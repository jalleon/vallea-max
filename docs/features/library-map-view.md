# Feature: Property Library Map View

## Status: Implemented

Merged to `main` on 2026-02-08 via `feature/library` branch.

---

## Overview

Interactive Mapbox map view in the Property Library module. Users can visualize properties geographically, toggle between table and map views, switch map styles, and select properties directly on the map.

---

## What Was Built

### Database Changes

**Migration:** `supabase/migrations/20260207000100_add_geocoding_to_properties.sql`

```sql
ALTER TABLE properties ADD COLUMN latitude DOUBLE PRECISION;
ALTER TABLE properties ADD COLUMN longitude DOUBLE PRECISION;
```

**Types:** `latitude` and `longitude` added to `Property` interface in `features/library/types/property.types.ts`.

**Service transform:** `properties-supabase.service.ts` maps lat/lng in `transformToProperty()`.

---

### Geocoding

**Service:** `features/library/_api/geocoding.service.ts`

| Function | Purpose |
|----------|---------|
| `geocodeAddress(address, city, postalCode, province)` | Returns `{lat, lng}` or `null` via Mapbox Geocoding API |
| `geocodeAndUpdateProperty(propertyId, ...)` | Geocodes and saves to DB |
| `geocodeAllProperties(onProgress?)` | Backfills all properties missing lat/lng |

**Auto-geocoding:** Fire-and-forget calls in `createProperty()` and `updateProperty()` in `properties-supabase.service.ts`.

**Backfill script:** `scripts/backfill-geocoding.mjs` - One-time Node.js script using `SUPABASE_SERVICE_ROLE_KEY` to geocode all existing properties.

```bash
SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/backfill-geocoding.mjs
```

---

### Map Component

**File:** `features/library/components/PropertyMapInner.tsx`

Loaded via `next/dynamic` with `ssr: false` (Mapbox requires browser APIs).

**Features:**
- Mapbox GL JS map centered on Montreal (-73.5673, 45.5017)
- GeoJSON source with clustering (radius 50, max zoom 14)
- Color-coded markers by property type (TYPE_COLORS map)
- 4 map styles: Streets (default), Satellite, Outdoors, Light - toggle in top-left
- Click marker: popup with address, city, price, View/Edit buttons
- Auto-fit bounds to visible markers
- ResizeObserver for sidebar collapse handling

**Selectable mode** (added later):
- Props: `selectable`, `selectedPropertyIds`, `onSelectionChange`
- Click markers to toggle selection (blue highlight, larger radius)
- Bottom-right overlay shows selection count or "Click markers to select" hint
- Selected markers: blue (#2196F3) with dark blue stroke (#1565C0), radius 11

---

### Library Page Integration

**File:** `app/[locale]/library/page.tsx`

- `viewMode` state: `'table' | 'map'`
- ToggleButtonGroup with Table/Map icons in header
- Map receives `filteredProperties` (respects all active filters)
- `selectedRows` state works for both table checkboxes and map clicks
- Selection clears on view mode switch

---

### Environment Setup

1. Mapbox account at [mapbox.com](https://www.mapbox.com)
2. Public access token in `.env.local`: `NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...`
3. Same token must be added to Vercel environment variables for production
4. Mapbox token: `pk.eyJ1IjoidmFsZWFtYXgiLCJhIjoiY21sZTFmMjF3MWh4aTNlcHdkbDRxcjNodiJ9.JzSSbo3OazYEzCmGVyz8Tg`

---

### Dependencies

```
mapbox-gl: ^3.x
@types/mapbox-gl: ^3.x
```

---

### Translation Keys

`library.map.*` in both `messages/en.json` and `messages/fr.json`:

| Key | EN | FR |
|-----|----|----|
| `viewTable` | Table view | Vue tableau |
| `viewMap` | Map view | Vue carte |
| `noCoordinates` | No geocoded properties... | Aucune propriete geocodee... |
| `propertiesOnMap` | {count} properties on map | {count} proprietes sur la carte |
| `selectedOnMap` | {count} selected | {count} selectionnees |
| `clickToSelect` | Click markers to select | Cliquez sur les marqueurs... |

---

### Files

| File | Type | Purpose |
|------|------|---------|
| `features/library/components/PropertyMapInner.tsx` | New | Map component |
| `features/library/_api/geocoding.service.ts` | New | Geocoding service |
| `scripts/backfill-geocoding.mjs` | New | One-time backfill script |
| `supabase/migrations/20260207000100_add_geocoding_to_properties.sql` | New | DB migration |
| `features/library/types/property.types.ts` | Modified | Added lat/lng |
| `features/library/_api/properties-supabase.service.ts` | Modified | Transform + auto-geocode |
| `app/[locale]/library/page.tsx` | Modified | View toggle + map rendering |
| `package.json` | Modified | Added mapbox-gl |
