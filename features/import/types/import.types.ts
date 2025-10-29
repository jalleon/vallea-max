/**
 * Import Module Type Definitions
 */

export type DocumentType = 'mls_listing' | 'role_foncier' | 'certificat_localisation';

export type ImportSource = 'pdf' | 'browser_extension';

export type ImportStatus = 'pending' | 'processing' | 'review' | 'completed' | 'failed';

/**
 * Raw extracted data from AI/PDF parsing
 */
export interface ExtractedPropertyData {
  // Address info
  address?: string;
  city?: string;
  postalCode?: string;
  municipality?: string;

  // Pricing
  sellPrice?: number;
  askingPrice?: number;

  // Property details
  propType?: string;
  yearBuilt?: number;

  // Surfaces/Areas
  surface?: number; // terrain surface
  privateSurface?: number;
  livingArea?: number;

  // Municipal evaluation
  terrainValue?: number;
  batimentValue?: number;
  totalValue?: number;
  matricule?: string;

  // Taxes
  copropTax?: number;
  schoolTax?: number;
  municipalTax?: number;

  // Market info
  hasCentris?: boolean;
  numeroMLS?: string;
  daysOnMarket?: number;
  acceptanceDate?: string;

  // Rooms & features
  roomsAboveGround?: number;
  bedrooms?: number;
  bathrooms?: number;

  // Parking
  walkways?: number;
  garages?: number;
  carport?: number;
  parkingSpaces?: number;

  // Extras
  inclusions?: string;
  pool?: number | boolean;
  foyerPoele?: number;

  // Lot info
  lotNumber?: string;

  // Raw fields for unmapped data
  [key: string]: any;
}

/**
 * Confidence score for each extracted field
 */
export interface FieldConfidence {
  field: string;
  value: any;
  confidence: number; // 0-100
}

/**
 * Import session tracking
 */
export interface ImportSession {
  id: string;
  documentType: DocumentType;
  source: ImportSource;
  status: ImportStatus;
  fileName?: string;
  fileSize?: number;
  extractedData?: ExtractedPropertyData;
  fieldConfidences?: FieldConfidence[];
  averageConfidence?: number;
  fieldsExtracted?: number;
  totalFields?: number;
  errors?: string[];
  createdAt: Date;
  completedAt?: Date;
  propertyId?: string; // ID of created property
}
