# Feature: Property Library Map View

## Status: Implemented

Last updated: 2026-02-11

---

## Overview

Interactive Mapbox GL JS map in the Property Library module. Visualize properties geographically with clustering, color-coded markers by property type, government GIS overlay layers, province-specific orthophoto base maps, property selection for comparable lists, and inline property actions (view, edit, add to comps, delete).

**File:** `features/library/components/PropertyMapInner.tsx`
**Page:** `app/[locale]/library/page.tsx`

---

## Map Styles

8 base map styles, toggled via a `ToggleButtonGroup` in the top-left corner.

### Mapbox Styles

| Key | Label | Source |
|-----|-------|--------|
| `streets` | Streets | `mapbox://styles/mapbox/streets-v12` |
| `satellite` | Satellite | `mapbox://styles/mapbox/satellite-streets-v12` |
| `outdoors` | Outdoors | `mapbox://styles/mapbox/outdoors-v12` |
| `light` | Light | `mapbox://styles/mapbox/light-v11` |

### Province Orthophoto Styles

Accessible via a single **Ortho** button with a dropdown menu to pick the province.

| Key | Label | Source | Protocol | Notes |
|-----|-------|--------|----------|-------|
| `ortho-qc` | QC Ortho | Gouvernement du Quebec | TMS | Pre-tiled, fastest |
| `ortho-on` | ON Ortho | Ontario GeoHub (LIO Imagery) | ArcGIS REST `/export` | Native EPSG:3857 |
| `ortho-bc` | BC Ortho | GeoBC | WMS | 10m at zoom <13, 2m at zoom 13+ |

**BC dual-resolution:** Two raster sources (`bc-ortho-10m` and `bc-ortho-2m`) with `maxzoom: 13` / `minzoom: 13` for automatic LOD switching.

**Ortho button behavior:**
- Click when inactive: shows dropdown if multiple orthos, switches directly if only one
- Click when active: switches back to Streets
- Label shows province name when active (e.g. "QC Ortho"), "Ortho" when inactive

### Ortho Endpoints

```
QC: https://geoegl.msp.gouv.qc.ca/carto/tms/1.0.0/orthos@EPSG_3857/{z}/{x}/{y}.png
ON: https://ws.lioservices.lrc.gov.on.ca/arcgis1071a/rest/services/LIO_Imagery/Ontario_Imagery_Web_Map_Service_Source/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=256,256&format=png&f=image
BC (10m): https://openmaps.gov.bc.ca/imagex/ecw_wms.dll?...layers=bc_bc_bc_xc10m_bcalb_20070115...
BC (2m):  https://openmaps.gov.bc.ca/imagex/ecw_wms.dll?...layers=bc_bc_bc_xc2m_bcalb_20070115...
```

### Style Change Behavior

When switching styles, zoom and center are preserved (saved before `setStyle`, restored after `style.load`). GIS overlay layers are also re-applied.

---

## GIS Overlay Layers

Province-aware government data overlays rendered as raster tiles at 60% opacity. Inserted below the `clusters` layer so markers remain on top.

### Architecture

- **`ALL_GIS_LAYERS`** - Registry of 16 layer configs with `tiles`, `color`, `icon`, `category`
- **`PROVINCE_LAYERS`** - Maps province codes to their layer IDs
- **`FEDERAL_LAYERS`** - Always-available fallback layers (`fed-landCover`, `fed-wetlands`)
- **`CATEGORY_ORDER`** - Display order: Agricultural, Flood Zones, Wetlands, Land Cover

### Province Detection

Properties on the map are grouped by `province` field. All detected provinces contribute their layers (union approach). Federal layers fill categories not covered by any detected province.

```typescript
const detectedProvinces = useMemo(() => {
  const provinces = new Set<string>()
  geoProperties.forEach(p => provinces.add(p.province || 'QC'))
  return provinces.size > 0 ? provinces : new Set(['QC'])
}, [geoProperties])
```

### Category-Based UI

Layers are grouped by category and displayed as chips below the style toggle:

- **Single province for a category**: Click chip to toggle on/off
- **Multiple provinces for a category**: Click chip to open a dropdown, pick a province
- **Active chip**: Shows province-specific label (e.g. "Wetlands (QC)") with colored background

### Layer Registry

| ID | Province | Category | Protocol | Endpoint |
|----|----------|----------|----------|----------|
| `qc-agricultural` | QC | Agricultural | WMS | CPTAQ `zone_agricole` |
| `qc-floodZones` | QC | Flood Zones | ArcGIS REST | BDZI layer 22 |
| `qc-wetlands` | QC | Wetlands | ArcGIS REST | `MH_potentiels` layer 0 |
| `bc-agricultural` | BC | Agricultural | WMS | ALR Polys |
| `bc-floodZones` | BC | Flood Zones | WMS | Floodplains |
| `bc-wetlands` | BC | Wetlands | WMS | FWA Wetlands Poly |
| `ab-agricultural` | AB | Agricultural | ArcGIS REST | Ag Land Resource Atlas layer 0 |
| `ab-wetlands` | AB | Wetlands | ArcGIS REST | Merged Wetland Inventory layer 3 |
| `on-agricultural` | ON | Agricultural | ArcGIS REST | LIO_Open06 layer 15 (Greenbelt) |
| `on-wetlands` | ON | Wetlands | ArcGIS REST | LIO_Open01 layer 15 |
| `nb-floodZones` | NB | Flood Zones | ArcGIS REST | GeoNB_ENV_Flood layer 0 |
| `nb-wetlands` | NB | Wetlands | ArcGIS REST | GeoNB_ELG_WAWA layer 0 |
| `ns-floodZones` | NS | Flood Zones | ArcGIS REST | `flood_risk_areas` layer 0 |
| `sk-floodZones` | SK | Flood Zones | ArcGIS REST | WSA Water layer 0 |
| `fed-landCover` | Federal | Land Cover | WMS | NRCan `landcover-2020` |
| `fed-wetlands` | Federal | Wetlands | WMS | INTHC (Canadian Wetland Inventory) |

### Layer Cleanup

When detected provinces change (e.g. filters applied), active layers that no longer exist are automatically removed from the map.

---

## Property Markers

### Data Source

GeoJSON `FeatureCollection` from `geoProperties` (properties with valid lat/lng). Rendered as a clustered source with radius 50, max cluster zoom 14.

### Layers

| Layer ID | Type | Purpose |
|----------|------|---------|
| `clusters` | circle | Cluster circles, blue (#667eea), sized by count |
| `cluster-count` | symbol | White text showing count |
| `unclustered-point` | circle | Individual markers |

### Marker Colors by Property Type

| Type | Color |
|------|-------|
| `condo_residentiel` | Purple (#9C27B0) |
| `plex` / `multifamilial` | Orange (#FF9800) |
| `residentiel_commercial` | Pink (#E91E63) |
| `commercial` | Red (#F44336) |
| `terrain` | Green (#4CAF50) |
| `industriel` | Brown (#795548) |
| `bureau` | Blue-grey (#607D8B) |
| Default | Primary (#667eea) |

### Marker States

| State | Color | Radius | Stroke |
|-------|-------|--------|--------|
| Normal | Type color | 8 | 2px white |
| Selected | Blue (#2196F3) | 11 | 3px dark blue (#1565C0) |
| Highlighted | Type color | 10 | 3px amber (#FFB300) |
| Dimmed (not highlighted) | Grey (#BDBDBD) | 5 | 1px white, 35% opacity |

---

## Property Popup

Click a marker to show a popup with:
- Address, city, postal code
- Sale price (formatted `fr-CA`)
- Action buttons: **View**, **Edit**, **+ Comps**, **Delete**

Buttons use `window.__mapXxx` global callbacks to bridge HTML popup to React state:
- `__mapViewProperty` / `__mapEditProperty` - navigate to property
- `__mapAddToComps` - open Add to Comps dialog with property pre-selected
- `__mapDeleteProperty` - open delete confirmation dialog

### Delete Confirmation

Dialog with property address, irreversibility warning, Cancel/Delete buttons. On confirm, calls `onDeleteProperty` prop (async), removes popup, refreshes property list.

---

## Selection Mode

When `selectable={true}`, markers can be clicked to toggle selection.

**Props:**
- `selectable: boolean` - enables click-to-select
- `selectedPropertyIds: string[]` - currently selected IDs
- `onSelectionChange: (ids: string[]) => void` - callback on selection change

**UI:** Bottom-right overlay shows selection count or "Click markers to select" hint.

**Integration:** `selectedRows` state in the Library page unifies table checkbox selection and map click selection. Selection clears on view mode switch (table <-> map).

---

## Geocoding

### Service

**File:** `features/library/_api/geocoding.service.ts`

| Function | Purpose |
|----------|---------|
| `geocodeAddress(address, city, postalCode, province)` | Returns `{lat, lng}` via Mapbox Geocoding API |
| `geocodeAndUpdateProperty(propertyId, ...)` | Geocodes and saves to DB |
| `geocodeAllProperties(onProgress?)` | Backfills all properties missing lat/lng |

**Auto-geocoding:** Fire-and-forget calls in `createProperty()` and `updateProperty()`.

**Backfill script:** `scripts/backfill-geocoding.mjs`
```bash
SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/backfill-geocoding.mjs
```

### Database

**Migration:** `supabase/migrations/20260207000100_add_geocoding_to_properties.sql`
```sql
ALTER TABLE properties ADD COLUMN latitude DOUBLE PRECISION;
ALTER TABLE properties ADD COLUMN longitude DOUBLE PRECISION;
```

---

## Component Props

```typescript
interface PropertyMapInnerProps {
  properties: Property[]
  onViewProperty?: (property: Property) => void
  onEditProperty?: (property: Property) => void
  onAddToComps?: (property: Property) => void
  onDeleteProperty?: (property: Property) => Promise<void>
  selectable?: boolean
  selectedPropertyIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  highlightedPropertyIds?: string[]
}
```

Loaded via `next/dynamic` with `ssr: false` (Mapbox requires browser APIs).

---

## Environment Setup

1. Mapbox account at [mapbox.com](https://www.mapbox.com)
2. Token in `.env.local`: `NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...`
3. Same token in Vercel env vars for production
4. Token stored in `.env.local` (see Vercel dashboard)

### Dependencies

```
mapbox-gl: ^3.x
@types/mapbox-gl: ^3.x
```

---

## Translation Keys

### `library.map.*`

| Key | EN | FR |
|-----|----|----|
| `viewTable` | Table view | Vue tableau |
| `viewMap` | Map view | Vue carte |
| `noCoordinates` | No geocoded properties... | Aucune propriete geocodee... |
| `propertiesOnMap` | {count} properties on map | {count} proprietes sur la carte |
| `selectedOnMap` | {count} selected | {count} selectionnees |
| `clickToSelect` | Click markers to select | Cliquez sur les marqueurs... |
| `deleteConfirmTitle` | Delete property? | Supprimer la propriete? |
| `deleteConfirmWarning` | This action cannot be undone. | Cette action est irreversible. |
| `deleteConfirm` | Delete | Supprimer |
| `deleting` | Deleting... | Suppression... |
| `cancel` | Cancel | Annuler |

### `library.map.layers.*`

| Key | EN | FR |
|-----|----|----|
| `qc-agricultural` | Agricultural Zone (QC) | Zone agricole (QC) |
| `qc-floodZones` | Flood Zones (QC) | Zones inondables (QC) |
| `qc-wetlands` | Wetlands (QC) | Milieux humides (QC) |
| `bc-agricultural` | Agri. Land Reserve (BC) | Reserve agricole (BC) |
| `bc-floodZones` | Floodplains (BC) | Plaines inondables (BC) |
| `bc-wetlands` | Wetlands (BC) | Milieux humides (BC) |
| `ab-agricultural` | Agricultural Land (AB) | Terres agricoles (AB) |
| `ab-wetlands` | Wetlands (AB) | Milieux humides (AB) |
| `on-agricultural` | Greenbelt (ON) | Ceinture verte (ON) |
| `on-wetlands` | Wetlands (ON) | Milieux humides (ON) |
| `nb-floodZones` | Flood Zones (NB) | Zones inondables (NB) |
| `nb-wetlands` | Wetlands (NB) | Milieux humides (NB) |
| `ns-floodZones` | Flood Zones (NS) | Zones inondables (NS) |
| `sk-floodZones` | Flood Zones (SK) | Zones inondables (SK) |
| `fed-landCover` | Land Cover | Couverture du sol |
| `fed-wetlands` | Wetlands (National) | Milieux humides (national) |

### `library.map.categories.*`

| Key | EN | FR |
|-----|----|----|
| `agricultural` | Agricultural | Zone agricole |
| `floodZones` | Flood Zones | Zones inondables |
| `wetlands` | Wetlands | Milieux humides |
| `landCover` | Land Cover | Couverture du sol |

### `library.map.styles.*`

| Key | EN | FR |
|-----|----|----|
| `ortho-qc` | QC Ortho | Ortho QC |
| `ortho-on` | ON Ortho | Ortho ON |
| `ortho-bc` | BC Ortho | Ortho BC |

---

## Files

| File | Purpose |
|------|---------|
| `features/library/components/PropertyMapInner.tsx` | Map component (styles, layers, markers, popups, selection, delete) |
| `features/library/_api/geocoding.service.ts` | Geocoding service (Mapbox API) |
| `scripts/backfill-geocoding.mjs` | One-time geocoding backfill |
| `supabase/migrations/20260207000100_add_geocoding_to_properties.sql` | lat/lng columns |
| `app/[locale]/library/page.tsx` | Page integration (view toggle, selection, delete callback) |
| `docs/canadian-government-gis-layers-reference.md` | Full GIS endpoint research (all provinces) |

---

## Adding a New Province

### GIS Overlay Layer

1. Find the endpoint in `docs/canadian-government-gis-layers-reference.md`
2. Verify it returns images with EPSG:3857 (test via WebFetch)
3. Add to `ALL_GIS_LAYERS` with `tiles`, `color`, `icon`, `category`
4. Add province entry to `PROVINCE_LAYERS`
5. Add i18n key to `library.map.layers.*` in both `en.json` and `fr.json`

### Ortho Base Map

1. Find a TMS, WMS, or ArcGIS REST imagery endpoint with EPSG:3857 support
2. Add a `mapboxgl.Style` entry to `MAP_STYLES` keyed as `ortho-{prov}`
3. Add to `PROVINCE_ORTHO` mapping
4. Add i18n key to `library.map.styles.*` in both `en.json` and `fr.json`

### Protocol Reference

**WMS tiles:**
```
...&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256&FORMAT=image/png&TRANSPARENT=true
```

**ArcGIS REST `/export`:**
```
...&bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=256,256&format=png32&transparent=true&f=image&layers=show:N
```

**TMS tiles:**
```
https://server/{z}/{x}/{y}.png  (add scheme: 'tms' if Y is inverted)
```
