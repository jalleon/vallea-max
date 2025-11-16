# Appraisal Sections Field Specification

**Purpose:** Complete field mapping for all appraisal sections across NAS, RPS, and CUSTOM templates
**Date:** 2025-11-16
**Status:** Design Phase

---

## Table of Contents

1. [Common Sections (All Templates)](#common-sections)
2. [NAS Template Sections](#nas-template-sections)
3. [RPS Template Sections](#rps-template-sections)
4. [CUSTOM Template Sections](#custom-template-sections)
5. [Field Types Reference](#field-types-reference)
6. [Validation Rules](#validation-rules)

---

## Common Sections (All Templates)

### ✅ 1. Presentation (presentation)
**Status:** Implemented
**Component:** `PresentationSectionContent.tsx`

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| reportTitle | text | ✅ | Max 200 chars | Default: "RAPPORT D'ÉVALUATION IMMOBILIÈRE" |
| civicAddress | text | ✅ | Non-empty | Auto-populated from appraisal |
| city | text | ✅ | Non-empty | Auto-populated from appraisal |
| fileNumber | text | ❌ | - | Internal reference |
| clientName | text | ✅ | Non-empty | Auto-populated from appraisal |
| companyAddress | text | ❌ | - | Rememberable preference |
| companyPhone | text | ❌ | Phone format | Rememberable preference |
| companyWebsite | text | ❌ | URL format | Rememberable preference |
| companyLogoUrl | text | ❌ | URL format | Rememberable preference |
| propertyPhotoUrl | text | ❌ | URL format | - |

**Features:**
- ✅ "Remember for future reports" checkbox
- ✅ Auto-populate from organization settings
- ✅ Photo upload placeholders

---

### ✅ 2. Reference Sheet (fiche_reference)
**Status:** Partially Implemented
**Component:** `AppraisalSectionForm.tsx` (renderReferenceSheetSection)

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| **Purpose & Scope** |
| purpose | rich-text | ✅ | Min 50 chars | Default template text |
| valueType | select | ✅ | Enum | Market Value, Insurance Value, Market Rental |
| appraisalDate | date | ✅ | Not future | Effective date of appraisal |
| inspectionDate | date | ✅ | Not future | Property inspection date |
| **Property Information** |
| address | text | ✅ | Non-empty | From appraisal |
| city | text | ✅ | Non-empty | From appraisal |
| postalCode | text | ❌ | Postal format | - |
| lotNumber | text | ❌ | - | Cadastral lot number |
| cadastre | text | ❌ | - | Default: "Cadastre du Québec" |
| municipality | text | ❌ | - | Municipality name |
| **Client (Mandant) Information** |
| mandantFileNumber | text | ❌ | - | Client's file reference |
| mandantName | text | ✅ | Non-empty | Client contact name |
| mandantCompany | text | ❌ | - | Client company |
| mandantAddress | text | ❌ | - | Client address |
| mandantCity | text | ❌ | - | Client city |
| mandantPhone | text | ❌ | Phone format | Client phone |
| mandantEmail | text | ❌ | Email format | Client email |
| **Owner Information** |
| ownerName | text | ❌ | - | Property owner |
| ownerPhone | text | ❌ | Phone format | Owner contact |
| **Borrower Information** |
| borrowerName | text | ❌ | - | If applicable |
| borrowerPhone | text | ❌ | Phone format | Borrower contact |
| **Property Details** |
| propertyType | select | ✅ | Enum | Single Family, Condo, Multi-Family, Commercial, Land |
| occupancy | select | ✅ | Enum | Owner-Occupied, Tenant-Occupied, Vacant |
| zoning | text | ❌ | - | Zoning classification |
| **Legal Description** |
| legalDescription | textarea | ❌ | Max 500 chars | Full legal description |
| registrationNumber | text | ❌ | - | Land registry number |

**Features:**
- ✅ Auto-populate from appraisal data
- ⏳ Conditional fields based on property type
- ⏳ Smart validation warnings

---

### ✅ 3. Direct Comparison / Méthode de Parité (methode_parite)
**Status:** Fully Implemented
**Component:** `DirectComparisonForm.tsx` (AG Grid)

**Data Structure:**
- `subject` - Subject property (ComparableProperty interface)
- `comparables[]` - Array of comparable properties
- `customLabels` - Custom field labels
- `measurementSystem` - Imperial/Metric toggle

**Features:**
- ✅ AG Grid spreadsheet interface
- ✅ Import from property library
- ✅ Auto-calculations (adjustments, totals, percentages)
- ✅ Undo/Redo
- ✅ Professional table export (Word & HTML)

---

### 4. Adjustments Calculator (adjustments_calculator)
**Status:** Implemented (Tool Tab)
**Component:** `AdjustmentsForm.tsx`

**Purpose:** Calculate adjustment amounts for comparable properties

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| **Default Adjustment Rates** |
| locationAdjustment | currency | ❌ | Per unit | $ per location quality difference |
| lotSizeAdjustment | currency | ❌ | Per sq ft | $ per square foot difference |
| livingAreaAdjustment | currency | ❌ | Per sq ft | $ per square foot difference |
| ageAdjustment | currency | ❌ | Per year | $ per year of age difference |
| conditionAdjustment | currency | ❌ | Percentage | % adjustment for condition |
| qualityAdjustment | currency | ❌ | Percentage | % adjustment for quality |
| basementAdjustment | currency | ❌ | Flat amount | $ for basement finish difference |
| garageAdjustment | currency | ❌ | Per space | $ per garage space |
| poolAdjustment | currency | ❌ | Flat amount | $ for pool presence |
| **Comparables Data** |
| comparables | array | ❌ | - | Linked to Direct Comparison |

**Features:**
- ✅ Define default rates per organization
- ✅ Apply rates to comparables automatically
- ✅ Override per comparable
- ⏳ Remember rates as user preference
- ⏳ Regional rate suggestions

---

## Narrative Sections (Need Implementation)

### 5. Neighborhood / Quartier / Voisinage
**Status:** ⏳ To Implement
**Used In:** NAS (quartier), RPS (voisinage), CUSTOM

**Field Structure:**
```typescript
interface NeighborhoodSection {
  // Narrative content (rich text editor)
  description: string; // HTML from Tiptap

  // Structured data (optional, for consistency)
  neighborhoodType?: 'residential' | 'commercial' | 'mixed' | 'industrial' | 'rural';
  developmentStage?: 'new' | 'developing' | 'established' | 'mature' | 'redevelopment';
  predominantUse?: string; // e.g., "Single-family homes"

  // Demographics (optional)
  populationTrend?: 'growing' | 'stable' | 'declining';
  incomeLevel?: 'low' | 'moderate' | 'high' | 'mixed';

  // Amenities (checkboxes)
  schools?: boolean;
  parks?: boolean;
  publicTransit?: boolean;
  shopping?: boolean;
  healthcare?: boolean;
  recreation?: boolean;

  // Services (checkboxes)
  water?: boolean;
  sewer?: boolean;
  electricity?: boolean;
  naturalGas?: boolean;
  cableInternet?: boolean;

  // Market perception
  desirability?: 'low' | 'moderate' | 'high' | 'very-high';

  // AI-generated content flag
  aiGenerated?: boolean;

  // Completion
  completed?: boolean;
}
```

**UI Components:**
- ✅ Rich text editor (Tiptap) - Already implemented
- ⏳ Structured fields section (collapsible)
- ⏳ AI Assistant button - Already implemented
- ⏳ Snippets dropdown - Already implemented
- ⏳ Amenities/Services checklist grid

**Suggested Layout:**
```
┌─────────────────────────────────────────────┐
│ Neighborhood Description                    │
│ ┌─────────────────────────────────────────┐ │
│ │ [Rich Text Editor with AI & Snippets]   │ │
│ │                                          │ │
│ │                                          │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ▼ Optional Structured Data (expand)        │
│ ┌─────────────────────────────────────────┐ │
│ │ Type: [Residential ▼]                   │ │
│ │ Stage: [Established ▼]                  │ │
│ │                                          │ │
│ │ Amenities:                               │ │
│ │ ☑ Schools  ☑ Parks  ☑ Transit           │ │
│ │ ☑ Shopping ☐ Healthcare ☐ Recreation    │ │
│ │                                          │ │
│ │ Services:                                │ │
│ │ ☑ Water ☑ Sewer ☑ Electricity           │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

### 6. Site / Emplacement
**Status:** ⏳ To Implement
**Used In:** NAS (site), RPS (emplacement), CUSTOM

**Field Structure:**
```typescript
interface SiteSection {
  // Narrative description
  description: string; // HTML from Tiptap

  // Lot characteristics
  lotSize?: string; // e.g., "5,000 sq ft" or "0.12 acres"
  lotDimensions?: string; // e.g., "50' x 100'"
  lotShape?: 'rectangular' | 'irregular' | 'corner' | 'flag' | 'pie-shaped';

  // Topography
  topography?: 'flat' | 'gentle-slope' | 'steep-slope' | 'rolling' | 'hilly';
  grading?: 'at-grade' | 'above-grade' | 'below-grade' | 'split-level';
  drainage?: 'excellent' | 'good' | 'adequate' | 'poor';

  // Location
  streetType?: 'local' | 'collector' | 'arterial' | 'highway' | 'cul-de-sac';
  trafficLevel?: 'low' | 'moderate' | 'high';
  cornerLot?: boolean;

  // Views & Exposure
  view?: 'none' | 'street' | 'park' | 'water' | 'mountain' | 'city' | 'other';
  exposure?: 'north' | 'south' | 'east' | 'west' | 'multi';

  // Utilities (if not covered in Neighborhood)
  waterSource?: 'municipal' | 'well' | 'cistern';
  sewerSystem?: 'municipal' | 'septic' | 'holding-tank';

  // Access
  roadAccess?: 'paved' | 'gravel' | 'dirt' | 'private';
  alleyAccess?: boolean;

  // Landscaping
  landscaping?: 'none' | 'minimal' | 'moderate' | 'extensive';
  fencing?: 'none' | 'partial' | 'full';

  // Special features
  specialFeatures?: string; // Free text for unique site features

  completed?: boolean;
}
```

**UI Components:**
- Rich text editor for narrative
- Structured fields (collapsible)
- Quick-select buttons for common values

---

### 7. Improvements / Améliorations
**Status:** ⏳ To Implement
**Used In:** NAS, RPS, CUSTOM

**Field Structure:**
```typescript
interface ImprovementsSection {
  // Narrative description
  description: string; // HTML from Tiptap

  // Building basics
  yearBuilt?: number;
  yearRenovated?: number; // Major renovation
  effectiveAge?: number; // Economic age vs actual age

  // Structure
  stories?: number; // 1, 1.5, 2, 2.5, 3, etc.
  buildingType?: 'detached' | 'semi-detached' | 'row' | 'duplex' | 'triplex' | 'apartment';
  architecturalStyle?: string; // e.g., "Colonial", "Contemporary", "Bungalow"

  // Construction
  foundationType?: 'concrete' | 'stone' | 'block' | 'piers' | 'slab';
  exteriorWalls?: 'brick' | 'stone' | 'vinyl' | 'wood' | 'stucco' | 'aluminum' | 'combination';
  roofType?: 'asphalt-shingle' | 'metal' | 'tile' | 'flat' | 'slate' | 'wood-shake';
  roofAge?: number; // Years since roof replacement

  // Living area
  grossLivingArea?: number; // Square feet/meters
  basementArea?: number;
  basementFinished?: 'none' | 'partial' | 'full';
  atticFinished?: boolean;

  // Rooms
  roomsTotal?: number;
  bedrooms?: number;
  bathrooms?: number; // Full bathrooms
  halfBathrooms?: number;

  // Systems
  heatingType?: 'forced-air' | 'hot-water' | 'electric' | 'heat-pump' | 'radiant' | 'none';
  heatingFuel?: 'gas' | 'oil' | 'electricity' | 'wood' | 'propane';
  coolingType?: 'central' | 'wall-unit' | 'window-unit' | 'heat-pump' | 'none';

  // Interior
  flooringTypes?: string[]; // Checkboxes: hardwood, carpet, tile, laminate, vinyl, etc.
  kitchenQuality?: 'basic' | 'average' | 'good' | 'excellent';
  bathroomQuality?: 'basic' | 'average' | 'good' | 'excellent';

  // Features
  fireplace?: boolean;
  fireplaceCount?: number;
  deck?: boolean;
  patio?: boolean;
  pool?: 'none' | 'above-ground' | 'in-ground';

  // Garage/Parking
  garageType?: 'none' | 'attached' | 'detached' | 'built-in' | 'carport';
  garageSpaces?: number;
  parkingSpaces?: number; // Additional outdoor parking

  // Condition
  overallCondition?: 'poor' | 'fair' | 'average' | 'good' | 'excellent';
  maintenanceLevel?: 'deferred' | 'minimal' | 'average' | 'above-average' | 'exceptional';

  // Recent updates (checkboxes with years)
  recentUpdates?: {
    roof?: number; // Year
    windows?: number;
    kitchen?: number;
    bathrooms?: number;
    flooring?: number;
    hvac?: number;
    electrical?: number;
    plumbing?: number;
  };

  completed?: boolean;
}
```

**UI Layout:**
```
┌─────────────────────────────────────────────┐
│ Improvements Description                    │
│ [Rich Text Editor]                          │
│                                             │
│ ▼ Building Details (expand)                │
│ ┌─────────────────────────────────────────┐ │
│ │ Year Built: [1985]  Renovated: [2010]  │ │
│ │ Stories: [2 ▼]  Type: [Detached ▼]     │ │
│ │                                          │ │
│ │ Construction:                            │ │
│ │ Foundation: [Concrete ▼]                │ │
│ │ Exterior: [Brick ▼]                     │ │
│ │ Roof: [Asphalt Shingle ▼] Age: [5 yrs] │ │
│ │                                          │ │
│ │ Living Area: [2,500] sq ft              │ │
│ │ Basement: [1,200] sq ft  Finished: [✓] │ │
│ │                                          │ │
│ │ Rooms: [8]  Bedrooms: [4]  Baths: [2.5]│ │
│ │                                          │ │
│ │ Heating: [Forced Air ▼] Fuel: [Gas ▼]  │ │
│ │ Cooling: [Central AC ▼]                 │ │
│ │                                          │ │
│ │ Garage: [Attached ▼] Spaces: [2]       │ │
│ │                                          │ │
│ │ Condition: [Good ▼]                     │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Conditional Fields:**
- If property type = "Condo": Hide lot size, garage type
- If property type = "Land": Hide all building fields
- If basement finished = "none": Hide basement bathroom count

---

### 8. Highest & Best Use / Utilisation Optimale
**Status:** ⏳ To Implement
**Used In:** RPS, CUSTOM

**Field Structure:**
```typescript
interface HighestBestUseSection {
  // Narrative analysis
  description: string; // HTML from Tiptap

  // Analysis framework (4 tests)
  legallyPermissible?: {
    assessment: 'yes' | 'no' | 'with-conditions';
    notes: string;
  };

  physicallyPossible?: {
    assessment: 'yes' | 'no' | 'with-modifications';
    notes: string;
  };

  financiallyFeasible?: {
    assessment: 'yes' | 'no' | 'marginal';
    notes: string;
  };

  maximallyProductive?: {
    assessment: 'yes' | 'no' | 'alternative-exists';
    notes: string;
  };

  // Conclusion
  conclusion?: 'as-improved' | 'as-vacant' | 'interim-use' | 'redevelopment';
  conclusionNarrative?: string;

  // Alternative uses considered
  alternativeUses?: string; // Free text

  completed?: boolean;
}
```

**UI Layout:**
```
┌─────────────────────────────────────────────┐
│ Highest & Best Use Analysis                │
│ [Rich Text Editor]                          │
│                                             │
│ ▼ Analysis Framework (expand)              │
│ ┌─────────────────────────────────────────┐ │
│ │ 1. Legally Permissible                  │ │
│ │    ◉ Yes  ○ No  ○ With Conditions       │ │
│ │    Notes: [Conforms to R-1 zoning]      │ │
│ │                                          │ │
│ │ 2. Physically Possible                  │ │
│ │    ◉ Yes  ○ No  ○ With Modifications    │ │
│ │    Notes: [Site suitable for current]   │ │
│ │                                          │ │
│ │ 3. Financially Feasible                 │ │
│ │    ◉ Yes  ○ No  ○ Marginal              │ │
│ │    Notes: [Generates positive return]   │ │
│ │                                          │ │
│ │ 4. Maximally Productive                 │ │
│ │    ◉ Yes  ○ No  ○ Alternative Exists    │ │
│ │    Notes: [Current use is optimal]      │ │
│ │                                          │ │
│ │ Conclusion:                              │ │
│ │    ◉ As Improved                         │ │
│ │    ○ As Vacant Land                      │ │
│ │    ○ Interim Use                         │ │
│ │    ○ Redevelopment                       │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

### 9. Market Analysis / Analyse du Marché
**Status:** ⏳ To Implement
**Used In:** CUSTOM, implied in others

**Field Structure:**
```typescript
interface MarketAnalysisSection {
  // Narrative
  description: string; // HTML from Tiptap

  // Market conditions
  marketCondition?: 'sellers' | 'buyers' | 'balanced';
  marketTrend?: 'appreciating' | 'stable' | 'depreciating';

  // Supply & Demand
  inventoryLevel?: 'low' | 'moderate' | 'high' | 'very-high';
  absorptionRate?: number; // Months
  averageDaysOnMarket?: number;

  // Pricing trends
  priceChangePercent?: number; // % change year-over-year
  priceChangeDirection?: 'increasing' | 'stable' | 'decreasing';

  // Sales activity
  salesVolume?: 'low' | 'moderate' | 'high';
  competitionLevel?: 'low' | 'moderate' | 'high' | 'intense';

  // Economic factors
  economicConditions?: string; // Free text
  interestRateImpact?: string; // Free text

  completed?: boolean;
}
```

---

### 10. Reconciliation / Conciliation
**Status:** ⏳ To Implement
**Used In:** NAS (conciliation), RPS (conciliation_estimation), CUSTOM

**Field Structure:**
```typescript
interface ReconciliationSection {
  // Narrative
  description: string; // HTML from Tiptap

  // Approaches considered
  directComparisonUsed?: boolean;
  costApproachUsed?: boolean;
  incomeApproachUsed?: boolean;

  // Indicators from each approach
  directComparisonValue?: number;
  costApproachValue?: number;
  incomeApproachValue?: number;

  // Weights assigned
  directComparisonWeight?: number; // % (0-100)
  costApproachWeight?: number; // %
  incomeApproachWeight?: number; // %

  // Final value conclusion
  finalValue?: number;
  finalValueRounded?: number; // Rounded to nearest $1,000 or $5,000

  // Reconciliation logic
  primaryApproach?: 'direct-comparison' | 'cost' | 'income';
  reconciliationRationale?: string;

  completed?: boolean;
}
```

---

### 11. Sales History / Historique des Ventes
**Status:** ⏳ To Implement
**Used In:** RPS, CUSTOM

**Field Structure:**
```typescript
interface SalesHistorySection {
  // Narrative
  description: string; // HTML from Tiptap

  // Prior sales of subject property
  priorSales?: Array<{
    date: string;
    price: number;
    buyer: string;
    seller: string;
    conditions: string; // "Arms-length", "Family transfer", etc.
  }>;

  // 3-year history analysis
  threeYearHistory?: string;

  // Current listing
  currentlyListed?: boolean;
  listingPrice?: number;
  listingDate?: string;
  daysOnMarket?: number;

  completed?: boolean;
}
```

---

### 12. Exposure Time / Durée d'Exposition
**Status:** ⏳ To Implement
**Used In:** NAS (exposition), RPS (duree_exposition)

**Field Structure:**
```typescript
interface ExposureTimeSection {
  // Narrative
  description: string; // HTML from Tiptap

  // Exposure estimate
  estimatedExposureTime?: number; // Days
  marketingTimeRange?: {
    min: number;
    max: number;
  };

  // Factors considered
  propertyType?: string;
  priceRange?: string;
  marketConditions?: string;
  location?: string;

  completed?: boolean;
}
```

---

## Field Types Reference

| Type | HTML Input | Validation | Example |
|------|-----------|------------|---------|
| **text** | `<TextField>` | Max length, regex | "123 Main Street" |
| **textarea** | `<TextField multiline>` | Max length | Long text |
| **rich-text** | `<NarrativeEditor>` (Tiptap) | HTML tags allowed | Formatted paragraphs |
| **number** | `<TextField type="number">` | Min/max, decimals | 2500 |
| **currency** | `<TextField>` with $ formatter | Min 0, decimals | $350,000 |
| **date** | `<TextField type="date">` | Valid date, not future | 2025-11-15 |
| **select** | `<Select>` with `<MenuItem>` | Must be in enum | "Single Family" |
| **checkbox** | `<Checkbox>` | Boolean | true/false |
| **radio** | `<Radio>` group | One selection | "good" |
| **array** | Custom component (AG Grid, list) | - | [{...}, {...}] |

---

## Validation Rules

### By Priority

**Critical (Block Save):**
- Required fields must not be empty
- Dates must be valid and not in future (for past events)
- Currency/number fields must be numeric and >= 0

**Warnings (Allow Save):**
- Living area too small for bedroom count
- Price per sq ft outliers
- Missing commonly expected fields
- Inconsistent data (e.g., year built > year renovated)

**Info (Suggestions):**
- Incomplete optional sections
- Missing recommended documentation
- Fields that could benefit from AI assistance

---

## Implementation Priority

### Phase 1: Core Narrative Sections (Week 1-2)
1. ✅ Presentation - Done
2. ✅ Reference Sheet - Mostly done
3. ⏳ Neighborhood/Quartier - Implement next
4. ⏳ Site/Emplacement - Implement next
5. ⏳ Improvements/Améliorations - Implement next

### Phase 2: Analysis Sections (Week 3-4)
6. ✅ Direct Comparison - Done
7. ⏳ Highest & Best Use
8. ⏳ Market Analysis
9. ⏳ Reconciliation

### Phase 3: Supporting Sections (Week 5)
10. ⏳ Sales History
11. ⏳ Exposure Time
12. ⏳ Additional template-specific sections

---

## Next Steps

1. **Review & Approve** this specification
2. **Prioritize sections** for implementation
3. **Create components** for each section
4. **Add i18n keys** for all field labels
5. **Implement validation** rules
6. **Test with real data**

---

**Document Version:** 1.0
**Last Updated:** 2025-11-16
**Status:** Draft - Ready for Review
