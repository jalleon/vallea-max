'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { Box, Typography, Chip, Menu, MenuItem, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from '@mui/material'
import { Map as MapIconMui, Satellite, Terrain, Layers, Agriculture, Waves, Park, Landscape, Flight, Straighten, SquareFoot, ViewInAr, Close } from '@mui/icons-material'
import { useTranslations, useLocale } from 'next-intl'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
// @ts-ignore
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
// @ts-ignore
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import * as turf from '@turf/turf'
import { Property } from '../types/property.types'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

const MAP_STYLES: Record<string, string | mapboxgl.Style> = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
  light: 'mapbox://styles/mapbox/light-v11',
  'ortho-qc': {
    version: 8,
    sources: {
      'qc-ortho': {
        type: 'raster',
        tiles: ['https://geoegl.msp.gouv.qc.ca/carto/tms/1.0.0/orthos@EPSG_3857/{z}/{x}/{y}.png'],
        tileSize: 256,
        scheme: 'tms',
        attribution: 'Gouvernement du Québec'
      }
    },
    layers: [{ id: 'qc-ortho-layer', type: 'raster', source: 'qc-ortho' }],
    glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf'
  } as mapboxgl.Style,
  'ortho-on': {
    version: 8,
    sources: {
      'on-ortho': {
        type: 'raster',
        tiles: ['https://ws.lioservices.lrc.gov.on.ca/arcgis1071a/rest/services/LIO_Imagery/Ontario_Imagery_Web_Map_Service_Source/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=256,256&format=png&f=image'],
        tileSize: 256,
        attribution: 'Ontario GeoHub'
      }
    },
    layers: [{ id: 'on-ortho-layer', type: 'raster', source: 'on-ortho' }],
    glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf'
  } as mapboxgl.Style,
  'ortho-bc': {
    version: 8,
    sources: {
      'bc-ortho-10m': {
        type: 'raster',
        tiles: ['https://openmaps.gov.bc.ca/imagex/ecw_wms.dll?service=WMS&version=1.1.1&request=GetMap&layers=bc_bc_bc_xc10m_bcalb_20070115&styles=&format=image/jpeg&srs=EPSG:3857&width=256&height=256&bbox={bbox-epsg-3857}'],
        tileSize: 256,
        attribution: 'GeoBC'
      },
      'bc-ortho-2m': {
        type: 'raster',
        tiles: ['https://openmaps.gov.bc.ca/imagex/ecw_wms.dll?service=WMS&version=1.1.1&request=GetMap&layers=bc_bc_bc_xc2m_bcalb_20070115&styles=&format=image/jpeg&srs=EPSG:3857&width=256&height=256&bbox={bbox-epsg-3857}'],
        tileSize: 256,
        attribution: 'GeoBC'
      }
    },
    layers: [
      { id: 'bc-ortho-10m-layer', type: 'raster', source: 'bc-ortho-10m', maxzoom: 13 },
      { id: 'bc-ortho-2m-layer', type: 'raster', source: 'bc-ortho-2m', minzoom: 13 },
    ],
    glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf'
  } as mapboxgl.Style,
}

// Province ortho style mapping
const PROVINCE_ORTHO: Record<string, string> = {
  QC: 'ortho-qc',
  ON: 'ortho-on',
  BC: 'ortho-bc',
}

// Government GIS overlay layers - province-aware
type LayerCategory = 'agricultural' | 'floodZones' | 'wetlands' | 'landCover'
interface GISLayerConfig { tiles: string[], color: string, icon: typeof Agriculture, category: LayerCategory }

const ALL_GIS_LAYERS: Record<string, GISLayerConfig> = {
  // Quebec
  'qc-agricultural': { category: 'agricultural', color: '#4CAF50', icon: Agriculture, tiles: [
    'https://carto.cptaq.gouv.qc.ca/cgi-bin/v2/cptaq?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=zone_agricole&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256&FORMAT=image/png&TRANSPARENT=true'
  ]},
  'qc-floodZones': { category: 'floodZones', color: '#2196F3', icon: Waves, tiles: [
    'https://www.servicesgeo.enviroweb.gouv.qc.ca/donnees/rest/services/Public/Themes_publics/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=256,256&format=png32&transparent=true&f=image&layers=show:22'
  ]},
  'qc-wetlands': { category: 'wetlands', color: '#00897B', icon: Park, tiles: [
    'https://geo.environnement.gouv.qc.ca/donnees/rest/services/Biodiversite/MH_potentiels/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=256,256&format=png32&transparent=true&f=image&layers=show:0'
  ]},
  // British Columbia
  'bc-agricultural': { category: 'agricultural', color: '#4CAF50', icon: Agriculture, tiles: [
    'https://openmaps.gov.bc.ca/geo/pub/WHSE_LEGAL_ADMIN_BOUNDARIES.OATS_ALR_POLYS/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=pub:WHSE_LEGAL_ADMIN_BOUNDARIES.OATS_ALR_POLYS&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256&FORMAT=image/png&TRANSPARENT=true'
  ]},
  'bc-floodZones': { category: 'floodZones', color: '#2196F3', icon: Waves, tiles: [
    'https://openmaps.gov.bc.ca/geo/pub/WHSE_BASEMAPPING.CWB_FLOODPLAINS_BC_AREA_SVW/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=pub:WHSE_BASEMAPPING.CWB_FLOODPLAINS_BC_AREA_SVW&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256&FORMAT=image/png&TRANSPARENT=true'
  ]},
  'bc-wetlands': { category: 'wetlands', color: '#00897B', icon: Park, tiles: [
    'https://openmaps.gov.bc.ca/geo/pub/WHSE_BASEMAPPING.FWA_WETLANDS_POLY/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=pub:WHSE_BASEMAPPING.FWA_WETLANDS_POLY&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256&FORMAT=image/png&TRANSPARENT=true'
  ]},
  // Alberta
  'ab-agricultural': { category: 'agricultural', color: '#4CAF50', icon: Agriculture, tiles: [
    'https://geospatial.alberta.ca/titan/rest/services/agriculture/Agricultural_Land_Resource_Atlas/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=256,256&format=png32&transparent=true&f=image&layers=show:0'
  ]},
  'ab-wetlands': { category: 'wetlands', color: '#00897B', icon: Park, tiles: [
    'https://geospatial.alberta.ca/titan/rest/services/environment/alberta_merged_wetland_inventory/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=256,256&format=png32&transparent=true&f=image&layers=show:3'
  ]},
  // Ontario
  'on-agricultural': { category: 'agricultural', color: '#4CAF50', icon: Agriculture, tiles: [
    'https://ws.lioservices.lrc.gov.on.ca/arcgis2/rest/services/LIO_OPEN_DATA/LIO_Open06/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=256,256&format=png32&transparent=true&f=image&layers=show:15'
  ]},
  'on-wetlands': { category: 'wetlands', color: '#00897B', icon: Park, tiles: [
    'https://ws.lioservices.lrc.gov.on.ca/arcgis2/rest/services/LIO_OPEN_DATA/LIO_Open01/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=256,256&format=png32&transparent=true&f=image&layers=show:15'
  ]},
  // New Brunswick
  'nb-floodZones': { category: 'floodZones', color: '#2196F3', icon: Waves, tiles: [
    'https://geonb.snb.ca/arcgis/rest/services/GeoNB_ENV_Flood/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=256,256&format=png32&transparent=true&f=image&layers=show:0'
  ]},
  'nb-wetlands': { category: 'wetlands', color: '#00897B', icon: Park, tiles: [
    'https://geonb.snb.ca/arcgis/rest/services/GeoNB_ELG_WAWA/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=256,256&format=png32&transparent=true&f=image&layers=show:0'
  ]},
  // Nova Scotia
  'ns-floodZones': { category: 'floodZones', color: '#2196F3', icon: Waves, tiles: [
    'https://fletcher.novascotia.ca/arcgis/rest/services/mrlu/flood_risk_areas/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=256,256&format=png32&transparent=true&f=image&layers=show:0'
  ]},
  // Saskatchewan
  'sk-floodZones': { category: 'floodZones', color: '#2196F3', icon: Waves, tiles: [
    'https://gis.wsask.ca/arcgiswa/rest/services/Temp/Water/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=256,256&format=png32&transparent=true&f=image&layers=show:0'
  ]},
  // Federal (available everywhere)
  'fed-landCover': { category: 'landCover', color: '#8D6E63', icon: Landscape, tiles: [
    'https://datacube.services.geo.ca/ows/landcover?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=landcover-2020&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256&FORMAT=image/png&TRANSPARENT=true&STYLES='
  ]},
  'fed-wetlands': { category: 'wetlands', color: '#009688', icon: Park, tiles: [
    'https://maps-cartes.ec.gc.ca/arcgis/services/CWS_SCF/INTHC/MapServer/WMSServer?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=0&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256&FORMAT=image/png&TRANSPARENT=true'
  ]},
}

// Province-specific layer IDs
const PROVINCE_LAYERS: Record<string, string[]> = {
  QC: ['qc-agricultural', 'qc-floodZones', 'qc-wetlands'],
  BC: ['bc-agricultural', 'bc-floodZones', 'bc-wetlands'],
  AB: ['ab-agricultural', 'ab-wetlands'],
  ON: ['on-agricultural', 'on-wetlands'],
  NB: ['nb-floodZones', 'nb-wetlands'],
  NS: ['ns-floodZones'],
  SK: ['sk-floodZones'],
}

// Federal layers fill in categories not covered by province
const FEDERAL_LAYERS = ['fed-landCover', 'fed-wetlands']

// Category display order for GIS layer chips
const CATEGORY_ORDER: LayerCategory[] = ['agricultural', 'floodZones', 'wetlands', 'landCover']

// Cadastre endpoints per province (raster tile overlays)
const CADASTRE_LAYERS: Record<string, { tiles: string[], tileSize: number, minzoom: number, attribution: string }> = {
  QC: {
    tiles: ['https://geo.environnement.gouv.qc.ca/donnees/rest/services/Reference/Cadastre_allege/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=512,512&format=png32&transparent=true&layers=show:0&f=image'],
    tileSize: 512, minzoom: 13, attribution: 'Gouvernement du Québec - Cadastre'
  },
  NS: {
    tiles: ['https://nsgiwa2.novascotia.ca/arcgis/rest/services/PLAN/PLAN_NSPRD_WM84/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=512,512&format=png&transparent=true&f=image'],
    tileSize: 512, minzoom: 14, attribution: 'Province of Nova Scotia - NSPRD'
  },
  NB: {
    tiles: ['https://geonb.snb.ca/arcgis/rest/services/GeoNB_SNB_Parcels/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=512,512&format=png&transparent=true&f=image'],
    tileSize: 512, minzoom: 14, attribution: 'Service New Brunswick - GeoNB'
  },
  ON: {
    tiles: ['https://ws.lioservices.lrc.gov.on.ca/arcgis2/rest/services/LIO_OPEN_DATA/LIO_Open05/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=512,512&format=png32&transparent=true&layers=show:15&f=image'],
    tileSize: 512, minzoom: 13, attribution: 'Ontario GeoHub - Cadastral Location'
  },
}

// Rough bounding boxes for provinces with GIS layers [west, south, east, north]
const PROVINCE_BOUNDS: Record<string, [number, number, number, number]> = {
  QC: [-79.8, 44.9, -57.1, 62.6],
  ON: [-95.2, 41.7, -74.3, 56.9],
  BC: [-139.1, 48.3, -114.0, 60.0],
  AB: [-120.0, 49.0, -110.0, 60.0],
  SK: [-110.0, 49.0, -101.4, 60.0],
  NB: [-69.1, 44.6, -63.8, 48.1],
  NS: [-66.4, 43.4, -59.7, 47.1],
}

// Check if two bounding boxes overlap
function boundsOverlap(a: [number, number, number, number], b: [number, number, number, number]) {
  return a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1]
}

// Convert EPSG:3857 [x,y] to WGS84 [lng,lat]
function epsg3857ToLngLat(x: number, y: number): [number, number] {
  const lng = (x * 180) / 20037508.34
  const lat = (Math.atan(Math.exp((y * Math.PI) / 20037508.34)) * 360) / Math.PI - 90
  return [lng, lat]
}

// Check if map style is structurally ready (doesn't wait for tile loading)
// Unlike isStyleLoaded(), this returns true even while slow raster tiles are still fetching
function isStyleReady(m: mapboxgl.Map | null): m is mapboxgl.Map {
  if (!m) return false
  try { return !!m.getStyle()?.layers } catch { return false }
}

// Marker colors by property type
const TYPE_COLORS: Record<string, string> = {
  condo_residentiel: '#9C27B0',
  plex: '#FF9800',
  multifamilial: '#FF9800',
  residentiel_commercial: '#E91E63',
  commercial: '#F44336',
  terrain: '#4CAF50',
  industriel: '#795548',
  bureau: '#607D8B',
}

function getTypeColor(type?: string): string {
  if (!type) return '#667eea'
  for (const [key, color] of Object.entries(TYPE_COLORS)) {
    if (type.includes(key)) return color
  }
  return '#667eea'
}

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

export default function PropertyMapInner({ properties, onViewProperty, onEditProperty, onAddToComps, onDeleteProperty, selectable, selectedPropertyIds = [], onSelectionChange, highlightedPropertyIds }: PropertyMapInnerProps) {
  const t = useTranslations('library')
  const locale = useLocale()
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const popupRef = useRef<mapboxgl.Popup | null>(null)
  const drawRef = useRef<any>(null)
  const cadastreProvinceRef = useRef<string | null>(null)
  const isochroneDataRef = useRef<any>(null)
  const cadastreHighlightRef = useRef<GeoJSON.FeatureCollection | null>(null)
  const ctrlHeldRef = useRef(false)
  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLES>('streets')
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set())
  const [cadastreProvince, setCadastreProvince] = useState<string | null>(null)
  const [cadastreMenuAnchor, setCadastreMenuAnchor] = useState<HTMLElement | null>(null)
  const [buildings3D, setBuildings3D] = useState(false)
  const [terrain3D, setTerrain3D] = useState(false)
  const [measureMode, setMeasureMode] = useState<'line' | 'polygon' | null>(null)
  const [measureResult, setMeasureResult] = useState<{ type: 'area' | 'distance', value: number } | null>(null)
  const [isochroneCenter, setIsochroneCenter] = useState<[number, number] | null>(null)
  const [isochroneProfile, setIsochroneProfile] = useState<'driving' | 'walking' | 'cycling'>('driving')

  // Properties with valid coordinates - stable reference unless IDs change
  const geoProperties = useMemo(() =>
    properties.filter(p => p.latitude && p.longitude),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [properties.map(p => p.id).join(',')]
  )

  // Provinces visible in the current map viewport (updated on moveend)
  const [viewportProvinces, setViewportProvinces] = useState<Set<string>>(new Set(['QC']))

  // Available layers = union of all province-specific layers + federal fallbacks for uncovered categories
  const availableLayers = useMemo(() => {
    const allProvinceLayers: string[] = []
    const coveredCategories = new Set<LayerCategory>()
    for (const prov of viewportProvinces) {
      for (const id of (PROVINCE_LAYERS[prov] || [])) {
        allProvinceLayers.push(id)
        coveredCategories.add(ALL_GIS_LAYERS[id].category)
      }
    }
    const federalFallbacks = FEDERAL_LAYERS.filter(id => !coveredCategories.has(ALL_GIS_LAYERS[id].category))
    return [...allProvinceLayers, ...federalFallbacks]
  }, [viewportProvinces])

  // All ortho styles always available (base map, not filtered by province)
  const availableOrthos = Object.values(PROVINCE_ORTHO)

  // Group available layers by category for dropdown menus
  const layersByCategory = useMemo(() => {
    const groups: Partial<Record<LayerCategory, string[]>> = {}
    for (const id of availableLayers) {
      const cat = ALL_GIS_LAYERS[id].category
      ;(groups[cat] ||= []).push(id)
    }
    return groups
  }, [availableLayers])

  // Available cadastre provinces from detected properties
  const availableCadastres = useMemo(() =>
    [...viewportProvinces].filter(p => CADASTRE_LAYERS[p]),
    [viewportProvinces]
  )

  const [layerMenuAnchor, setLayerMenuAnchor] = useState<{ el: HTMLElement, category: LayerCategory } | null>(null)
  const [styleMenuAnchor, setStyleMenuAnchor] = useState<HTMLElement | null>(null)
  const [showOverlays, setShowOverlays] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Property | null>(null)
  const [deleting, setDeleting] = useState(false)

  const buildGeoJSON = useCallback((): GeoJSON.FeatureCollection => ({
    type: 'FeatureCollection',
    features: geoProperties.map(p => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [p.longitude!, p.latitude!]
      },
      properties: {
        id: p.id,
        address: p.adresse,
        city: p.ville || '',
        postalCode: p.code_postal || '',
        type: p.type_propriete || '',
        price: p.prix_vente || 0,
        status: p.status || '',
        color: getTypeColor(p.type_propriete),
        selected: selectedPropertyIds.includes(p.id) ? 'true' : 'false',
        highlighted: !highlightedPropertyIds ? 'none' : highlightedPropertyIds.includes(p.id) ? 'yes' : 'no'
      }
    }))
  }), [geoProperties, selectedPropertyIds, highlightedPropertyIds])

  const addLayers = useCallback((m: mapboxgl.Map, skipFitBounds = false) => {
    m.addSource('properties', {
      type: 'geojson',
      data: buildGeoJSON(),
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    })

    m.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'properties',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#667eea',
        'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 50, 32],
        'circle-opacity': 0.85
      }
    })

    m.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'properties',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 13
      },
      paint: { 'text-color': '#ffffff' }
    })

    m.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'properties',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': ['case',
          ['==', ['get', 'selected'], 'true'], '#2196F3',
          ['==', ['get', 'highlighted'], 'no'], '#BDBDBD',
          ['get', 'color']
        ],
        'circle-radius': ['case',
          ['==', ['get', 'selected'], 'true'], 11,
          ['==', ['get', 'highlighted'], 'yes'], 10,
          ['==', ['get', 'highlighted'], 'no'], 5,
          8
        ],
        'circle-stroke-width': ['case',
          ['==', ['get', 'selected'], 'true'], 3,
          ['==', ['get', 'highlighted'], 'yes'], 3,
          ['==', ['get', 'highlighted'], 'no'], 1,
          2
        ],
        'circle-stroke-color': ['case',
          ['==', ['get', 'selected'], 'true'], '#1565C0',
          ['==', ['get', 'highlighted'], 'yes'], '#FFB300',
          '#ffffff'
        ],
        'circle-opacity': ['case',
          ['==', ['get', 'highlighted'], 'no'], 0.35,
          1
        ]
      }
    })

    // Cadastre highlight overlay (empty until a lot is clicked)
    m.addSource('cadastre-highlight', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
    m.addLayer({ id: 'cadastre-highlight-fill', type: 'fill', source: 'cadastre-highlight', paint: { 'fill-color': '#F44336', 'fill-opacity': 0.25 } }, 'clusters')
    m.addLayer({ id: 'cadastre-highlight-outline', type: 'line', source: 'cadastre-highlight', paint: { 'line-color': '#D32F2F', 'line-width': 3 } }, 'clusters')

    // Click cluster → zoom in
    m.on('click', 'clusters', (e) => {
      const features = m.queryRenderedFeatures(e.point, { layers: ['clusters'] })
      if (!features.length) return
      const clusterId = features[0].properties!.cluster_id
      ;(m.getSource('properties') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || zoom == null) return
        m.easeTo({ center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number], zoom })
      })
    })

    // Click marker → toggle selection + show popup
    m.on('click', 'unclustered-point', (e) => {
      if (!e.features?.length) return
      const props = e.features[0].properties!

      // Toggle selection if selectable
      if (selectable && onSelectionChange) {
        const id = props.id as string
        const isSelected = selectedPropertyIds.includes(id)
        onSelectionChange(isSelected
          ? selectedPropertyIds.filter(pid => pid !== id)
          : [...selectedPropertyIds, id]
        )
      }

      // Show popup
      const coords = (e.features[0].geometry as GeoJSON.Point).coordinates.slice() as [number, number]
      const price = props.price ? `$${Number(props.price).toLocaleString('fr-CA')}` : ''

      if (popupRef.current) popupRef.current.remove()
      popupRef.current = new mapboxgl.Popup({ offset: 12, maxWidth: '280px' })
        .setLngLat(coords)
        .setHTML(`
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 4px 0;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 2px;">${props.address}</div>
            <div style="color: #666; font-size: 12px;">${[props.city, props.postalCode].filter(Boolean).join(', ')}</div>
            ${price ? `<div style="font-weight: 600; font-size: 13px; margin-top: 4px; color: #667eea;">${price}</div>` : ''}
            <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
              <button onclick="window.__mapViewProperty('${props.id}')" style="padding: 4px 12px; font-size: 12px; border: 1px solid #ddd; border-radius: 6px; background: white; cursor: pointer;">View</button>
              <button onclick="window.__mapEditProperty('${props.id}')" style="padding: 4px 12px; font-size: 12px; border: none; border-radius: 6px; background: #667eea; color: white; cursor: pointer;">Edit</button>
              <button onclick="window.__mapAddToComps('${props.id}')" style="padding: 4px 12px; font-size: 12px; border: none; border-radius: 6px; background: #4CAF50; color: white; cursor: pointer;">+ Comps</button>
              <button onclick="window.__mapDeleteProperty('${props.id}')" style="padding: 4px 12px; font-size: 12px; border: none; border-radius: 6px; background: #F44336; color: white; cursor: pointer;">Delete</button>
              <button onclick="window.__mapShowIsochrone('${props.id}')" style="padding: 4px 12px; font-size: 12px; border: 1px solid #3bb2d0; border-radius: 6px; background: white; color: #3bb2d0; cursor: pointer;">Isochrone</button>
              <button onclick="window.open('https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${(e.features![0].geometry as GeoJSON.Point).coordinates[1]},${(e.features![0].geometry as GeoJSON.Point).coordinates[0]}','_blank')" style="padding: 4px 12px; font-size: 12px; border: 1px solid #666; border-radius: 6px; background: white; color: #666; cursor: pointer;">Street View</button>
            </div>
          </div>
        `)
        .addTo(m)
    })

    m.on('mouseenter', 'clusters', () => { m.getCanvas().style.cursor = 'pointer' })
    m.on('mouseleave', 'clusters', () => { m.getCanvas().style.cursor = '' })
    m.on('mouseenter', 'unclustered-point', () => { m.getCanvas().style.cursor = 'pointer' })
    m.on('mouseleave', 'unclustered-point', () => { m.getCanvas().style.cursor = '' })

    if (!skipFitBounds && geoProperties.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      geoProperties.forEach(p => bounds.extend([p.longitude!, p.latitude!]))
      m.fitBounds(bounds, { padding: 60, maxZoom: 15 })
    }
  }, [buildGeoJSON, geoProperties, selectable, selectedPropertyIds, onSelectionChange])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLES.streets,
      center: [-73.5673, 45.5017],
      zoom: 10
    })

    // Geocoder search control (top-right, above zoom buttons)
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl as any,
      countries: 'ca',
      language: locale,
      marker: true,
      collapsed: true
    })
    map.current.addControl(geocoder, 'top-right')
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Draw control for measurement (no visible controls - we use our own buttons)
    const draw = new MapboxDraw({ displayControlsDefault: false, controls: {} })
    drawRef.current = draw
    map.current.addControl(draw as any)

    // Draw measurement events
    const updateMeasurement = () => {
      if (!drawRef.current) return
      const data = drawRef.current.getAll()
      if (!data.features.length) { setMeasureResult(null); return }
      const feature = data.features[data.features.length - 1]
      if (feature.geometry.type === 'Polygon') {
        setMeasureResult({ type: 'area', value: turf.area(feature) })
      } else if (feature.geometry.type === 'LineString') {
        setMeasureResult({ type: 'distance', value: turf.length(feature, { units: 'kilometers' }) * 1000 })
      }
    }
    map.current.on('draw.create', updateMeasurement)
    map.current.on('draw.update', updateMeasurement)
    map.current.on('draw.delete', () => setMeasureResult(null))

    // Cadastre click-to-identify: highlight lot polygon + show lot number popup
    // Ctrl/Cmd+click accumulates lots, normal click replaces selection
    map.current.on('click', async (e: mapboxgl.MapMouseEvent) => {
      const prov = cadastreProvinceRef.current
      if (!prov) return
      const m = map.current
      const config = CADASTRE_LAYERS[prov]
      if (!m || !config || m.getZoom() < config.minzoom) return
      const hits = m.queryRenderedFeatures(e.point, { layers: ['clusters', 'unclustered-point'].filter(l => m.getLayer(l)) })
      if (hits.length > 0) return
      const multiSelect = ctrlHeldRef.current
      // Convert click to EPSG:3857
      const { lng, lat } = e.lngLat
      const x = lng * 20037508.34 / 180
      const sinLat = Math.sin(lat * Math.PI / 180)
      const y = (20037508.34 / Math.PI) * Math.log((1 + sinLat) / (1 - sinLat)) / 2
      // Derive identify URL from tile export URL
      const baseUrl = config.tiles[0].split('/export?')[0]
      const layerParam = config.tiles[0].match(/layers=show:(\d+)/)?.[1]
      try {
        const resp = await fetch(`${baseUrl}/identify?geometry=${x},${y}&geometryType=esriGeometryPoint&sr=3857&layers=all${layerParam ? `:${layerParam}` : ''}&tolerance=2&mapExtent=${x - 100},${y - 100},${x + 100},${y + 100}&imageDisplay=256,256,96&returnGeometry=true&f=json`)
        const data = await resp.json()
        if (data.results?.length > 0) {
          const result = data.results[0]
          // Show popup with lot/parcel info (only if a lot number is found)
          const attrs = result.attributes || {}
          const lotNum = attrs.NO_LOT || attrs.PID || attrs.PIN || attrs.PARCELID || ''
          if (lotNum) {
            new mapboxgl.Popup({ offset: 0 }).setLngLat(e.lngLat)
              .setHTML(`<div style="font-family:-apple-system,sans-serif;padding:4px 0;"><strong>${t('map.cadastreLot')}:</strong> ${lotNum}</div>`)
              .addTo(m)
          }
          // Highlight the lot polygon
          if (result.geometry?.rings) {
            const coordinates = result.geometry.rings.map((ring: number[][]) =>
              ring.map(([rx, ry]: number[]) => epsg3857ToLngLat(rx, ry))
            )
            const newFeature: GeoJSON.Feature = { type: 'Feature', geometry: { type: 'Polygon', coordinates }, properties: { lot: lotNum } }
            const prev = multiSelect && cadastreHighlightRef.current ? cadastreHighlightRef.current.features : []
            const fc: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [...prev, newFeature] }
            cadastreHighlightRef.current = fc
            const src = m.getSource('cadastre-highlight') as mapboxgl.GeoJSONSource | undefined
            if (src) src.setData(fc)
          }
        } else if (!multiSelect) {
          // Clear highlight if clicked on empty area (only without Ctrl)
          cadastreHighlightRef.current = null
          const src = m.getSource('cadastre-highlight') as mapboxgl.GeoJSONSource | undefined
          if (src) src.setData({ type: 'FeatureCollection', features: [] })
        }
      } catch (err) { console.warn('Cadastre identify failed:', err) }
    })

    // Detect provinces visible in the current viewport
    const updateViewportProvinces = () => {
      if (!map.current) return
      const b = map.current.getBounds()
      if (!b) return
      const vp: [number, number, number, number] = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]
      const visible = new Set<string>()
      for (const [prov, bbox] of Object.entries(PROVINCE_BOUNDS)) {
        if (boundsOverlap(vp, bbox)) visible.add(prov)
      }
      if (visible.size === 0) visible.add('QC')
      setViewportProvinces(prev => {
        const same = prev.size === visible.size && [...prev].every(p => visible.has(p))
        return same ? prev : visible
      })
    }
    map.current.on('moveend', updateViewportProvinces)

    map.current.on('load', () => { addLayers(map.current!); updateViewportProvinces() })

    return () => {
      if (popupRef.current) popupRef.current.remove()
      drawRef.current = null
      map.current?.remove()
      map.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Resize map when container changes (e.g. sidebar collapse)
  useEffect(() => {
    if (!mapContainer.current || !map.current) return
    const observer = new ResizeObserver(() => map.current?.resize())
    observer.observe(mapContainer.current)
    return () => observer.disconnect()
  }, [])

  // Track Ctrl/Cmd key state for cadastre multi-select
  // (Mapbox's DragRotateHandler can swallow Ctrl+click events, so we track independently)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Control' || e.key === 'Meta') ctrlHeldRef.current = true }
    const onKeyUp = (e: KeyboardEvent) => { if (e.key === 'Control' || e.key === 'Meta') ctrlHeldRef.current = false }
    const onBlur = () => { ctrlHeldRef.current = false }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => { document.removeEventListener('keydown', onKeyDown); document.removeEventListener('keyup', onKeyUp); window.removeEventListener('blur', onBlur) }
  }, [])

  // Add a GIS raster overlay to the map
  const addGISLayer = useCallback((m: mapboxgl.Map, layerId: string) => {
    const config = ALL_GIS_LAYERS[layerId]
    if (!config || m.getSource(`gis-${layerId}`)) return
    try {
      m.addSource(`gis-${layerId}`, { type: 'raster', tiles: config.tiles, tileSize: 256 })
      const beforeId = m.getLayer('clusters') ? 'clusters' : undefined
      m.addLayer({ id: `gis-${layerId}`, type: 'raster', source: `gis-${layerId}`, paint: { 'raster-opacity': 0.6 } }, beforeId)
    } catch (err) { console.warn(`Failed to add GIS layer ${layerId}:`, err) }
  }, [])

  const removeGISLayer = useCallback((m: mapboxgl.Map, layerId: string) => {
    try {
      if (m.getLayer(`gis-${layerId}`)) m.removeLayer(`gis-${layerId}`)
      if (m.getSource(`gis-${layerId}`)) m.removeSource(`gis-${layerId}`)
    } catch (err) { console.warn(`Failed to remove GIS layer ${layerId}:`, err) }
  }, [])

  const toggleGISLayer = useCallback((layerId: string) => {
    const m = map.current
    if (!isStyleReady(m)) return
    // Check actual Mapbox state (not React state) to decide add/remove
    const isOnMap = !!m.getLayer(`gis-${layerId}`)
    if (isOnMap) {
      removeGISLayer(m, layerId)
    } else {
      addGISLayer(m, layerId)
    }
    setActiveLayers(prev => {
      const next = new Set(prev)
      if (isOnMap) next.delete(layerId)
      else next.add(layerId)
      return next
    })
  }, [addGISLayer, removeGISLayer])

  const handleLayerChipClick = useCallback((e: React.MouseEvent<HTMLElement>, category: LayerCategory, layerIds: string[]) => {
    // Check actual Mapbox state for active layer in this category
    const activeId = map.current
      ? layerIds.find(id => map.current!.getLayer(`gis-${id}`))
      : layerIds.find(id => activeLayers.has(id))
    if (activeId) {
      toggleGISLayer(activeId)
    } else if (layerIds.length === 1) {
      toggleGISLayer(layerIds[0])
    } else {
      setLayerMenuAnchor({ el: e.currentTarget, category })
    }
  }, [activeLayers, toggleGISLayer])

  // Clean up active layers that no longer exist when province changes
  useEffect(() => {
    if (!isStyleReady(map.current)) return
    const availableSet = new Set(availableLayers)
    setActiveLayers(prev => {
      let changed = false
      const next = new Set(prev)
      for (const layerId of prev) {
        if (!availableSet.has(layerId)) { removeGISLayer(map.current!, layerId); next.delete(layerId); changed = true }
      }
      return changed ? next : prev
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableLayers])

  // Keep cadastre ref in sync with state
  useEffect(() => { cadastreProvinceRef.current = cadastreProvince }, [cadastreProvince])

  // --- Cadastre layer ---
  const addCadastreToMap = useCallback((m: mapboxgl.Map, province: string) => {
    const config = CADASTRE_LAYERS[province]
    if (!config || m.getSource('cadastre-source')) return
    try {
      m.addSource('cadastre-source', { type: 'raster', tiles: config.tiles, tileSize: config.tileSize, attribution: config.attribution })
      const beforeId = m.getLayer('clusters') ? 'clusters' : undefined
      m.addLayer({ id: 'cadastre-layer', type: 'raster', source: 'cadastre-source', paint: { 'raster-opacity': 0.7 }, minzoom: config.minzoom, maxzoom: 20 }, beforeId)
    } catch (err) { console.warn(`Failed to add cadastre layer for ${province}:`, err) }
  }, [])

  const removeCadastreFromMap = useCallback((m: mapboxgl.Map) => {
    if (m.getLayer('cadastre-layer')) m.removeLayer('cadastre-layer')
    if (m.getSource('cadastre-source')) m.removeSource('cadastre-source')
  }, [])

  const clearCadastreHighlight = useCallback((m: mapboxgl.Map) => {
    cadastreHighlightRef.current = null
    const src = m.getSource('cadastre-highlight') as mapboxgl.GeoJSONSource | undefined
    if (src) src.setData({ type: 'FeatureCollection', features: [] })
  }, [])

  const toggleCadastre = useCallback((province: string) => {
    if (!isStyleReady(map.current)) return
    if (cadastreProvince === province) {
      removeCadastreFromMap(map.current)
      clearCadastreHighlight(map.current)
      setCadastreProvince(null)
    } else {
      removeCadastreFromMap(map.current)
      clearCadastreHighlight(map.current)
      addCadastreToMap(map.current, province)
      setCadastreProvince(province)
    }
  }, [cadastreProvince, addCadastreToMap, removeCadastreFromMap, clearCadastreHighlight])

  // --- 3D Buildings ---
  const add3DBuildings = useCallback((m: mapboxgl.Map) => {
    if (!m.getSource('composite') || m.getLayer('3d-buildings')) return
    const labelLayerId = m.getStyle().layers.find((l: any) => l.type === 'symbol' && l.layout?.['text-field'])?.id
    m.addLayer({
      id: '3d-buildings', source: 'composite', 'source-layer': 'building',
      filter: ['==', 'extrude', 'true'], type: 'fill-extrusion', minzoom: 14,
      paint: {
        'fill-extrusion-color': '#aaa',
        'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 14, 0, 14.05, ['get', 'height']],
        'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 14, 0, 14.05, ['get', 'min_height']],
        'fill-extrusion-opacity': 0.6
      }
    }, labelLayerId)
  }, [])

  const toggle3DBuildings = useCallback(() => {
    if (!isStyleReady(map.current)) return
    if (buildings3D) {
      if (map.current.getLayer('3d-buildings')) map.current.removeLayer('3d-buildings')
      setBuildings3D(false)
    } else {
      add3DBuildings(map.current)
      setBuildings3D(true)
    }
  }, [buildings3D, add3DBuildings])

  // --- 3D Terrain ---
  const toggle3DTerrain = useCallback(() => {
    if (!isStyleReady(map.current)) return
    if (terrain3D) {
      map.current.setTerrain(null)
      setTerrain3D(false)
    } else {
      if (!map.current.getSource('mapbox-dem')) {
        map.current.addSource('mapbox-dem', { type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1', tileSize: 512, maxzoom: 14 })
      }
      map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 })
      setTerrain3D(true)
    }
  }, [terrain3D])

  // --- Measurement tools ---
  const toggleMeasureMode = useCallback((mode: 'line' | 'polygon') => {
    if (!drawRef.current) return
    if (measureMode === mode) {
      drawRef.current.deleteAll()
      drawRef.current.changeMode('simple_select')
      setMeasureMode(null)
      setMeasureResult(null)
    } else {
      drawRef.current.deleteAll()
      setMeasureResult(null)
      drawRef.current.changeMode(mode === 'line' ? 'draw_line_string' : 'draw_polygon')
      setMeasureMode(mode)
    }
  }, [measureMode])

  // --- Isochrone ---
  const fetchIsochrone = useCallback(async (center: [number, number], profile: string) => {
    const url = `https://api.mapbox.com/isochrone/v1/mapbox/${profile}/${center[0]},${center[1]}?contours_minutes=5,10,15&contours_colors=4CAF50,FF9800,F44336&polygons=true&access_token=${mapboxgl.accessToken}`
    try {
      const resp = await fetch(url)
      const data = await resp.json()
      isochroneDataRef.current = data
      if (!isStyleReady(map.current)) return
      if (map.current.getSource('isochrone')) {
        (map.current.getSource('isochrone') as mapboxgl.GeoJSONSource).setData(data)
      } else {
        const beforeId = map.current.getLayer('clusters') ? 'clusters' : undefined
        map.current.addSource('isochrone', { type: 'geojson', data })
        map.current.addLayer({ id: 'isochrone-fill', type: 'fill', source: 'isochrone', paint: { 'fill-color': ['get', 'fill'], 'fill-opacity': 0.2 } }, beforeId)
        map.current.addLayer({ id: 'isochrone-outline', type: 'line', source: 'isochrone', paint: { 'line-color': ['get', 'fill'], 'line-width': 2 } }, beforeId)
      }
    } catch (err) { console.warn('Isochrone fetch failed:', err) }
  }, [])

  const clearIsochrone = useCallback(() => {
    setIsochroneCenter(null)
    isochroneDataRef.current = null
    if (!isStyleReady(map.current)) return
    if (map.current.getLayer('isochrone-outline')) map.current.removeLayer('isochrone-outline')
    if (map.current.getLayer('isochrone-fill')) map.current.removeLayer('isochrone-fill')
    if (map.current.getSource('isochrone')) map.current.removeSource('isochrone')
  }, [])

  // Fetch isochrone when center or profile changes
  useEffect(() => {
    if (isochroneCenter) fetchIsochrone(isochroneCenter, isochroneProfile)
  }, [isochroneCenter, isochroneProfile, fetchIsochrone])

  // Handle style change - re-add layers after style loads
  const handleStyleChange = useCallback((newStyle: keyof typeof MAP_STYLES) => {
    if (!map.current || newStyle === mapStyle) return
    setMapStyle(newStyle)

    const center = map.current.getCenter()
    const zoom = map.current.getZoom()

    map.current.setStyle(MAP_STYLES[newStyle])
    map.current.once('style.load', () => {
      map.current!.setCenter(center)
      map.current!.setZoom(zoom)
      addLayers(map.current!, true)
      // Restore active GIS overlays
      activeLayers.forEach(layerId => addGISLayer(map.current!, layerId))
      // Restore cadastre
      if (cadastreProvince) addCadastreToMap(map.current!, cadastreProvince)
      // Restore 3D buildings (only on standard Mapbox styles with composite source)
      if (buildings3D) add3DBuildings(map.current!)
      // Restore terrain
      if (terrain3D) {
        if (!map.current!.getSource('mapbox-dem')) {
          map.current!.addSource('mapbox-dem', { type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1', tileSize: 512, maxzoom: 14 })
        }
        map.current!.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 })
      }
      // Restore cadastre highlight
      if (cadastreHighlightRef.current) {
        const src = map.current!.getSource('cadastre-highlight') as mapboxgl.GeoJSONSource | undefined
        if (src) src.setData(cadastreHighlightRef.current)
      }
      // Restore isochrone
      if (isochroneDataRef.current) {
        const isoBeforeId = map.current!.getLayer('clusters') ? 'clusters' : undefined
        map.current!.addSource('isochrone', { type: 'geojson', data: isochroneDataRef.current })
        map.current!.addLayer({ id: 'isochrone-fill', type: 'fill', source: 'isochrone', paint: { 'fill-color': ['get', 'fill'], 'fill-opacity': 0.2 } }, isoBeforeId)
        map.current!.addLayer({ id: 'isochrone-outline', type: 'line', source: 'isochrone', paint: { 'line-color': ['get', 'fill'], 'line-width': 2 } }, isoBeforeId)
      }
    })
  }, [mapStyle, addLayers, activeLayers, addGISLayer, cadastreProvince, addCadastreToMap, buildings3D, add3DBuildings, terrain3D])

  // Set up window callbacks for popup buttons
  useEffect(() => {
    (window as any).__mapViewProperty = (id: string) => {
      const p = properties.find(prop => prop.id === id)
      if (p && onViewProperty) onViewProperty(p)
    }
    ;(window as any).__mapEditProperty = (id: string) => {
      const p = properties.find(prop => prop.id === id)
      if (p && onEditProperty) onEditProperty(p)
    }
    ;(window as any).__mapAddToComps = (id: string) => {
      const p = properties.find(prop => prop.id === id)
      if (p && onAddToComps) onAddToComps(p)
    }
    ;(window as any).__mapDeleteProperty = (id: string) => {
      const p = properties.find(prop => prop.id === id)
      if (p) setDeleteConfirm(p)
    }
    ;(window as any).__mapShowIsochrone = (id: string) => {
      const p = properties.find(prop => prop.id === id)
      if (p && p.longitude && p.latitude) {
        setIsochroneCenter([p.longitude, p.latitude])
        setIsochroneProfile('driving')
        if (popupRef.current) popupRef.current.remove()
      }
    }
    return () => {
      delete (window as any).__mapViewProperty
      delete (window as any).__mapEditProperty
      delete (window as any).__mapAddToComps
      delete (window as any).__mapDeleteProperty
      delete (window as any).__mapShowIsochrone
    }
  }, [properties, onViewProperty, onEditProperty, onAddToComps])

  // Update map data when properties, selection, or highlight change
  useEffect(() => {
    if (!isStyleReady(map.current)) return
    const source = map.current.getSource('properties') as mapboxgl.GeoJSONSource | undefined
    if (source) {
      source.setData(buildGeoJSON())
    }
  }, [selectedPropertyIds, highlightedPropertyIds, buildGeoJSON])

  // Fit bounds when properties change (not on selection change)
  useEffect(() => {
    if (!isStyleReady(map.current)) return
    const source = map.current.getSource('properties') as mapboxgl.GeoJSONSource | undefined
    if (source && geoProperties.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      geoProperties.forEach(p => bounds.extend([p.longitude!, p.latitude!]))
      map.current!.fitBounds(bounds, { padding: 60, maxZoom: 15 })
    }
  }, [geoProperties])

  if (!mapboxgl.accessToken) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', p: 4 }}>
        <Typography color="text.secondary">Mapbox token not configured. Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <Box ref={mapContainer} sx={{ width: '100%', height: '100%' }} />

      {/* Map style + Layers controls */}
      <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1, display: 'flex', flexDirection: 'column', gap: 0.5, maxWidth: 260 }}>
        {/* Top row: base map dropdown + layers toggle */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={(e) => setStyleMenuAnchor(e.currentTarget)}
            title={t('map.styles.' + (mapStyle.startsWith('ortho-') ? mapStyle : mapStyle))}
            sx={{
              bgcolor: 'rgba(255,255,255,0.95)', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              border: '2px solid #667eea', borderRadius: 2, width: 36, height: 36,
              color: '#667eea',
              '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
            }}
          >
            <MapIconMui sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setShowOverlays(v => !v)}
            title={t('map.overlays')}
            sx={{
              bgcolor: (activeLayers.size > 0 || cadastreProvince || buildings3D || terrain3D) ? '#667eea' : 'rgba(255,255,255,0.95)',
              color: (activeLayers.size > 0 || cadastreProvince || buildings3D || terrain3D) ? '#fff' : '#667eea',
              border: '2px solid #667eea',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              borderRadius: 2, width: 36, height: 36,
              '&:hover': { bgcolor: (activeLayers.size > 0 || cadastreProvince || buildings3D || terrain3D) ? '#5a6fd6' : 'rgba(255,255,255,1)' }
            }}
          >
            <Layers sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Base map style menu */}
        <Menu
          anchorEl={styleMenuAnchor}
          open={!!styleMenuAnchor}
          onClose={() => setStyleMenuAnchor(null)}
          slotProps={{ paper: { sx: { borderRadius: 2, minWidth: 160, border: '2px solid #667eea' } } }}
        >
          {([
            { key: 'streets', icon: <MapIconMui sx={{ fontSize: 16, color: '#667eea' }} /> },
            { key: 'satellite', icon: <Satellite sx={{ fontSize: 16, color: '#5c6bc0' }} /> },
            { key: 'outdoors', icon: <Terrain sx={{ fontSize: 16, color: '#43a047' }} /> },
            { key: 'light', icon: <Layers sx={{ fontSize: 16, color: '#9e9e9e' }} /> },
          ] as const).map(({ key, icon }) => (
            <MenuItem
              key={key}
              selected={mapStyle === key}
              onClick={() => { handleStyleChange(key); setStyleMenuAnchor(null) }}
              sx={{ fontSize: '0.8rem', py: 0.75, gap: 1 }}
            >
              {icon} {t(`map.styles.${key}`)}
            </MenuItem>
          ))}
          <Divider />
          {availableOrthos.map(key => (
            <MenuItem
              key={key}
              selected={mapStyle === key}
              onClick={() => { handleStyleChange(key as keyof typeof MAP_STYLES); setStyleMenuAnchor(null) }}
              sx={{ fontSize: '0.8rem', py: 0.75, gap: 1 }}
            >
              <Flight sx={{ fontSize: 16, color: '#ff7043' }} /> {t(`map.styles.${key}`)}
            </MenuItem>
          ))}
        </Menu>

        {/* Overlay layers panel (toggleable) */}
        {showOverlays && (
          <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {CATEGORY_ORDER.filter(cat => layersByCategory[cat]).map(cat => {
                const layerIds = layersByCategory[cat]!
                const activeId = layerIds.find(id => activeLayers.has(id))
                const isActive = !!activeId
                const config = ALL_GIS_LAYERS[layerIds[0]]
                const Icon = config.icon
                return (
                  <Chip
                    key={cat}
                    icon={<Icon sx={{ fontSize: 14, color: isActive ? '#fff' : config.color }} />}
                    label={activeId ? t(`map.layers.${activeId}`) : t(`map.categories.${cat}`)}
                    size="small"
                    onClick={(e) => handleLayerChipClick(e, cat, layerIds)}
                    sx={{
                      fontSize: '0.65rem', height: 26,
                      bgcolor: isActive ? config.color : 'rgba(255,255,255,0.95)',
                      color: isActive ? '#fff' : 'text.primary',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                      '&:hover': { bgcolor: isActive ? config.color : 'rgba(255,255,255,1)' },
                      '& .MuiChip-icon': { ml: 0.5 }
                    }}
                  />
                )
              })}
            </Box>
            <Menu
              anchorEl={layerMenuAnchor?.el}
              open={!!layerMenuAnchor}
              onClose={() => setLayerMenuAnchor(null)}
              slotProps={{ paper: { sx: { borderRadius: 2, minWidth: 160, border: '2px solid #667eea' } } }}
            >
              {layerMenuAnchor && layersByCategory[layerMenuAnchor.category]?.map(layerId => (
                <MenuItem
                  key={layerId}
                  onClick={() => { toggleGISLayer(layerId); setLayerMenuAnchor(null) }}
                  sx={{ fontSize: '0.8rem', py: 0.75 }}
                >
                  {t(`map.layers.${layerId}`)}
                </MenuItem>
              ))}
            </Menu>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {availableCadastres.length > 0 && (
                <Chip
                  icon={<Layers sx={{ fontSize: 14, color: cadastreProvince ? '#fff' : '#795548' }} />}
                  label={cadastreProvince ? `${t('map.cadastre')} (${cadastreProvince})` : t('map.cadastre')}
                  size="small"
                  onClick={(e) => {
                    if (cadastreProvince) { toggleCadastre(cadastreProvince) }
                    else if (availableCadastres.length === 1) { toggleCadastre(availableCadastres[0]) }
                    else { setCadastreMenuAnchor(e.currentTarget) }
                  }}
                  sx={{
                    fontSize: '0.65rem', height: 26,
                    bgcolor: cadastreProvince ? '#795548' : 'rgba(255,255,255,0.95)',
                    color: cadastreProvince ? '#fff' : 'text.primary',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    '&:hover': { bgcolor: cadastreProvince ? '#795548' : 'rgba(255,255,255,1)' },
                    '& .MuiChip-icon': { ml: 0.5 }
                  }}
                />
              )}
              <Chip
                icon={<ViewInAr sx={{ fontSize: 14, color: buildings3D ? '#fff' : '#667eea' }} />}
                label={t('map.buildings3d')}
                size="small"
                onClick={toggle3DBuildings}
                disabled={mapStyle.startsWith('ortho-')}
                sx={{
                  fontSize: '0.65rem', height: 26,
                  bgcolor: buildings3D ? '#667eea' : 'rgba(255,255,255,0.95)',
                  color: buildings3D ? '#fff' : 'text.primary',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  '&:hover': { bgcolor: buildings3D ? '#667eea' : 'rgba(255,255,255,1)' },
                  '& .MuiChip-icon': { ml: 0.5 }
                }}
              />
              <Chip
                icon={<Terrain sx={{ fontSize: 14, color: terrain3D ? '#fff' : '#8D6E63' }} />}
                label={t('map.terrain3d')}
                size="small"
                onClick={toggle3DTerrain}
                sx={{
                  fontSize: '0.65rem', height: 26,
                  bgcolor: terrain3D ? '#8D6E63' : 'rgba(255,255,255,0.95)',
                  color: terrain3D ? '#fff' : 'text.primary',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  '&:hover': { bgcolor: terrain3D ? '#8D6E63' : 'rgba(255,255,255,1)' },
                  '& .MuiChip-icon': { ml: 0.5 }
                }}
              />
            </Box>
            <Menu
              anchorEl={cadastreMenuAnchor}
              open={!!cadastreMenuAnchor}
              onClose={() => setCadastreMenuAnchor(null)}
              slotProps={{ paper: { sx: { borderRadius: 2, minWidth: 140, border: '2px solid #667eea' } } }}
            >
              {availableCadastres.map(prov => (
                <MenuItem key={prov} onClick={() => { toggleCadastre(prov); setCadastreMenuAnchor(null) }} sx={{ fontSize: '0.8rem', py: 0.75 }}>
                  {t('map.cadastre')} ({prov})
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
      </Box>

      {geoProperties.length === 0 && (
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 2, p: 3, textAlign: 'center'
        }}>
          <Typography color="text.secondary">{t('map.noCoordinates')}</Typography>
        </Box>
      )}
      <Box sx={{
        position: 'absolute', bottom: 8, left: 8,
        bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 1, px: 1.5, py: 0.5
      }}>
        <Typography variant="caption" color="text.secondary">
          {t('map.propertiesOnMap', { count: geoProperties.length })}
        </Typography>
      </Box>

      {selectable && (
        <Box sx={{
          position: 'absolute', bottom: 8, right: 8,
          bgcolor: 'rgba(255,255,255,0.95)', borderRadius: 1, px: 1.5, py: 0.5
        }}>
          <Typography variant="caption" color={selectedPropertyIds.length > 0 ? 'primary' : 'text.secondary'} fontWeight={selectedPropertyIds.length > 0 ? 600 : 400}>
            {selectedPropertyIds.length > 0
              ? t('map.selectedOnMap', { count: selectedPropertyIds.length })
              : t('map.clickToSelect')
            }
          </Typography>
        </Box>
      )}

      {/* Measurement tools - bottom left */}
      <Box sx={{ position: 'absolute', bottom: 36, left: 8, display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => toggleMeasureMode('line')}
            sx={{
              bgcolor: measureMode === 'line' ? '#667eea' : 'rgba(255,255,255,0.95)',
              color: measureMode === 'line' ? '#fff' : 'text.primary',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              width: 32, height: 32,
              '&:hover': { bgcolor: measureMode === 'line' ? '#667eea' : 'rgba(255,255,255,1)' }
            }}
            title={t('map.measureDistance')}
          >
            <Straighten sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => toggleMeasureMode('polygon')}
            sx={{
              bgcolor: measureMode === 'polygon' ? '#667eea' : 'rgba(255,255,255,0.95)',
              color: measureMode === 'polygon' ? '#fff' : 'text.primary',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              width: 32, height: 32,
              '&:hover': { bgcolor: measureMode === 'polygon' ? '#667eea' : 'rgba(255,255,255,1)' }
            }}
            title={t('map.measureArea')}
          >
            <SquareFoot sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
        {measureResult && (
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.95)', borderRadius: 1, px: 1.5, py: 0.5, boxShadow: '0 1px 4px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {measureResult.type === 'area'
                ? `${t('map.measureArea')}: ${measureResult.value.toFixed(1)} m² (${(measureResult.value * 10.7639).toFixed(0)} pi²)`
                : `${t('map.measureDistance')}: ${measureResult.value.toFixed(1)} m (${(measureResult.value * 3.28084).toFixed(0)} pi)`
              }
            </Typography>
            <IconButton size="small" onClick={() => { drawRef.current?.deleteAll(); setMeasureMode(null); setMeasureResult(null) }} sx={{ p: 0.25 }}>
              <Close sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Isochrone controls - bottom center-right */}
      {isochroneCenter && (
        <Box sx={{ position: 'absolute', bottom: 36, right: 60, bgcolor: 'rgba(255,255,255,0.95)', borderRadius: 1, px: 1.5, py: 0.75, boxShadow: '0 1px 4px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, mr: 0.5 }}>{t('map.isochrone')}:</Typography>
          {(['driving', 'walking', 'cycling'] as const).map(p => (
            <Chip
              key={p}
              label={t(`map.isochrone${p.charAt(0).toUpperCase() + p.slice(1)}`)}
              size="small"
              onClick={() => setIsochroneProfile(p)}
              sx={{
                fontSize: '0.65rem', height: 22,
                bgcolor: isochroneProfile === p ? '#3bb2d0' : 'transparent',
                color: isochroneProfile === p ? '#fff' : 'text.primary',
                border: isochroneProfile === p ? 'none' : '1px solid #ccc',
              }}
            />
          ))}
          <Chip
            label={t('map.isochroneClear')}
            size="small"
            onClick={clearIsochrone}
            onDelete={clearIsochrone}
            sx={{ fontSize: '0.65rem', height: 22, bgcolor: '#F44336', color: '#fff', '& .MuiChip-deleteIcon': { color: '#fff', fontSize: 14 } }}
          />
        </Box>
      )}

      <Dialog open={!!deleteConfirm} onClose={() => !deleting && setDeleteConfirm(null)} maxWidth="xs">
        <DialogTitle>{t('map.deleteConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {deleteConfirm?.adresse}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {[deleteConfirm?.ville, deleteConfirm?.code_postal].filter(Boolean).join(', ')}
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1.5 }}>
            {t('map.deleteConfirmWarning')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirm(null)} disabled={deleting}>{t('map.cancel')}</Button>
          <Button
            variant="contained"
            color="error"
            disabled={deleting}
            onClick={async () => {
              if (!deleteConfirm || !onDeleteProperty) return
              setDeleting(true)
              try {
                await onDeleteProperty(deleteConfirm)
                if (popupRef.current) popupRef.current.remove()
                setDeleteConfirm(null)
              } finally {
                setDeleting(false)
              }
            }}
            sx={{ borderRadius: 2 }}
          >
            {deleting ? t('map.deleting') : t('map.deleteConfirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
