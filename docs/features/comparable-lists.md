# Feature: Comparable Lists

## Status: Implemented

Merged to `main` on 2026-02-08 via `feature/library` branch.

---

## Overview

Curated shortlists of properties from the Library module, tied to specific appraisals. Each appraisal can have one comparable list per value approach (list type). Users select properties in the Library (table or map), add them to lists, then load those lists into appraisal sections.

This bridges the **Library** and **Evaluations** modules: browse/filter/map properties -> shortlist comparables -> use them in appraisals.

---

## What Was Built

### Database

**Migration:** `supabase/migrations/20260207000200_create_comparable_lists.sql`

```sql
CREATE TABLE comparable_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  appraisal_id UUID NOT NULL REFERENCES appraisals(id) ON DELETE CASCADE,
  list_type TEXT NOT NULL,
  name TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (appraisal_id, list_type)
);
```

- RLS policies scoped to `organization_id`
- Indexes on `appraisal_id` and `organization_id`
- Trigger for auto-updating `updated_at`

**Also:** `supabase/migrations/20260207000000_drop_unused_comparables_table.sql` drops the legacy unused `comparables` table.

---

### Types

**File:** `features/library/types/comparable-list.types.ts`

```typescript
export type ComparableListType =
  | 'direct_comparison'
  | 'direct_capitalization'
  | 'land'
  | 'commercial_lease'
  | 'residential_lease'

export interface ComparableListItem {
  property_id: string
  sort_order: number
  notes?: string
  added_at: string
}

export interface ComparableList {
  id: string
  organization_id: string
  created_by: string
  appraisal_id: string
  list_type: ComparableListType
  name?: string
  items: ComparableListItem[]
  created_at: string
  updated_at: string
}
```

---

### Service Layer

**File:** `features/library/_api/comparable-lists.service.ts`

| Method | Signature | Purpose |
|--------|-----------|---------|
| `getByAppraisal` | `(appraisalId) => ComparableList[]` | All lists for an appraisal |
| `getByType` | `(appraisalId, listType) => ComparableList \| null` | Single list by appraisal + type |
| `addProperties` | `(appraisalId, listType, propertyIds[]) => {added, skipped}` | Upsert list with new properties (skips duplicates) |
| `removeProperty` | `(appraisalId, listType, propertyId) => void` | Remove one property, re-index sort_order |
| `updateItems` | `(appraisalId, listType, items[]) => void` | Replace items array (used for reorder) |
| `delete` | `(id) => void` | Delete entire list |

`addProperties` uses upsert with `onConflict: 'appraisal_id,list_type'` - creates the list on first add, appends on subsequent adds. Automatically assigns `sort_order`, `added_at`, `organization_id`, and `created_by`.

---

### Components

#### 1. AddToCompsDialog (Library side)

**File:** `features/library/components/AddToCompsDialog.tsx`

Dialog for adding selected properties to a comparable list.

**Props:** `open, onClose, selectedProperties, onSuccess, onManageList?`

**Flow:**
1. User selects properties in the Library (table checkboxes or map clicks)
2. Clicks "Add to Comps" button (appears when 1+ properties selected)
3. Dialog opens: pick an appraisal from dropdown, pick a list type
4. If existing lists found for the appraisal, they appear as clickable Chips with item counts (e.g., "Direct Comparison (4)")
5. Clicking a chip auto-selects that list type
6. "Manage" button opens ManageCompsDialog for the selected list
7. Confirm adds properties via `comparableListsService.addProperties()`

**Features:**
- Loads all appraisals on open via `appraisalsService.getAll()`
- Fetches existing lists when appraisal is selected via `comparableListsService.getByAppraisal()`
- Shows selected properties as Chips (max 8 visible, +N overflow)
- Reports added/skipped counts in success message

#### 2. ManageCompsDialog (Library + Appraisal side)

**File:** `features/library/components/ManageCompsDialog.tsx`

Dialog for viewing, reordering, and removing items in a specific list.

**Props:** `open, onClose, appraisalId, listType, onListChanged?`

**Flow:**
1. Fetches list via `comparableListsService.getByType()`
2. Fetches property details (address, city, price, date) via supabase `.in('id', ids)`
3. Displays numbered rows with address, city, price, date
4. Up/Down arrow buttons to reorder (persists via `updateItems`)
5. Delete button to remove (persists via `removeProperty`)
6. Calls `onListChanged()` after each operation for parent state refresh

**Empty state:** Shows "List is empty" with a "Go to Library" button.

**Accessible from:**
- Library page: via "Manage" button in AddToCompsDialog
- DirectComparisonForm: via "Manage List" button (when list has items)

#### 3. LoadFromListDialog (Appraisal side)

**File:** `features/evaluations/components/LoadFromListDialog.tsx`

Dialog for loading comps from a list into an appraisal section's comparables grid.

**Props:** `open, onClose, appraisalId, listType, existingPropertyIds, onLoadProperties`

**Flow:**
1. Fetches list + property details
2. Shows each property with a checkbox
3. Properties already in the comparables grid are marked "already loaded" (disabled, greyed out)
4. New properties are pre-checked
5. "Load Selected" fetches full property data and passes to parent via `onLoadProperties`

**Empty state:** Shows "No comparables shortlisted yet" with "Go to Library" button.

---

### Library Page Integration

**File:** `app/[locale]/library/page.tsx`

- "Add to Comps" button appears when `selectedRows.length > 0` (works for both table and map)
- `selectedRows` state unifies table checkboxes and map marker clicks
- Selection clears on view mode switch (table <-> map)
- AddToCompsDialog receives `onManageList` callback that opens ManageCompsDialog
- ManageCompsDialog rendered alongside AddToCompsDialog

### Map Selection Integration

**File:** `features/library/components/PropertyMapInner.tsx`

When used from the Library page, the map supports selectable mode:
- `selectable={true}` enables click-to-select on markers
- `selectedPropertyIds` and `onSelectionChange` bind to the page's `selectedRows` state
- Selected markers: blue (#2196F3) with dark blue stroke (#1565C0), radius 11
- Bottom-right overlay shows selection count or "Click markers to select" hint
- See [library-map-view.md](./library-map-view.md) for full map documentation

### DirectComparisonForm Integration

**File:** `features/evaluations/components/DirectComparisonForm.tsx`

- "Load from List" button with badge showing item count
- Badge count fetched via `comparableListsService.getByType()` on mount
- Opens LoadFromListDialog with `listType='direct_comparison'`
- "Manage List" button (appears when list has items) opens ManageCompsDialog
- Loaded properties are converted to the section's comparable format

---

### Data Flow

#### Adding comps from Library (table or map):

```
Library Page
  -> User selects properties (table checkboxes OR map marker clicks)
  -> Clicks "Add to Comps"
  -> AddToCompsDialog: picks appraisal + list type
  -> comparableListsService.addProperties()
  -> Supabase upserts comparable_lists row (JSONB items)
  -> Success snackbar with added/skipped counts
```

#### Loading comps in Appraisal:

```
DirectComparisonForm
  -> User clicks "Load from List" (badge shows count)
  -> LoadFromListDialog fetches list + property details
  -> User checks/unchecks properties (already-loaded are greyed out)
  -> "Load Selected" fetches full property data
  -> Properties added to section's comparables[] array
  -> Section auto-saves
```

#### Managing a list:

```
ManageCompsDialog (from Library or DirectComparisonForm)
  -> Fetches list items with property details
  -> User reorders with Up/Down arrows (persisted immediately)
  -> User removes with Delete button (persisted immediately)
  -> onListChanged callback refreshes parent state
```

---

### Translation Keys

`library.comps.*` in both `messages/en.json` and `messages/fr.json`:

| Key | EN | FR |
|-----|----|----|
| `addToComps` | Add to Comps | Ajouter aux comparables |
| `addToCompsList` | Add to Comparable List | Ajouter a une liste de comparables |
| `selectAppraisal` | Select an appraisal | Selectionner une evaluation |
| `selectListType` | List type | Type de liste |
| `adding` | Adding {count} properties | Ajout de {count} proprietes |
| `addToList` | Add to List | Ajouter a la liste |
| `addedSuccess` | {count} added to {listType} for {appraisal} | {count} ajoutees a {listType} pour {appraisal} |
| `cancel` | Cancel | Annuler |
| `close` | Close | Fermer |
| `existingLists` | Existing lists for this appraisal | Listes existantes pour cette evaluation |
| `manageLists` | Manage | Gerer |
| `manageCompsList` | Manage Comparable List | Gerer la liste de comparables |
| `emptyList` | This list is empty | Cette liste est vide |
| `goToLibrary` | Go to Library | Aller a la bibliotheque |
| `itemsCount` | {count} items | {count} elements |
| `direct_comparison` | Direct Comparison | Comparaison directe |
| `direct_capitalization` | Direct Capitalization | Capitalisation directe |
| `land` | Land | Terrain |
| `commercial_lease` | Commercial Lease | Bail commercial |
| `residential_lease` | Residential Lease | Bail residentiel |

`evaluations.comps.*`:

| Key | EN | FR |
|-----|----|----|
| `loadFromList` | Load from List | Charger depuis la liste |
| `comparableList` | Comparable List | Liste de comparables |
| `noListYet` | No comparables shortlisted yet | Aucun comparable pre-selectionne |
| `goToLibrary` | Go to Library | Aller a la bibliotheque |
| `loadSelected` | Load Selected | Charger la selection |
| `alreadyLoaded` | Already loaded | Deja charge |
| `selected` | {count} selected | {count} selectionnes |
| `cancel` | Cancel | Annuler |
| `manageList` | Manage List | Gerer la liste |
| `compsInList` | comps in list | comparables dans la liste |

---

### Files Summary

#### New Files

| File | Purpose |
|------|---------|
| `features/library/_api/comparable-lists.service.ts` | CRUD service for comparable lists |
| `features/library/types/comparable-list.types.ts` | TypeScript types |
| `features/library/components/AddToCompsDialog.tsx` | Add properties to a list dialog |
| `features/library/components/ManageCompsDialog.tsx` | View/reorder/remove items dialog |
| `features/evaluations/components/LoadFromListDialog.tsx` | Load comps into appraisal section |
| `supabase/migrations/20260207000200_create_comparable_lists.sql` | DB table + RLS + indexes |
| `supabase/migrations/20260207000000_drop_unused_comparables_table.sql` | Remove legacy table |

#### Modified Files

| File | Changes |
|------|---------|
| `app/[locale]/library/page.tsx` | Add to Comps button, ManageCompsDialog, map selection wiring |
| `features/library/components/PropertyMapInner.tsx` | Selectable mode for map markers |
| `features/evaluations/components/DirectComparisonForm.tsx` | Load from List + Manage List buttons |
| `features/evaluations/components/DirectComparisonSectionContent.tsx` | Pass-through for list type prop |
| `messages/en.json` | Translation keys for `library.comps.*` and `evaluations.comps.*` |
| `messages/fr.json` | Translation keys for `library.comps.*` and `evaluations.comps.*` |

---

### Edge Cases

| Scenario | Handling |
|----------|----------|
| Property deleted from Library | Shows "(Deleted)" / "(Property deleted)" in list views |
| Appraisal deleted | `ON DELETE CASCADE` removes all associated lists |
| Duplicate add attempt | Skipped silently, success message shows added vs skipped count |
| Empty list | "List is empty" with "Go to Library" link |
| Property already loaded in appraisal | Greyed out in LoadFromListDialog with "Already loaded" chip |
| Multiple users same org | RLS scoped to `organization_id` |
