/**
 * API Route for text-only processing (no PDF extraction needed)
 * Use this when user manually copies text from a PDF that can't be auto-extracted
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiExtractionService } from '@/features/import/_api/ai-extraction.service';
import { DocumentType } from '@/features/import/types/import.types';
import { adminApiKeysService } from '@/features/admin/_api/admin-api-keys.service';
import { usageTrackingService } from '@/features/admin/_api/usage-tracking.service';
import { createRouteClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let body: any;

  console.log('[ProcessText] Request received');

  try {
    // Get authenticated user
    const supabase = createRouteClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('[ProcessText] Auth check:', { hasUser: !!user, authError });

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    body = await request.json();
    const { text, documentType } = body;
    let { apiKey, provider, model } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'No text provided' },
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
      .single() as { data: { can_use_own_api_keys: boolean } | null; error: any };

    const canUseOwnKeys = userData?.can_use_own_api_keys || false;

    // If user wants to use their own keys, they MUST provide an API key
    if (canUseOwnKeys && !apiKey) {
      return NextResponse.json(
        { error: 'Please configure your API keys in Settings. You have enabled personal API keys but none are configured.' },
        { status: 400 }
      );
    }

    // Text extracts count as 1 credit (only if using master keys)
    const creditsNeeded = canUseOwnKeys ? 0 : 1;

    // Only check/consume credits if using master key system
    if (!canUseOwnKeys) {
      // Check if user has enough credits
      const hasCredits = await usageTrackingService.hasEnoughCredits(user.id, creditsNeeded);

      if (!hasCredits) {
        return NextResponse.json(
          { error: 'Insufficient scan credits. Please upgrade your plan or contact support.' },
          { status: 402 }
        );
      }
    }

    // If no API key provided (and user is NOT using own keys), use master API key
    if (!apiKey) {
      console.log('[Text Processing] No user API key provided, using master API key');
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
      console.log(`[Text Processing] Using master key: ${provider}`);
    } else {
      console.log(`[Text Processing] Using user's personal API key: ${provider}`);
    }

    console.log(`[Text Processing] Processing ${text.length} characters of type ${documentType}`);

    if (text.length < 10) {
      return NextResponse.json(
        { error: `Insufficient text provided (${text.length} characters). Please paste more content.` },
        { status: 400 }
      );
    }

    // Use AI to extract structured data (returns array of properties)
    const extractedPropertiesArray = await aiExtractionService.extractFromText(
      text,
      documentType as DocumentType,
      apiKey,
      provider || 'deepseek',
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
      const creditsConsumed = await usageTrackingService.consumeCredits(user.id, creditsNeeded);

      if (!creditsConsumed) {
        console.error('[Text Processing] Failed to consume credits');
      }
    }

    // Track usage (always track, but 0 credits for personal keys)
    const processingTime = Date.now() - startTime;
    await usageTrackingService.trackUsage({
      user_id: user.id,
      organization_id: user.user_metadata?.organization_id,
      operation_type: 'text_extract',
      document_type: documentType,
      file_size_bytes: text.length,
      page_count: undefined,
      credits_used: creditsNeeded,
      provider_used: provider || 'deepseek',
      model_used: model,
      tokens_input: undefined,
      tokens_output: undefined,
      cost_estimate: undefined,
      success: true,
      error_message: undefined,
      processing_time_ms: processingTime,
    });

    console.log(`[Text Processing] Success! Credits used: ${creditsNeeded}, Processing time: ${processingTime}ms`);

    return NextResponse.json({
      properties,
      totalProperties: properties.length,
      creditsUsed: creditsNeeded,
    });
  } catch (error) {
    console.error('Text processing error:', error);

    // Track failed usage
    try {
      const supabase = createRouteClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user && body) {
        const processingTime = Date.now() - startTime;

        await usageTrackingService.trackUsage({
          user_id: user.id,
          organization_id: user.user_metadata?.organization_id,
          operation_type: 'text_extract',
          document_type: body.documentType,
          file_size_bytes: body.text?.length || 0,
          page_count: undefined,
          credits_used: 0,
          provider_used: undefined,
          model_used: undefined,
          tokens_input: undefined,
          tokens_output: undefined,
          cost_estimate: undefined,
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
