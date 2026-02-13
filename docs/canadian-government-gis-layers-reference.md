# Canadian Government GIS Layers for Real Estate Valuation Platform

Reference document for integrating provincial/territorial/federal geospatial data into a Mapbox GL JS application.

---

## Table of Contents

1. [Architecture: Province-Based Layer Loading](#architecture)
2. [Mapbox Integration Patterns](#mapbox-integration-patterns)
3. [Quebec](#quebec)
4. [British Columbia](#british-columbia)
5. [Alberta](#alberta)
6. [Saskatchewan](#saskatchewan)
7. [Manitoba](#manitoba)
8. [Ontario](#ontario)
9. [New Brunswick](#new-brunswick)
10. [Nova Scotia](#nova-scotia)
11. [Prince Edward Island](#prince-edward-island)
12. [Newfoundland and Labrador](#newfoundland-and-labrador)
13. [Yukon](#yukon)
14. [Northwest Territories](#northwest-territories)
15. [Nunavut](#nunavut)
16. [Federal / Pan-Canadian Services](#federal--pan-canadian-services)
17. [Data Availability Matrix](#data-availability-matrix)
18. [Key Gaps and Workarounds](#key-gaps-and-workarounds)

---

## Architecture

### Province-Based Layer Loading

```
Property Address -> Geocode -> Determine Province -> Load Province-Specific Layer Config
```

```javascript
const PROVINCE_LAYERS = {
  BC: { /* ... */ },
  AB: { /* ... */ },
  SK: { /* ... */ },
  MB: { /* ... */ },
  ON: { /* ... */ },
  QC: { /* ... */ },
  NB: { /* ... */ },
  NS: { /* ... */ },
  PE: { /* ... */ },
  NL: { /* ... */ },
  YT: { /* ... */ },
  NT: { /* ... */ },
  NU: { /* ... */ },
};

function getProvinceFromCoords(lng, lat) { /* reverse geocode or point-in-polygon */ }

function loadProvinceLayers(province) {
  const layers = PROVINCE_LAYERS[province];
  Object.entries(layers).forEach(([name, config]) => {
    addLayerToMap(name, config);
  });
}
```

### Three Integration Adapters Needed

1. **WMS adapter** -- for BC, Quebec, some SK/NWT (use `{bbox-epsg-3857}` raster source)
2. **ArcGIS REST adapter** -- for AB, SK, MB, ON, NB, NS, PEI, NL, Yukon, NWT (use `/export` or `/tile/{z}/{y}/{x}`)
3. **GeoJSON/Socrata adapter** -- for NB, NS, MB (fetch + `type: 'geojson'` source)

---

## Mapbox Integration Patterns

### Pattern 1: WMS as Raster Source

```javascript
map.addSource('wms-source', {
  type: 'raster',
  tiles: [
    '{WMS_URL}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap'
    + '&LAYERS={layer_name}'
    + '&CRS=EPSG:3857'
    + '&BBOX={bbox-epsg-3857}'
    + '&WIDTH=256&HEIGHT=256'
    + '&FORMAT=image/png'
    + '&TRANSPARENT=true'
  ],
  tileSize: 256
});
map.addLayer({
  id: 'wms-layer',
  type: 'raster',
  source: 'wms-source',
  paint: { 'raster-opacity': 0.7 }
});
```

### Pattern 2: ArcGIS REST Tile Cache as Raster Source

```javascript
map.addSource('arcgis-tiles', {
  type: 'raster',
  tiles: ['{ArcGIS_MapServer_URL}/tile/{z}/{y}/{x}'],
  tileSize: 256
});
```

### Pattern 3: ArcGIS REST Dynamic Export as Raster Source

```javascript
map.addSource('arcgis-dynamic', {
  type: 'raster',
  tiles: [
    '{ArcGIS_MapServer_URL}/export?bbox={bbox-epsg-3857}'
    + '&bboxSR=3857&imageSR=3857&size=256,256'
    + '&format=png32&transparent=true&f=image'
    + '&layers=show:0,1,2'
  ],
  tileSize: 256
});
```

### Pattern 4: ArcGIS REST Feature Query as GeoJSON Source

```javascript
const url = `{ArcGIS_MapServer_URL}/{layerId}/query?`
  + `where=1=1&geometry=${bbox}&geometryType=esriGeometryEnvelope`
  + `&inSR=4326&outFields=*&f=geojson&outSR=4326&resultRecordCount=2000`;
const response = await fetch(url);
const geojson = await response.json();
map.addSource('feature-source', { type: 'geojson', data: geojson });
```

### Pattern 5: Socrata API as GeoJSON Source

```javascript
// Direct GeoJSON export
const url = 'https://{domain}/api/geospatial/{dataset-4x4}?method=export&type=GeoJSON';
// OR SODA query with filtering
const url = 'https://{domain}/resource/{dataset-4x4}.geojson?$where=assessed_value>100000';
```

### Pattern 6: TMS Source

```javascript
map.addSource('tms-source', {
  type: 'raster',
  tiles: ['{TMS_URL}/{z}/{x}/{-y}.png'],
  tileSize: 256,
  scheme: 'tms'
});
```

### Pattern 7: Federal Geocoding

```javascript
async function geocode(address) {
  const res = await fetch(
    `https://geogratis.gc.ca/services/geolocation/en/locate?q=${encodeURIComponent(address)}`
  );
  const data = await res.json();
  if (data.length > 0) {
    const [lng, lat] = data[0].geometry.coordinates;
    map.flyTo({ center: [lng, lat], zoom: 15 });
  }
}
```

---

## Quebec

**Portal:** https://donneesquebec.ca/recherche/
**OGC Services Directory:** https://www.igouverte.org/documentation/services-web-ogc-igo/

### Key Services

| Category | Service | Type | Endpoint |
|----------|---------|------|----------|
| **Agricultural Zones (Demeter)** | CPTAQ Zone Agricole | WMS | `https://carto.cptaq.gouv.qc.ca/cgi-bin/v2/cptaq?SERVICE=WMS&VERSION=1.3.0&REQUEST=Getcapabilities` |
| **Assessment Rolls** | Roles d'evaluation fonciere | GeoJSON/SHP | https://www.donneesquebec.ca/recherche/dataset/roles-d-evaluation-fonciere-du-quebec |
| **Cadastre** | Infolot | Web app | https://appli.foncier.gouv.qc.ca/infolot/ |
| **Flood Zones** | Geo-Inondations / BDZI | GeoJSON/SHP | https://www.donneesquebec.ca/recherche/dataset/base-de-donnees-des-zones-inondables |
| **Wetlands** | Milieux humides potentiels | ArcGIS REST + WMS | `https://geo.environnement.gouv.qc.ca/donnees/rest/services/Biodiversite/MH_potentiels/MapServer` |
| **Base Map** | Quebec TMS | TMS | `https://geoegl.msp.gouv.qc.ca/carto/tms/1.0.0/carte_gouv_qc_public@EPSG_3857/{z}/{x}/{-y}.png` |
| **Aerial Imagery** | Orthophotos TMS | TMS | `https://geoegl.msp.gouv.qc.ca/carto/tms/1.0.0/orthos@EPSG_3857/{z}/{x}/{-y}.png` |
| **Geocoding** | Quebec Address Geocoder | ArcGIS REST | `https://servicescarto.mern.gouv.qc.ca/pes/rest/services/Territoire/AdressesQuebec_Geocodage/GeocodeServer` |
| **Forest Resources** | WMS | WMS | `https://geoegl.msp.gouv.qc.ca/ws/mffpecofor.fcgi?service=WMS&version=1.3.0&request=GetCapabilities` |
| **Transportation** | WMS | WMS | `https://ws.mapserver.transports.gouv.qc.ca/swtq?service=WMS&version=1.3.0&request=GetCapabilities` |
| **Admin Divisions** | MERN | ArcGIS REST | `https://servicescarto.mern.gouv.qc.ca/pes/rest/services/Territoire/SDA_WMS/MapServer` |

### Demeter WMS Technical Guide
PDF: https://carto.cptaq.gouv.qc.ca/doc/CPTAQ_Service_WMS.pdf

### Integration Example

```javascript
map.addSource('cptaq-zone-agricole', {
  type: 'raster',
  tiles: [
    'https://carto.cptaq.gouv.qc.ca/cgi-bin/v2/cptaq?'
    + 'SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap'
    + '&LAYERS=zone_agricole'
    + '&CRS=EPSG:3857&BBOX={bbox-epsg-3857}'
    + '&WIDTH=256&HEIGHT=256&FORMAT=image/png&TRANSPARENT=true'
  ],
  tileSize: 256
});
```

---

## British Columbia

**Portal:** https://catalogue.data.gov.bc.ca/
**WMS Base:** `https://openmaps.gov.bc.ca/geo/ows?SERVICE=WMS&REQUEST=GetCapabilities`
**WFS Base:** `https://openmaps.gov.bc.ca/geo/ows?SERVICE=WFS&REQUEST=GetCapabilities`
**Per-layer pattern:** `https://openmaps.gov.bc.ca/geo/pub/{LAYER_NAME}/ows`

### Key Services

| Category | Layer | Endpoint |
|----------|-------|----------|
| **Parcels** | ParcelMap BC (2M+ parcels) | `https://openmaps.gov.bc.ca/geo/pub/WHSE_CADASTRE.PMBC_PARCEL_POLY_SV/ows` |
| **ALR** | Agricultural Land Reserve Polygons | `https://openmaps.gov.bc.ca/geo/pub/WHSE_LEGAL_ADMIN_BOUNDARIES.OATS_ALR_POLYS/ows` |
| **ALR Boundaries** | ALR Boundary Lines | `https://openmaps.gov.bc.ca/geo/pub/WHSE_LEGAL_ADMIN_BOUNDARIES.OATS_ALR_BOUNDARY_LINES_SVW/ows` |
| **Flood Zones** | Mapped Floodplains | `https://openmaps.gov.bc.ca/geo/pub/WHSE_BASEMAPPING.CWB_FLOODPLAINS_BC_AREA_SVW/ows` |
| **Wetlands** | Freshwater Atlas Wetlands | `https://openmaps.gov.bc.ca/geo/pub/WHSE_BASEMAPPING.FWA_WETLANDS_POLY/ows` |
| **Land Use** | Present Land Use | `https://openmaps.gov.bc.ca/geo/pub/WHSE_BASEMAPPING.BTM_PRESENT_LAND_USE_V1_SVW/ows` |
| **Sensitive Ecosystems** | SEI Boundaries | `https://openmaps.gov.bc.ca/geo/pub/WHSE_TERRESTRIAL_ECOLOGY.STE_SEI_PROJECT_BOUNDARIES_SVW/ows` |
| **Base Map** | Roads Web Mercator | `https://delivery.maps.gov.bc.ca/arcgis/rest/services/province/roads_wm/MapServer` |
| **Geocoding** | BC Address Geocoder (free, no key) | `https://geocoder.api.gov.bc.ca/` |

**Assessment Data Note:** BC Assessment data is NOT freely available as WMS/WFS. Contact BC Assessment for bulk data. Municipal portals (Vancouver, Surrey) publish subsets.

---

## Alberta

**Portal:** https://open.alberta.ca/opendata
**GeoDiscover:** https://geodiscover.alberta.ca/
**ArcGIS REST Root:** `https://geospatial.alberta.ca/titan/rest/services`

### Key Services

| Category | Service | Endpoint |
|----------|---------|----------|
| **Parcels** | Cadastral & Land Ownership (excl. Calgary/Edmonton) | `https://geospatial.alberta.ca/titan/rest/services/cadastre/cadastral_and_land_ownership/MapServer` |
| **Township System** | Alberta DLS Grid | `https://geospatial.alberta.ca/titan/rest/services/base/alberta_township_system/MapServer` |
| **Agriculture** | Agricultural Land Resource Atlas | `https://geospatial.alberta.ca/titan/rest/services/agriculture/Agricultural_Land_Resource_Atlas/MapServer` |
| **Wetlands** | Merged Wetland Inventory | `https://geospatial.alberta.ca/titan/rest/services/environment/alberta_merged_wetland_inventory/MapServer` |
| **Wetlands WMS** | Same via WMS | `.../alberta_merged_wetland_inventory/MapServer/WMS` |
| **Wet Areas** | Predicted Streams | `https://geospatial.alberta.ca/titan/rest/services/environment/wet_areas_mapping_predicted_streams/MapServer` |
| **Flood Zones** | Flood Awareness Map | https://floods.alberta.ca/ |
| **Base Map** | Provincial Basemap | `https://geospatial.alberta.ca/titan/rest/services/basemap/provincial_basemap_a/MapServer` |
| **Municipal Boundaries** | Public boundaries | `https://geospatial.alberta.ca/titan/rest/services/boundaries/municipal_boundary_public/MapServer` |

**Assessment Data:** Provincial data is aggregate only. Parcel-level from Calgary (`data.calgary.ca`) and Edmonton (`data.edmonton.ca`).
**Geocoding:** No provincial service. Use federal NRCan or commercial.

---

## Saskatchewan

**Portal:** https://geohub.saskatchewan.ca/
**ArcGIS REST Root:** `https://gis.saskatchewan.ca/arcgis/rest/services`
**Water Security Agency:** `https://gis.wsask.ca/arcgiswa/rest/services`
**WSA GeoHub:** https://geohub-wsask.hub.arcgis.com/

### Key Services

| Category | Service | Endpoint |
|----------|---------|----------|
| **Cadastre** | DLS Grid | `https://gis.saskatchewan.ca/arcgis/rest/services/Cadastre/MapServer` |
| **Cadastre Township** | Township level | `https://gis.saskatchewan.ca/arcgis/rest/services/CadastreTownship/MapServer` |
| **Cadastre Section** | Section + quarter sections | `https://gis.saskatchewan.ca/arcgis/rest/services/CadastreSection/MapServer` |
| **Planning** | Parks, reserves, conservation | `https://gis.saskatchewan.ca/arcgis/rest/services/Planning/MapServer` |
| **Admin Boundaries** | Rural/urban municipalities | `https://gis.saskatchewan.ca/arcgis/rest/services/Administrative/MapServer` |
| **Flood Zones** | FDRP Floodway (via WSA) | `https://gis.wsask.ca/arcgiswa/rest/services/Temp/Water/MapServer` |
| **Biota** | Ecological data | `https://gis.saskatchewan.ca/arcgis/rest/services/Biota/MapServer` |
| **Env Sensitive Areas** | CAP | `https://gis.saskatchewan.ca/arcgis/rest/services/Wildlife/CAP_EnvironmentallySensitiveAreas/MapServer` |
| **Imagery** | FlySask Orthophotos | `https://gis.saskatchewan.ca/imagery/rest/services/SGIC_Public_Orthophotos/ImageServer` |
| **Imagery WMS** | FlySask WMS | `https://www.flysask2.ca/cubewerx/cubeserv.cgi?SERVICE=WMS` |
| **Imagery WMTS** | FlySask WMTS | `https://www.flysask2.ca/cubewerx/cubeserv?SERVICE=WMTS` |

**Assessment Data:** SAMA (sama.sk.ca) -- web lookup only, no open API. Commercial subscriptions for bulk.
**Parcel Titles:** ISC (isc.ca) -- requires purchase/subscription.
**Geocoding:** No provincial service.

---

## Manitoba

**Portal:** https://geoportal.gov.mb.ca/
**MLI:** https://mli.gov.mb.ca/ (free registration at https://mli2.gov.mb.ca/)
**ArcGIS REST:** `https://services.arcgis.com/mMUesHYPkXjaFGfS/arcgis/rest/services/`
**AgriMaps:** `https://agrimaps.gov.mb.ca/arcgis/rest/services/`
**WALLAS:** `https://web43.gov.mb.ca/arcgis/rest/services/`
**MLI WMS:** `http://mlidata.gov.mb.ca/wms/request.aspx` (EPSG:26914)

### Key Services

| Category | Service | Endpoint |
|----------|---------|----------|
| **Parcels + Assessment** | ROLL_ENTRY (all assessed properties with TOTAL_VALUE!) | `https://services.arcgis.com/mMUesHYPkXjaFGfS/arcgis/rest/services/ROLL_ENTRY/FeatureServer/0` |
| **Cadastral Polygons** | MLI Cadastral | `https://mli2.gov.mb.ca/cadastral/` (download) |
| **Zoning** | Zoning By-Laws (outside Winnipeg) | Via `https://geoportal.gov.mb.ca/datasets/manitoba::manitoba-zoning-by-laws` |
| **Development Plans** | Development Plan Designations | Via `https://geoportal.gov.mb.ca/datasets/manitoba::manitoba-development-plan-designations/about` |
| **Agriculture** | AgriMaps (soil, capability, productivity) | `https://agrimaps.gov.mb.ca/arcgis/rest/services/AGRIMAPS/AGRIMAPS/MapServer` |
| **Flood - Lines** | Provincial Waterways (floodways, dikes) | `https://services.arcgis.com/mMUesHYPkXjaFGfS/arcgis/rest/services/Provincial_Waterways/FeatureServer` |
| **Flood - Polygons** | Provincial Waterways Polygons | `https://services.arcgis.com/mMUesHYPkXjaFGfS/arcgis/rest/services/Manitoba_Provincial_Waterways_Waterways_Polygons/FeatureServer/0` |
| **Waterbodies** | Manitoba Waterbody Data | `https://services.arcgis.com/mMUesHYPkXjaFGfS/arcgis/rest/services/Manitoba_Waterbody_Data/FeatureServer/0` |
| **Watersheds** | Watershed Districts | `https://services.arcgis.com/mMUesHYPkXjaFGfS/arcgis/rest/services/Watershed_Districts/FeatureServer/0` |
| **Water/Land** | WALLAS | `https://web43.gov.mb.ca/arcgis/rest/services/WALLAS/wallas_op_external/MapServer` |

**Winnipeg-specific open data:** https://data.winnipeg.ca/
- Assessment Parcels: `https://data.winnipeg.ca/Assessment-Taxation-Corporate/Assessment-Parcels/d4mq-wa44`
- Zoning: `https://data.winnipeg.ca/City-Planning/City-of-Winnipeg-Zoning-By-law-Parcels-and-Zoning-/dxrp-w6re`

**Geocoding:** No provincial service. Use federal NRCan.

### Integration Example (GeoJSON query)

```javascript
map.addSource('mb-parcels', {
  type: 'geojson',
  data: 'https://services.arcgis.com/mMUesHYPkXjaFGfS/arcgis/rest/services/ROLL_ENTRY/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson&resultRecordCount=1000'
});
```

---

## Ontario

**Portal:** https://geohub.lio.gov.on.ca/
**Open Data Catalogue:** https://data.ontario.ca/
**LIO REST (primary):** `https://ws.lioservices.lrc.gov.on.ca/arcgis2/rest/services/LIO_OPEN_DATA/`
**LIO REST (alternate):** `https://ws.lioservices.lrc.gov.on.ca/arcgis1071a/rest/services/LIO_OPEN_DATA/`
**Conservation Ontario Hub:** https://co-opendata-camaps.hub.arcgis.com/
**Ontario Soils Hub:** https://ontario-soils-geohub-ontarioca11.hub.arcgis.com/

### LIO MapServer Directory

Services: LIO_Open01 through LIO_Open09, each containing multiple thematic layers.
WMS pattern: `.../services/LIO_OPEN_DATA/{ServiceName}/MapServer/WMSServer?request=GetCapabilities&service=WMS`

### Key Services

| Category | Service | Endpoint |
|----------|---------|----------|
| **Parcels** | Ontario Parcel (7.5M+, FGDB download only, NOT via API) | https://geohub.lio.gov.on.ca/documents/lio::ontario-parcel/about |
| **Assessment** | MPAC -- **RESTRICTED, not publicly available** | https://www.mpac.ca/ |
| **Greenbelt** | Greenbelt Designation | Via GeoHub: `https://geohub.lio.gov.on.ca/datasets/lio::greenbelt-designation/about` |
| **Greenbelt Boundary** | Outer Boundary | `.../LIO_Open06/MapServer/17` |
| **Specialty Crops** | Holland Marsh, Niagara | `.../LIO_Open06/MapServer/19` |
| **Wetlands (PSW)** | Wetland With Significance | `.../LIO_Open01/MapServer/15` |
| **Waterbodies** | OHN Waterbody | `.../LIO_Open01/MapServer/25` |
| **ORM Land Use** | Oak Ridges Moraine | `.../LIO_Open06/MapServer/28` |
| **Niagara Escarpment** | Plan Boundary | `.../LIO_Open06/MapServer/25` |
| **Municipal Boundaries** | Lower & Single Tier | `.../LIO_Open03/MapServer/14` |
| **Imagery** | OIWMS (primary aerial imagery) | `.../LIO_Imagery/Ontario_Imagery_Web_Map_Service_Source/MapServer` |
| **Topographic** | LIO Topographic | `.../LIO_Cartographic/LIO_Topographic/MapServer` |
| **Address Ranges** | ORN Segment With Address | `.../LIO_Open01/MapServer/32` |
| **Place Names** | Geographic Names Ontario | `.../LIO_Open09/MapServer/36` |

**Flood Zones Note:** Decentralized across 36 conservation authorities. Key CAs:
- TRCA (Toronto): https://trca-camaps.opendata.arcgis.com/
- RVCA (Rideau Valley): https://rvca.arcgis.com/

**Geocoding:** No provincial API. Use federal NRCan or ORN address range data for custom locator.

---

## New Brunswick

**Portal:** https://gnb.socrata.com/ (Socrata)
**GeoNB:** https://geonb.snb.ca/geonb/
**Data Catalogue:** https://www.gnb.ca/en/campaign/geonb/data-catalogue.html
**Developer Corner:** https://www.snb.ca/geonb1/e/dev/dev-corner-E.asp
**ArcGIS REST:** https://geonb.snb.ca/arcgis/rest/services
**ERD Open Data REST:** https://gis-erd-der.gnb.ca/server/rest/services
**Direct Download:** https://geonb.snb.ca/dd/index.html

### Key Services

| Category | Service | Endpoint |
|----------|---------|----------|
| **Parcels (500K+)** | Digital Property Maps (DPM) | `https://geonb.snb.ca/arcgis/rest/services/GeoNB_SNB_DPM/MapServer` |
| **Parcels GeoJSON** | DPM via Socrata | `https://gnb.socrata.com/api/geospatial/r46k-5j2j?method=export&type=GeoJSON` |
| **Assessment** | PAOL (web search) | https://paol-efel.snb.ca/ |
| **Assessment Data** | Socrata TSV/CSV | `https://gnb.socrata.com/fr/w/yqr9-tpe4` |
| **Municipal Areas** | ELG | `https://geonb.snb.ca/arcgis/rest/services/GeoNB_ELG_MunicipalAreas/MapServer` |
| **Local Service Districts** | ELG | `https://geonb.snb.ca/arcgis/rest/services/GeoNB_ELG_LocalServiceDistricts/MapServer` |
| **Coastal Zones** | ELG | `https://geonb.snb.ca/arcgis/rest/services/GeoNB_ELG_CoastalZones/MapServer` |
| **Climate Adaptation** | ELG | `https://geonb.snb.ca/arcgis/rest/services/GeoNB_ELG_Climate_Change_Adaptation_Plans/MapServer` |
| **Crown Land** | DNR | `https://geonb.snb.ca/arcgis/rest/services/GeoNB_DNR_Crown_Land/MapServer` |
| **Forest** | DNR | `https://geonb.snb.ca/arcgis/rest/services/GeoNB_DNR_Forest/MapServer` |
| **Forest Soils** | DNR | `https://geonb.snb.ca/arcgis/rest/services/GeoNB_DNR_ForestSoils/MapServer` |
| **Crop Suitability** | ERD (corn, soy, potato, grape, hemp, maple, apple) | `https://gis-erd-der.gnb.ca/server/rest/services/OpenData/` |
| **Flood Hazard** | Inland + coastal + 2100 projections | `https://geonb.snb.ca/arcgis/rest/services/GeoNB_ENV_Flood/MapServer` |
| **Flood Hub** | ArcGIS Hub (WMS/WFS/GeoJSON) | https://flooding-inondations-geonb.hub.arcgis.com/ |
| **Coastal Erosion** | DEM | `https://geonb.snb.ca/arcgis/rest/services/GeoNB_DEM_Coastal_Erosion/MapServer` |
| **Hydro Network** | NBHN (watercourses, wetlands, watersheds) | `https://geonb.snb.ca/arcgis/rest/services/GeoNB_DNR_NBHN/MapServer` |
| **Regulated Wetlands** | WAWA | `https://geonb.snb.ca/arcgis/rest/services/GeoNB_ELG_WAWA/MapServer` |
| **Contaminated Sites** | ELG | `https://geonb.snb.ca/arcgis/rest/services/GeoNB_ELG_Contaminated_Sites/MapServer` |
| **Imagery** | Aerial (tile cached) | `https://geonb.snb.ca/arcgis/rest/services/GeoNB_Basemap_Imagery/MapServer` |
| **Topo Basemap** | Tile cached | `https://geonb.snb.ca/arcgis/rest/services/GeoNB_Basemap_Topo/MapServer` |
| **Grey Basemap** | Tile cached | `https://geonb.snb.ca/arcgis/rest/services/GeoNB_Basemap_Grey/MapServer` |
| **Road Network** | NBRN | `https://geonb.snb.ca/arcgis/rest/services/GeoNB_Basemap_NBRN/MapServer` |
| **Geocoding** | ArcGIS GeocodeServer | `https://geonb.snb.ca/arcgis/rest/services/Geocoding/` |
| **Civic Addresses** | DPS | `https://geonb.snb.ca/arcgis/rest/services/GeoNB_DPS_Civic_Address/MapServer` |

### Integration Example

```javascript
// Tile cached basemap
map.addSource('geonb-imagery', {
  type: 'raster',
  tiles: ['https://geonb.snb.ca/arcgis/rest/services/GeoNB_Basemap_Imagery/MapServer/tile/{z}/{y}/{x}'],
  tileSize: 256
});

// Dynamic flood layer
map.addSource('geonb-flood', {
  type: 'raster',
  tiles: [
    'https://geonb.snb.ca/arcgis/rest/services/GeoNB_ENV_Flood/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=256,256&format=png32&transparent=true&f=image'
  ],
  tileSize: 256
});
```

---

## Nova Scotia

**Portal:** https://data.novascotia.ca/
**GeoNOVA:** https://geonova.novascotia.ca/
**NSGI Data Directory:** https://nsgi.novascotia.ca/gdd/
**NSGI Data Locator:** https://nsgi.novascotia.ca/datalocator/
**ArcGIS REST (primary):** `https://nsgiwa.novascotia.ca/arcgis/rest/services/`
**ArcGIS REST (secondary):** `https://nsgiwa2.novascotia.ca/arcgis/rest/services/`
**ArcGIS REST (environment):** `https://fletcher.novascotia.ca/arcgis/rest/services/`
**PVSC datazONE:** https://www.thedatazone.ca/

### Key Services

| Category | Service | Endpoint |
|----------|---------|----------|
| **Parcels (Web Mercator)** | NSPRD WM84 | `https://nsgiwa2.novascotia.ca/arcgis/rest/services/PLAN/PLAN_NSPRD_WM84/MapServer` |
| **Parcels (UTM)** | NSPRD UT83 | `https://nsgiwa2.novascotia.ca/arcgis/rest/services/PLAN/PLAN_NSPRD_UT83/MapServer` |
| **Property (with values)** | ISD_GIS Property | `https://gis7.nsgc.gov.ns.ca/arcgis/rest/services/ISD_GIS/Property/MapServer` |
| **Assessment Values** | datazONE (Socrata API) | `https://www.thedatazone.ca/Assessment/Assessed-Value-and-Taxable-Assessed-Value-History/bt58-qu28` |
| **Dwelling Characteristics** | datazONE | `https://www.thedatazone.ca/Assessment/Residential-Dwelling-Characteristics/a859-xvcs` |
| **Parcel Sizes** | datazONE | `https://www.thedatazone.ca/widgets/wg22-3ric` |
| **Zoning** | datazONE | `https://www.thedatazone.ca/Planning-Development/Zoning-Boundaries/iwqq-99ck` |
| **Crown Lands** | WM84 | `https://nsgiwa.novascotia.ca/arcgis/rest/services/PLAN/PLANCrownLandsWM84V1/MapServer` |
| **Land Cover** | NSTDB 10k | `https://nsgiwa.novascotia.ca/arcgis/rest/services/BASE/BASE_NSTDB_10k_Land_Cover_UT83/MapServer` |
| **Flood Risk** | Flood Risk Areas | `https://fletcher.novascotia.ca/arcgis/rest/services/mrlu/flood_risk_areas/MapServer` |
| **Coastal Hazard** | Web viewer | https://nsgi.novascotia.ca/chm |
| **Biodiversity** | Provincial Landscape Viewer | `https://nsgiwa.novascotia.ca/arcgis/rest/services/BIO/WLD_ProvLandScapeViewer_UT83/MapServer` |
| **Water Features** | NSTDB 10k | `https://nsgiwa.novascotia.ca/arcgis/rest/services/BASE/BASE_NSTDB_10k_Water_UT83/MapServer` |
| **Groundwater** | Groundwater Atlas | `https://fletcher.novascotia.ca/geocortex/essentials/rest/sites/groundwater_atlas_v3/map` |
| **Buildings** | NSTDB 10k | `https://nsgiwa.novascotia.ca/arcgis/rest/services/BASE/BASE_NSTDB_10k_Buildings_UT83/MapServer` |
| **Roads** | NSTDB 10k | `https://nsgiwa.novascotia.ca/arcgis/rest/services/BASE/BASE_NSTDB_10k_Roads_UT83/MapServer` |
| **Civic Addresses** | GeoJSON from Open Canada | `https://open.canada.ca/data/en/dataset/51a00e58-549f-12e0-41be-eee7d58a6f35` |
| **Civic Address Finder** | Web app | https://nsgi.novascotia.ca/civic-address-finder/ |

### datazONE Socrata API Pattern

```
CSV: https://www.thedatazone.ca/api/views/{4x4-id}/rows.csv?accessType=DOWNLOAD
JSON: https://www.thedatazone.ca/resource/{4x4-id}.json
GeoJSON: https://www.thedatazone.ca/api/geospatial/{4x4-id}?method=export&type=GeoJSON
```

---

## Prince Edward Island

**Portal:** https://data.princeedwardisland.ca/
**GIS Catalog:** https://gov.pe.ca/gis/index.php3?number=77543
**GeoLinc ArcGIS REST:** `https://geolinc.gov.pe.ca/server/rest/services/`
**ArcGIS Online:** https://peigov.maps.arcgis.com/
**CHRIS (Climate Hazard):** https://chris.peiclimate.ca/

### Key Services (GeoLinc REST)

| Category | Service | Endpoint |
|----------|---------|----------|
| **Parcels** | property_parcels (may need GeoLinc Plus for attributes) | `https://geolinc.gov.pe.ca/server/rest/services/property_parcels/MapServer` |
| **Boundaries** | property_boundaries | `https://geolinc.gov.pe.ca/server/rest/services/property_boundaries/MapServer` |
| **Municipal Zones** | municipal_zones | `https://geolinc.gov.pe.ca/server/rest/services/municipal_zones/MapServer` |
| **Lot/Township** | lot_township_zones | `https://geolinc.gov.pe.ca/server/rest/services/lot_township_zones/MapServer` |
| **County Zones** | county_zones | `https://geolinc.gov.pe.ca/server/rest/services/county_zones/MapServer` |
| **Civic Addresses** | civic_addresses | `https://geolinc.gov.pe.ca/server/rest/services/civic_addresses/MapServer` |
| **Road Network** | road_centerline | `https://geolinc.gov.pe.ca/server/rest/services/road_centerline/MapServer` |
| **Basemap** | Geolinc_MapImage | `https://geolinc.gov.pe.ca/server/rest/services/Geolinc_MapImage/MapServer` |
| **Neighbour Search** | Geoprocessing | `https://geolinc.gov.pe.ca/server/rest/services/geolinc_geoprocess/Neighbour_Search/GPServer` |
| **First Nations** | first_nations_reserves_zones | `https://geolinc.gov.pe.ca/server/rest/services/first_nations_reserves_zones/MapServer` |

**Assessment:** GeoLinc Plus only (paid subscription).
**Wetlands:** ArcGIS Online Feature Layer: `https://www.arcgis.com/home/item.html?id=907bf28d5fbe4cf4a1ef1d68d5881017`
**Agriculture:** ArcGIS Web App: `https://www.arcgis.com/apps/webappviewer/index.html?id=e0d12b6f54a4487096262fd49534046a`
**Flood Zones:** CHRIS covers coastal (2020-2100) and inland (10-100yr) scenarios.

---

## Newfoundland and Labrador

**Portal:** https://opendata.gov.nl.ca/
**GeoHub:** https://geohub-gnl.hub.arcgis.com/search
**GIS and Mapping Hub:** https://gis-and-mapping-gnl.hub.arcgis.com/
**Water Resources GeoHub:** https://nl-water-resources-geohub-gnl.hub.arcgis.com/
**Water Resources Portal:** https://maps.gov.nl.ca/water/
**Land Use Atlas REST:** `https://www.gov.nl.ca/landuseatlasmaps/rest/services/LandUseDetails/MapServer`
**Land Use Atlas Viewer:** https://www.gov.nl.ca/landuseatlas/details/

### Key Services

| Category | Service | Endpoint |
|----------|---------|----------|
| **Crown Titles** | LandUseDetails (layers 1-10) | `https://www.gov.nl.ca/landuseatlasmaps/rest/services/LandUseDetails/MapServer` |
| **Municipal Plan** | Municipal Plan Restrictions | Sublayer within LandUseDetails |
| **Protected Road** | Protected Road Zoning | Sublayer within LandUseDetails |
| **Admin Boundaries** | Layer 36 | `.../LandUseDetails/MapServer/36` |
| **Climate Change** | 100yr AEP scenarios | Sublayers within LandUseDetails |
| **Land Cover** | FAL Land Cover | https://geohub-gnl.hub.arcgis.com/maps/ea86e8a2a296425bb4eff8fb8ee40f97 |
| **Flood Risk** | 38 communities mapped | `https://gnl.maps.arcgis.com/apps/webappviewer/index.html?id=24dd4bb6f03948eb93f0535367a42a1f` |
| **Water Resources** | WMS/WFS via GeoHub | https://nl-water-resources-geohub-gnl.hub.arcgis.com/ |
| **Geoscience** | Geology maps | https://gis.geosurv.gov.nl.ca/ |

**Major Gaps:** No private parcel data, no assessment API, no geocoding service, no comprehensive wetland inventory.
**Assessment:** MAA web search only (https://maa.ca/), St. John's separate (https://apps.stjohns.ca/assessmentsearch/).

---

## Yukon

**Portal:** https://open.yukon.ca/data/
**GeoYukon Hub:** https://mapservices.gov.yk.ca/GeoYukon/
**ArcGIS REST Root:** `https://mapservices.gov.yk.ca/arcgis/rest/services/GeoYukon`
**WMS Pattern:** `https://mapservices.gov.yk.ca/arcgis/services/GeoYukon/{ServiceName}/MapServer/WMSServer`

### Key Services

| Category | Service | Endpoint |
|----------|---------|----------|
| **Land Parcels** | GY_LandTenure | `.../GeoYukon/GY_LandTenure/MapServer` |
| **Land Planning** | GY_LandPlanning | `.../GeoYukon/GY_LandPlanning/MapServer` |
| **Biological** | GY_Biological | `.../GeoYukon/GY_Biological/MapServer` |
| **Biophysical** | GY_Biophysical | `.../GeoYukon/GY_Biophysical/MapServer` |
| **Basemap** | GY_Basemap | `.../GeoYukon/GY_Basemap/MapServer` |
| **Imagery** | GY_Imagery | `.../GeoYukon/GY_Imagery/MapServer` |
| **Elevation** | GY_Elevation | `.../GeoYukon/GY_Elevation/MapServer` |
| **Flood Atlas** | Community flood maps | https://floods.service.yukon.ca/ |

Additional: GY_FirstNations, GY_Mining, GY_OilGas, GY_ParksProtectedAreas, GY_Transportation, GY_Forestry, GY_Geological.
**Assessment:** Not open geospatial.
**Geocoding:** Federal NRCan only.

---

## Northwest Territories

**Portal:** https://www.eia.gov.nt.ca/en/priorities/open-government/open-data
**Centre for Geomatics:** https://www.geomatics.gov.nt.ca/en
**Vector REST:** `https://www.apps.geomatics.gov.nt.ca/ArcGIS/rest/services`
**Raster REST:** `https://www.image.geomatics.gov.nt.ca/ArcGIS/rest/services`

### Key Services

| Category | Service | Endpoint |
|----------|---------|----------|
| **Parcels/Cadastre** | PlanningCadastre_LCC | `.../GNWT/PlanningCadastre_LCC/MapServer` |
| **Land Admin** | ATLAS_Public | `.../GNWT_Operational/ATLAS_Public/MapServer` |
| **Agriculture** | Agriculture_LCC | `.../GNWT/Agriculture_LCC/MapServer` |
| **Biology/Ecology** | BiologicEcologic_LCC | `.../GNWT/BiologicEcologic_LCC/MapServer` |
| **Environment** | Environment_LCC | `.../GNWT/Environment_LCC/MapServer` |
| **Basemap** | Simplified Basemap | `.../GNWT_Basemaps/GNWT_Simplified_Basemap/MapServer` |

ISO folders: Boundaries_LCC, Elevation_LCC, Geoscientific_LCC, Structure_LCC, Transportation_LCC.
**Assessment:** Not open geospatial.
**Geocoding:** Federal NRCan only.

---

## Nunavut

Most limited geospatial infrastructure. Services primarily through federal platforms.

| Category | Service | URL |
|----------|---------|-----|
| **CLSS Map Browser** | Cadastral for northern communities | https://clss.nrcan-rncan.gc.ca/mb-nc/en/index.html |
| **Nunavut Map Viewer** | Mineral/surface tenure | `https://services.aadnc-aandc.gc.ca/nms2-scn/gv/index.html` |
| **Land Use Plan** | Interactive maps | https://www.nunavut.ca/land-use-planning/interactive-maps |
| **Inuit Owned Lands** | NTI Shapefiles | https://ntilands.tunngavik.com/maps/ |

**Assessment, Geocoding, Wetlands:** Not available. Use federal services.

---

## Federal / Pan-Canadian Services

### Portals

| Portal | URL |
|--------|-----|
| Open Government Portal | https://open.canada.ca/data/ |
| Federal Geospatial Platform | https://maps.canada.ca/en/index.html |
| GEO.ca | https://geo.ca/home/ |
| GeoGratis | https://geogratis.gc.ca/ |

### Key Services

| Category | Service | Endpoint |
|----------|---------|----------|
| **Geocoding** | NRCan Geolocation (free, no key, all Canada) | `https://geogratis.gc.ca/services/geolocation/en/locate?q={query}` |
| **Place Names** | NRCan Geoname | `https://geogratis.gc.ca/services/geoname/en/geonames?q={query}` |
| **Basemap (EPSG:3857)** | CBMT | `https://geoappext.nrcan.gc.ca/arcgis/rest/services/BaseMaps/CBMT_TXT_3857/MapServer` |
| **Basemap WMTS** | CBMT 3978 | `https://maps-cartes.services.geo.ca/server2_serveur2/rest/services/BaseMaps/CBMT3978/MapServer/WMTS/1.0.0/WMTSCapabilities.xml` |
| **Basemap WMS** | CBMT | `https://maps.geogratis.gc.ca/wms/CBMT?service=wms&version=1.3.0&request=GetCapabilities` |
| **Topographic** | Toporama WMS | `https://wms.ess-ws.nrcan.gc.ca/wms/toporama_en?service=wms&request=GetCapabilities` |
| **Agriculture (CLI 250k)** | Soil capability 7-class | `https://services.arcgis.com/lGOekm0RsNxYnT3j/arcgis/rest/services/cli_agr_cap_250k/FeatureServer` |
| **Agriculture (CLI 1M)** | Lower resolution | `https://services.arcgis.com/lGOekm0RsNxYnT3j/arcgis/rest/services/cli_agr_cap_1M/FeatureServer` |
| **Active Floods** | Near real-time satellite | `https://maps-cartes.services.geo.ca/egs_sgu/rest/services/Flood_Inondation/EGS_Flood_Product_Active_en/MapServer` |
| **Flood Map Inventory** | Where flood maps exist | https://open.canada.ca/data/en/dataset/a13a2575-5bda-4bfd-a9b1-5bd2dd583f09 |
| **National Wetlands (CNWI)** | 12.1M polygons | `https://maps-cartes.ec.gc.ca/arcgis/services/CWS_SCF/INTHC/MapServer/WMSServer` |
| **Land Cover 2020** | 30m resolution | `https://datacube.services.geo.ca/web/landcover.xml?service=WMS&version=1.3.0&request=GetCapabilities` |
| **Census Boundaries** | 2021 census subdivisions/tracts | Via open.canada.ca |
| **Aboriginal Lands** | Legislative boundaries | `https://proxyinternet.nrcan-rncan.gc.ca/arcgis/services/CLSS-SATC/CLSS_Administrative_Boundaries/MapServer/WMSServer` |
| **Canada Lands (CLSS)** | Reserves, parks, northern communities | https://clss.nrcan-rncan.gc.ca/mb-nc/en/index.html |
| **Weather/Climate** | MSC GeoMet (ECCC) | https://eccc-msc.github.io/open-data/msc-geomet/readme_en/ |
| **Address Register** | Stats Canada NAR | https://www.statcan.gc.ca/en/developers/nar |

---

## Data Availability Matrix

| Province | Parcels via API | Assessment via API | Zoning via API | Flood Zones via API | Wetlands via API | Geocoding | Developer Rating |
|----------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **BC** | WMS/WFS | No (restricted) | Municipal only | WMS/WFS | WMS/WFS | Provincial (free) | Excellent |
| **AB** | ArcGIS REST | Municipal only (Calgary/Edmonton) | Municipal only | ArcGIS Online | ArcGIS REST/WMS | None | Medium |
| **SK** | DLS grid only | None (SAMA web only) | ArcGIS REST | ArcGIS REST (WSA) | ArcGIS REST | None | Medium |
| **MB** | FeatureServer (with values!) | FeatureServer (TOTAL_VALUE) | FeatureServer | FeatureServer | FeatureServer | None | Good |
| **ON** | Download only (FGDB) | No (MPAC restricted) | Municipal only | Per conservation authority | ArcGIS REST | None | Medium |
| **QC** | Download | Download (GeoJSON/SHP) | Municipal only | Download (GeoJSON/SHP) | ArcGIS REST/WMS | Provincial | Good |
| **NB** | ArcGIS REST + Socrata | Socrata (open!) | ArcGIS REST | ArcGIS REST + Hub | ArcGIS REST | Provincial (ArcGIS) | Excellent |
| **NS** | ArcGIS REST | Socrata (datazONE, open!) | Socrata (datazONE) | ArcGIS REST | ArcGIS REST + download | GeoJSON (Open Canada) | Good |
| **PE** | ArcGIS REST (partial) | Paid (GeoLinc Plus) | ArcGIS REST (limited) | CHRIS web app | ArcGIS Online | ArcGIS REST | Fair |
| **NL** | Crown only | None (MAA web only) | ArcGIS REST (Land Use Atlas) | ArcGIS web app (38 communities) | Limited | None | Fair |
| **YT** | ArcGIS REST/WMS | None | ArcGIS REST/WMS | Flood Atlas (download) | Partial | None | Fair |
| **NT** | ArcGIS REST | None | ArcGIS REST | Partial | ArcGIS REST | None | Fair |
| **NU** | Federal CLSS only | None | Web only | Minimal | Federal only | None | Poor |

---

## Key Gaps and Workarounds

### Property Assessment Data
The hardest category to obtain openly. Best provinces: **Manitoba** (ROLL_ENTRY), **New Brunswick** (Socrata), **Nova Scotia** (datazONE). For Ontario (MPAC locked), PEI (paid), NL (web only) -- consider commercial data aggregators like Regrid (https://app.regrid.com/ca/).

### Zoning
Administered at the municipal level everywhere. No province has a single provincial zoning layer. Must integrate per-municipality. Check individual municipal open data portals.

### Geocoding
Only **BC** and **New Brunswick** have provincial geocoding APIs. **Quebec** has one via MERN. For all others, use the **federal NRCan Geolocation API** (`geogratis.gc.ca/services/geolocation/en/locate`) -- free, no key, covers all of Canada.

### No Pan-Canadian Parcel/Cadastral Service
Each province maintains its own system. CLSS covers federal/Canada Lands only. No single national service exists.

### ArcGIS REST Pagination
Most ArcGIS REST services have a `maxRecordCount` (typically 1000-2000). For large datasets, implement pagination using `resultOffset` and `resultRecordCount`, or use spatial/attribute `where` clauses to filter.

### Projection Considerations
- Most services use NAD83 variants (UTM zones vary by province)
- Always request `outSR=4326` or `outSR=3857` in ArcGIS REST queries for Mapbox compatibility
- Use `_WM84` or Web Mercator variants where available (e.g., NS NSPRD)
- Quebec TMS uses `{-y}` (TMS scheme with inverted Y)

---

## Viewport-Based Layer Loading (Map UI Architecture)

The platform maps ALL properties from the database at once (with filters). Government layers adapt based on what's visible in the map viewport, not a single property search.

### Detecting Visible Provinces

Use approximate provincial bounding boxes to determine which province(s) are on screen:

```javascript
const PROVINCE_BOUNDS = {
  BC: { west: -139.06, south: 48.30, east: -114.03, north: 60.00 },
  AB: { west: -120.00, south: 49.00, east: -110.00, north: 60.00 },
  SK: { west: -110.00, south: 49.00, east: -101.36, north: 60.00 },
  MB: { west: -102.00, south: 49.00, east: -88.90,  north: 60.00 },
  ON: { west: -95.15,  south: 41.67, east: -74.34,  north: 56.86 },
  QC: { west: -79.76,  south: 44.99, east: -57.10,  north: 62.59 },
  NB: { west: -69.06,  south: 44.60, east: -63.77,  north: 48.07 },
  NS: { west: -66.42,  south: 43.37, east: -59.68,  north: 47.03 },
  PE: { west: -64.42,  south: 45.95, east: -61.98,  north: 47.07 },
  NL: { west: -67.81,  south: 46.62, east: -52.62,  north: 60.38 },
  YT: { west: -141.00, south: 60.00, east: -123.82, north: 69.65 },
  NT: { west: -136.45, south: 60.00, east: -101.98, north: 78.77 },
  NU: { west: -120.68, south: 51.62, east: -61.24,  north: 83.11 },
};

function getVisibleProvinces() {
  const bounds = map.getBounds();
  const visible = [];
  for (const [code, box] of Object.entries(PROVINCE_BOUNDS)) {
    if (bounds.getWest() < box.east && bounds.getEast() > box.west &&
        bounds.getSouth() < box.north && bounds.getNorth() > box.south) {
      visible.push(code);
    }
  }
  return visible;
}
```

### Automatic Layer Management on Pan/Zoom

```javascript
let activeProvinces = [];

map.on('moveend', () => {
  const zoom = map.getZoom();

  // Only load government layers when zoomed in enough
  if (zoom < 8) {
    hideAllGovernmentLayers();
    updateLayerPanel([]);  // show "zoom in" message
    return;
  }

  const visible = getVisibleProvinces();

  // Remove layers for provinces no longer in view
  activeProvinces
    .filter(p => !visible.includes(p))
    .forEach(p => removeProvinceLayers(p));

  // Add layers for newly visible provinces
  visible
    .filter(p => !activeProvinces.includes(p))
    .forEach(p => addProvinceLayers(p));

  activeProvinces = visible;

  // Rebuild the layer panel to show toggles for visible provinces
  updateLayerPanel(visible);
});
```

### Zoom Thresholds Per Layer Type

Different layers make sense at different zoom levels:

```javascript
const LAYER_ZOOM_THRESHOLDS = {
  'municipal-bounds':    7,
  'flood-zones':         8,
  'agricultural-zone':   8,
  'wetlands':            9,
  'aerial-imagery':      10,
  'contaminated-sites':  11,
  'zoning':              12,
  'parcels':             13,  // only at neighbourhood level
};
```

Apply via Mapbox `minzoom`:

```javascript
map.addLayer({
  id: 'qc-flood-layer',
  type: 'raster',
  source: 'qc-flood',
  minzoom: 8,
  maxzoom: 18,
  paint: { 'raster-opacity': 0.6 }
});
```

### Province-Aware Layer Panel Config

The toggle panel adapts based on which provinces are in the viewport:

```javascript
const PROVINCE_LAYER_CONFIG = {
  QC: {
    groups: [
      {
        name: 'Land Classification',
        layers: [
          { id: 'qc-demeter', label: 'Agricultural Zone (Demeter)', default: true },
          { id: 'qc-wetlands', label: 'Milieux humides', default: true },
        ]
      },
      {
        name: 'Risk',
        layers: [
          { id: 'qc-flood', label: 'Flood Zones (Geo-Inondations)', default: true },
        ]
      },
      {
        name: 'Reference',
        layers: [
          { id: 'qc-basemap', label: 'Quebec Base Map', default: false },
          { id: 'qc-imagery', label: 'Aerial Imagery', default: false },
        ]
      }
    ]
  },
  ON: {
    groups: [
      {
        name: 'Land Classification',
        layers: [
          { id: 'on-greenbelt', label: 'Greenbelt Designation', default: true },
          { id: 'on-psw', label: 'Provincially Significant Wetlands', default: true },
          { id: 'on-orm', label: 'Oak Ridges Moraine', default: false },
          { id: 'on-niagara-escarpment', label: 'Niagara Escarpment', default: false },
        ]
      }
    ]
  },
  // ... define for each province
};
```

### Layer Panel UI Behavior

**Zoomed out (all of Canada):**
```
[Layers]
  Zoom in to see government layers
```

**Zoomed into one province (e.g., Quebec):**
```
[Layers - Quebec]
  Property Constraints
    [x] Agricultural Zone (Demeter / CPTAQ)
    [x] Flood Zones (Geo-Inondations)
    [x] Wetlands (Milieux humides)
  Reference
    [ ] Quebec Base Map
    [ ] Aerial Imagery
```

**Zoomed into a border area (e.g., Ottawa/Gatineau, ON + QC):**
```
[Layers - Ontario]
    [x] Greenbelt Designation
    [x] Provincially Significant Wetlands

[Layers - Quebec]
    [x] Agricultural Zone (Demeter)
    [x] Flood Zones
    [x] Wetlands
```

### Lazy Loading Government Layers

Don't load all sources upfront. Add them only when toggled on:

```javascript
function showLayer(layerId, province) {
  if (!map.getSource(layerId)) {
    const config = getLayerConfig(layerId, province);

    if (config.type === 'wms') {
      map.addSource(layerId, {
        type: 'raster',
        tiles: [config.url],
        tileSize: 256
      });
      map.addLayer({
        id: layerId, type: 'raster', source: layerId,
        minzoom: config.minzoom || 8,
        paint: { 'raster-opacity': 0.7 }
      });

    } else if (config.type === 'arcgis-export') {
      map.addSource(layerId, {
        type: 'raster',
        tiles: [
          config.url + '/export?bbox={bbox-epsg-3857}'
          + '&bboxSR=3857&imageSR=3857&size=256,256'
          + '&format=png32&transparent=true&f=image'
        ],
        tileSize: 256
      });
      map.addLayer({
        id: layerId, type: 'raster', source: layerId,
        minzoom: config.minzoom || 8,
        paint: { 'raster-opacity': 0.7 }
      });

    } else if (config.type === 'geojson') {
      map.addSource(layerId, { type: 'geojson', data: config.url });
      map.addLayer({
        id: layerId, type: 'fill', source: layerId,
        minzoom: config.minzoom || 8,
        paint: { 'fill-color': config.color, 'fill-opacity': 0.4 }
      });
      map.addLayer({
        id: layerId + '-outline', type: 'line', source: layerId,
        minzoom: config.minzoom || 8,
        paint: { 'line-color': config.color, 'line-width': 1.5 }
      });
    }
  } else {
    map.setLayoutProperty(layerId, 'visibility', 'visible');
  }
}

function hideLayer(layerId) {
  if (map.getLayer(layerId)) {
    map.setLayoutProperty(layerId, 'visibility', 'none');
  }
}
```

### Toggle and Opacity Controls

```javascript
function toggleLayer(layerId, visible) {
  map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
}

function setLayerOpacity(layerId, opacity) {
  map.setPaintProperty(layerId, 'raster-opacity', opacity); // raster layers
  // OR
  map.setPaintProperty(layerId, 'fill-opacity', opacity);   // vector layers
}
```

### Click-to-Identify (Popups on Government Layers)

```javascript
map.on('click', (e) => {
  // For vector/GeoJSON layers
  const features = map.queryRenderedFeatures(e.point, {
    layers: ['parcels-fill', 'flood-zones-fill', 'wetlands-fill']
  });
  if (features.length > 0) {
    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(formatFeaturePopup(features[0]))
      .addTo(map);
  }

  // For raster/WMS layers - use GetFeatureInfo
  if (isLayerVisible('qc-demeter')) {
    const url = buildGetFeatureInfoUrl('qc-demeter', e.lngLat, e.point);
    fetch(url).then(r => r.json()).then(data => showPopup(e.lngLat, data));
  }

  // For ArcGIS REST raster layers - use identify
  if (isLayerVisible('ab-wetlands')) {
    const url = `${arcgisUrl}/identify?geometry=${e.lngLat.lng},${e.lngLat.lat}`
      + `&geometryType=esriGeometryPoint&sr=4326&layers=all&tolerance=3`
      + `&mapExtent=${map.getBounds().toArray()}&imageDisplay=256,256,96&f=json`;
    fetch(url).then(r => r.json()).then(data => showPopup(e.lngLat, data));
  }
});
```

### Full UX Flow

```
App loads
  -> All properties from DB plotted on map (clustered at low zoom)
  -> User applies filters (property type, value range, date, status, etc.)
  -> Filtered properties displayed
  -> User zooms/pans into area of interest
  -> moveend fires -> detect visible province(s)
  -> Government layers for those provinces become available
  -> Layer panel updates with province-specific toggles
  -> Default layers auto-enabled (flood, ag zone, wetlands)
  -> User toggles additional layers, adjusts opacity
  -> Clicks government layer feature -> info popup
  -> Clicks property marker -> property details panel
  -> Pans to different province -> layers swap automatically
```

### Note on Raster Tile Efficiency

WMS and ArcGIS REST raster layers automatically handle viewport clipping -- Mapbox only requests tiles for the visible area. No manual spatial filtering needed for raster sources. The main responsibility of your code is managing which province's sources are added/removed as the user navigates.

---

*Last updated: February 2026*
*Research compiled for real estate valuation platform development*
