/**
 * Main import service - orchestrates API calls and property creation
 */

import { supabase } from '@/lib/supabase/client';
import { PropertyCreateInput } from '@/features/library/types/property.types';
import { propertiesSupabaseService } from '@/features/library/_api/properties-supabase.service';
import { ExtractedPropertyData, DocumentType, ImportSession } from '../types/import.types';
import { FIELD_MAPPINGS } from '../constants/import.constants';

class ImportService {
  /**
   * Process PDF file via API route (server-side processing)
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
      // Call API route for server-side PDF processing
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      const response = await fetch('/api/import/process-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process PDF');
      }

      const result = await response.json();

      // Update session with results
      session.extractedData = result.extractedData;
      session.fieldConfidences = result.fieldConfidences;
      session.averageConfidence = result.averageConfidence;
      session.fieldsExtracted = result.fieldsExtracted;
      session.totalFields = Object.keys(FIELD_MAPPINGS).length;
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
    const property = await propertiesSupabaseService.create(propertyData as PropertyCreateInput);

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
