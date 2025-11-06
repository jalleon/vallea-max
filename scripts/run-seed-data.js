const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Using service role to bypass RLS
)

async function runSeedFile(filename) {
  console.log(`\n🌱 Running ${filename}...`)

  const sqlPath = path.join(__dirname, filename)
  const sql = fs.readFileSync(sqlPath, 'utf8')

  // Split by semicolons to get individual INSERT statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0)

  console.log(`   Found ${statements.length} SQL statements`)

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]

    // Extract data from INSERT statement for manual insertion
    // This is more reliable than executing raw SQL via API
    if (statement.includes('INSERT INTO properties')) {
      console.log(`   ℹ️  Note: Please execute this SQL directly in Supabase SQL Editor`)
      console.log(`   📝 SQL file location: ${sqlPath}`)
      break
    }
  }
}

async function main() {
  console.log('🚀 Valea Max - Database Seed Script')
  console.log('=====================================\n')

  console.log('⚠️  IMPORTANT:')
  console.log('This script requires executing raw SQL INSERT statements.')
  console.log('The Supabase JavaScript client does not support raw SQL execution.\n')

  console.log('📋 Instructions:')
  console.log('1. Go to: https://supabase.com/dashboard/project/xrqhkocktxzzyfwixqgg/sql/new')
  console.log('2. Open file: scripts/seed-data-toronto.sql')
  console.log('3. Copy the entire contents')
  console.log('4. Paste into Supabase SQL Editor')
  console.log('5. Click "Run" to execute')
  console.log('6. Repeat for: scripts/seed-data-montreal-quebec.sql\n')

  console.log('✅ Alternatively, if you have PostgreSQL CLI (psql) installed:')
  console.log('   You can connect directly and run the SQL files.\n')

  // Show file paths
  console.log('📁 Seed files ready:')
  console.log(`   - ${path.join(__dirname, 'seed-data-toronto.sql')}`)
  console.log(`   - ${path.join(__dirname, 'seed-data-montreal-quebec.sql')}`)

  await runSeedFile('seed-data-toronto.sql')
  await runSeedFile('seed-data-montreal-quebec.sql')
}

main().catch(console.error)
