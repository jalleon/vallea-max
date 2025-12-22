/**
 * Constants for evaluation types and options
 */

import { PropertyType, PropertyGenre, ValueType, ValuationApproach } from '../types/evaluation.types';

export const PROPERTY_TYPES: Array<{ value: PropertyType; label: string }> = [
  { value: 'condo_residentiel', label: 'Condo résidentiel' },
  { value: 'plex', label: 'Plex' },
  { value: 'multifamilial', label: 'Multifamilial' },
  { value: 'residentiel_commercial', label: 'Résidentiel/commercial' },
  { value: 'residentiel_commercial_bureau', label: 'Résidentiel/commercial/bureau' },
  { value: 'residentiel_bureau', label: 'Résidentiel/bureau' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'commercial_bureau', label: 'Commercial/bureau' },
  { value: 'bureau', label: 'Bureau' },
  { value: 'industriel', label: 'Industriel' },
  { value: 'industriel_bureau', label: 'Industriel/bureau' },
  { value: 'condo_commercial', label: 'Condo commercial' },
  { value: 'condo_bureau', label: 'Condo bureau' },
  { value: 'condo_industriel', label: 'Condo industriel' },
  { value: 'parc_maisons_mobiles', label: 'Parc de maisons mobiles' },
  { value: 'terrain', label: 'Terrain' }
];

// Property types that should hide the genre field (non-residential types)
export const PROPERTY_TYPES_HIDING_GENRE: PropertyType[] = [
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
];

export const VALUATION_APPROACHES: Array<{ value: ValuationApproach; label: string }> = [
  { value: 'methode_parite', label: 'Méthode de parité (comparaison directe)' },
  { value: 'methode_cout', label: 'Méthode du coût' },
  { value: 'flux_monetaire', label: 'Flux monétaire' },
  { value: 'capitalisation_directe', label: 'Capitalisation directe' },
  { value: 'grm', label: 'Multiplicateur de revenu brut (GRM)' },
  { value: 'methode_residuelle', label: 'Méthode résiduelle' }
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
  'methode_cout',
  'methode_comparaison',
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

// AIC Form sections (Version 2024)
// Merges new aic_ prefixed sections with original section IDs
export const AIC_FORM_SECTIONS = [
  // Property Details - Combined and individual sections
  'aic_property_info',     // Combined: Client + Appraiser + Subject on one page
  'aic_assignment',        // Assignment details
  'executive_summary',     // Executive Summary (original component)
  'neighborhood_site',     // Combined: Neighborhood + Site on one page
  'improvements',          // Improvements
  // Valuation Methods - Original sections (have existing components)
  'highest_best_use',
  'direct_comparison_approach',
  'cost_approach',
  'income_approach',
  'market_rent',
  // Conclusion and Certification - Original sections
  'reconciliation',
  'scope_certification',
  // Additional Sections (Addendums) - Original sections
  'extraordinary_items',
  'hypothetical_conditions',
  'photos_addendum',
  'comparable_photos',
  'building_sketch',
  'additional_sales',
  'zoning_map',
  'aerial_map',
  'site_map',
  'as_is_complete'
];

// AIC Form section groups for sidebar navigation
// Labels are handled via i18n in messages/en.json and messages/fr.json under evaluations.sections
export const AIC_FORM_SECTION_GROUPS = [
  {
    id: 'property_details',
    label: 'Property Details',
    sections: ['aic_property_info', 'aic_assignment', 'executive_summary', 'neighborhood_site', 'improvements']
  },
  {
    id: 'valuation_methods',
    label: 'Valuation Methods',
    sections: ['highest_best_use', 'direct_comparison_approach', 'cost_approach', 'income_approach', 'market_rent']
  },
  {
    id: 'conclusion_certification',
    label: 'Conclusion and Certification',
    sections: ['reconciliation', 'scope_certification']
  },
  {
    id: 'additional_sections',
    label: 'Additional Sections',
    sections: ['extraordinary_items', 'hypothetical_conditions', 'photos_addendum', 'comparable_photos', 'building_sketch', 'additional_sales', 'zoning_map', 'aerial_map', 'site_map', 'as_is_complete']
  }
];