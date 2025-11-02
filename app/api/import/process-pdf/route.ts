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
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as DocumentType;
    let apiKey = formData.get('apiKey') as string;
    let provider = (formData.get('provider') as 'deepseek' | 'openai' | 'anthropic') || 'deepseek';
    let model = formData.get('model') as string | undefined;

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

    // Calculate credits needed based on file size
    const fileSizeBytes = file.size;
    const creditsNeeded = usageTrackingService.calculateCreditsNeeded(fileSizeBytes);

    // Check if user has enough credits
    const hasCredits = await usageTrackingService.hasEnoughCredits(user.id, creditsNeeded);

    if (!hasCredits) {
      return NextResponse.json(
        { error: 'Insufficient scan credits. Please upgrade your plan or contact support.' },
        { status: 402 } // Payment Required
      );
    }

    // If no API key provided, use master API key (Valea's keys)
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

    // Consume credits (atomic operation)
    const creditsConsumed = await usageTrackingService.consumeCredits(user.id, creditsNeeded);

    if (!creditsConsumed) {
      console.error('[PDF Processing] Failed to consume credits');
      // Still return success but log the error
    }

    // Track usage for billing
    const processingTime = Date.now() - startTime;
    await usageTrackingService.trackUsage({
      user_id: user.id,
      organization_id: user.user_metadata?.organization_id || null,
      operation_type: 'pdf_scan',
      document_type: documentType,
      file_size_bytes: fileSizeBytes,
      page_count: null, // We don't extract page count currently
      credits_used: creditsNeeded,
      provider_used: provider,
      model_used: model || null,
      tokens_input: null, // Could track if AI service provides this
      tokens_output: null,
      cost_estimate: null, // Could calculate based on provider pricing
      success: true,
      error_message: null,
      processing_time_ms: processingTime,
    });

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
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const processingTime = Date.now() - startTime;
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const documentType = formData.get('documentType') as DocumentType;

        await usageTrackingService.trackUsage({
          user_id: user.id,
          organization_id: user.user_metadata?.organization_id || null,
          operation_type: 'pdf_scan',
          document_type: documentType,
          file_size_bytes: file?.size || 0,
          page_count: null,
          credits_used: 0, // No credits consumed on failure
          provider_used: null,
          model_used: null,
          tokens_input: null,
          tokens_output: null,
          cost_estimate: null,
          success: false,
          error_message: error instanceof Error ? error.message : 'Unknown error',
          processing_time_ms: processingTime,
        });
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
