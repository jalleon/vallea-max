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

async function createDemoUser() {
  console.log('🎭 Creating Demo User for Screenshots...\n')

  // Demo user credentials
  const demoEmail = 'demo@valeamax.com'
  const demoPassword = 'DemoUser2024!'
  const demoName = 'Alexandre Tremblay'
  const demoOrgName = 'Évaluations Prestige Inc.'

  // Step 1: Create demo user
  console.log('👤 Creating user account...')
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: demoEmail,
    password: demoPassword,
    email_confirm: true,
    user_metadata: {
      full_name: demoName
    }
  })

  if (authError) {
    console.error('❌ Error creating user:', authError.message)
    return
  }

  console.log(`✅ User created: ${demoEmail}`)
  console.log(`   ID: ${authData.user.id}`)
  console.log(`   Name: ${demoName}\n`)

  // Step 2: Create demo organization
  console.log('🏢 Creating organization...')
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: demoOrgName
    })
    .select()
    .single()

  if (orgError) {
    console.error('❌ Error creating organization:', orgError.message)
    return
  }

  console.log(`✅ Organization created: ${demoOrgName}`)
  console.log(`   ID: ${orgData.id}\n`)

  // Step 3: Link user to organization (if you have a user_organizations table)
  console.log('🔗 Linking user to organization...')
  const { error: linkError } = await supabase
    .from('user_organizations')
    .insert({
      user_id: authData.user.id,
      organization_id: orgData.id,
      role: 'owner'
    })

  if (linkError) {
    console.log('ℹ️  Note: user_organizations table may not exist, skipping link')
  } else {
    console.log('✅ User linked to organization\n')
  }

  // Step 4: Update all seeded properties to belong to this organization
  console.log('📦 Assigning Toronto and Montreal/Quebec properties to demo organization...')

  // Get all properties that don't have organization_id or were just seeded
  const { data: properties, error: propFetchError } = await supabase
    .from('properties')
    .select('id, adresse, organization_id')
    .or('ville.eq.Toronto,ville.eq.Montréal,ville.eq.Québec')
    .is('organization_id', null)

  if (propFetchError) {
    console.error('❌ Error fetching properties:', propFetchError.message)
  } else {
    console.log(`Found ${properties.length} properties to assign\n`)

    for (const prop of properties) {
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          organization_id: orgData.id
        })
        .eq('id', prop.id)

      if (updateError) {
        console.error(`   ❌ Failed to update ${prop.adresse}`)
      } else {
        console.log(`   ✅ Assigned: ${prop.adresse}`)
      }
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎉 Demo Account Created Successfully!')
  console.log('='.repeat(60))
  console.log('\n📋 LOGIN CREDENTIALS (for screenshots):')
  console.log(`   Email:        ${demoEmail}`)
  console.log(`   Password:     ${demoPassword}`)
  console.log(`   Name:         ${demoName}`)
  console.log(`   Organization: ${demoOrgName}`)
  console.log('\n💡 Use these credentials when taking screenshots')
  console.log('   to keep your personal information private.\n')
}

createDemoUser().catch(console.error)
