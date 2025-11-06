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

async function setupDemoAccount() {
  console.log('🎭 Setting up Demo Account for Screenshots...\n')

  const demoEmail = 'demo@valeamax.com'
  const demoPassword = 'DemoUser2024!'
  const demoOrgName = 'Évaluations Prestige Inc.'

  // Step 1: Get or create user
  console.log('👤 Checking for existing demo user...')
  const { data: { users } } = await supabase.auth.admin.listUsers()
  let userId = users.find(u => u.email === demoEmail)?.id

  if (!userId) {
    console.log('   Creating new user...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Alexandre Tremblay'
      }
    })

    if (authError) {
      console.error('❌ Error creating user:', authError.message)
      return
    }
    userId = authData.user.id
    console.log(`✅ User created: ${demoEmail}`)
  } else {
    console.log(`✅ User already exists: ${demoEmail}`)
  }

  console.log(`   User ID: ${userId}\n`)

  // Step 2: Create organization
  console.log('🏢 Creating demo organization...')
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
  console.log(`   Organization ID: ${orgData.id}\n`)

  // Step 3: Link user to organization
  console.log('🔗 Linking user to organization...')
  const { error: linkError } = await supabase
    .from('user_organizations')
    .insert({
      user_id: userId,
      organization_id: orgData.id,
      role: 'owner'
    })

  if (linkError) {
    console.log('ℹ️  Note: Could not link user to organization (may need manual linking)')
    console.log(`   Error: ${linkError.message}\n`)
  } else {
    console.log('✅ User linked to organization\n')
  }

  // Step 4: Assign Toronto and Montreal properties
  console.log('📦 Assigning Toronto and Montreal/Quebec properties...')

  const { data: properties, error: propFetchError } = await supabase
    .from('properties')
    .select('id, adresse, ville, organization_id')
    .or('ville.eq.Toronto,ville.eq.Montréal,ville.eq.Québec')
    .is('organization_id', null)

  if (propFetchError) {
    console.error('❌ Error fetching properties:', propFetchError.message)
  } else {
    console.log(`   Found ${properties.length} unassigned properties\n`)

    let torontoCount = 0
    let quebecCount = 0

    for (const prop of properties) {
      const { error: updateError } = await supabase
        .from('properties')
        .update({ organization_id: orgData.id })
        .eq('id', prop.id)

      if (updateError) {
        console.error(`   ❌ Failed: ${prop.adresse}`)
      } else {
        if (prop.ville === 'Toronto') {
          torontoCount++
        } else {
          quebecCount++
        }
        console.log(`   ✅ ${prop.adresse} (${prop.ville})`)
      }
    }

    console.log(`\n   📊 Assigned ${torontoCount} Toronto properties`)
    console.log(`   📊 Assigned ${quebecCount} Montreal/Quebec properties`)
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎉 Demo Account Ready!')
  console.log('='.repeat(60))
  console.log('\n📋 LOGIN CREDENTIALS (for screenshots):')
  console.log(`   Email:        ${demoEmail}`)
  console.log(`   Password:     ${demoPassword}`)
  console.log(`   Name:         Alexandre Tremblay`)
  console.log(`   Organization: ${demoOrgName}`)
  console.log('\n💡 Use these credentials when taking screenshots')
  console.log('   to keep your personal information private.\n')
}

setupDemoAccount().catch(console.error)
