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

async function linkDemoUser() {
  const demoEmail = 'demo@valeamax.com'

  // Get demo user
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const demoUser = users.find(u => u.email === demoEmail)

  if (!demoUser) {
    console.error('❌ Demo user not found')
    return
  }

  // Get demo organization
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('name', 'Évaluations Prestige Inc.')
    .single()

  if (!org) {
    console.error('❌ Demo organization not found')
    return
  }

  console.log('🔗 Linking demo user to organization...')
  console.log(`   User: ${demoUser.email}`)
  console.log(`   Organization: ${org.name}\n`)

  // Update user metadata with organization_id
  const { error } = await supabase.auth.admin.updateUserById(
    demoUser.id,
    {
      user_metadata: {
        ...demoUser.user_metadata,
        organization_id: org.id
      }
    }
  )

  if (error) {
    console.error('❌ Error updating user:', error.message)
  } else {
    console.log('✅ User metadata updated with organization_id')
  }
}

linkDemoUser().catch(console.error)
