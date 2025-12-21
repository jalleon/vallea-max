/**
 * Type definitions for Evaluations module
 */

export type TemplateType = 'RPS' | 'NAS' | 'CUSTOM' | 'AIC_FORM';

export type PropertyType =
  | 'condo_residentiel'
  | 'plex'
  | 'multifamilial'
  | 'residentiel_commercial'
  | 'residentiel_commercial_bureau'
  | 'residentiel_bureau'
  | 'commercial'
  | 'commercial_bureau'
  | 'bureau'
  | 'industriel'
  | 'industriel_bureau'
  | 'condo_commercial'
  | 'condo_bureau'
  | 'condo_industriel'
  | 'parc_maisons_mobiles'
  | 'terrain';

export type ValuationApproach =
  | 'methode_parite'
  | 'methode_cout'
  | 'flux_monetaire'
  | 'capitalisation_directe'
  | 'grm'
  | 'methode_residuelle';

export type PropertyGenre =
  | 'plain_pied'
  | 'a_etages'
  | '1_etage'
  | 'un_etage_et_demi'
  | 'deux_etages'
  | 'deux_etages_et_demi'
  | 'trois_etages'
  | 'paliers_multiples'
  | 'mobile'
  | 'maison_de_ville'
  | 'tour_appartement'
  | 'terrain_vacant';

export type ValueType = 'valeur_actuelle' | 'valeur_retrospective';

export type AppraisalStatus = 'draft' | 'in_progress' | 'review' | 'completed' | 'archived';

export interface Appraisal {
  id: string;
  templateType: TemplateType;
  clientName: string;
  appraisalNumber: string;
  propertyId?: string;
  propertyType: PropertyType;
  propertyGenre: PropertyGenre;
  valueType: ValueType;
  evaluationObjective: string;
  effectiveDate: string;
  address?: string;
  city?: string;
  postalCode?: string;
  sectionsData: Record<string, any>;
  status: AppraisalStatus;
  completionPercentage: number;
  organizationId: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CreateAppraisalRequest {
  templateType: TemplateType;
  clientName: string;
  propertyId?: string;
  propertyType: PropertyType;
  propertyGenre: PropertyGenre;
  valueType: ValueType;
  evaluationObjective: string;
  effectiveDate: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export interface WizardStep1Data {
  propertyType: PropertyType | null;
  propertyGenre: PropertyGenre | null;
  valuationApproaches: ValuationApproach[];
  surPlan: boolean;
}

export interface WizardStep2Data {
  clientName: string;
  propertyId: string | null;
  address: string | null;
  city: string;
  postalCode: string;
  valueType: ValueType | null;
  evaluationObjective: string;
  effectiveDate: string;
}