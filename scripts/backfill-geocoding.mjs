/**
 * One-time script to backfill lat/lng for all existing properties.
 * Uses service_role key to bypass RLS.
 *
 * Usage: node scripts/backfill-geocoding.mjs
 */

const SUPABASE_URL = 'https://xrqhkocktxzzyfwixqgg.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const MAPBOX_TOKEN = 'pk.eyJ1IjoidmFsZWFtYXgiLCJhIjoiY21sZTFmMjF3MWh4aTNlcHdkbDRxcjNodiJ9.JzSSbo3OazYEzCmGVyz8Tg'

if (!SUPABASE_KEY) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY env var first')
  process.exit(1)
}

async function supabaseGet(table, params = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    }
  })
  if (!res.ok) throw new Error(`Supabase GET error: ${res.status} ${await res.text()}`)
  return res.json()
}

async function supabasePatch(table, id, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error(`Supabase PATCH error: ${res.status} ${await res.text()}`)
}

async function geocode(address, city, postalCode, province) {
  const query = [address, city, province, postalCode].filter(Boolean).join(', ')
  if (!query) return null
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=ca&limit=1&access_token=${MAPBOX_TOKEN}`
  )
  const data = await res.json()
  if (data.features?.length > 0) {
    const [lng, lat] = data.features[0].center
    return { lat, lng }
  }
  return null
}

async function main() {
  console.log('Fetching properties without coordinates...')
  const properties = await supabaseGet('properties', 'select=id,adresse,ville,code_postal,province&latitude=is.null')
  console.log(`Found ${properties.length} properties to geocode.\n`)

  let geocoded = 0
  let failed = 0

  for (let i = 0; i < properties.length; i++) {
    const p = properties[i]
    const label = `[${i + 1}/${properties.length}] ${p.adresse || '(no address)'}`
    try {
      const coords = await geocode(p.adresse, p.ville, p.code_postal, p.province)
      if (coords) {
        await supabasePatch('properties', p.id, { latitude: coords.lat, longitude: coords.lng })
        console.log(`  OK  ${label} -> ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`)
        geocoded++
      } else {
        console.log(` SKIP ${label} (no result)`)
        failed++
      }
    } catch (err) {
      console.log(` ERR  ${label}: ${err.message}`)
      failed++
    }
    // Respect Mapbox rate limits
    if (i < properties.length - 1) await new Promise(r => setTimeout(r, 120))
  }

  console.log(`\nDone! Geocoded: ${geocoded}, Failed/Skipped: ${failed}, Total: ${properties.length}`)
}

main().catch(err => { console.error(err); process.exit(1) })
