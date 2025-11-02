/**
 * API Route for text-only processing (no PDF extraction needed)
 * Use this when user manually copies text from a PDF that can't be auto-extracted
 */

import { NextRequest, NextResponse } from 'next/server';
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

    const body = await request.json();
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

    // Text extracts count as 1 credit (small size)
    const creditsNeeded = 1;

    // Check if user has enough credits
    const hasCredits = await usageTrackingService.hasEnoughCredits(user.id, creditsNeeded);

    if (!hasCredits) {
      return NextResponse.json(
        { error: 'Insufficient scan credits. Please upgrade your plan or contact support.' },
        { status: 402 }
      );
    }

    // If no API key provided, use master API key
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

    // Consume credits
    const creditsConsumed = await usageTrackingService.consumeCredits(user.id, creditsNeeded);

    if (!creditsConsumed) {
      console.error('[Text Processing] Failed to consume credits');
    }

    // Track usage
    const processingTime = Date.now() - startTime;
    await usageTrackingService.trackUsage({
      user_id: user.id,
      organization_id: user.user_metadata?.organization_id || null,
      operation_type: 'text_extract',
      document_type: documentType,
      file_size_bytes: text.length,
      page_count: null,
      credits_used: creditsNeeded,
      provider_used: provider || 'deepseek',
      model_used: model || null,
      tokens_input: null,
      tokens_output: null,
      cost_estimate: null,
      success: true,
      error_message: null,
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
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const processingTime = Date.now() - startTime;
        const body = await request.json();

        await usageTrackingService.trackUsage({
          user_id: user.id,
          organization_id: user.user_metadata?.organization_id || null,
          operation_type: 'text_extract',
          document_type: body.documentType,
          file_size_bytes: body.text?.length || 0,
          page_count: null,
          credits_used: 0,
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
