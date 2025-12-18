import { DefaultRates, PropertyType } from '../types/adjustments.types';

// Default adjustment rates for different property types
export const DEFAULT_RATES_BY_PROPERTY_TYPE: Record<string, DefaultRates> = {
  single_family: {
    marketAppreciationRate: 5.0,
    livingAreaRate: 30.0,
    landRate: 15.0,
    landDepreciationRate: 10.0,
    basementFinishRate: 25.0,
    basementDepreciationRate: 15.0,
    qualityAdjustmentMethod: 'percentage',
    qualityAdjustmentValue: 10.0,
    ageAdjustmentRate: 1000.0,
    ageAdjustmentMethod: 'per_year',
    bathroomValue: 5000.0,
    bathroomRate: 5000.0,
    powderRoomRate: 2500.0,
    bathroomDepreciationRate: 10.0,
    garageValue: 10000.0,
    floorValue: 0,
    landscapingDepreciationRate: 15.0,
    extrasDepreciationRate: 20.0,
    cornerUnitPremium: 0
  },
  duplex: {
    marketAppreciationRate: 5.0,
    livingAreaRate: 28.0,
    landRate: 12.0,
    landDepreciationRate: 10.0,
    basementFinishRate: 22.0,
    basementDepreciationRate: 15.0,
    qualityAdjustmentMethod: 'percentage',
    qualityAdjustmentValue: 10.0,
    ageAdjustmentRate: 800.0,
    ageAdjustmentMethod: 'per_year',
    bathroomValue: 4500.0,
    bathroomRate: 4500.0,
    powderRoomRate: 2250.0,
    bathroomDepreciationRate: 10.0,
    garageValue: 8000.0,
    floorValue: 0,
    landscapingDepreciationRate: 15.0,
    extrasDepreciationRate: 20.0,
    cornerUnitPremium: 0
  },
  triplex: {
    marketAppreciationRate: 5.0,
    livingAreaRate: 26.0,
    landRate: 10.0,
    landDepreciationRate: 10.0,
    basementFinishRate: 20.0,
    basementDepreciationRate: 15.0,
    qualityAdjustmentMethod: 'percentage',
    qualityAdjustmentValue: 10.0,
    ageAdjustmentRate: 700.0,
    ageAdjustmentMethod: 'per_year',
    bathroomValue: 4000.0,
    bathroomRate: 4000.0,
    powderRoomRate: 2000.0,
    bathroomDepreciationRate: 10.0,
    garageValue: 7000.0,
    floorValue: 0,
    landscapingDepreciationRate: 15.0,
    extrasDepreciationRate: 20.0,
    cornerUnitPremium: 0
  },
  quadruplex: {
    marketAppreciationRate: 5.0,
    livingAreaRate: 24.0,
    landRate: 8.0,
    landDepreciationRate: 10.0,
    basementFinishRate: 18.0,
    basementDepreciationRate: 15.0,
    qualityAdjustmentMethod: 'percentage',
    qualityAdjustmentValue: 10.0,
    ageAdjustmentRate: 600.0,
    ageAdjustmentMethod: 'per_year',
    bathroomValue: 3500.0,
    bathroomRate: 3500.0,
    powderRoomRate: 1750.0,
    bathroomDepreciationRate: 10.0,
    garageValue: 6000.0,
    floorValue: 0,
    landscapingDepreciationRate: 15.0,
    extrasDepreciationRate: 20.0,
    cornerUnitPremium: 0
  },
  condo: {
    marketAppreciationRate: 5.0,
    livingAreaRate: 35.0,
    landRate: 0,
    landDepreciationRate: 0,
    basementFinishRate: 0,
    basementDepreciationRate: 0,
    qualityAdjustmentMethod: 'percentage',
    qualityAdjustmentValue: 10.0,
    ageAdjustmentRate: 500.0,
    ageAdjustmentMethod: 'per_year',
    bathroomValue: 5000.0,
    bathroomRate: 5000.0,
    powderRoomRate: 2500.0,
    bathroomDepreciationRate: 10.0,
    garageValue: 15000.0,
    floorValue: 2000.0,
    landscapingDepreciationRate: 0,
    extrasDepreciationRate: 20.0,
    cornerUnitPremium: 5000.0
  },
  commercial: {
    marketAppreciationRate: 5.0,
    livingAreaRate: 50.0,
    landRate: 20.0,
    landDepreciationRate: 10.0,
    basementFinishRate: 30.0,
    basementDepreciationRate: 15.0,
    qualityAdjustmentMethod: 'percentage',
    qualityAdjustmentValue: 15.0,
    ageAdjustmentRate: 2000.0,
    ageAdjustmentMethod: 'per_year',
    bathroomValue: 3000.0,
    bathroomRate: 3000.0,
    powderRoomRate: 1500.0,
    bathroomDepreciationRate: 10.0,
    garageValue: 5000.0,
    floorValue: 0,
    landscapingDepreciationRate: 15.0,
    extrasDepreciationRate: 20.0,
    cornerUnitPremium: 0
  },
  land: {
    marketAppreciationRate: 5.0,
    livingAreaRate: 0,
    landRate: 10.0,
    landDepreciationRate: 0,
    basementFinishRate: 0,
    basementDepreciationRate: 0,
    qualityAdjustmentMethod: 'percentage',
    qualityAdjustmentValue: 10.0,
    ageAdjustmentRate: 0,
    ageAdjustmentMethod: 'per_year',
    bathroomValue: 0,
    bathroomRate: 0,
    powderRoomRate: 0,
    bathroomDepreciationRate: 0,
    garageValue: 0,
    floorValue: 0,
    landscapingDepreciationRate: 10.0,
    extrasDepreciationRate: 10.0,
    cornerUnitPremium: 0
  }
};

// Adjustment categories configuration
export const ADJUSTMENT_CATEGORIES: Array<{
  id: string;
  labelKey: string;
  directComparisonField: string;
  requiresRate: boolean;
  requiresDepreciation: boolean;
  unit: string;
  applicablePropertyTypes: PropertyType[];
}> = [
  {
    id: 'timing',
    labelKey: 'timing',
    directComparisonField: 'adjustmentDataSource',
    requiresRate: true,
    requiresDepreciation: false,
    unit: 'percentage',
    applicablePropertyTypes: ['single_family', 'duplex', 'triplex', 'quadruplex_plus', 'condo', 'commercial', 'land']
  },
  {
    id: 'livingArea',
    labelKey: 'livingArea',
    directComparisonField: 'adjustmentLivingArea',
    requiresRate: true,
    requiresDepreciation: false,
    unit: 'per_sqft',
    applicablePropertyTypes: ['single_family', 'duplex', 'triplex', 'quadruplex_plus', 'condo', 'commercial']
  },
  {
    id: 'lotSize',
    labelKey: 'lotSize',
    directComparisonField: 'adjustmentLotSize',
    requiresRate: true,
    requiresDepreciation: true,
    unit: 'per_sqft',
    applicablePropertyTypes: ['single_family', 'duplex', 'triplex', 'quadruplex_plus', 'commercial', 'land']
  },
  {
    id: 'quality',
    labelKey: 'quality',
    directComparisonField: 'adjustmentQuality',
    requiresRate: true,
    requiresDepreciation: false,
    unit: 'percentage',
    applicablePropertyTypes: ['single_family', 'duplex', 'triplex', 'quadruplex_plus', 'condo', 'commercial']
  },
  {
    id: 'effectiveAge',
    labelKey: 'effectiveAge',
    directComparisonField: 'adjustmentAge',
    requiresRate: true,
    requiresDepreciation: false,
    unit: 'per_year',
    applicablePropertyTypes: ['single_family', 'duplex', 'triplex', 'quadruplex_plus', 'condo', 'commercial']
  },
  {
    id: 'basement',
    labelKey: 'basement',
    directComparisonField: 'adjustmentBasement',
    requiresRate: true,
    requiresDepreciation: true,
    unit: 'per_sqft',
    applicablePropertyTypes: ['single_family', 'duplex', 'triplex', 'quadruplex_plus']
  },
  {
    id: 'bathrooms',
    labelKey: 'bathrooms',
    directComparisonField: 'adjustmentRooms', // May need separate field
    requiresRate: true,
    requiresDepreciation: true,
    unit: 'fixed',
    applicablePropertyTypes: ['single_family', 'duplex', 'triplex', 'quadruplex_plus', 'condo']
  },
  {
    id: 'garage',
    labelKey: 'garage',
    directComparisonField: 'adjustmentParking',
    requiresRate: true,
    requiresDepreciation: false,
    unit: 'fixed',
    applicablePropertyTypes: ['single_family', 'duplex', 'triplex', 'quadruplex_plus', 'condo']
  },
  {
    id: 'floor',
    labelKey: 'floor',
    directComparisonField: 'adjustmentFloor', // NEW FIELD
    requiresRate: true,
    requiresDepreciation: false,
    unit: 'fixed',
    applicablePropertyTypes: ['condo', 'apartment']
  },
  {
    id: 'landscaping',
    labelKey: 'landscaping',
    directComparisonField: 'adjustmentLandscaping', // NEW FIELD
    requiresRate: true,
    requiresDepreciation: true,
    unit: 'fixed',
    applicablePropertyTypes: ['single_family', 'duplex', 'triplex', 'quadruplex_plus', 'land']
  },
  {
    id: 'extras',
    labelKey: 'extras',
    directComparisonField: 'adjustmentExtras',
    requiresRate: true,
    requiresDepreciation: true,
    unit: 'fixed',
    applicablePropertyTypes: ['single_family', 'duplex', 'triplex', 'quadruplex_plus', 'condo', 'commercial']
  },
  {
    id: 'unitLocation',
    labelKey: 'unitLocation',
    directComparisonField: 'adjustmentUnitLocation',
    requiresRate: true,
    requiresDepreciation: false,
    unit: 'fixed',
    applicablePropertyTypes: ['condo', 'apartment']
  }
];
