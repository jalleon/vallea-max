/**
 * Main import service - orchestrates API calls and property creation
 */

import { createClient } from '@/lib/supabase/client';
import { PropertyCreateInput } from '@/features/library/types/property.types';
import { propertiesSupabaseService } from '@/features/library/_api/properties-supabase.service';
import { ExtractedPropertyData, DocumentType, ImportSession } from '../types/import.types';
import { FIELD_MAPPINGS } from '../constants/import.constants';
import { formatLotNumber } from '@/lib/utils/formatting';

class ImportService {
  /**
   * Process text directly (no PDF extraction)
   * Use this when user manually copies text from a PDF that can't be auto-extracted
   */
  async processText(
    text: string,
    documentType: DocumentType,
    apiKey: string,
    provider: 'deepseek' | 'openai' | 'anthropic' = 'deepseek',
    model?: string,
    customPrompt?: string
  ): Promise<ImportSession> {
    const session: ImportSession = {
      id: crypto.randomUUID(),
      documentType,
      source: 'pdf',
      status: 'processing',
      fileName: 'pasted-text.txt',
      fileSize: text.length,
      properties: [],
      createdAt: new Date(),
    };

    try {
      // Get auth session for API call
      const supabase = createClient();
      const { data: { session: authSession } } = await supabase.auth.getSession();

      // Call API route for text processing
      const response = await fetch('/api/import/process-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authSession?.access_token ? {
            'Authorization': `Bearer ${authSession.access_token}`
          } : {}),
        },
        body: JSON.stringify({
          text,
          documentType,
          apiKey,
          provider,
          model,
          customPrompt,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process text');
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
   * Process PDF file via API route (server-side processing)
   * Supports multi-property PDFs
   */
  async processPDF(
    file: File,
    documentType: DocumentType,
    apiKey: string,
    provider: 'deepseek' | 'openai' | 'anthropic' = 'deepseek',
    model?: string,
    customPrompt?: string
  ): Promise<ImportSession> {
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
      // Get auth session for API call
      const supabase = createClient();
      const { data: { session: authSession } } = await supabase.auth.getSession();

      // Call API route for server-side PDF processing
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      formData.append('apiKey', apiKey);
      formData.append('provider', provider);
      if (model) {
        formData.append('model', model);
      }
      if (customPrompt) {
        formData.append('customPrompt', customPrompt);
      }

      const response = await fetch('/api/import/process-pdf', {
        method: 'POST',
        headers: authSession?.access_token ? {
          'Authorization': `Bearer ${authSession.access_token}`
        } : {},
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
   * @param extracted - Extracted property data
   * @param documentType - Type of document (determines which fields to protect)
   * @param isMerge - True if merging into existing property (protects certain fields)
   * @param existingFieldSources - Existing field sources from database (for merge protection)
   */
  mapToPropertyInput(
    extracted: ExtractedPropertyData,
    documentType?: DocumentType,
    isMerge: boolean = false,
    existingFieldSources?: Record<string, string>
  ): Partial<PropertyCreateInput> {
    const mapped: any = {};
    const fieldSources: Record<string, string> = existingFieldSources || {};

    // Protected document types - these sources take precedence over MLS data
    // This protects ALL fields from these sources, including:
    // - role_foncier: eval values, evaluation date (eval_municipale_annee), matricule, lot, etc.
    // - role_taxe: tax amounts, tax years (taxes_municipales_annee), etc.
    const protectedSources = ['role_foncier', 'role_taxe'];
    const isMLS = documentType === 'mls_listing';

    // Protected fields that should NEVER be overwritten during merge
    const protectedFieldsForMerge = [
      'source',
      'created_at',
      'updated_at',
      'organization_id',
      'created_by',
    ];

    // Address fields - protected EXCEPT for role_foncier which has standardized official addresses
    const addressFields = ['adresse', 'ville', 'code_postal'];
    const shouldProtectAddress = isMerge && documentType !== 'role_foncier';

    // Fields that are protected for non-MLS documents
    const protectedFieldsForNonMLS = [
      'status',           // Don't change status unless it's MLS
      'type_propriete',   // Don't change property type
      'type_evaluation',  // Don't change evaluation type
    ];

    Object.entries(extracted).forEach(([extractedKey, value]) => {
      const dbField = FIELD_MAPPINGS[extractedKey];

      // Skip if no mapping or value is null/undefined
      if (!dbField || value === null || value === undefined) {
        return;
      }

      // Skip protected fields during merge
      if (isMerge && protectedFieldsForMerge.includes(dbField)) {
        return;
      }

      // CRITICAL: Protect municipal data from MLS overwrites
      // If this field already came from role_foncier or role_taxe, and we're importing MLS data, skip it
      if (isMerge && isMLS && fieldSources[dbField] && protectedSources.includes(fieldSources[dbField])) {
        console.log(`Protecting field ${dbField} (source: ${fieldSources[dbField]}) from MLS overwrite`);
        return;
      }

      // Protect address fields during merge UNLESS it's role_foncier (which has official standardized address)
      if (shouldProtectAddress && addressFields.includes(dbField)) {
        return;
      }

      // Skip status/type fields for non-MLS documents during merge
      if (isMerge && documentType && documentType !== 'mls_listing') {
        if (protectedFieldsForNonMLS.includes(dbField)) {
          return;
        }
      }

      // Only add if value exists
      // Format lot_number to Quebec standard: # ### ###
      if (dbField === 'lot_number' && typeof value === 'string') {
        mapped[dbField] = formatLotNumber(value);
      } else {
        mapped[dbField] = value;
      }

      // Track the source of this field
      if (documentType) {
        fieldSources[dbField] = documentType;
      }
    });

    // Handle special conversions
    // For new properties OR role_foncier merges (which have official addresses)
    const shouldProcessAddress = !isMerge || documentType === 'role_foncier';

    if (shouldProcessAddress && extracted.address) {
      // Check if protected by municipal source when merging with MLS
      const shouldProtectFromMLS = isMerge && isMLS && fieldSources['adresse'] && protectedSources.includes(fieldSources['adresse']);

      if (!shouldProtectFromMLS) {
        mapped.adresse = extracted.address;
        if (documentType) fieldSources['adresse'] = documentType;
      }
    }

    // Parse address components if full address is provided but components aren't
    if (shouldProcessAddress && extracted.address && !extracted.city) {
      const addressParts = this.parseAddress(extracted.address);

      // Check protection for each address component when merging with MLS
      const villeProtected = isMerge && isMLS && fieldSources['ville'] && protectedSources.includes(fieldSources['ville']);
      const postalProtected = isMerge && isMLS && fieldSources['code_postal'] && protectedSources.includes(fieldSources['code_postal']);

      if (addressParts.city && !villeProtected) {
        mapped.ville = addressParts.city;
        if (documentType) fieldSources['ville'] = documentType;
      }
      if (addressParts.postalCode && !postalProtected) {
        mapped.code_postal = addressParts.postalCode;
        if (documentType) fieldSources['code_postal'] = documentType;
      }
    }

    // Handle multi-unit data (unit_rents field expects JSONB array)
    if (extracted.unitNumbers && extracted.unitRents) {
      const units = extracted.unitNumbers.map((unitNumber, index) => ({
        unit: unitNumber,
        rent: extracted.unitRents?.[index] || 0
      }));
      mapped.unit_rents = units;
      if (documentType) fieldSources['unit_rents'] = documentType;
    }

    // Handle parking extras - append to ameliorations_hors_sol (don't overwrite)
    if (extracted.parkingExtras) {
      const existing = mapped.ameliorations_hors_sol || '';
      if (existing) {
        // Append with separator if there's existing content
        mapped.ameliorations_hors_sol = `${existing}, ${extracted.parkingExtras}`;
      } else {
        mapped.ameliorations_hors_sol = extracted.parkingExtras;
      }
    }

    // Set source only for new properties
    if (!isMerge) {
      mapped.source = 'import';
    }

    // Include updated field sources in the mapped data
    mapped.field_sources = fieldSources;

    return mapped;
  }

  /**
   * Create property from import session
   */
  async createPropertyFromImport(session: ImportSession): Promise<string> {
    if (!session.extractedData) {
      throw new Error('No extracted data in session');
    }

    const propertyData = this.mapToPropertyInput(session.extractedData, session.documentType, false);

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

    // Fetch existing property to get field_sources
    let existingFieldSources = {};
    try {
      const existingProperty = await propertiesSupabaseService.getById(propertyId);
      existingFieldSources = existingProperty.field_sources || {};
    } catch (error) {
      console.warn('Could not fetch existing property field_sources:', error);
      // Continue with empty field_sources if fetch fails
    }

    const propertyData = this.mapToPropertyInput(
      session.extractedData,
      session.documentType,
      true,
      existingFieldSources
    );

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

      const isMerge = action === 'merge' && duplicateProperty;

      let existingFieldSources = {};
      if (isMerge && duplicateProperty) {
        try {
          // Fetch existing property to get field_sources
          const existingProperty = await propertiesSupabaseService.getById(duplicateProperty.id);
          existingFieldSources = existingProperty.field_sources || {};
        } catch (error) {
          console.warn('Could not fetch existing property field_sources:', error);
          // Continue with empty field_sources if fetch fails
          existingFieldSources = {};
        }
      }

      const propertyData = this.mapToPropertyInput(
        extractedData,
        session.documentType,
        isMerge,
        existingFieldSources
      );

      if (isMerge) {
        // Merge with existing property - only update non-null fields, protect certain fields
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
