// Shared property constants to ensure consistency across types and schemas

export const PROPERTY_TYPES = [
  'condo_residentiel',
  'plex',
  'multifamilial',
  'residentiel_commercial',
  'residentiel_commercial_bureau',
  'residentiel_bureau',
  'commercial',
  'commercial_bureau',
  'bureau',
  'industriel',
  'industriel_bureau',
  'condo_commercial',
  'condo_bureau',
  'condo_industriel',
  'parc_maisons_mobiles',
  'terrain'
] as const

export const PROPERTY_STATUSES = [
  'Vendu',
  'Sujet',
  'Actif'
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

export const BUILDING_TYPES = [
  'Isolé',
  'Semi-détaché',
  'En rangée',
  'En rangée sur coin'
] as const

export const GARAGE_TYPES = [
  'Attaché',
  'Détaché',
  'Intégré',
  'Au sous-sol',
  'Abri d\'auto'
] as const

export const CONDO_LOCATION_TYPES = [
  'Coin',
  'Centre'
] as const

export const COPROPRIETE_TYPES = [
  'Divise',
  'Indivise'
] as const
