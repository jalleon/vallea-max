import { supabase } from '@/lib/supabase/client'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

export async function geocodeAddress(
  address: string,
  city?: string,
  postalCode?: string,
  province?: string
): Promise<{ lat: number; lng: number } | null> {
  const query = [address, city, province, postalCode].filter(Boolean).join(', ')
  if (!query || !MAPBOX_TOKEN) return null

  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=ca&limit=1&access_token=${MAPBOX_TOKEN}`
    )
    const data = await res.json()
    if (data.features?.length > 0) {
      const [lng, lat] = data.features[0].center
      return { lat, lng }
    }
  } catch (err) {
    console.warn('Geocoding failed:', err)
  }
  return null
}

export async function geocodeAndUpdateProperty(
  propertyId: string,
  address: string,
  city?: string,
  postalCode?: string,
  province?: string
): Promise<void> {
  const coords = await geocodeAddress(address, city, postalCode, province)
  if (coords) {
    await supabase
      .from('properties')
      .update({ latitude: coords.lat, longitude: coords.lng })
      .eq('id', propertyId)
  }
}

/**
 * Backfill geocoding for all properties missing lat/lng.
 * Returns { total, geocoded, failed } counts.
 * Call from a UI button or browser console.
 */
export async function geocodeAllProperties(
  onProgress?: (done: number, total: number) => void
): Promise<{ total: number; geocoded: number; failed: number }> {
  const { data, error } = await supabase
    .from('properties')
    .select('id, adresse, ville, code_postal, province')
    .is('latitude', null)

  if (error) throw error
  const properties = data || []
  let geocoded = 0
  let failed = 0

  for (let i = 0; i < properties.length; i++) {
    const p = properties[i]
    try {
      const coords = await geocodeAddress(p.adresse, p.ville || undefined, p.code_postal || undefined, p.province || undefined)
      if (coords) {
        await supabase
          .from('properties')
          .update({ latitude: coords.lat, longitude: coords.lng })
          .eq('id', p.id)
        geocoded++
      } else {
        failed++
      }
    } catch {
      failed++
    }
    onProgress?.(i + 1, properties.length)
    // Small delay to respect Mapbox rate limits (600 req/min on free tier)
    if (i < properties.length - 1) await new Promise(r => setTimeout(r, 120))
  }

  return { total: properties.length, geocoded, failed }
}
