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
   * Supports multi-property PDFs
   */
  async processPDF(file: File, documentType: DocumentType): Promise<ImportSession> {
    const session: ImportSession = {
      id: crypto.randomUUID(),
      documentType,
      source: 'pdf',
      status: 'processing',
      fileName: file.name,
      fileSize: file.size,
      properties: [],
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
      session.properties = result.properties || [];
      session.totalProperties = result.totalProperties || session.properties.length;
      session.status = 'review';

      // Legacy support for single property
      if (session.properties.length > 0) {
        session.extractedData = session.properties[0].extractedData;
        session.averageConfidence = session.properties[0].averageConfidence;
        session.fieldsExtracted = session.properties[0].fieldsExtracted;
      }

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

    // Handle multi-unit data (unit_rents field expects JSONB array)
    if (extracted.unitNumbers && extracted.unitRents) {
      const units = extracted.unitNumbers.map((unitNumber, index) => ({
        unit: unitNumber,
        rent: extracted.unitRents?.[index] || 0
      }));
      mapped.unit_rents = units;
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
   * Merge imported data with existing property
   */
  async mergePropertyData(propertyId: string, session: ImportSession): Promise<void> {
    if (!session.extractedData) {
      throw new Error('No extracted data in session');
    }

    const propertyData = this.mapToPropertyInput(session.extractedData);

    // Update existing property with new data (only non-null values)
    await propertiesSupabaseService.update(propertyId, propertyData as Partial<PropertyCreateInput>);

    // Update session
    session.propertyId = propertyId;
    session.status = 'completed';
    session.completedAt = new Date();
  }

  /**
   * Create/merge multiple properties from session
   * Handles batch import for multi-listing PDFs
   */
  async createPropertiesFromImport(session: ImportSession): Promise<string[]> {
    if (!session.properties || session.properties.length === 0) {
      throw new Error('No properties in session');
    }

    const propertyIds: string[] = [];

    for (const propertyExtraction of session.properties) {
      const { extractedData, duplicateProperty, action } = propertyExtraction;

      if (action === 'skip') {
        continue; // User chose to skip this property
      }

      const propertyData = this.mapToPropertyInput(extractedData);

      if (action === 'merge' && duplicateProperty) {
        // Merge with existing property
        await propertiesSupabaseService.update(duplicateProperty.id, propertyData as Partial<PropertyCreateInput>);
        propertyIds.push(duplicateProperty.id);
      } else {
        // Create new property
        const property = await propertiesSupabaseService.create(propertyData as PropertyCreateInput);
        propertyIds.push(property.id);
      }
    }

    // Update session
    session.propertyIds = propertyIds;
    session.status = 'completed';
    session.completedAt = new Date();

    return propertyIds;
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
