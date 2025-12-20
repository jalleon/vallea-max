/**
 * Import Module Type Definitions
 */

export type DocumentType = 'mls_listing' | 'role_foncier' | 'role_taxe' | 'taxe_scolaire' | 'zonage' | 'acte_vente' | 'certificat_localisation' | 'plan_cadastre' | 'autre';

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

  // Status and classification
  status?: string; // Always "Vendu" for MLS/Matrix
  propType?: string;
  genrePropriete?: string; // Plain-pied, etc.
  typeBatiment?: string; // Isolé, Jumelé, En rangée, En rangée sur coin

  // Pricing
  sellPrice?: number;
  askingPrice?: number;

  // Property details
  yearBuilt?: number;

  // Surfaces/Areas
  surface?: number; // terrain surface
  privateSurface?: number;
  livingArea?: number;
  aireHabitable?: number; // Aire d'étages from Rôle foncier (m²)
  frontage?: number; // Mesure frontale (m)

  // Municipal evaluation
  terrainValue?: number;
  batimentValue?: number;
  totalValue?: number;
  matricule?: string;

  // Zoning
  zonage?: string; // Zone number (e.g., "H-5", "RU-3")
  zoningUsagesPermis?: string; // Permitted uses (comma-separated)

  // Taxes
  copropTax?: number;
  schoolTax?: number;
  schoolTaxYear?: number;
  municipalTax?: number;
  municipalTaxYear?: number;

  // Market info
  hasCentris?: boolean;
  numeroMLS?: string;
  daysOnMarket?: number;
  acceptanceDate?: string;

  // Rooms & features
  roomsAboveGround?: number;
  bedrooms?: number;
  bathrooms?: number;
  powderRooms?: number; // Salle d'eau (number after + sign)

  // Parking
  stationnement?: string; // Garage, Abri d'auto, Allée
  parkingExtras?: string; // "Garage: 2, Allée: 3"
  walkways?: number;
  garages?: number;
  carport?: number;
  parkingSpaces?: number;

  // Extras and inclusions
  extras?: string; // Combined from inclusions box
  inclusions?: string;
  pool?: number | boolean;
  foyerPoele?: number;

  // Lot info
  lotNumber?: string;

  // Multi-unit properties (Duplex/Triplex/Quadriplex/Apartment)
  unitNumbers?: string[]; // ["1", "2", "3"]
  unitRents?: number[]; // [1200, 1350, 1400]

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
 * Single property extraction result
 */
export interface PropertyExtraction {
  extractedData: ExtractedPropertyData;
  fieldConfidences?: Record<string, number>;
  averageConfidence?: number;
  fieldsExtracted?: number;
  duplicateProperty?: any; // Existing property if duplicate found
  action?: 'create' | 'merge' | 'skip'; // User's choice for this property
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

  // Support for multiple properties
  properties: PropertyExtraction[];
  totalProperties?: number;

  // Legacy single property support (deprecated)
  extractedData?: ExtractedPropertyData;
  fieldConfidences?: FieldConfidence[];
  averageConfidence?: number;
  fieldsExtracted?: number;
  totalFields?: number;

  errors?: string[];
  createdAt: Date;
  completedAt?: Date;
  propertyIds?: string[]; // IDs of created/updated properties
  propertyId?: string; // Legacy single property ID
}
