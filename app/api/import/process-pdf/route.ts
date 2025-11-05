/**
 * API Route for server-side PDF processing
 * This runs on the server where Node.js fs module is available
 */

import { NextRequest, NextResponse } from 'next/server';
import { pdfReaderService } from '@/features/import/_api/pdf-reader.service';
import { aiExtractionService } from '@/features/import/_api/ai-extraction.service';
import { DocumentType } from '@/features/import/types/import.types';
import { adminApiKeysService } from '@/features/admin/_api/admin-api-keys.service';
import { usageTrackingService } from '@/features/admin/_api/usage-tracking.service';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get auth token from request header
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      console.error('[PDF Processing] No authorization header');
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Create Supabase client with the auth token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('[PDF Processing] Auth check:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message
    });

    if (authError || !user) {
      console.error('[PDF Processing] Authentication failed:', authError);
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    console.log('[PDF Processing] ========================================');
    console.log('[PDF Processing] User authenticated:', user.id);
    console.log('[PDF Processing] User email:', user.email);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as DocumentType;
    let apiKey = formData.get('apiKey') as string;
    let provider = (formData.get('provider') as 'deepseek' | 'openai' | 'anthropic') || 'deepseek';
    let model = formData.get('model') as string | undefined;

    console.log('[PDF Processing] File:', file.name, 'Size:', file.size, 'bytes');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!documentType) {
      return NextResponse.json(
        { error: 'No document type provided' },
        { status: 400 }
      );
    }

    // Check if user has enabled their own API keys
    const { data: userData } = await supabase
      .from('users')
      .select('can_use_own_api_keys')
      .eq('id', user.id)
      .single();

    const canUseOwnKeys = userData?.can_use_own_api_keys || false;

    // If user wants to use their own keys, they MUST provide an API key
    if (canUseOwnKeys && !apiKey) {
      return NextResponse.json(
        { error: 'Please configure your API keys in Settings. You have enabled personal API keys but none are configured.' },
        { status: 400 }
      );
    }

    // Calculate credits (only needed if using master keys)
    const fileSizeBytes = file.size;
    const creditsNeeded = canUseOwnKeys ? 0 : usageTrackingService.calculateCreditsNeeded(fileSizeBytes);

    // Only check/consume credits if using master key system
    if (!canUseOwnKeys) {
      console.log('[PDF Processing] Checking credits for user:', user.id, 'Credits needed:', creditsNeeded);

      // Check if user has enough credits (pass supabase client)
      const hasCredits = await usageTrackingService.hasEnoughCredits(user.id, creditsNeeded, supabase);

      console.log('[PDF Processing] Has enough credits:', hasCredits);

      if (!hasCredits) {
        // Get user credits for debugging
        const userCredits = await usageTrackingService.getUserCredits(user.id, supabase);
        console.error('[PDF Processing] Insufficient credits:', {
          userId: user.id,
          quota: userCredits?.scan_credits_quota,
          used: userCredits?.scan_credits_used,
          creditsNeeded
        });

        return NextResponse.json(
          { error: 'Insufficient scan credits. Please upgrade your plan or contact support.' },
          { status: 402 } // Payment Required
        );
      }
    }

    // If no API key provided (and user is NOT using own keys), use master API key
    if (!apiKey) {
      console.log('[PDF Processing] No user API key provided, using master API key');
      const masterKey = await adminApiKeysService.getDefaultApiKey();

      if (!masterKey) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }

      apiKey = masterKey.apiKey;
      provider = masterKey.provider;
      model = masterKey.model;
      console.log(`[PDF Processing] Using master key: ${provider}`);
    } else {
      console.log(`[PDF Processing] Using user's personal API key: ${provider}`);
    }

    // Extract text from PDF
    const pdfText = await pdfReaderService.extractTextFromFile(file);

    console.log(`[PDF Processing] Extracted ${pdfText?.length || 0} characters from ${file.name}`);

    if (!pdfText || pdfText.length < 10) {
      console.error(`[PDF Processing] Insufficient text: "${pdfText?.substring(0, 100)}"`);
      return NextResponse.json(
        { error: `Insufficient text extracted from PDF (${pdfText?.length || 0} characters). The PDF may be scanned/image-based. Please ensure the PDF contains selectable text.` },
        { status: 400 }
      );
    }

    // Use AI to extract structured data (now returns array of properties)
    const extractedPropertiesArray = await aiExtractionService.extractFromText(
      pdfText,
      documentType,
      apiKey,
      provider,
      model
    );

    // Process each property
    const properties = await Promise.all(
      extractedPropertiesArray.map(async (extractedData) => {
        // Calculate confidence scores for this property
        const confidences = await aiExtractionService.calculateConfidence(extractedData);

        const fieldsExtracted = Object.keys(extractedData).filter(
          (key) => extractedData[key] !== null && extractedData[key] !== undefined
        ).length;

        const confidenceValues = Object.values(confidences);
        const averageConfidence = confidenceValues.length > 0
          ? Math.round(confidenceValues.reduce((sum, conf) => sum + conf, 0) / confidenceValues.length)
          : 0;

        return {
          extractedData,
          fieldConfidences: confidences,
          averageConfidence,
          fieldsExtracted,
        };
      })
    );

    // Consume credits only if using master key system
    if (!canUseOwnKeys && creditsNeeded > 0) {
      const creditsConsumed = await usageTrackingService.consumeCredits(user.id, creditsNeeded, supabase);

      if (!creditsConsumed) {
        console.error('[PDF Processing] Failed to consume credits');
        // Still return success but log the error
      }
    }

    // Track usage for billing (always track, but 0 credits for personal keys)
    const processingTime = Date.now() - startTime;
    await usageTrackingService.trackUsage({
      user_id: user.id,
      organization_id: user.user_metadata?.organization_id,
      operation_type: 'pdf_scan',
      document_type: documentType,
      file_size_bytes: fileSizeBytes,
      page_count: undefined,
      credits_used: creditsNeeded,
      provider_used: provider,
      model_used: model,
      tokens_input: undefined,
      tokens_output: undefined,
      cost_estimate: undefined,
      success: true,
      error_message: undefined,
      processing_time_ms: processingTime,
    }, supabase);

    console.log(`[PDF Processing] Success! Credits used: ${creditsNeeded}, Processing time: ${processingTime}ms`);

    return NextResponse.json({
      properties,
      totalProperties: properties.length,
      creditsUsed: creditsNeeded, // Return credits info to client
    });
  } catch (error) {
    console.error('PDF processing error:', error);

    // Track failed usage (don't consume credits on failure)
    try {
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        const errorSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: authHeader
              }
            }
          }
        );

        const { data: { user } } = await errorSupabase.auth.getUser();

        if (user) {
          const processingTime = Date.now() - startTime;
          const formData = await request.formData();
          const file = formData.get('file') as File;
          const documentType = formData.get('documentType') as DocumentType;

          await usageTrackingService.trackUsage({
            user_id: user.id,
            organization_id: user.user_metadata?.organization_id,
            operation_type: 'pdf_scan',
            document_type: documentType,
            file_size_bytes: file?.size || 0,
            page_count: undefined,
            credits_used: 0, // No credits consumed on failure
            provider_used: undefined,
            model_used: undefined,
            tokens_input: undefined,
            tokens_output: undefined,
            cost_estimate: undefined,
            success: false,
            error_message: error instanceof Error ? error.message : 'Unknown error',
            processing_time_ms: processingTime,
          }, errorSupabase);
        }
      }
    } catch (trackingError) {
      console.error('Failed to track error:', trackingError);
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
