/**
 * Constants for evaluation types and options
 */

import { PropertyType, PropertyGenre, ValueType } from '../types/evaluation.types';

export const PROPERTY_TYPES: Array<{ value: PropertyType; label: string }> = [
  { value: 'condo', label: 'Condo' },
  { value: 'single_family', label: 'Unifamiliale' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'triplex', label: 'Triplex' },
  { value: 'quadriplex_plus', label: 'Quadriplex+' },
  { value: 'apartment', label: 'Appartement' },
  { value: 'semi_commercial', label: 'Semi-Commercial' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Terrain' },
  { value: 'other', label: 'Autre' }
];

export const PROPERTY_GENRES: Array<{ value: PropertyGenre; label: string }> = [
  { value: 'plain_pied', label: 'Plain-pied' },
  { value: 'a_etages', label: 'À étages' },
  { value: '1_etage', label: '1 Étage' },
  { value: 'un_etage_et_demi', label: 'Un étage et demi' },
  { value: 'deux_etages', label: 'Deux étages' },
  { value: 'deux_etages_et_demi', label: 'Deux étages et demi' },
  { value: 'trois_etages', label: 'Trois étages' },
  { value: 'paliers_multiples', label: 'Paliers multiples' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'maison_de_ville', label: 'Maison de ville' },
  { value: 'tour_appartement', label: "Tour d'appartement" },
  { value: 'terrain_vacant', label: 'Terrain vacant' }
];

export const VALUE_TYPES: Array<{ value: ValueType; label: string }> = [
  { value: 'valeur_actuelle', label: 'Valeur actuelle' },
  { value: 'valeur_retrospective', label: 'Valeur rétrospective' }
];

export const EVALUATION_OBJECTIVES = [
  'Financement hypothécaire',
  'Achat/Vente',
  'Succession',
  'Divorce/Séparation',
  'Expropriation',
  'Litige',
  'Assurance',
  'Fiscalité',
  'Refinancement',
  'Évaluation municipale',
  'Autre'
];

// Template-specific sections
export const NAS_SECTIONS = [
  'client',
  'evaluateur',
  'propriete_evaluee',
  'quartier',
  'site',
  'ameliorations',
  'repartitions_pieces',
  'techniques_cout',
  'technique_parite',
  'exposition',
  'conciliation',
  'certification',
  'photos'
];

export const RPS_SECTIONS = [
  'client_evaluateur',
  'exec_summary',
  'sujet',
  'affectation',
  'voisinage',
  'emplacement',
  'ameliorations',
  'utilisation_optimale',
  'methode_parite',
  'historique_ventes',
  'duree_exposition',
  'conciliation_estimation',
  'definitions',
  'envergure',
  'methode_cout',
  'annexe_points_extraordinaires',
  'hypotheses_ordinaires',
  'certification',
  'addenda_photos_sujet',
  'addenda_photos_facades',
  'addenda_photos_listings',
  'addenda_croquis',
  'maps'
];

export const CUSTOM_SECTIONS = [
  'presentation',
  'fiche_reference',
  'general',
  'description',
  'cout_parite',
  'conclusion_comparaison',
  'methode_revenu',
  'loyer_marchand',
  'loyers',
  'calcul_revenu',
  'conciliation',
  'signature',
  'reserves_hypotheses',
  'photos',
  'sales',
  'zoning_plans',
  'maps'
];