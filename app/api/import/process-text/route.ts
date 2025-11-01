/**
 * API Route for text-only processing (no PDF extraction needed)
 * Use this when user manually copies text from a PDF that can't be auto-extracted
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiExtractionService } from '@/features/import/_api/ai-extraction.service';
import { DocumentType } from '@/features/import/types/import.types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, documentType, apiKey, provider, model } = body;

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

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No API key provided. Please configure your AI API key in Settings.' },
        { status: 400 }
      );
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

    return NextResponse.json({
      properties,
      totalProperties: properties.length,
    });
  } catch (error) {
    console.error('Text processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
