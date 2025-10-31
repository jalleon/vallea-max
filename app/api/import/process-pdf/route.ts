/**
 * API Route for server-side PDF processing
 * This runs on the server where Node.js fs module is available
 */

import { NextRequest, NextResponse } from 'next/server';
import { pdfReaderService } from '@/features/import/_api/pdf-reader.service';
import { aiExtractionService } from '@/features/import/_api/ai-extraction.service';
import { DocumentType } from '@/features/import/types/import.types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as DocumentType;
    const apiKey = formData.get('apiKey') as string;
    const provider = (formData.get('provider') as 'deepseek' | 'openai' | 'anthropic') || 'deepseek';
    const model = formData.get('model') as string | undefined;

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

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No API key provided. Please configure your AI API key in Settings.' },
        { status: 400 }
      );
    }

    // Extract text from PDF
    const pdfText = await pdfReaderService.extractTextFromFile(file);

    if (!pdfText || pdfText.length < 50) {
      return NextResponse.json(
        { error: 'Insufficient text extracted from PDF' },
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

    return NextResponse.json({
      properties,
      totalProperties: properties.length,
    });
  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
