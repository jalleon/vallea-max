/**
 * Main import service - orchestrates PDF reading, AI extraction, and property creation
 */

import { supabase } from '@/lib/supabase/client';
import { PropertyCreateInput } from '@/features/library/types/property.types';
import { propertiesService } from '@/features/library/_api/properties-supabase.service';
import { pdfReaderService } from './pdf-reader.service';
import { aiExtractionService } from './ai-extraction.service';
import { ExtractedPropertyData, DocumentType, ImportSession } from '../types/import.types';
import { FIELD_MAPPINGS } from '../constants/import.constants';

class ImportService {
  /**
   * Process PDF file and extract property data
   */
  async processPDF(file: File, documentType: DocumentType): Promise<ImportSession> {
    const session: ImportSession = {
      id: crypto.randomUUID(),
      documentType,
      source: 'pdf',
      status: 'processing',
      fileName: file.name,
      fileSize: file.size,
      createdAt: new Date(),
    };

    try {
      // Step 1: Extract text from PDF
      const pdfText = await pdfReaderService.extractTextFromFile(file);

      if (!pdfText || pdfText.length < 50) {
        throw new Error('Insufficient text extracted from PDF');
      }

      // Step 2: Use AI to extract structured data
      const extractedData = await aiExtractionService.extractFromText(pdfText, documentType);

      // Step 3: Calculate confidence scores
      const confidences = await aiExtractionService.calculateConfidence(extractedData);

      // Calculate statistics
      const fieldConfidences = Object.entries(confidences).map(([field, confidence]) => ({
        field,
        value: extractedData[field as keyof ExtractedPropertyData],
        confidence,
      }));

      const totalFields = Object.keys(FIELD_MAPPINGS).length;
      const fieldsExtracted = Object.keys(extractedData).filter(
        (key) => extractedData[key] !== null && extractedData[key] !== undefined
      ).length;

      const averageConfidence =
        fieldConfidences.reduce((sum, fc) => sum + fc.confidence, 0) / fieldConfidences.length;

      // Update session
      session.extractedData = extractedData;
      session.fieldConfidences = fieldConfidences;
      session.averageConfidence = Math.round(averageConfidence);
      session.fieldsExtracted = fieldsExtracted;
      session.totalFields = totalFields;
      session.status = 'review';

      return session;
    } catch (error) {
      session.status = 'failed';
      session.errors = [error instanceof Error ? error.message : 'Unknown error'];
      throw error;
    }
  }

  /**
   * Map extracted data to Property model format
   */
  mapToPropertyInput(extracted: ExtractedPropertyData): Partial<PropertyCreateInput> {
    const mapped: any = {};

    Object.entries(extracted).forEach(([extractedKey, value]) => {
      const dbField = FIELD_MAPPINGS[extractedKey];
      if (dbField && value !== null && value !== undefined) {
        mapped[dbField] = value;
      }
    });

    // Handle special conversions
    if (extracted.address) {
      mapped.adresse = extracted.address;
    }

    // Parse address components if full address is provided but components aren't
    if (extracted.address && !extracted.city) {
      const addressParts = this.parseAddress(extracted.address);
      if (addressParts.city) mapped.ville = addressParts.city;
      if (addressParts.postalCode) mapped.code_postal = addressParts.postalCode;
    }

    // Set source
    mapped.source = 'import';

    return mapped;
  }

  /**
   * Create property from import session
   */
  async createPropertyFromImport(session: ImportSession): Promise<string> {
    if (!session.extractedData) {
      throw new Error('No extracted data in session');
    }

    const propertyData = this.mapToPropertyInput(session.extractedData);

    // Create property using existing service
    const property = await propertiesService.create(propertyData as PropertyCreateInput);

    // Update session
    session.propertyId = property.id;
    session.status = 'completed';
    session.completedAt = new Date();

    return property.id;
  }

  /**
   * Parse Quebec address into components
   */
  private parseAddress(fullAddress: string): {
    street?: string;
    city?: string;
    postalCode?: string;
  } {
    const result: any = {};

    // Extract postal code (format: A1A 1A1)
    const postalMatch = fullAddress.match(/([A-Z]\d[A-Z]\s?\d[A-Z]\d)/i);
    if (postalMatch) {
      result.postalCode = postalMatch[1].toUpperCase();
    }

    // Extract city (between commas, before postal code)
    const cityMatch = fullAddress.match(/,\s*([^,]+)\s*,?\s*[A-Z]\d[A-Z]/i);
    if (cityMatch) {
      result.city = cityMatch[1].trim();
    }

    return result;
  }
}

// Export singleton instance
export const importService = new ImportService();
