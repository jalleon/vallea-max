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

async function setupBilingualDemoAccounts() {
  console.log('🌍 Setting up Bilingual Demo Accounts...\n')

  // Demo accounts configuration
  const accounts = [
    {
      email: 'demo-en@valeamax.com',
      password: 'DemoEN2024!',
      name: 'Sarah Mitchell',
      orgName: 'Mitchell Appraisal Group',
      language: 'English',
      locale: 'en'
    },
    {
      email: 'demo-fr@valeamax.com',
      password: 'DemoFR2024!',
      name: 'Marc Dubois',
      orgName: 'Évaluations Dubois Inc.',
      language: 'French',
      locale: 'fr'
    }
  ]

  for (const account of accounts) {
    console.log(`\n📋 Setting up ${account.language} demo account...`)
    console.log(`   Email: ${account.email}`)

    // Check if user exists
    const { data: { users } } = await supabase.auth.admin.listUsers()
    let userId = users.find(u => u.email === account.email)?.id

    if (!userId) {
      console.log('   Creating new user...')
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          full_name: account.name,
          locale: account.locale
        }
      })

      if (authError) {
        console.error(`   ❌ Error creating user: ${authError.message}`)
        continue
      }
      userId = authData.user.id
      console.log(`   ✅ User created: ${account.email}`)
    } else {
      console.log(`   ✅ User already exists: ${account.email}`)
    }

    console.log(`   User ID: ${userId}`)

    // Create organization
    console.log(`   Creating organization: ${account.orgName}...`)
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: account.orgName })
      .select()
      .single()

    if (orgError) {
      console.error(`   ❌ Error creating organization: ${orgError.message}`)
      continue
    }

    console.log(`   ✅ Organization created: ${account.orgName}`)
    console.log(`   Organization ID: ${orgData.id}`)

    // Update user metadata with organization_id
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          full_name: account.name,
          locale: account.locale,
          organization_id: orgData.id
        }
      }
    )

    if (updateError) {
      console.error(`   ❌ Error updating user metadata: ${updateError.message}`)
    } else {
      console.log(`   ✅ User linked to organization`)
    }

    // Store for later use
    account.userId = userId
    account.organizationId = orgData.id
  }

  console.log('\n' + '='.repeat(70))
  console.log('🎉 Bilingual Demo Accounts Created!')
  console.log('='.repeat(70))

  console.log('\n📋 ENGLISH DEMO ACCOUNT (for EN screenshots):')
  console.log(`   Email:        ${accounts[0].email}`)
  console.log(`   Password:     ${accounts[0].password}`)
  console.log(`   Name:         ${accounts[0].name}`)
  console.log(`   Organization: ${accounts[0].orgName}`)
  console.log(`   Org ID:       ${accounts[0].organizationId}`)

  console.log('\n📋 FRENCH DEMO ACCOUNT (for FR screenshots):')
  console.log(`   Email:        ${accounts[1].email}`)
  console.log(`   Password:     ${accounts[1].password}`)
  console.log(`   Name:         ${accounts[1].name}`)
  console.log(`   Organization: ${accounts[1].orgName}`)
  console.log(`   Org ID:       ${accounts[1].organizationId}`)

  console.log('\n💡 Next steps:')
  console.log('   1. Run English property seed script (assign to EN org)')
  console.log('   2. Run French property seed script (assign to FR org)')
  console.log('   3. Take screenshots with separate accounts\n')

  return accounts
}

setupBilingualDemoAccounts().catch(console.error)
