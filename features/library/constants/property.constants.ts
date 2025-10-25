// Shared property constants to ensure consistency across types and schemas

export const PROPERTY_TYPES = [
  'Condo',
  'Unifamiliale',
  'Duplex',
  'Triplex',
  'Quadriplex+',
  'Appartement',
  'Semi-commercial',
  'Terrain',
  'Commercial',
  'Autre'
] as const

export const PROPERTY_STATUSES = [
  'Vendu',
  'Sujet',
  'À vendre',
  'Actif',
  'Retiré',
  'Conditionnel',
  'Expiré'
] as const

export const OCCUPANCY_TYPES = [
  'Propriétaire',
  'Locataire'
] as const

export const EVALUATION_TYPES = [
  'Valeur marchande',
  'Assurable'
] as const

export const BASEMENT_TYPES = [
  'Aucun',
  'Complet',
  'Partiel',
  'Complet aménagé',
  'Complet non-aménagé',
  'Partiel aménagé',
  'Partiel non-aménagé',
  'Vide sanitaire',
  'Dalle de béton'
] as const

export const PARKING_TYPES = [
  'Allée',
  'Garage',
  'Abri d\'auto',
  'Rue',
  'Aucun'
] as const

export const FLOOR_TYPES = [
  'Sous-sol',
  'Rez-de-chaussée',
  '2e étage',
  '3e étage',
  'Comble',
  'Mezzanine'
] as const
