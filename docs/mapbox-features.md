# Carte Mapbox GL JS — Features pour évaluation immobilière

## Contexte

Ce document décrit les features cartographiques à intégrer dans Valea Max pour supporter les workflows d'évaluation immobilière au Canada. Toutes les intégrations utilisent Mapbox GL JS.

## Table des matières

1. [Cadastre — Toutes provinces](#1-cadastre---toutes-provinces)
2. [Imagerie satellite](#2-imagerie-satellite)
3. [Bâtiments 3D](#3-bâtiments-3d)
4. [Geocoding (recherche par adresse)](#4-geocoding---recherche-par-adresse)
5. [Street View (Mapillary)](#5-street-view---mapillary)
6. [Outils de mesure (distances et superficies)](#6-outils-de-mesure---distances-et-superficies)
7. [Isochrones (zones d'accessibilité)](#7-isochrones---zones-daccessibilité)
8. [Compare / Swipe (comparer deux vues)](#8-compare--swipe)

---

## 1. Cadastre — Toutes provinces

Le cadastre (limites de lots/parcelles) est disponible publiquement pour certaines provinces canadiennes. Cette section documente tous les endpoints testés et leur compatibilité avec Mapbox GL JS.

### Disponibilité par province

| Province | Disponible? | CORS? | Mapbox direct? | Proxy requis? |
|---|---|---|---|---|
| **Québec** | Oui | Oui | Oui | Non |
| **Nouvelle-Écosse** | Oui | Oui | Oui | Non |
| **Nouveau-Brunswick** | Oui | Oui (`*`) | Oui | Non |
| **Manitoba** | Oui (FeatureServer) | Oui | Oui (vector) | Non |
| **Colombie-Britannique** | Oui (WMS) | **Non** | **Non** | **Oui** |
| **Ontario** | Partiel (lots cadastraux, pas parcelles individuelles) | Oui | Oui | Non |
| **Terre-Neuve** | Partiel (terres de la Couronne seulement) | Oui | Oui | Non |
| **Alberta** | Non (token requis, AltaLIS payant) | — | Non | — |
| **Saskatchewan** | Non (token requis, ISC payant) | — | Non | — |
| **Î.-P.-É.** | Non confirmé (GeoLinc Plus payant) | — | Non | — |

### Intégration dynamique par province

L'application devrait détecter la province à partir des coordonnées et activer automatiquement le bon endpoint cadastral.

```javascript
// Configuration des endpoints cadastraux par province
const CADASTRE_ENDPOINTS = {
  QC: {
    name: 'Québec',
    url: 'https://geo.environnement.gouv.qc.ca/donnees/rest/services/' +
         'Reference/Cadastre_allege/MapServer/export' +
         '?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857' +
         '&size=512,512&format=png32&transparent=true&layers=show:0&f=image',
    tileSize: 512,
    minzoom: 13,
    type: 'raster',
    attribution: '&copy; Gouvernement du Québec - Cadastre'
  },
  NS: {
    name: 'Nouvelle-Écosse',
    url: 'https://nsgiwa2.novascotia.ca/arcgis/rest/services/' +
         'PLAN/PLAN_NSPRD_WM84/MapServer/export' +
         '?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857' +
         '&size=512,512&format=png&transparent=true&f=image',
    tileSize: 512,
    minzoom: 14,
    type: 'raster',
    attribution: '&copy; Province of Nova Scotia - NSPRD'
  },
  NB: {
    name: 'Nouveau-Brunswick',
    url: 'https://geonb.snb.ca/arcgis/rest/services/' +
         'GeoNB_SNB_Parcels/MapServer/export' +
         '?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857' +
         '&size=512,512&format=png&transparent=true&f=image',
    tileSize: 512,
    minzoom: 14,
    type: 'raster',
    attribution: '&copy; Service New Brunswick - GeoNB'
  },
  BC: {
    name: 'Colombie-Britannique',
    // REQUIERT UN PROXY CORS — voir section "Proxy CORS pour la C.-B."
    url: 'YOUR_CORS_PROXY_URL/https://openmaps.gov.bc.ca/geo/pub/' +
         'WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW/ows' +
         '?service=WMS&version=1.1.1&request=GetMap' +
         '&layers=pub:WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW' +
         '&bbox={bbox-epsg-3857}&width=512&height=512' +
         '&srs=EPSG:3857&styles=&format=image/png&transparent=true',
    tileSize: 512,
    minzoom: 13,
    type: 'raster',
    attribution: '&copy; Province of British Columbia - ParcelMap BC'
  },
  ON: {
    name: 'Ontario (lots cadastraux seulement)',
    url: 'https://ws.lioservices.lrc.gov.on.ca/arcgis2/rest/services/' +
         'LIO_OPEN_DATA/LIO_Open05/MapServer/export' +
         '?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857' +
         '&size=512,512&format=png32&transparent=true&layers=show:15&f=image',
    tileSize: 512,
    minzoom: 13,
    type: 'raster',
    attribution: '&copy; Ontario GeoHub - Cadastral Location'
  },
  MB: {
    name: 'Manitoba',
    // FeatureServer — approche vector/GeoJSON, voir section Manitoba
    featureServerUrl: 'https://services.arcgis.com/mMUesHYPkXjaFGfS/ArcGIS/rest/services/' +
                      'ROLL_ENTRY/FeatureServer/0',
    type: 'feature-server',
    maxRecords: 2000,
    attribution: '&copy; Province of Manitoba - Property Assessment'
  }
};

// Ajouter le cadastre pour une province donnée
function addCadastreLayer(map, provinceCode) {
  const config = CADASTRE_ENDPOINTS[provinceCode];
  if (!config) {
    console.warn('Aucun cadastre disponible pour:', provinceCode);
    return;
  }

  // Supprimer le cadastre existant si on change de province
  if (map.getLayer('cadastre-lots')) map.removeLayer('cadastre-lots');
  if (map.getSource('cadastre-province')) map.removeSource('cadastre-province');

  if (config.type === 'raster') {
    map.addSource('cadastre-province', {
      type: 'raster',
      tiles: [config.url],
      tileSize: config.tileSize,
      attribution: config.attribution
    });
    map.addLayer({
      id: 'cadastre-lots',
      type: 'raster',
      source: 'cadastre-province',
      paint: { 'raster-opacity': 0.7 },
      minzoom: config.minzoom,
      maxzoom: 20
    });
  }
  // Pour MB (FeatureServer), voir la section Manitoba ci-dessous
}
```

---

### Québec — Endpoints détaillés

Deux endpoints ArcGIS REST publics testés et fonctionnels avec CORS.

#### Endpoint recommandé : Environnement Québec — Cadastre_allege

- **Base URL** : `https://geo.environnement.gouv.qc.ca/donnees/rest/services/Reference/Cadastre_allege/MapServer`
- **Layer** : ID `0` — "Lots du cadastre rénové" (polygones)
- **Champ clé** : `NO_LOT` (numéro de lot, type string)
- **Projection** : EPSG:3857 (Web Mercator)
- **Échelle** : Visible à partir de 1:30 000 (zoom Mapbox ~13+)
- **CORS** : Oui (reflète l'Origin)
- **Format tuile** : PNG32 avec transparence
- **Mise à jour** : Aux deux mois
- **Rendu** : Remplissage vert pâle, contour noir 0.7px, étiquettes numéro de lot en Arial 8pt bold sous 1:2 500

#### Endpoint alternatif : Infolot (Foncier)

- **Base URL** : `https://appli.foncier.gouv.qc.ca/arcgis_webadaptor_prodc_10_9_1/rest/services/Commun/LotCadastreSirf/MapServer`
- **Layer** : ID `0` — "Lot (polygone)"
- **Projection** : EPSG:3857
- **Échelle** : Visible à partir de 1:20 000 (zoom Mapbox ~14+)
- **CORS** : Oui
- **Note** : Même données que le portail Infolot officiel

#### Notes techniques — Québec

- L'intégration utilise l'endpoint ArcGIS REST `/export` avec `f=image`. Mapbox remplace automatiquement `{bbox-epsg-3857}` par le bounding box Web Mercator de chaque tuile.
- `tileSize: 512` réduit le nombre de requêtes par 4x comparé à 256px.
- Zoom minimum ~13 (échelle 1:30 000). En dessous, tuiles transparentes.
- Endpoint gouvernemental sans SLA garanti. Prévoir gestion d'erreur.

### Identifier un lot au clic — Québec

```javascript
map.on('click', async (e) => {
  const { lng, lat } = e.lngLat;
  const x = lng * 20037508.34 / 180;
  const sinLat = Math.sin(lat * Math.PI / 180);
  const y = (20037508.34 / Math.PI) * Math.log((1 + sinLat) / (1 - sinLat)) / 2;

  const url =
    'https://geo.environnement.gouv.qc.ca/donnees/rest/services/' +
    'Reference/Cadastre_allege/MapServer/identify' +
    '?geometry=' + x + ',' + y +
    '&geometryType=esriGeometryPoint&sr=3857&layers=all:0&tolerance=2' +
    '&mapExtent=' + (x-100) + ',' + (y-100) + ',' + (x+100) + ',' + (y+100) +
    '&imageDisplay=256,256,96&returnGeometry=false&f=json';

  try {
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.results?.length > 0) {
      const lotNo = data.results[0].attributes.NO_LOT;
      new mapboxgl.Popup().setLngLat(e.lngLat)
        .setHTML('<strong>Lot:</strong> ' + lotNo).addTo(map);
    }
  } catch (err) { console.warn('Identify failed:', err); }
});
```

---

### Nouvelle-Écosse — NSPRD

- **Base URL** : `https://nsgiwa2.novascotia.ca/arcgis/rest/services/PLAN/PLAN_NSPRD_WM84/MapServer`
- **Layer** : 0 = NSPRD.Property (polygones, limites de propriétés)
- **Projection** : EPSG:3857
- **Échelle** : Visible à partir de 1:36 114 (zoom ~14+)
- **CORS** : Oui (reflète l'Origin)

```javascript
map.addSource('cadastre-ns', {
  type: 'raster',
  tiles: [
    'https://nsgiwa2.novascotia.ca/arcgis/rest/services/' +
    'PLAN/PLAN_NSPRD_WM84/MapServer/export' +
    '?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857' +
    '&size=512,512&format=png&transparent=true&f=image'
  ],
  tileSize: 512,
  attribution: '&copy; Province of Nova Scotia - NSPRD'
});
map.addLayer({
  id: 'cadastre-ns',
  type: 'raster',
  source: 'cadastre-ns',
  paint: { 'raster-opacity': 0.7 },
  minzoom: 14
});
```

---

### Nouveau-Brunswick — GeoNB Parcels

- **Base URL** : `https://geonb.snb.ca/arcgis/rest/services/GeoNB_SNB_Parcels/MapServer`
- **Layers** : 0 = Parcels (polygones, visible 1:40 000), 1 = Parcel labels (visible 1:20 000)
- **Projection** : Export en EPSG:3857 supporté
- **CORS** : Oui (wildcard `*` — le plus permissif)

```javascript
map.addSource('cadastre-nb', {
  type: 'raster',
  tiles: [
    'https://geonb.snb.ca/arcgis/rest/services/' +
    'GeoNB_SNB_Parcels/MapServer/export' +
    '?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857' +
    '&size=512,512&format=png&transparent=true&f=image'
  ],
  tileSize: 512,
  attribution: '&copy; Service New Brunswick - GeoNB'
});
map.addLayer({
  id: 'cadastre-nb',
  type: 'raster',
  source: 'cadastre-nb',
  paint: { 'raster-opacity': 0.7 },
  minzoom: 14
});
```

---

### Manitoba — FeatureServer (vector)

Le Manitoba utilise un FeatureServer ArcGIS Online (données vectorielles, pas raster). L'approche est différente : on query les features GeoJSON pour le viewport courant.

- **Base URL** : `https://services.arcgis.com/mMUesHYPkXjaFGfS/ArcGIS/rest/services/ROLL_ENTRY/FeatureServer/0`
- **Champs utiles** : `Roll_No`, `Property_Address`, `Municipality`, `Total_Value`, `Frontage_or_Area`
- **Limite** : 2 000 features par requête
- **CORS** : Oui (ArcGIS Online natif)

```javascript
// Query les parcelles du Manitoba pour le viewport courant
async function loadManitobaParcels(map) {
  const bounds = map.getBounds();
  const envelope = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;

  const url =
    'https://services.arcgis.com/mMUesHYPkXjaFGfS/ArcGIS/rest/services/' +
    'ROLL_ENTRY/FeatureServer/0/query' +
    '?where=1=1' +
    '&geometry=' + encodeURIComponent(envelope) +
    '&geometryType=esriGeometryEnvelope' +
    '&inSR=4326&outSR=4326' +
    '&outFields=Roll_No,Property_Address,Municipality,Total_Value' +
    '&returnGeometry=true' +
    '&f=geojson';

  const resp = await fetch(url);
  const data = await resp.json();

  if (map.getSource('cadastre-mb')) {
    map.getSource('cadastre-mb').setData(data);
  } else {
    map.addSource('cadastre-mb', { type: 'geojson', data: data });
    map.addLayer({
      id: 'cadastre-mb-fill',
      type: 'fill',
      source: 'cadastre-mb',
      paint: { 'fill-color': '#88cc88', 'fill-opacity': 0.15 }
    });
    map.addLayer({
      id: 'cadastre-mb-outline',
      type: 'line',
      source: 'cadastre-mb',
      paint: { 'line-color': '#333', 'line-width': 1 }
    });
  }
}

// Recharger les parcelles quand la carte bouge (avec debounce)
let mbTimeout;
map.on('moveend', () => {
  if (map.getZoom() < 14) return;
  clearTimeout(mbTimeout);
  mbTimeout = setTimeout(() => loadManitobaParcels(map), 500);
});
```

---

### Colombie-Britannique — ParcelMap BC (proxy CORS requis)

La C.-B. a le meilleur jeu de données cadastral (ParcelMap BC, données ouvertes) mais le serveur WMS ne retourne pas de header CORS. Un proxy est nécessaire.

- **WMS URL** : `https://openmaps.gov.bc.ca/geo/pub/WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW/ows`
- **Layer** : `pub:WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW`
- **Projection** : EPSG:3857 supporté
- **Formats** : PNG, GeoJSON, KML, GeoTIFF
- **Licence** : Open Government Licence — British Columbia (gratuit)
- **CORS** : **Non** — proxy obligatoire

#### Proxy CORS avec Cloudflare Worker (gratuit, 100k req/jour)

Créer un Cloudflare Worker avec ce code :

```javascript
// cloudflare-worker-cors-proxy.js
export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Extraire l'URL cible du path (après le /)
    const targetUrl = url.pathname.slice(1) + url.search;
    if (!targetUrl.startsWith('https://openmaps.gov.bc.ca/')) {
      return new Response('Blocked: only BC OpenMaps allowed', { status: 403 });
    }

    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'ValéaMax-CadastreProxy/1.0' }
    });

    // Cloner la réponse et ajouter les headers CORS
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    newHeaders.set('Cache-Control', 'public, max-age=3600'); // Cache 1h

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders
    });
  }
};
```

Déployer sur Cloudflare Workers :
1. Créer un compte sur https://dash.cloudflare.com/
2. Workers & Pages → Create Worker
3. Coller le code ci-dessus
4. Déployer — l'URL sera du type `https://your-worker.your-subdomain.workers.dev/`

#### Utilisation dans Mapbox avec le proxy

```javascript
const CORS_PROXY = 'https://your-worker.your-subdomain.workers.dev/';

map.addSource('cadastre-bc', {
  type: 'raster',
  tiles: [
    CORS_PROXY +
    'https://openmaps.gov.bc.ca/geo/pub/' +
    'WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW/ows' +
    '?service=WMS&version=1.1.1&request=GetMap' +
    '&layers=pub:WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW' +
    '&bbox={bbox-epsg-3857}&width=512&height=512' +
    '&srs=EPSG:3857&styles=&format=image/png&transparent=true'
  ],
  tileSize: 512,
  attribution: '&copy; Province of British Columbia - ParcelMap BC'
});
map.addLayer({
  id: 'cadastre-bc',
  type: 'raster',
  source: 'cadastre-bc',
  paint: { 'raster-opacity': 0.7 },
  minzoom: 13
});
```

#### Alternative recommandée : Supabase Edge Function

Valea Max utilise Supabase. Une Edge Function (Deno) est la solution la plus simple car elle est déjà dans le stack.

**Créer la fonction :**

```bash
supabase functions new bc-cadastre-proxy
```

**Code de la Edge Function (`supabase/functions/bc-cadastre-proxy/index.ts`) :**

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (req: Request) => {
  // Gérer le preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    })
  }

  const url = new URL(req.url)
  const targetUrl =
    'https://openmaps.gov.bc.ca/geo/pub/' +
    'WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW/ows' +
    url.search  // Forward tous les query params (bbox, format, etc.)

  const response = await fetch(targetUrl, {
    headers: { 'User-Agent': 'ValéaMax-CadastreProxy/1.0' },
  })

  return new Response(response.body, {
    status: response.status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': response.headers.get('content-type') || 'image/png',
      'Cache-Control': 'public, max-age=3600',
    },
  })
})
```

**Déployer :**

```bash
supabase functions deploy bc-cadastre-proxy
```

**URL résultante :**
```
https://<votre-projet>.supabase.co/functions/v1/bc-cadastre-proxy
```

**Utilisation dans Mapbox :**

```javascript
const SUPABASE_PROXY = 'https://<votre-projet>.supabase.co/functions/v1/bc-cadastre-proxy';

map.addSource('cadastre-bc', {
  type: 'raster',
  tiles: [
    SUPABASE_PROXY +
    '?service=WMS&version=1.1.1&request=GetMap' +
    '&layers=pub:WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW' +
    '&bbox={bbox-epsg-3857}&width=512&height=512' +
    '&srs=EPSG:3857&styles=&format=image/png&transparent=true'
  ],
  tileSize: 512,
  attribution: '&copy; Province of British Columbia - ParcelMap BC'
});
```

**Note sur les coûts Supabase :** Les Edge Functions sont incluses dans le plan gratuit jusqu'à 500 000 invocations/mois, largement suffisant pour un proxy de tuiles cadastrales.

---

### Ontario — Cadastral Location (partiel)

Seuls les lots cadastraux (township/lot/concession) sont disponibles publiquement, PAS les parcelles individuelles d'évaluation (token requis).

- **Base URL** : `https://ws.lioservices.lrc.gov.on.ca/arcgis2/rest/services/LIO_OPEN_DATA/LIO_Open05/MapServer`
- **Layer** : 15 = Cadastral Location (polygones)
- **CORS** : Oui

```javascript
map.addSource('cadastre-on', {
  type: 'raster',
  tiles: [
    'https://ws.lioservices.lrc.gov.on.ca/arcgis2/rest/services/' +
    'LIO_OPEN_DATA/LIO_Open05/MapServer/export' +
    '?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857' +
    '&size=512,512&format=png32&transparent=true&layers=show:15&f=image'
  ],
  tileSize: 512,
  attribution: '&copy; Ontario GeoHub - Cadastral Location'
});
map.addLayer({
  id: 'cadastre-on',
  type: 'raster',
  source: 'cadastre-on',
  paint: { 'raster-opacity': 0.7 },
  minzoom: 13
});
```

---

### Provinces non disponibles

| Province | Raison | Alternative |
|---|---|---|
| **Alberta** | Données cadastrales licenciées via AltaLIS (payant). Token requis. | Contacter AltaLIS : https://www.altalis.com/ |
| **Saskatchewan** | Token requis sur le MapServer. Données via ISC (payant). | Contacter ISC : https://www.isc.ca/ |
| **Î.-P.-É.** | GeoLinc Plus est un service par abonnement. Pas de service WMS public confirmé. | Contacter : opendata@gov.pe.ca |
| **Terre-Neuve** | Seules les terres de la Couronne sont disponibles, pas les parcelles privées. | Crown Titles : `https://www.gov.nl.ca/landuseatlasmaps/rest/services/LandUseDetails/MapServer` (layer 3) |

---

## 2. Imagerie satellite

Mapbox offre une imagerie satellite globale haute résolution (jusqu'à 5 cm/pixel dans certaines zones urbaines). Utile pour visualiser le toit, le terrain, le stationnement et l'environnement immédiat d'une propriété.

### Basculer entre carte et satellite

```javascript
// Styles disponibles
const STYLES = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  satelliteStreets: 'mapbox://styles/mapbox/satellite-streets-v12'
};

// Basculer vers la vue satellite avec noms de rues
function switchToSatellite() {
  map.setStyle(STYLES.satelliteStreets);
}

// Revenir à la carte standard
function switchToStreets() {
  map.setStyle(STYLES.streets);
}
```

### Note importante

Lors d'un changement de style (`setStyle`), toutes les sources et layers personnalisés (cadastre, etc.) sont supprimés. Il faut les réajouter après le changement :

```javascript
map.on('style.load', () => {
  // Réajouter le cadastre et autres layers personnalisés ici
  addCadastreLayer();
  add3DBuildingsLayer();
});
```

---

## 3. Bâtiments 3D

Mapbox inclut un layer de bâtiments 3D extrudés dans ses styles standard. Utile pour visualiser le gabarit des bâtiments, la hauteur relative et l'intégration dans le voisinage.

### Activer les bâtiments 3D

```javascript
map.on('style.load', () => {
  // Trouver le premier layer de type symbole pour insérer les bâtiments en dessous
  const layers = map.getStyle().layers;
  const labelLayerId = layers.find(
    (layer) => layer.type === 'symbol' && layer.layout['text-field']
  )?.id;

  map.addLayer(
    {
      id: '3d-buildings',
      source: 'composite',
      'source-layer': 'building',
      filter: ['==', 'extrude', 'true'],
      type: 'fill-extrusion',
      minzoom: 14,
      paint: {
        'fill-extrusion-color': '#aaa',
        'fill-extrusion-height': [
          'interpolate', ['linear'], ['zoom'],
          14, 0,
          14.05, ['get', 'height']
        ],
        'fill-extrusion-base': [
          'interpolate', ['linear'], ['zoom'],
          14, 0,
          14.05, ['get', 'min_height']
        ],
        'fill-extrusion-opacity': 0.6
      }
    },
    labelLayerId
  );
});
```

### Activer le terrain 3D (relief)

```javascript
map.on('style.load', () => {
  map.addSource('mapbox-dem', {
    type: 'raster-dem',
    url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
    tileSize: 512,
    maxzoom: 14
  });
  map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
});
```

---

## 4. Geocoding — Recherche par adresse

Le Geocoding API de Mapbox permet de convertir une adresse en coordonnées et vice-versa. Essentiel pour localiser rapidement une propriété.

### Utiliser le Geocoder Search Control (UI intégré)

```html
<!-- Ajouter le CSS et JS du plugin geocoder -->
<script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.3/mapbox-gl-geocoder.min.js"></script>
<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.3/mapbox-gl-geocoder.css" type="text/css">
```

```javascript
// Ajouter la barre de recherche d'adresse
const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  countries: 'ca',           // Limiter au Canada
  language: 'fr',            // Résultats en français
  bbox: [-80, 44, -57, 63],  // Limiter au Québec (approx.)
  placeholder: 'Rechercher une adresse...',
  marker: true               // Afficher un marqueur au résultat
});

map.addControl(geocoder, 'top-right');

// Écouter le résultat de la recherche
geocoder.on('result', (e) => {
  const { center, place_name } = e.result;
  console.log('Adresse:', place_name);
  console.log('Coordonnées:', center); // [lng, lat]
});
```

### Geocoding programmatique (API directe)

```javascript
// Geocoder une adresse via l'API REST
async function geocodeAddress(address) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json` +
    `?access_token=${mapboxgl.accessToken}` +
    `&country=CA&language=fr&limit=1`;
  const resp = await fetch(url);
  const data = await resp.json();
  if (data.features && data.features.length > 0) {
    return {
      coordinates: data.features[0].center, // [lng, lat]
      placeName: data.features[0].place_name
    };
  }
  return null;
}

// Reverse geocoding (coordonnées → adresse)
async function reverseGeocode(lng, lat) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
    `?access_token=${mapboxgl.accessToken}` +
    `&language=fr&limit=1`;
  const resp = await fetch(url);
  const data = await resp.json();
  if (data.features && data.features.length > 0) {
    return data.features[0].place_name;
  }
  return null;
}
```

---

## 5. Street View — Mapillary

Google Street View n'est pas intégrable directement dans Mapbox. L'alternative recommandée est **Mapillary** (propriété de Meta) : 2+ milliards d'images street-level crowdsourcées, couverture dans 190+ pays, gratuit pour consultation.

### Option A : Plugin mglStreetViewControl

Le plugin [`mglStreetViewControl`](https://github.com/reyemtm/mglStreetViewControl) ajoute un bouton qui ouvre Mapillary ou Google Street View à l'emplacement cliqué.

```html
<script src="https://unpkg.com/mgl-streetview-control/dist/mglStreetViewControl.min.js"></script>
```

```javascript
map.addControl(new mglStreetViewControl(), 'top-right');
```

### Option B : Intégration Mapillary via iframe

```javascript
// Ouvrir Mapillary dans un panneau au clic sur la carte
map.on('click', (e) => {
  const { lng, lat } = e.lngLat;
  const mapillaryUrl = `https://www.mapillary.com/app/?lat=${lat}&lng=${lng}&z=17`;

  // Ouvrir dans un panneau latéral (iframe)
  document.getElementById('streetview-panel').innerHTML =
    `<iframe src="${mapillaryUrl}" width="100%" height="400" frameborder="0"></iframe>`;
});
```

### Option C : Mapillary JS SDK (viewer embarqué)

Pour une intégration plus poussée avec le viewer Mapillary directement dans l'application :

```html
<script src="https://unpkg.com/mapillary-js@4/dist/mapillary.min.js"></script>
<link rel="stylesheet" href="https://unpkg.com/mapillary-js@4/dist/mapillary.min.css">
```

```javascript
// Trouver l'image Mapillary la plus proche d'un point
async function findNearestMapillaryImage(lng, lat) {
  const url = `https://graph.mapillary.com/images` +
    `?access_token=YOUR_MAPILLARY_CLIENT_TOKEN` +
    `&fields=id,geometry` +
    `&is_pano=true` +
    `&bbox=${lng - 0.001},${lat - 0.001},${lng + 0.001},${lat + 0.001}` +
    `&limit=1`;
  const resp = await fetch(url);
  const data = await resp.json();
  return data.data?.[0] || null;
}

// Initialiser le viewer Mapillary
const viewer = new mapillary.Viewer({
  accessToken: 'YOUR_MAPILLARY_CLIENT_TOKEN',
  container: 'mapillary-viewer', // ID du div conteneur
});

// Afficher une image
async function showStreetView(lng, lat) {
  const image = await findNearestMapillaryImage(lng, lat);
  if (image) {
    viewer.moveTo(image.id);
  }
}
```

### Obtenir un token Mapillary

1. Créer un compte sur https://www.mapillary.com/
2. Aller dans les paramètres développeur
3. Créer une application pour obtenir un client token

---

## 6. Outils de mesure — Distances et superficies

Utiliser le plugin `@mapbox/mapbox-gl-draw` pour permettre à l'utilisateur de dessiner des polygones et lignes, puis calculer les distances et superficies avec `@turf/turf`.

### Installation

```html
<script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.4.3/mapbox-gl-draw.js"></script>
<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.4.3/mapbox-gl-draw.css" type="text/css">
<script src="https://unpkg.com/@turf/turf@7/turf.min.js"></script>
```

### Intégration

```javascript
// Ajouter les outils de dessin
const draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    polygon: true,   // Dessiner des polygones (superficies)
    line_string: true, // Dessiner des lignes (distances)
    trash: true       // Supprimer un dessin
  }
});
map.addControl(draw, 'top-left');

// Calculer superficie et distance quand l'utilisateur dessine
map.on('draw.create', updateMeasurements);
map.on('draw.update', updateMeasurements);
map.on('draw.delete', () => {
  document.getElementById('measurement-info').innerHTML = '';
});

function updateMeasurements() {
  const data = draw.getAll();
  if (data.features.length === 0) return;

  const feature = data.features[data.features.length - 1];

  if (feature.geometry.type === 'Polygon') {
    // Superficie en mètres carrés
    const areaM2 = turf.area(feature);
    const areaSqFt = areaM2 * 10.7639; // Conversion en pieds carrés

    document.getElementById('measurement-info').innerHTML =
      `<strong>Superficie:</strong> ${areaM2.toFixed(1)} m² (${areaSqFt.toFixed(0)} pi²)`;
  }

  if (feature.geometry.type === 'LineString') {
    // Distance en mètres
    const lengthKm = turf.length(feature, { units: 'kilometers' });
    const lengthM = lengthKm * 1000;
    const lengthFt = lengthM * 3.28084;

    document.getElementById('measurement-info').innerHTML =
      `<strong>Distance:</strong> ${lengthM.toFixed(1)} m (${lengthFt.toFixed(0)} pi)`;
  }
}
```

---

## 7. Isochrones — Zones d'accessibilité

L'API Isochrone de Mapbox génère des polygones représentant les zones accessibles en X minutes à partir d'un point, en auto, à pied ou à vélo. Utile pour analyser l'accessibilité d'une propriété aux services.

### Utilisation

```javascript
// Générer une isochrone (zone accessible en X minutes)
async function getIsochrone(lng, lat, profile = 'driving', minutes = 10) {
  // profile: 'driving', 'walking', 'cycling'
  const url = `https://api.mapbox.com/isochrone/v1/mapbox/${profile}/${lng},${lat}` +
    `?contours_minutes=${minutes}` +
    `&polygons=true` +
    `&access_token=${mapboxgl.accessToken}`;

  const resp = await fetch(url);
  const data = await resp.json();
  return data; // GeoJSON FeatureCollection
}

// Afficher l'isochrone sur la carte
async function showIsochrone(lng, lat, profile, minutes) {
  const data = await getIsochrone(lng, lat, profile, minutes);

  // Supprimer l'isochrone précédente si elle existe
  if (map.getSource('isochrone')) {
    map.getSource('isochrone').setData(data);
  } else {
    map.addSource('isochrone', { type: 'geojson', data: data });
    map.addLayer({
      id: 'isochrone-fill',
      type: 'fill',
      source: 'isochrone',
      paint: {
        'fill-color': '#3bb2d0',
        'fill-opacity': 0.25
      }
    });
    map.addLayer({
      id: 'isochrone-outline',
      type: 'line',
      source: 'isochrone',
      paint: {
        'line-color': '#3bb2d0',
        'line-width': 2
      }
    });
  }
}

// Exemple : zone accessible en 10 min en voiture depuis un point
showIsochrone(-73.6615, 45.4413, 'driving', 10);
```

### Isochrones multiples (5, 10, 15 min)

```javascript
async function showMultipleIsochrones(lng, lat, profile = 'driving') {
  const url = `https://api.mapbox.com/isochrone/v1/mapbox/${profile}/${lng},${lat}` +
    `?contours_minutes=5,10,15` +
    `&contours_colors=00ff00,ffff00,ff0000` +
    `&polygons=true` +
    `&access_token=${mapboxgl.accessToken}`;

  const resp = await fetch(url);
  const data = await resp.json();

  if (map.getSource('isochrones')) {
    map.getSource('isochrones').setData(data);
  } else {
    map.addSource('isochrones', { type: 'geojson', data: data });
    map.addLayer({
      id: 'isochrones-fill',
      type: 'fill',
      source: 'isochrones',
      paint: {
        'fill-color': ['get', 'fill'],
        'fill-opacity': 0.2
      }
    });
  }
}
```

---

## 8. Compare / Swipe — Comparer deux vues

Le plugin `mapbox-gl-compare` permet de comparer deux cartes côte à côte avec un curseur glissant. Utile pour comparer satellite vs carte, ou avant/après.

### Installation

```html
<script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-compare/v0.4.0/mapbox-gl-compare.js"></script>
<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-compare/v0.4.0/style.css" type="text/css">
```

### Intégration

```html
<div id="comparison-container">
  <div id="before" class="map"></div>
  <div id="after" class="map"></div>
</div>

<style>
  #comparison-container { position: relative; width: 100%; height: 500px; }
  .map { position: absolute; top: 0; bottom: 0; width: 100%; }
</style>
```

```javascript
// Carte de gauche (carte standard)
const beforeMap = new mapboxgl.Map({
  container: 'before',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-73.6615, 45.4413],
  zoom: 15
});

// Carte de droite (satellite)
const afterMap = new mapboxgl.Map({
  container: 'after',
  style: 'mapbox://styles/mapbox/satellite-streets-v12',
  center: [-73.6615, 45.4413],
  zoom: 15
});

// Activer le comparateur avec curseur glissant
const compare = new mapboxgl.Compare(beforeMap, afterMap, '#comparison-container', {
  mousemove: false, // true = le curseur suit la souris
  orientation: 'vertical' // ou 'horizontal'
});
```

---

## Résumé des dépendances

| Feature | Package / Plugin | CDN |
|---|---|---|
| Carte de base | `mapbox-gl` | `api.mapbox.com/mapbox-gl-js/v3.9.4/mapbox-gl.js` |
| Geocoding | `@mapbox/mapbox-gl-geocoder` | CDN v5.0.3 |
| Dessin/Mesure | `@mapbox/mapbox-gl-draw` + `@turf/turf` | CDN v1.4.3 + Turf v7 |
| Street View | `mapillary-js` | `unpkg.com/mapillary-js@4` |
| Compare/Swipe | `mapbox-gl-compare` | CDN v0.4.0 |
| Cadastre QC | Aucun (ArcGIS REST natif) | — |
| Satellite | Inclus dans Mapbox (style) | — |
| Bâtiments 3D | Inclus dans Mapbox (source composite) | — |
| Isochrones | Inclus dans Mapbox (API REST) | — |
| Terrain 3D | Inclus dans Mapbox (DEM) | — |

## Tokens requis

| Service | Variable | Comment l'obtenir |
|---|---|---|
| Mapbox | `MAPBOX_ACCESS_TOKEN` | https://account.mapbox.com/access-tokens/ |
| Mapillary | `MAPILLARY_CLIENT_TOKEN` | https://www.mapillary.com/dashboard/developers |

## Notes sur les coûts

- **Mapbox** : Gratuit jusqu'à 50 000 chargements de carte/mois, puis tarification à l'usage. Geocoding, Isochrones et Directions ont leurs propres quotas gratuits.
- **Mapillary** : Gratuit pour la consultation d'images. L'API a des limites de requêtes.
- **Cadastre QC** : Gratuit (service gouvernemental public).

---

## Internationalisation (i18n)

Valea Max utilise le framework **I18n** avec support anglais et français. Tous les textes visibles par l'utilisateur dans les composants cartographiques doivent utiliser des clés i18n, jamais du texte en dur.

### Clés de traduction à ajouter

```yaml
# config/locales/fr.yml (ou équivalent selon le framework)
fr:
  map:
    cadastre:
      toggle_label: "Afficher le cadastre"
      opacity_label: "Opacité"
      lot_label: "Lot"
      no_lot_found: "Aucun lot trouvé"
      loading: "Chargement..."
      error: "Service cadastral indisponible"
    satellite:
      toggle_label: "Vue satellite"
      streets_label: "Vue carte"
    buildings_3d:
      toggle_label: "Bâtiments 3D"
    geocoder:
      placeholder: "Rechercher une adresse..."
    street_view:
      open_label: "Street View"
      no_image: "Aucune image disponible"
      panel_title: "Vue de la rue"
    measure:
      area_label: "Superficie"
      distance_label: "Distance"
      draw_polygon: "Dessiner un polygone"
      draw_line: "Tracer une ligne"
      delete: "Supprimer"
    isochrone:
      title: "Zone d'accessibilité"
      driving: "En voiture"
      walking: "À pied"
      cycling: "À vélo"
      minutes: "minutes"
    compare:
      title: "Comparer"
      before: "Carte"
      after: "Satellite"
```

```yaml
# config/locales/en.yml
en:
  map:
    cadastre:
      toggle_label: "Show cadastre"
      opacity_label: "Opacity"
      lot_label: "Lot"
      no_lot_found: "No lot found"
      loading: "Loading..."
      error: "Cadastre service unavailable"
    satellite:
      toggle_label: "Satellite view"
      streets_label: "Map view"
    buildings_3d:
      toggle_label: "3D Buildings"
    geocoder:
      placeholder: "Search for an address..."
    street_view:
      open_label: "Street View"
      no_image: "No image available"
      panel_title: "Street view"
    measure:
      area_label: "Area"
      distance_label: "Distance"
      draw_polygon: "Draw polygon"
      draw_line: "Draw line"
      delete: "Delete"
    isochrone:
      title: "Accessibility zone"
      driving: "Driving"
      walking: "Walking"
      cycling: "Cycling"
      minutes: "minutes"
    compare:
      title: "Compare"
      before: "Map"
      after: "Satellite"
```

### Utilisation dans le code

Tous les exemples de code dans ce document utilisent du texte en dur pour la lisibilité. Lors de l'implémentation, remplacer systématiquement par les clés i18n. Exemples :

```javascript
// AVANT (exemples dans ce document)
placeholder: 'Rechercher une adresse...'
.setHTML('<strong>Lot:</strong> ' + lotNo)
document.getElementById('measurement-info').innerHTML =
  `<strong>Superficie:</strong> ${areaM2.toFixed(1)} m²`;

// APRÈS (implémentation réelle avec i18n)
placeholder: I18n.t('map.geocoder.placeholder')
.setHTML(`<strong>${I18n.t('map.cadastre.lot_label')}:</strong> ${lotNo}`)
document.getElementById('measurement-info').innerHTML =
  `<strong>${I18n.t('map.measure.area_label')}:</strong> ${areaM2.toFixed(1)} m²`;
```

### Geocoder — langue dynamique

Le geocoder Mapbox supporte le paramètre `language` qui doit suivre la locale active :

```javascript
const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  countries: 'ca',
  language: I18n.locale,  // 'fr' ou 'en' selon la locale active
  placeholder: I18n.t('map.geocoder.placeholder')
});

// Mettre à jour le placeholder si l'utilisateur change de langue
function onLocaleChange(newLocale) {
  const input = document.querySelector('.mapboxgl-ctrl-geocoder input');
  if (input) {
    input.placeholder = I18n.t('map.geocoder.placeholder');
  }
  // Note : pour changer la langue des résultats du geocoder,
  // il faut recréer l'instance du geocoder
}
```

### Règle pour l'agent

**IMPORTANT** : Lors de l'implémentation de toute feature cartographique, ne JAMAIS écrire de texte en dur visible par l'utilisateur. Toujours utiliser `I18n.t('map.xxx.xxx')` et s'assurer que les clés existent dans les deux fichiers de locale (fr et en).
