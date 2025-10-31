/**
 * Import Module Constants
 */

import { DocumentType } from '../types/import.types';

export const DOCUMENT_TYPES: Record<DocumentType, { label: string; labelEn: string }> = {
  mls_listing: {
    label: 'Fiche MLS/Matrix',
    labelEn: 'MLS/Matrix Listing',
  },
  role_foncier: {
    label: 'Rôle foncier',
    labelEn: 'Property Assessment Roll',
  },
  certificat_localisation: {
    label: 'Certificat de localisation',
    labelEn: 'Location Certificate',
  },
};

/**
 * Field mapping from extracted data to Property model
 * Maps AI-extracted field names to database column names
 */
export const FIELD_MAPPINGS: Record<string, string> = {
  // Address
  address: 'adresse',
  city: 'ville',
  postalCode: 'code_postal',
  municipality: 'municipalite',

  // Status and classification
  status: 'status',
  propType: 'type_propriete',
  genrePropriete: 'genre_propriete',
  typeBatiment: 'type_batiment',

  // Pricing
  sellPrice: 'prix_vente',
  askingPrice: 'prix_demande',

  // Property details
  yearBuilt: 'annee_construction',

  // Areas
  surface: 'superficie_terrain_m2',
  privateSurface: 'superficie_terrain_m2',
  livingArea: 'superficie_habitable_pi2',

  // Municipal evaluation
  terrainValue: 'eval_municipale_terrain',
  batimentValue: 'eval_municipale_batiment',
  totalValue: 'eval_municipale_total',
  matricule: 'matricule',

  // Taxes
  copropTax: 'frais_condo',
  schoolTax: 'taxes_scolaires_montant',
  schoolTaxYear: 'taxes_scolaires_annee',
  municipalTax: 'taxes_municipales_montant',
  municipalTaxYear: 'taxes_municipales_annee',

  // Market
  numeroMLS: 'numero_mls',
  daysOnMarket: 'jours_sur_marche',
  acceptanceDate: 'date_vente',

  // Rooms
  roomsAboveGround: 'nombre_pieces',
  bedrooms: 'nombre_chambres',
  bathrooms: 'salle_bain',
  powderRooms: 'salle_eau',

  // Parking
  stationnement: 'stationnement',
  parkingExtras: 'ameliorations_hors_sol',
  garages: 'stationnement',
  parkingSpaces: 'stationnement',

  // Lot
  lotNumber: 'lot_number',

  // Notes/extras/inclusions
  extras: 'extras',
  inclusions: 'notes',
};

/**
 * Default confidence threshold for auto-acceptance
 */
export const CONFIDENCE_THRESHOLD = {
  HIGH: 90, // Auto-accept
  MEDIUM: 70, // Show warning
  LOW: 50, // Highlight for review
};

/**
 * Maximum file size for PDF upload (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Accepted file types
 */
export const ACCEPTED_FILE_TYPES = ['application/pdf'];
