/**
 * Utility for determining field visibility based on property type
 * Phase 4: Smart Forms & Auto-Population
 */

export type PropertyType = 'single_family' | 'condo' | 'multi_family' | 'commercial' | 'land' | 'other';

interface FieldVisibilityRule {
  field: string;
  visibleFor: PropertyType[];
  requiredFor?: PropertyType[];
  label?: string;
  description?: string;
}

/**
 * Field visibility rules by property type
 * Controls which fields appear in forms based on property type
 */
export const FIELD_VISIBILITY_RULES: FieldVisibilityRule[] = [
  // Always visible fields
  {
    field: 'address',
    visibleFor: ['single_family', 'condo', 'multi_family', 'commercial', 'land', 'other'],
    requiredFor: ['single_family', 'condo', 'multi_family', 'commercial', 'land']
  },
  {
    field: 'salePrice',
    visibleFor: ['single_family', 'condo', 'multi_family', 'commercial', 'land', 'other'],
    requiredFor: ['single_family', 'condo', 'multi_family', 'commercial']
  },
  {
    field: 'saleDate',
    visibleFor: ['single_family', 'condo', 'multi_family', 'commercial', 'land', 'other'],
    requiredFor: ['single_family', 'condo', 'multi_family', 'commercial']
  },
  {
    field: 'lotSize',
    visibleFor: ['single_family', 'multi_family', 'commercial', 'land', 'other'],
    requiredFor: ['single_family', 'multi_family', 'land']
  },

  // Building-specific fields (NOT for land)
  {
    field: 'livingArea',
    visibleFor: ['single_family', 'condo', 'multi_family', 'commercial'],
    requiredFor: ['single_family', 'condo', 'multi_family'],
    description: 'Not applicable for land parcels'
  },
  {
    field: 'roomsTotal',
    visibleFor: ['single_family', 'condo', 'multi_family'],
    requiredFor: ['single_family', 'condo'],
    description: 'Number of rooms (not applicable for commercial/land)'
  },
  {
    field: 'roomsBedrooms',
    visibleFor: ['single_family', 'condo', 'multi_family'],
    requiredFor: ['single_family', 'condo'],
    description: 'Number of bedrooms (not applicable for commercial/land)'
  },
  {
    field: 'roomsBathrooms',
    visibleFor: ['single_family', 'condo', 'multi_family'],
    requiredFor: ['single_family', 'condo'],
    description: 'Number of bathrooms (not applicable for commercial/land)'
  },
  {
    field: 'basement',
    visibleFor: ['single_family', 'condo', 'multi_family'],
    description: 'Basement details (not applicable for commercial/land)'
  },
  {
    field: 'age',
    visibleFor: ['single_family', 'condo', 'multi_family', 'commercial'],
    requiredFor: ['single_family', 'condo', 'multi_family'],
    description: 'Building age (not applicable for land)'
  },
  {
    field: 'condition',
    visibleFor: ['single_family', 'condo', 'multi_family', 'commercial'],
    requiredFor: ['single_family', 'condo', 'multi_family'],
    description: 'Building condition (not applicable for land)'
  },

  // Condo-specific fields
  {
    field: 'unitLocation',
    visibleFor: ['condo'],
    requiredFor: ['condo'],
    label: 'Unit Location',
    description: 'Floor level and unit position (condos only)'
  },
  {
    field: 'condoFees',
    visibleFor: ['condo'],
    label: 'Condo Fees',
    description: 'Monthly condominium fees (condos only)'
  },
  {
    field: 'aboveGradeImprovements',
    visibleFor: ['condo'],
    label: 'Above Grade Improvements',
    description: 'Improvements above ground level (condos only)'
  },

  // Multi-family specific fields
  {
    field: 'numberOfUnits',
    visibleFor: ['multi_family', 'commercial'],
    requiredFor: ['multi_family'],
    label: 'Number of Units',
    description: 'Total rental units (multi-family/commercial only)'
  },
  {
    field: 'monthlyIncome',
    visibleFor: ['multi_family', 'commercial'],
    label: 'Monthly Rental Income',
    description: 'Total monthly rental income (multi-family/commercial)'
  },
  {
    field: 'operatingExpenses',
    visibleFor: ['multi_family', 'commercial'],
    label: 'Operating Expenses',
    description: 'Annual operating expenses (multi-family/commercial)'
  },

  // Commercial-specific fields
  {
    field: 'zoning',
    visibleFor: ['commercial', 'land', 'multi_family'],
    requiredFor: ['commercial', 'land'],
    label: 'Zoning',
    description: 'Zoning classification'
  },
  {
    field: 'commercialUse',
    visibleFor: ['commercial'],
    requiredFor: ['commercial'],
    label: 'Commercial Use',
    description: 'Type of commercial use (commercial only)'
  },
  {
    field: 'capRate',
    visibleFor: ['commercial', 'multi_family'],
    label: 'Capitalization Rate',
    description: 'Cap rate for income-producing properties'
  },

  // Land-specific fields
  {
    field: 'landUse',
    visibleFor: ['land'],
    requiredFor: ['land'],
    label: 'Land Use',
    description: 'Current or permitted land use (land only)'
  },
  {
    field: 'utilities',
    visibleFor: ['land', 'commercial'],
    label: 'Utilities Available',
    description: 'Available utilities (water, sewer, electric, gas)'
  },
  {
    field: 'topography',
    visibleFor: ['land'],
    label: 'Topography',
    description: 'Land topography and grading (land only)'
  },
  {
    field: 'accessibility',
    visibleFor: ['land', 'commercial'],
    label: 'Accessibility',
    description: 'Road access and easements'
  },

  // Parking (varies by type)
  {
    field: 'parking',
    visibleFor: ['single_family', 'condo', 'multi_family', 'commercial'],
    requiredFor: ['single_family'],
    description: 'Parking spaces (not applicable for land)'
  }
];

/**
 * Check if a field should be visible for a given property type
 */
export function isFieldVisible(fieldName: string, propertyType: PropertyType): boolean {
  const rule = FIELD_VISIBILITY_RULES.find(r => r.field === fieldName);
  if (!rule) {
    // If no rule exists, field is visible for all types
    return true;
  }
  return rule.visibleFor.includes(propertyType);
}

/**
 * Check if a field is required for a given property type
 */
export function isFieldRequired(fieldName: string, propertyType: PropertyType): boolean {
  const rule = FIELD_VISIBILITY_RULES.find(r => r.field === fieldName);
  if (!rule || !rule.requiredFor) {
    return false;
  }
  return rule.requiredFor.includes(propertyType);
}

/**
 * Get all visible fields for a property type
 */
export function getVisibleFields(propertyType: PropertyType): string[] {
  return FIELD_VISIBILITY_RULES
    .filter(rule => rule.visibleFor.includes(propertyType))
    .map(rule => rule.field);
}

/**
 * Get all required fields for a property type
 */
export function getRequiredFields(propertyType: PropertyType): string[] {
  return FIELD_VISIBILITY_RULES
    .filter(rule => rule.requiredFor?.includes(propertyType))
    .map(rule => rule.field);
}

/**
 * Get field label and description
 */
export function getFieldInfo(fieldName: string): { label?: string; description?: string } {
  const rule = FIELD_VISIBILITY_RULES.find(r => r.field === fieldName);
  return {
    label: rule?.label,
    description: rule?.description
  };
}

/**
 * Validate form data against property type rules
 * Returns list of missing required fields
 */
export function validateRequiredFields(
  formData: Record<string, any>,
  propertyType: PropertyType
): string[] {
  const requiredFields = getRequiredFields(propertyType);
  const missingFields: string[] = [];

  requiredFields.forEach(field => {
    const value = formData[field];
    if (value === undefined || value === null || value === '') {
      missingFields.push(field);
    }
  });

  return missingFields;
}
