import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local manually
const envPath = join(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    const value = match[2].trim().replace(/^["']|["']$/g, '')
    envVars[key] = value
  }
})

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
)

async function checkOrganizations() {
  console.log('🔍 Checking Organizations...\n')

  // Check organizations
  const { data: orgs, error: orgError } = await supabase
    .from('organizations')
    .select('*')

  if (orgError) {
    console.error('❌ Error fetching organizations:', orgError.message)
  } else {
    console.log(`📊 Found ${orgs.length} organization(s):\n`)
    orgs.forEach(org => {
      console.log(`  - ID: ${org.id}`)
      console.log(`    Name: ${org.name}`)
      console.log(`    Created: ${org.created_at}`)
      console.log('')
    })
  }

  // Check users
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()

  if (userError) {
    console.error('❌ Error fetching users:', userError.message)
  } else {
    console.log(`👥 Found ${users.length} user(s):\n`)
    users.forEach(user => {
      console.log(`  - Email: ${user.email}`)
      console.log(`    ID: ${user.id}`)
      console.log(`    Created: ${user.created_at}`)
      console.log('')
    })
  }

  // Check properties and their organization_id
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .select('id, adresse, organization_id')
    .limit(5)

  if (propError) {
    console.error('❌ Error fetching properties:', propError.message)
  } else {
    console.log(`🏠 Sample of ${properties.length} properties:\n`)
    properties.forEach(prop => {
      console.log(`  - ${prop.adresse}`)
      console.log(`    Organization ID: ${prop.organization_id || 'NULL'}`)
      console.log('')
    })
  }
}

checkOrganizations().catch(console.error)
