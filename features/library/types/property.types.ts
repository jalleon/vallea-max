import { MediaReference } from '@/types/common.types'
import { PROPERTY_TYPES, PROPERTY_STATUSES, BASEMENT_TYPES, PARKING_TYPES, FLOOR_TYPES, OCCUPANCY_TYPES, EVALUATION_TYPES, BUILDING_TYPES, GARAGE_TYPES, CONDO_LOCATION_TYPES, COPROPRIETE_TYPES } from '../constants/property.constants'

// Inspection types
export type InspectionStatus = 'not_started' | 'in_progress' | 'completed'
export type InspectionCategory = 'pieces' | 'batiment' | 'garage' | 'mecanique' | 'divers' | 'exterieur'

// Room inspection structure for inspection_pieces
export interface RoomInspection {
  type: string
  armoires?: string[]
  comptoirs?: string[]
  dosseret?: string[]
  plancher?: string[]
  plafond?: string
  murs?: string[]
  grandeur?: string
  completedAt?: string
  [key: string]: any // Allow additional custom fields
}

export interface FloorInspection {
  name: string
  rooms: {
    [roomId: string]: RoomInspection
  }
}

export interface InspectionPieces {
  floors: {
    [floorId: string]: FloorInspection
  }
  totalRooms: number
  completedRooms: number
}

// Rent information for multi-unit properties
export interface UnitRent {
  unitNumber: string
  monthlyRent: number
  isOwnerOccupied?: boolean  // True if the owner lives in this unit
}

// Additional lot information
export interface AdditionalLot {
  id: string
  unit_number?: string
  lot_number: string
  type_lot: 'Exclusif' | 'Commun'
  matricule?: string
}

export interface Property {
  id: string
  organization_id: string
  created_by: string
  property_id_no?: string  // Unique property identification number

  // Core fields (1-15)
  adresse: string
  ville?: string
  municipalite?: string
  code_postal?: string
  province?: string
  prix_vente?: number
  prix_demande?: number
  date_vente?: string
  jours_sur_marche?: number
  status?: PropertyStatus
  type_propriete?: PropertyType

  // Sujet-specific fields (when status is "Sujet")
  // Note: valeur_evaluation and date_effective are UI-only fields that map to prix_vente and date_vente
  type_evaluation?: EvaluationType  // Only shown when status is Sujet

  // Occupancy fields
  occupancy?: OccupancyType
  loyer_en_place?: number  // Single rent for when occupancy is Locataire

  // Condo-specific fields
  frais_condo?: number  // Condo fees when type is Condo
  localisation?: CondoLocationType  // Coin or Centre
  type_copropriete?: CoproprieteType  // Divise or Indivise

  // Multi-unit property rents (Duplex, Triplex, Quadriplex+)
  unit_rents?: UnitRent[]  // Array of rents for multi-unit properties
  genre_propriete?: string
  type_batiment?: BuildingType
  annee_construction?: number
  chrono_age?: number  // Chronological age
  eff_age?: number  // Effective age
  zonage?: string
  superficie_terrain_m2?: number
  superficie_terrain_pi2?: number
  frontage_m2?: number
  profondeur_m2?: number
  frontage_pi2?: number
  profondeur_pi2?: number
  superficie_habitable_m2?: number
  superficie_habitable_pi2?: number
  perimetre_batiment_m2?: number
  perimetre_batiment_pi2?: number
  nombre_pieces?: number
  nombre_chambres?: number
  salle_bain?: number
  salle_eau?: number
  stationnement?: ParkingType
  type_garage?: GarageType
  dimension_garage?: string
  type_sous_sol?: BasementType
  toiture?: string
  extras?: string
  ameliorations_hors_sol?: string
  numero_mls?: string
  floor_areas?: FloorArea[]

  // Municipal data (Données municipales)
  lot_number?: string
  additional_lots?: AdditionalLot[]
  matricule?: string
  eval_municipale_annee?: string  // Changed to string for date input
  eval_municipale_terrain?: number
  eval_municipale_batiment?: number
  eval_municipale_total?: number
  taxes_municipales_annee?: number
  taxes_municipales_montant?: number
  taxes_scolaires_annee?: number
  taxes_scolaires_montant?: number
  zoning_usages_permis?: string

  // Historical
  date_vente_precedente?: string
  prix_vente_precedente?: number

  // Media
  media_references: MediaReference[]

  // Metadata
  source?: string
  notes?: string
  is_template: boolean
  is_shared: boolean

  // Inspection fields
  inspection_status?: InspectionStatus
  inspection_date?: string
  inspection_completion?: number
  inspection_pieces?: InspectionPieces
  inspection_batiment?: Record<string, any>
  inspection_garage?: Record<string, any>
  inspection_mecanique?: Record<string, any>
  inspection_exterieur?: Record<string, any>
  inspection_divers?: Record<string, any>
  inspection_categories_completed?: InspectionCategory[]

  created_at: Date
  updated_at: Date
}

export type PropertyType = typeof PROPERTY_TYPES[number]
export type PropertyStatus = typeof PROPERTY_STATUSES[number]
export type BasementType = typeof BASEMENT_TYPES[number]
export type ParkingType = typeof PARKING_TYPES[number]
export type FloorType = typeof FLOOR_TYPES[number]
export type OccupancyType = typeof OCCUPANCY_TYPES[number]
export type EvaluationType = typeof EVALUATION_TYPES[number]
export type BuildingType = typeof BUILDING_TYPES[number]
export type GarageType = typeof GARAGE_TYPES[number]
export type CondoLocationType = typeof CONDO_LOCATION_TYPES[number]
export type CoproprieteType = typeof COPROPRIETE_TYPES[number]

export interface FloorArea {
  id: string
  floor: FloorType
  area_m2: number
  area_ft2: number
  type: 'hors-sol' | 'sous-sol'
}

export interface PropertyCreateInput {
  adresse: string
  property_id_no?: string  // Unique property identification number
  ville?: string
  municipalite?: string
  code_postal?: string
  province?: string
  prix_vente?: number
  prix_demande?: number
  date_vente?: string
  jours_sur_marche?: number
  status?: PropertyStatus
  type_propriete?: PropertyType

  // Sujet-specific fields
  // Note: valeur_evaluation and date_effective are UI-only fields that map to prix_vente and date_vente
  type_evaluation?: EvaluationType

  // Occupancy fields
  occupancy?: OccupancyType
  loyer_en_place?: number

  // Condo-specific fields
  frais_condo?: number
  localisation?: CondoLocationType
  type_copropriete?: CoproprieteType

  // Multi-unit property rents
  unit_rents?: UnitRent[]

  genre_propriete?: string
  type_batiment?: BuildingType
  annee_construction?: number
  chrono_age?: number
  eff_age?: number
  zonage?: string
  superficie_terrain_m2?: number
  superficie_terrain_pi2?: number
  frontage_m2?: number
  profondeur_m2?: number
  frontage_pi2?: number
  profondeur_pi2?: number
  superficie_habitable_m2?: number
  superficie_habitable_pi2?: number
  perimetre_batiment_m2?: number
  perimetre_batiment_pi2?: number
  nombre_pieces?: number
  nombre_chambres?: number
  salle_bain?: number
  salle_eau?: number
  stationnement?: ParkingType
  type_garage?: GarageType
  dimension_garage?: string
  type_sous_sol?: BasementType
  toiture?: string
  extras?: string
  ameliorations_hors_sol?: string
  numero_mls?: string
  floor_areas?: FloorArea[]

  // Municipal data (Données municipales)
  lot_number?: string
  additional_lots?: AdditionalLot[]
  matricule?: string
  eval_municipale_annee?: string  // Changed to string for date input
  eval_municipale_terrain?: number
  eval_municipale_batiment?: number
  eval_municipale_total?: number
  taxes_municipales_annee?: number
  taxes_municipales_montant?: number
  taxes_scolaires_annee?: number
  taxes_scolaires_montant?: number
  zoning_usages_permis?: string

  source?: string
  notes?: string
  is_template?: boolean
  is_shared?: boolean
  inspection_status?: InspectionStatus
  inspection_date?: string
  inspection_completion?: number
  inspection_pieces?: InspectionPieces
  inspection_batiment?: Record<string, any>
  inspection_garage?: Record<string, any>
  inspection_mecanique?: Record<string, any>
  inspection_exterieur?: Record<string, any>
  inspection_divers?: Record<string, any>
  inspection_categories_completed?: InspectionCategory[]
}

export interface PropertyUpdateInput extends Partial<PropertyCreateInput> {
  id: string
}

export interface PropertyTableRow extends Property {
  selected?: boolean
}

export interface MLSData {
  adresse: string
  ville: string
  code_postal: string
  prix_vente?: number
  prix_demande: number
  date_vente?: string
  numero_mls: string
  type_propriete: string
  annee_construction?: number
  superficie_habitable_pi2?: number
  superficie_terrain_pi2?: number
  nombre_chambres?: number
  salle_bain?: number
  raw_data?: Record<string, any>
}

export interface RoleFoncierData {
  matricule: string
  evaluation_terrain: number
  evaluation_batiment: number
  evaluation_total: number
  date_evaluation: string
  taxes_municipales: number
  taxes_scolaires: number
  adresse: string
  lot: string
  cadastre: string
}