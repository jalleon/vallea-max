'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { Map as MapIconMui, Satellite, Terrain, Layers } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Property } from '../types/property.types'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

const MAP_STYLES = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
  light: 'mapbox://styles/mapbox/light-v11',
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
}

export default function PropertyMapInner({ properties, onViewProperty, onEditProperty }: PropertyMapInnerProps) {
  const t = useTranslations('library')
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const popupRef = useRef<mapboxgl.Popup | null>(null)
  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLES>('streets')

  // Properties with valid coordinates
  const geoProperties = properties.filter(p => p.latitude && p.longitude)

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
        color: getTypeColor(p.type_propriete)
      }
    }))
  }), [geoProperties])

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
        'circle-color': ['get', 'color'],
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
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

    // Click marker → popup
    m.on('click', 'unclustered-point', (e) => {
      if (!e.features?.length) return
      const props = e.features[0].properties!
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
  }, [buildGeoJSON, geoProperties])

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
    })
  }, [mapStyle, addLayers])

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
    return () => {
      delete (window as any).__mapViewProperty
      delete (window as any).__mapEditProperty
    }
  }, [properties, onViewProperty, onEditProperty])

  // Update map data when properties change
  useEffect(() => {
    if (!map.current?.isStyleLoaded()) return
    const source = map.current.getSource('properties') as mapboxgl.GeoJSONSource | undefined
    if (source) {
      source.setData(buildGeoJSON())
      if (geoProperties.length > 0) {
        const bounds = new mapboxgl.LngLatBounds()
        geoProperties.forEach(p => bounds.extend([p.longitude!, p.latitude!]))
        map.current!.fitBounds(bounds, { padding: 60, maxZoom: 15 })
      }
    }
  }, [geoProperties, buildGeoJSON])

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

      {/* Style toggle */}
      <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1 }}>
        <ToggleButtonGroup
          value={mapStyle}
          exclusive
          onChange={(_, v) => v && handleStyleChange(v)}
          size="small"
          sx={{
            bgcolor: 'rgba(255,255,255,0.95)',
            borderRadius: 2,
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            '& .MuiToggleButton-root': { px: 1, py: 0.5, border: 'none', fontSize: '0.7rem', textTransform: 'none', gap: 0.5 }
          }}
        >
          <ToggleButton value="streets"><MapIconMui sx={{ fontSize: 16 }} /> Streets</ToggleButton>
          <ToggleButton value="satellite"><Satellite sx={{ fontSize: 16 }} /> Satellite</ToggleButton>
          <ToggleButton value="outdoors"><Terrain sx={{ fontSize: 16 }} /> Outdoors</ToggleButton>
          <ToggleButton value="light"><Layers sx={{ fontSize: 16 }} /> Light</ToggleButton>
        </ToggleButtonGroup>
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
    </Box>
  )
}
