export type AdjustmentUnit = 'per_sqft' | 'per_year' | 'percentage' | 'fixed';
export type AdjustmentMethod = 'linear' | 'percentage' | 'fixed' | 'custom';
export type PropertyType = 'single_family' | 'duplex' | 'triplex' | 'quadruplex_plus' | 'condo' | 'apartment' | 'semi_commercial' | 'commercial' | 'land' | 'other';

export interface AdjustmentRate {
  value: number;
  unit: AdjustmentUnit;
  label?: string;
}

export interface AdjustmentDetail {
  category: string;
  enabled: boolean;

  // Subject data
  subjectValue: number | string | null;
  subjectLabel?: string;

  // Comparable data
  comparableValue: number | string | null;
  comparableLabel?: string;

  // Calculation inputs
  difference: number;
  adjustmentRate: number;
  depreciationRate?: number;

  // Result
  calculatedAmount: number;
  manualOverride?: number;

  // Metadata
  calculationFormula?: string;
  notes?: string;
}

export interface ComparableAdjustments {
  comparableId: string;
  comparableAddress: string;
  adjustments: {
    timing?: AdjustmentDetail;
    livingArea?: AdjustmentDetail;
    lotSize?: AdjustmentDetail;
    quality?: AdjustmentDetail;
    effectiveAge?: AdjustmentDetail;
    basement?: AdjustmentDetail;
    bathrooms?: AdjustmentDetail;
    garage?: AdjustmentDetail;
    floor?: AdjustmentDetail;
    landscaping?: AdjustmentDetail;
    extras?: AdjustmentDetail;
    unitLocation?: AdjustmentDetail;
    [key: string]: AdjustmentDetail | undefined;
  };
  totalAdjustment: number;
  adjustedValue: number;
}

export interface DefaultRates {
  // Market & Timing
  marketAppreciationRate: number; // % per year

  // Living Area
  livingAreaRate: number; // $/sqft

  // Land
  landRate: number; // $/sqft
  landDepreciationRate: number; // %

  // Basement
  basementFinishRate: number; // $/sqft
  basementDepreciationRate: number; // %

  // Quality
  qualityAdjustmentMethod: 'percentage' | 'fixed';
  qualityAdjustmentValue: number; // % or $ amount

  // Age
  ageAdjustmentRate: number; // $ per year OR %
  ageAdjustmentMethod: 'per_year' | 'percentage';

  // Bathrooms
  bathroomValue: number; // $ per bathroom
  bathroomDepreciationRate: number; // %

  // Garage/Parking
  garageValue: number; // $ per garage spot

  // Floor (condos)
  floorValue: number; // $ per floor

  // Landscaping
  landscapingDepreciationRate: number; // %

  // Extras
  extrasDepreciationRate: number; // %

  // Unit Location (condos)
  cornerUnitPremium: number; // $ amount
}

export interface AdjustmentsData {
  subjectPropertyId: string | null;
  propertyType: PropertyType;

  // Default rates by property type
  defaultRates: DefaultRates;

  // Organization-level default rates for all property types
  ratesByType?: {
    [K in PropertyType]?: DefaultRates;
  };

  // Per-comparable adjustments
  comparables: ComparableAdjustments[];

  // Sync settings
  autoSyncToDirectComparison: boolean;
  lastSyncedAt?: string;
}

export interface OrganizationAdjustmentPreset {
  id: string;
  organizationId: string;
  propertyType: PropertyType;
  rates: DefaultRates;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}
