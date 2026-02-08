# Feature: Comparable Lists

## Overview

Add the ability to curate shortlists of properties from the Library module and associate them with specific appraisals. Each appraisal can have multiple comparable lists (one per value approach). From the Appraisal module, users load their pre-built lists directly into the respective approach sections.

This bridges the **Library** and **Evaluations** modules, turning property research into a streamlined workflow: browse/filter/map properties → shortlist comparables → use them in appraisals.

---

## Goals

1. **Select & shortlist** - From the Library (table or map view), select properties and add them to a comparable list
2. **Appraisal-scoped lists** - Each list is tied to a specific appraisal
3. **Multiple list types per appraisal** - One list per value approach (direct comparison, direct cap, land, commercial lease, residential lease)
4. **Load into appraisal** - From the Appraisal module's value approach sections, load comps from the associated list
5. **Manage lists** - View, edit, reorder, and remove properties from lists

---

## Current State

| Aspect | Status |
|--------|--------|
| Comparable selection | One-at-a-time dialog inside appraisal sections |
| Comparable storage | JSONB array in `form_data.methode_parite.comparables[]` |
| `comparables` DB table | Exists but **unused** |
| Cross-module bridge | None - Library and Evaluations are independent |
| Pre-built shortlists | Do not exist |

---

## Terminology

| Term | Meaning |
|------|---------|
| **Comparable list** | A named shortlist of properties tied to one appraisal + one list type |
| **List type** | The value approach the list serves (see table below) |
| **Comp** | A single property within a comparable list |

### List Types

| ID | Label (EN) | Label (FR) | Used by Appraisal Section |
|----|-----------|-----------|---------------------------|
| `direct_comparison` | Direct Comparison | Comparaison directe | `methode_parite` / `methode_comparaison` / `direct_comparison_approach` |
| `direct_capitalization` | Direct Capitalization | Capitalisation directe | `methode_revenu` / `income_approach` |
| `land` | Land Comparables | Terrains comparables | Land-specific sections |
| `commercial_lease` | Commercial Leases | Baux commerciaux | `loyers` / commercial lease sections |
| `residential_lease` | Residential Leases | Baux residentiels | `loyer_marchand` / `market_rent` |

---

## Technical Design

### 1. Database Schema

**New table: `comparable_lists`**

```sql
CREATE TABLE comparable_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  appraisal_id UUID NOT NULL REFERENCES appraisals(id) ON DELETE CASCADE,
  list_type TEXT NOT NULL,  -- 'direct_comparison' | 'direct_capitalization' | 'land' | 'commercial_lease' | 'residential_lease'
  name TEXT,                -- Optional user label (e.g., "Main comps", "Backup set")
  items JSONB NOT NULL DEFAULT '[]',  -- Array of { property_id, sort_order, notes }
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One list per type per appraisal (can be relaxed later if needed)
  UNIQUE (appraisal_id, list_type)
);

-- RLS policies (same pattern as other tables)
ALTER TABLE comparable_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their org comparable lists"
  ON comparable_lists FOR ALL
  USING (organization_id = get_user_organization_id(auth.uid()));

-- Indexes
CREATE INDEX idx_comparable_lists_appraisal ON comparable_lists(appraisal_id);
CREATE INDEX idx_comparable_lists_org ON comparable_lists(organization_id);
```

**`items` JSONB structure:**

```typescript
interface ComparableListItem {
  property_id: string;   // UUID reference to properties table
  sort_order: number;    // Display order in the list
  notes?: string;        // Optional per-comp note (e.g., "Best comp - same street")
  added_at: string;      // ISO timestamp
}
```

**Why JSONB for items instead of a join table:**
- Keeps sort order and notes inline (no extra queries)
- Typical list size is 3-8 items (never thousands)
- Matches the project's existing JSONB-first pattern
- Single read/write per list operation
- Property details are fetched separately from the `properties` table when needed

---

### 2. Service Layer

**New file: `features/library/_api/comparable-lists.service.ts`**

```typescript
export const comparableListsService = {
  // Get all lists for an appraisal
  getByAppraisal(appraisalId: string): Promise<ComparableList[]>,

  // Get a specific list by appraisal + type
  getByType(appraisalId: string, listType: ListType): Promise<ComparableList | null>,

  // Create or update a list (upsert on appraisal_id + list_type)
  upsert(appraisalId: string, listType: ListType, items: ComparableListItem[]): Promise<ComparableList>,

  // Add properties to a list (appends to existing items)
  addProperties(appraisalId: string, listType: ListType, propertyIds: string[]): Promise<ComparableList>,

  // Remove a property from a list
  removeProperty(appraisalId: string, listType: ListType, propertyId: string): Promise<ComparableList>,

  // Reorder items in a list
  reorder(appraisalId: string, listType: ListType, propertyIds: string[]): Promise<ComparableList>,

  // Delete an entire list
  delete(listId: string): Promise<void>,

  // Get all lists across appraisals that include a specific property
  getListsForProperty(propertyId: string): Promise<ComparableList[]>,
};
```

---

### 3. TypeScript Types

**New file: `features/library/types/comparable-list.types.ts`**

```typescript
export type ComparableListType =
  | 'direct_comparison'
  | 'direct_capitalization'
  | 'land'
  | 'commercial_lease'
  | 'residential_lease';

export interface ComparableListItem {
  property_id: string;
  sort_order: number;
  notes?: string;
  added_at: string;
}

export interface ComparableList {
  id: string;
  appraisal_id: string;
  list_type: ComparableListType;
  name?: string;
  items: ComparableListItem[];
  created_at: string;
  updated_at: string;
}

// Enriched item with full property data (for display)
export interface ComparableListItemWithProperty extends ComparableListItem {
  property: Property;  // Full property from properties table
}
```

---

### 4. UI Design - Library Side

#### 4.1 Adding Comps from the Library

**Entry point:** The library page already has multi-select (checkboxes). Add a new action button in the header when properties are selected:

```
┌─────────────────────────────────────────────────────────────────┐
│  Property Library           [Delete Selected] [+ Add to Comps] │
│                             [Export]  [New Property]            │
├─────────────────────────────────────────────────────────────────┤
│  Filters...                                                    │
├─────────────────────────────────────────────────────────────────┤
│  ☑ Property 1                                                  │
│  ☑ Property 2                                                  │
│  ☐ Property 3                                                  │
│  ☑ Property 4                                                  │
└─────────────────────────────────────────────────────────────────┘
```

The **"+ Add to Comps"** button appears when 1+ properties are selected.

#### 4.2 Add to Comps Dialog

Clicking "Add to Comps" opens a dialog:

```
┌─────────────────────────────────────────────┐
│  Add to Comparable List                     │
│                                             │
│  Appraisal *                                │
│  ┌─────────────────────────────────────┐    │
│  │ ▾ Select an appraisal...            │    │
│  │   #24-001 - 123 Rue Principale     │    │
│  │   #24-002 - 456 Boul. St-Laurent  │    │
│  │   #24-003 - 789 Ave du Parc       │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  List Type *                                │
│  ┌─────────────────────────────────────┐    │
│  │ ▾ Direct Comparison                 │    │
│  │   Direct Comparison                 │    │
│  │   Direct Capitalization             │    │
│  │   Land Comparables                  │    │
│  │   Commercial Leases                 │    │
│  │   Residential Leases                │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Adding 3 properties:                       │
│  • 123 Rue Principale, Montréal             │
│  • 456 Boul. St-Laurent, Montréal           │
│  • 789 Ave du Parc, Québec                  │
│                                             │
│  ⓘ 1 property already in this list          │
│    (will be skipped)                        │
│                                             │
│           [Cancel]  [Add to List]           │
└─────────────────────────────────────────────┘
```

**Behavior:**
- Appraisal dropdown shows all appraisals for the user's organization, sorted by most recent
- List type defaults to "Direct Comparison" (most common)
- Shows summary of selected properties
- Warns about duplicates (properties already in that list)
- On confirm: calls `comparableListsService.addProperties()`
- Shows success snackbar: "3 properties added to Direct Comparison list for #24-001"

#### 4.3 Map View Integration

When in map view (from the Map View feature), the same flow applies:
- Click a marker popup → "Add to Comps" button in the popup
- Or use the multi-select pattern: select markers → bulk "Add to Comps"

---

### 5. UI Design - Appraisal Side

#### 5.1 Loading Comps into a Value Approach Section

In each value approach section (e.g., Direct Comparison), add a **"Load from List"** button alongside the existing "Add from Library" button:

```
┌──────────────────────────────────────────────────────────┐
│  Direct Comparison Approach                              │
│                                                          │
│  Subject: 123 Rue Principale, Montréal                   │
│                                                          │
│  Comparables:                                            │
│  [+ Add from Library]  [📋 Load from List (4)]           │
│                                                          │
│  ┌─────────┬──────────┬─────────┬─────────┬────────┐    │
│  │ Comp #  │ Address  │ Price   │ Date    │ Adj.   │    │
│  ├─────────┼──────────┼─────────┼─────────┼────────┤    │
│  │ C-1     │ ...      │ ...     │ ...     │ ...    │    │
│  │ C-2     │ ...      │ ...     │ ...     │ ...    │    │
│  └─────────┴──────────┴─────────┴─────────┴────────┘    │
└──────────────────────────────────────────────────────────┘
```

The **badge (4)** shows how many comps are in the associated list for this approach.

#### 5.2 Load from List Dialog

Clicking "Load from List" opens a dialog showing the pre-built list:

```
┌───────────────────────────────────────────────────┐
│  Direct Comparison - Comparable List              │
│                                                   │
│  ☑  123 Rue Sherbrooke, Montréal                  │
│     Unifamiliale | $475,000 | 2024-03-15          │
│                                                   │
│  ☑  456 Boul. Gouin, Laval                        │
│     Unifamiliale | $520,000 | 2024-02-28          │
│                                                   │
│  ☑  789 Rue Masson, Montréal                      │
│     Unifamiliale | $445,000 | 2024-04-10          │
│                                                   │
│  ☐  101 Ave Laurier, Montréal                     │
│     Unifamiliale | $510,000 | 2024-01-20          │
│     (already loaded)                              │
│                                                   │
│  ──────────────────────────────                   │
│  3 selected | 1 already loaded                    │
│                                                   │
│       [Cancel]  [Load Selected]                   │
└───────────────────────────────────────────────────┘
```

**Behavior:**
- Shows all properties in the list with key info (address, type, price, date)
- Pre-checks all properties that are NOT already loaded as comparables in the section
- Greys out / marks properties already loaded in the section
- "Load Selected" populates the comparables grid with the selected properties
- Uses existing `propertyId` reference pattern already in `form_data.comparables[]`

#### 5.3 Empty List State

If no comparable list exists for this appraisal + list type:

```
┌───────────────────────────────────────────────────┐
│  Direct Comparison - Comparable List              │
│                                                   │
│  No comparables have been shortlisted yet.        │
│                                                   │
│  Go to the Property Library to browse and         │
│  add properties to this list.                     │
│                                                   │
│       [Go to Library]  [Cancel]                   │
└───────────────────────────────────────────────────┘
```

---

### 6. Comparable List Management Panel

#### 6.1 Dedicated Management View (Library Module)

Add a **"Comparable Lists"** section/tab accessible from the Library page. This provides a view of all lists across appraisals:

```
┌─────────────────────────────────────────────────────────────┐
│  Comparable Lists                                           │
│                                                             │
│  Appraisal: ▾ All Appraisals                                │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ #24-001 - 123 Rue Principale                          │ │
│  │                                                        │ │
│  │  Direct Comparison (4)    Direct Cap (2)    Land (0)   │ │
│  │  Comm. Lease (0)          Res. Lease (3)               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ #24-002 - 456 Boul. St-Laurent                        │ │
│  │                                                        │ │
│  │  Direct Comparison (6)    Direct Cap (0)    Land (0)   │ │
│  │  Comm. Lease (0)          Res. Lease (0)               │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

Clicking a list type chip opens an inline or dialog view to manage that specific list:
- View properties in the list
- Reorder via drag-and-drop
- Remove individual properties
- Add notes to individual comps

---

### 7. Data Flow

#### Adding comps from Library:

```
Library Page
  → User selects properties (checkbox)
  → Clicks "Add to Comps"
  → Dialog: picks appraisal + list type
  → comparableListsService.addProperties()
  → Supabase upserts comparable_lists row
  → Success snackbar
```

#### Loading comps in Appraisal:

```
Appraisal Section (e.g., Direct Comparison)
  → User clicks "Load from List"
  → comparableListsService.getByType(appraisalId, 'direct_comparison')
  → Fetch full property data for each item
  → Dialog shows list with checkboxes
  → User selects and clicks "Load"
  → Properties added to section's comparables[] array
  → Section auto-saves via existing mechanism
```

#### Visual indicator in Library:

```
Library Table / Map
  → Property row/marker shows small indicator if property
    is in any comparable list (optional enhancement)
  → Tooltip: "In 2 comparable lists"
```

---

## File Changes Summary

### New Files

| File | Purpose |
|------|---------|
| `features/library/_api/comparable-lists.service.ts` | CRUD operations for comparable lists |
| `features/library/types/comparable-list.types.ts` | TypeScript interfaces |
| `features/library/components/AddToCompsDialog.tsx` | Dialog for adding selected properties to a list |
| `features/library/components/ComparableListsPanel.tsx` | Management view for all lists |
| `features/evaluations/components/LoadFromListDialog.tsx` | Dialog for loading comps into an appraisal section |
| `supabase/migrations/XXXXXX_create_comparable_lists.sql` | Database migration |

### Modified Files

| File | Changes |
|------|---------|
| `app/[locale]/library/page.tsx` | Add "Add to Comps" button, integrate AddToCompsDialog |
| `features/evaluations/components/DirectComparisonForm.tsx` | Add "Load from List" button, integrate LoadFromListDialog |
| `features/evaluations/components/DirectComparisonSectionContent.tsx` | Same (legacy component) |
| `messages/fr.json` | Add `library.comps.*` and `evaluations.comps.*` translation keys |
| `messages/en.json` | Add `library.comps.*` and `evaluations.comps.*` translation keys |

### Translation Keys

```json
{
  "library": {
    "comps": {
      "addToComps": "Add to Comps",
      "addToCompsList": "Add to Comparable List",
      "selectAppraisal": "Select an appraisal",
      "selectListType": "List type",
      "adding": "Adding {count} properties",
      "alreadyInList": "{count} property already in this list",
      "addToList": "Add to List",
      "addedSuccess": "{count} properties added to {listType} list for {appraisal}",
      "comparableLists": "Comparable Lists",
      "allAppraisals": "All Appraisals",
      "noLists": "No comparable lists yet",
      "removeFromList": "Remove from list",
      "reorder": "Drag to reorder",
      "directComparison": "Direct Comparison",
      "directCapitalization": "Direct Capitalization",
      "land": "Land Comparables",
      "commercialLease": "Commercial Leases",
      "residentialLease": "Residential Leases"
    }
  },
  "evaluations": {
    "comps": {
      "loadFromList": "Load from List",
      "comparableList": "Comparable List",
      "noListYet": "No comparables have been shortlisted yet.",
      "goToLibrary": "Go to Library",
      "loadSelected": "Load Selected",
      "alreadyLoaded": "already loaded",
      "selected": "{count} selected"
    }
  }
}
```

---

## Implementation Order

| Phase | Task | Dependencies |
|-------|------|-------------|
| **1** | Create `comparable_lists` table migration + RLS policies | None |
| **2** | Create types + service layer (`comparable-lists.service.ts`) | Phase 1 |
| **3** | Build `AddToCompsDialog.tsx` - appraisal picker, list type picker, confirm | Phase 2 |
| **4** | Integrate "Add to Comps" button into Library page (table view) | Phase 3 |
| **5** | Build `LoadFromListDialog.tsx` - show list, select comps, load into section | Phase 2 |
| **6** | Integrate "Load from List" into Direct Comparison section | Phase 5 |
| **7** | Build `ComparableListsPanel.tsx` - management view with reorder/remove | Phase 2 |
| **8** | Integrate with other value approach sections (Direct Cap, Leases, etc.) | Phase 6 |
| **9** | Add i18n keys, test both languages | Phase 4 |
| **10** | Integrate with Map View (add to comps from marker popup) | Phase 4 + Map View feature |

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Property deleted from Library | List item becomes orphaned - show "Property deleted" placeholder, allow removal |
| Appraisal deleted | `ON DELETE CASCADE` removes all associated lists |
| Duplicate add attempt | Skip silently, show info message about already-existing items |
| Max comps per list | No hard limit in DB; UI may soft-warn above 8 (typical appraisal max) |
| User adds comp, then edits property data | Appraisal always fetches fresh property data via `propertyId` reference |
| Multiple users on same org | RLS scoped to org - all users see same lists |

---

## Relationship to Map View Feature

These two features are complementary and can be built in parallel:

- **Map View** helps users visually find and filter properties
- **Comparable Lists** lets users shortlist those properties for appraisals
- **Combined workflow:** Filter by area on map → select markers → add to comp list → open appraisal → load comps

The "Add to Comps" button works identically from both the table and map views since both operate on the same `filteredProperties` + selection state.

---

## Out of Scope (Future Enhancements)

- Comparable list templates (pre-built lists not tied to a specific appraisal)
- Auto-suggest comparables based on subject property similarity
- Comparable scoring / ranking algorithm
- Export comparable list as standalone report
- Share comparable lists between users/organizations
- Comparable list version history / audit trail
