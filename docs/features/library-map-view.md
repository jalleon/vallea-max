# Feature: Property Library Map View

## Overview

Add an interactive Mapbox map view to the Property Library module, allowing users to visualize all their properties geographically and filter them using the existing filter controls.

---

## Goals

1. **Visualize properties on a map** - See all properties as markers on an interactive Mapbox map
2. **Filter integration** - Existing filters (search, type, city, date range, price range, year range) control which markers appear on the map
3. **Toggle between views** - Users can switch between the current table view and the new map view
4. **Property interaction** - Click a marker to see property details; navigate to full property view
5. **Geocode properties** - Store lat/lng coordinates on each property for fast, reliable map rendering

---

## Current State

| Aspect | Status |
|--------|--------|
| Property data model | No `latitude`/`longitude` fields |
| Map library | None installed (only Google Maps Embed iframe in PropertyView) |
| Geocoding | None - Google Maps iframe handles it implicitly |
| Filters | Fully implemented client-side (search, type, city, date/price/year ranges) |
| Map view | Does not exist |

---

## Technical Design

### 1. Database Changes

**Add geocoding columns to `properties` table:**

```sql
ALTER TABLE properties
  ADD COLUMN latitude DOUBLE PRECISION,
  ADD COLUMN longitude DOUBLE PRECISION;

-- Index for spatial queries (optional, for future radius search)
CREATE INDEX idx_properties_coordinates
  ON properties (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
```

**Update TypeScript types** in `features/library/types/property.types.ts`:

```typescript
// Add to Property interface
latitude?: number;
longitude?: number;
```

**Update service transform** in `features/library/_api/properties-supabase.service.ts`:

```typescript
// In transformToProperty()
latitude: row.latitude ?? undefined,
longitude: row.longitude ?? undefined,
```

---

### 2. Geocoding Strategy

**Library:** Mapbox Geocoding API (bundled with Mapbox account, consistent with map rendering)

**When to geocode:**
- **On property create/update** - If address fields change, geocode and store lat/lng
- **Batch migration** - One-time script to geocode all existing properties that lack coordinates

**Implementation:**

```
features/library/_api/geocoding.service.ts
```

- `geocodeAddress(address, city, postalCode, province)` → `{ lat, lng } | null`
- Called from `createProperty()` and `updateProperty()` in the service layer
- Uses Mapbox Geocoding API: `https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json`
- Rate-limited and cached to avoid excessive API calls
- Falls back gracefully if geocoding fails (property still saves, just without coordinates)

**Batch migration endpoint (API route):**

```
app/api/geocode-properties/route.ts
```

- Server-side route that fetches all properties without coordinates
- Geocodes them in batches (respecting Mapbox rate limits)
- Updates the database with lat/lng
- Protected by auth (admin only)

---

### 3. Mapbox Integration

**Package:** `mapbox-gl` + `@types/mapbox-gl`

**Access token:** Stored as `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env.local` (public token, safe for client-side per Mapbox docs - restricted by URL referrer).

**Map component:**

```
features/library/components/PropertyMap.tsx
```

**Responsibilities:**
- Render a full-width Mapbox GL map
- Accept filtered properties as props
- Display each property as a marker (with clustering for dense areas)
- Fit map bounds to visible markers when filters change
- Show a popup on marker click with key property info

---

### 4. UI Design

#### 4.1 View Toggle

Add a toggle button group to the library page header (next to existing action buttons):

```
[Table icon] [Map icon]
```

- **Table view** (default) - Current behavior, no changes
- **Map view** - Replaces the table area with the map component
- Filters card remains visible and functional in both views
- Active filter count badge shown on both views

#### 4.2 Map View Layout

```
┌─────────────────────────────────────────────────┐
│  Header: Title + Actions + [Table | Map] Toggle │
├─────────────────────────────────────────────────┤
│  Filters Card (same as current)                 │
├─────────────────────────────────────────────────┤
│                                                 │
│              Mapbox Map (full width)             │
│              ~500px height (desktop)             │
│              ~400px height (mobile)              │
│                                                 │
│  ● Clustered markers                            │
│  ● Click cluster → zoom in                      │
│  ● Click marker → popup                         │
│                                                 │
├─────────────────────────────────────────────────┤
│  Property count: "Showing X of Y properties"    │
└─────────────────────────────────────────────────┘
```

#### 4.3 Marker Popup Content

When a user clicks a property marker, show a compact popup:

```
┌──────────────────────────┐
│ 123 Rue Principale       │
│ Montréal, QC H2X 1A1    │
│ Unifamiliale | $450,000  │
│ [View] [Edit]            │
└──────────────────────────┘
```

Fields shown:
- Address (adresse)
- City + postal code
- Property type + sold price
- Action buttons: View (opens PropertyView dialog), Edit (opens PropertyEdit dialog)

#### 4.4 Marker Styling

- **Color by property type** - Match the existing chip colors used in the table:
  - Unifamiliale: blue
  - Condo: purple
  - Plex: orange
  - Terrain: green
  - Commercial: red
  - Other: grey
- **Cluster circles** - Show count, sized proportionally, neutral color

#### 4.5 Empty/Edge States

| State | Behavior |
|-------|----------|
| No properties have coordinates | Show map centered on Quebec with a message: "No properties to display. Geocode your properties to see them on the map." |
| Filters return 0 results | Show empty map with message: "No properties match your filters." |
| Single property | Center map on that property, appropriate zoom level |
| All properties in same city | Fit bounds with padding, moderate zoom |

---

### 5. Filter Integration

The map view reuses the **exact same filtered properties array** that currently feeds the table. No separate filtering logic needed.

**Current flow (table):**
```
allProperties → applyFilters(search, type, city, dates, prices, years) → filteredProperties → Table
```

**New flow (map):**
```
allProperties → applyFilters(search, type, city, dates, prices, years) → filteredProperties → PropertyMap
```

The `filteredProperties` array is passed as a prop to `PropertyMap`. When filters change, the map automatically updates markers and re-fits bounds.

---

### 6. Clustering

**Why:** Users may have hundreds of properties in the same area. Without clustering, markers overlap and become unusable.

**Implementation:** Use Mapbox GL JS built-in clustering via GeoJSON source:

```typescript
map.addSource('properties', {
  type: 'geojson',
  data: propertiesGeoJSON,
  cluster: true,
  clusterMaxZoom: 14,
  clusterRadius: 50
});
```

**Behavior:**
- Zoom out: Properties merge into clusters showing count
- Zoom in: Clusters split into individual markers
- Click cluster: Zoom to expand that cluster

---

## File Changes Summary

### New Files

| File | Purpose |
|------|---------|
| `features/library/components/PropertyMap.tsx` | Map component with markers, clustering, popups |
| `features/library/_api/geocoding.service.ts` | Mapbox geocoding service (address → lat/lng) |
| `supabase/migrations/XXXXXX_add_property_coordinates.sql` | Database migration for lat/lng columns |
| `app/api/geocode-properties/route.ts` | Batch geocoding API route (one-time migration) |

### Modified Files

| File | Changes |
|------|---------|
| `features/library/types/property.types.ts` | Add `latitude`, `longitude` fields |
| `features/library/_api/properties-supabase.service.ts` | Add lat/lng to transform; geocode on create/update |
| `app/[locale]/library/page.tsx` | Add view toggle (table/map), render PropertyMap when map view active |
| `messages/fr.json` | Add `library.map.*` translation keys |
| `messages/en.json` | Add `library.map.*` translation keys |
| `package.json` | Add `mapbox-gl` dependency |

### Translation Keys to Add

```json
{
  "library": {
    "map": {
      "viewToggle": "View",
      "tableView": "Table",
      "mapView": "Map",
      "noCoordinates": "No properties to display on the map. Properties need to be geocoded first.",
      "noResults": "No properties match your current filters.",
      "showing": "Showing {count} of {total} properties",
      "geocodeAll": "Geocode All Properties",
      "geocoding": "Geocoding in progress...",
      "clusterCount": "{count} properties"
    }
  }
}
```

---

## Implementation Order

| Phase | Task | Dependencies |
|-------|------|-------------|
| **1** | Add `latitude`/`longitude` to DB schema + types + service transform | None |
| **2** | Install `mapbox-gl`, create `PropertyMap.tsx` with static markers | Phase 1 |
| **3** | Add view toggle to library page, wire filtered properties to map | Phase 2 |
| **4** | Create `geocoding.service.ts`, integrate into create/update flows | Phase 1 |
| **5** | Build batch geocoding API route + trigger from UI | Phase 4 |
| **6** | Add clustering, marker colors by type, popup interactions | Phase 2 |
| **7** | Add i18n keys, test both languages, edge states | Phase 3 |
| **8** | Polish: bounds fitting, responsive sizing, empty states | Phase 6 |

---

## Environment Setup Required

1. **Mapbox account** - Create at [mapbox.com](https://www.mapbox.com)
2. **Access token** - Generate a public token with:
   - Scopes: `styles:read`, `fonts:read`, `datasets:read`
   - URL restrictions: `localhost:*`, `valeamax.com`, `*.vercel.app`
3. **Environment variable** - Add `NEXT_PUBLIC_MAPBOX_TOKEN` to `.env.local` and Vercel dashboard

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Geocoding rate limits | Properties without coordinates | Batch with delays; cache results in DB |
| Mapbox token exposure | Unauthorized usage | URL referrer restrictions on token |
| Properties without valid addresses | No marker on map | Gracefully skip; show count of unmapped properties |
| Bundle size increase (~200KB for mapbox-gl) | Slower initial load | Dynamic import (`next/dynamic`) with `ssr: false` |
| Large number of properties (1000+) | Map performance | Clustering + GeoJSON source (GPU-accelerated in Mapbox GL) |

---

## Out of Scope (Future Enhancements)

- Radius search ("properties within X km of address")
- Draw polygon to select properties
- Heatmap visualization (property values / density)
- Street View integration
- Satellite/terrain map style toggles
- Map-based property creation (drop pin to set address)
- Route planning between properties
