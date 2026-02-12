'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { Box, Typography, ToggleButtonGroup, ToggleButton, Chip, Menu, MenuItem } from '@mui/material'
import { Map as MapIconMui, Satellite, Terrain, Layers, Agriculture, Waves, Park, Landscape, Flight } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Property } from '../types/property.types'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

const MAP_STYLES: Record<string, string | mapboxgl.Style> = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
  light: 'mapbox://styles/mapbox/light-v11',
  ortho: {
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
  selectable?: boolean
  selectedPropertyIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  highlightedPropertyIds?: string[]
}

export default function PropertyMapInner({ properties, onViewProperty, onEditProperty, onAddToComps, selectable, selectedPropertyIds = [], onSelectionChange, highlightedPropertyIds }: PropertyMapInnerProps) {
  const t = useTranslations('library')
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const popupRef = useRef<mapboxgl.Popup | null>(null)
  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLES>('streets')
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set())

  // Properties with valid coordinates - stable reference unless IDs change
  const geoProperties = useMemo(() =>
    properties.filter(p => p.latitude && p.longitude),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [properties.map(p => p.id).join(',')]
  )

  // Detect all provinces represented in current properties
  const detectedProvinces = useMemo(() => {
    const provinces = new Set<string>()
    geoProperties.forEach(p => provinces.add(p.province || 'QC'))
    return provinces.size > 0 ? provinces : new Set(['QC'])
  }, [geoProperties])

  // Available layers = union of all province-specific layers + federal fallbacks for uncovered categories
  const availableLayers = useMemo(() => {
    const allProvinceLayers: string[] = []
    const coveredCategories = new Set<LayerCategory>()
    for (const prov of detectedProvinces) {
      for (const id of (PROVINCE_LAYERS[prov] || [])) {
        allProvinceLayers.push(id)
        coveredCategories.add(ALL_GIS_LAYERS[id].category)
      }
    }
    const federalFallbacks = FEDERAL_LAYERS.filter(id => !coveredCategories.has(ALL_GIS_LAYERS[id].category))
    return [...allProvinceLayers, ...federalFallbacks]
  }, [detectedProvinces])

  // Group available layers by category for dropdown menus
  const layersByCategory = useMemo(() => {
    const groups: Partial<Record<LayerCategory, string[]>> = {}
    for (const id of availableLayers) {
      const cat = ALL_GIS_LAYERS[id].category
      ;(groups[cat] ||= []).push(id)
    }
    return groups
  }, [availableLayers])

  const [layerMenuAnchor, setLayerMenuAnchor] = useState<{ el: HTMLElement, category: LayerCategory } | null>(null)

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

  const addLayers = useCallback((m: mapboxgl.Map) => {
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
            <div style="margin-top: 8px; display: flex; gap: 6px;">
              <button onclick="window.__mapViewProperty('${props.id}')" style="padding: 4px 12px; font-size: 12px; border: 1px solid #ddd; border-radius: 6px; background: white; cursor: pointer;">View</button>
              <button onclick="window.__mapEditProperty('${props.id}')" style="padding: 4px 12px; font-size: 12px; border: none; border-radius: 6px; background: #667eea; color: white; cursor: pointer;">Edit</button>
              <button onclick="window.__mapAddToComps('${props.id}')" style="padding: 4px 12px; font-size: 12px; border: none; border-radius: 6px; background: #4CAF50; color: white; cursor: pointer;">+ Comps</button>
            </div>
          </div>
        `)
        .addTo(m)
    })

    m.on('mouseenter', 'clusters', () => { m.getCanvas().style.cursor = 'pointer' })
    m.on('mouseleave', 'clusters', () => { m.getCanvas().style.cursor = '' })
    m.on('mouseenter', 'unclustered-point', () => { m.getCanvas().style.cursor = 'pointer' })
    m.on('mouseleave', 'unclustered-point', () => { m.getCanvas().style.cursor = '' })

    if (geoProperties.length > 0) {
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

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.current.on('load', () => addLayers(map.current!))

    return () => {
      if (popupRef.current) popupRef.current.remove()
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

  // Add a GIS raster overlay to the map
  const addGISLayer = useCallback((m: mapboxgl.Map, layerId: string) => {
    const config = ALL_GIS_LAYERS[layerId]
    if (!config || m.getSource(`gis-${layerId}`)) return
    m.addSource(`gis-${layerId}`, { type: 'raster', tiles: config.tiles, tileSize: 256 })
    m.addLayer({ id: `gis-${layerId}`, type: 'raster', source: `gis-${layerId}`, paint: { 'raster-opacity': 0.6 } }, 'clusters')
  }, [])

  const removeGISLayer = useCallback((m: mapboxgl.Map, layerId: string) => {
    if (m.getLayer(`gis-${layerId}`)) m.removeLayer(`gis-${layerId}`)
    if (m.getSource(`gis-${layerId}`)) m.removeSource(`gis-${layerId}`)
  }, [])

  const toggleGISLayer = useCallback((layerId: string) => {
    if (!map.current?.isStyleLoaded()) return
    const next = new Set(activeLayers)
    if (next.has(layerId)) {
      removeGISLayer(map.current, layerId)
      next.delete(layerId)
    } else {
      addGISLayer(map.current, layerId)
      next.add(layerId)
    }
    setActiveLayers(next)
  }, [activeLayers, addGISLayer, removeGISLayer])

  const handleLayerChipClick = useCallback((e: React.MouseEvent<HTMLElement>, category: LayerCategory, layerIds: string[]) => {
    const activeId = layerIds.find(id => activeLayers.has(id))
    if (activeId) {
      if (map.current?.isStyleLoaded()) {
        removeGISLayer(map.current, activeId)
        const next = new Set(activeLayers)
        next.delete(activeId)
        setActiveLayers(next)
      }
    } else if (layerIds.length === 1) {
      toggleGISLayer(layerIds[0])
    } else {
      setLayerMenuAnchor({ el: e.currentTarget, category })
    }
  }, [activeLayers, removeGISLayer, toggleGISLayer])

  // Clean up active layers that no longer exist when province changes
  useEffect(() => {
    if (!map.current?.isStyleLoaded()) return
    const availableSet = new Set(availableLayers)
    const next = new Set(activeLayers)
    let changed = false
    for (const layerId of activeLayers) {
      if (!availableSet.has(layerId)) { removeGISLayer(map.current, layerId); next.delete(layerId); changed = true }
    }
    if (changed) setActiveLayers(next)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableLayers])

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
      addLayers(map.current!)
      // Restore active GIS overlays
      activeLayers.forEach(layerId => addGISLayer(map.current!, layerId))
    })
  }, [mapStyle, addLayers, activeLayers, addGISLayer])

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
    return () => {
      delete (window as any).__mapViewProperty
      delete (window as any).__mapEditProperty
      delete (window as any).__mapAddToComps
    }
  }, [properties, onViewProperty, onEditProperty, onAddToComps])

  // Update map data when properties, selection, or highlight change
  useEffect(() => {
    if (!map.current?.isStyleLoaded()) return
    const source = map.current.getSource('properties') as mapboxgl.GeoJSONSource | undefined
    if (source) {
      source.setData(buildGeoJSON())
    }
  }, [selectedPropertyIds, highlightedPropertyIds, buildGeoJSON])

  // Fit bounds when properties change (not on selection change)
  useEffect(() => {
    if (!map.current?.isStyleLoaded()) return
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

      {/* Style toggle + GIS layers */}
      <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <ToggleButtonGroup
          value={mapStyle}
          exclusive
          onChange={(_, v) => v && handleStyleChange(v)}
          size="small"
          sx={{
            bgcolor: 'rgba(255,255,255,0.95)',
            borderRadius: 2,
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            '& .MuiToggleButton-root': { flex: 1, px: 1, py: 0.5, border: 'none', fontSize: '0.7rem', textTransform: 'none', gap: 0.5 }
          }}
        >
          <ToggleButton value="streets"><MapIconMui sx={{ fontSize: 16 }} /> Streets</ToggleButton>
          <ToggleButton value="satellite"><Satellite sx={{ fontSize: 16 }} /> Satellite</ToggleButton>
          <ToggleButton value="outdoors"><Terrain sx={{ fontSize: 16 }} /> Outdoors</ToggleButton>
          <ToggleButton value="light"><Layers sx={{ fontSize: 16 }} /> Light</ToggleButton>
          <ToggleButton value="ortho"><Flight sx={{ fontSize: 16 }} /> QC Ortho</ToggleButton>
        </ToggleButtonGroup>
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
          slotProps={{ paper: { sx: { borderRadius: 2, minWidth: 160 } } }}
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
    </Box>
  )
}
