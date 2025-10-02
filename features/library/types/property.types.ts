import { MediaReference } from '@/types/common.types'

export interface Property {
  id: string
  organization_id: string
  created_by: string

  // Core fields (1-15)
  adresse: string
  ville?: string
  municipalite?: string
  code_postal?: string
  province?: string
  prix_vente?: number
  prix_demande?: number
  date_vente?: Date
  jours_sur_marche?: number
  status?: PropertyStatus
  type_propriete?: PropertyType
  genre_propriete?: string
  annee_construction?: number
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
  dimension_garage?: string
  type_sous_sol?: BasementType
  toiture?: string
  ameliorations_hors_sol?: string
  numero_mls?: string
  floor_areas?: FloorArea[]

  // Historical
  date_vente_precedente?: Date
  prix_vente_precedente?: number

  // Media
  media_references: MediaReference[]

  // Metadata
  source?: string
  notes?: string
  is_template: boolean
  is_shared: boolean

  created_at: Date
  updated_at: Date
}

export type PropertyType = 'Condo' | 'Unifamiliale' | 'Plex' | 'Appartement' | 'Semi-commercial' | 'Autre'
export type PropertyStatus = 'Vendu' | 'Actif' | 'Retiré' | 'Conditionnel' | 'Expiré'
export type BasementType = 'Aucun' | 'Complet aménagé' | 'Complet non-aménagé' | 'Partiel aménagé' | 'Partiel non-aménagé' | 'Vide sanitaire' | 'Dalle de béton'
export type ParkingType = 'Allée' | 'Garage' | 'Abri d\'auto' | 'Rue' | 'Aucun'
export type FloorType = 'Sous-sol' | 'Rez-de-chaussée' | '2e étage' | '3e étage' | 'Comble' | 'Mezzanine'

export interface FloorArea {
  id: string
  floor: FloorType
  area_m2: number
  area_ft2: number
  type: 'hors-sol' | 'sous-sol'
}

export interface PropertyCreateInput {
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
  genre_propriete?: string
  annee_construction?: number
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
  dimension_garage?: string
  type_sous_sol?: BasementType
  toiture?: string
  ameliorations_hors_sol?: string
  numero_mls?: string
  floor_areas?: FloorArea[]
  source?: string
  notes?: string
  is_template?: boolean
  is_shared?: boolean
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