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

    // Extract text from PDF
    const pdfText = await pdfReaderService.extractTextFromFile(file);

    if (!pdfText || pdfText.length < 50) {
      return NextResponse.json(
        { error: 'Insufficient text extracted from PDF' },
        { status: 400 }
      );
    }

    // Use AI to extract structured data
    const extractedData = await aiExtractionService.extractFromText(pdfText, documentType);

    // Calculate confidence scores
    const confidences = await aiExtractionService.calculateConfidence(extractedData);

    // Calculate statistics
    const fieldConfidences = Object.entries(confidences).map(([field, confidence]) => ({
      field,
      value: extractedData[field as keyof typeof extractedData],
      confidence,
    }));

    const fieldsExtracted = Object.keys(extractedData).filter(
      (key) => extractedData[key] !== null && extractedData[key] !== undefined
    ).length;

    const averageConfidence =
      fieldConfidences.reduce((sum, fc) => sum + fc.confidence, 0) / fieldConfidences.length;

    return NextResponse.json({
      extractedData,
      fieldConfidences,
      averageConfidence: Math.round(averageConfidence),
      fieldsExtracted,
    });
  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
