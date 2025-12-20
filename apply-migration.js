/**
 * Apply Supabase migration directly to the database
 * This script reads the migration file and executes it using the Supabase client
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  try {
    console.log('📦 Reading migration file...')
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20251105000000_fix_user_signup_trigger.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('🚀 Applying migration to Supabase database...')
    console.log('   URL:', supabaseUrl)
    console.log('')

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      console.error('❌ Migration failed:', error.message)
      console.error('')
      console.error('⚠️  The exec_sql function may not exist in your database.')
      console.error('   Please apply this migration manually using the Supabase Dashboard:')
      console.error('')
      console.error('   1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/editor')
      console.error('   2. Open SQL Editor')
      console.error('   3. Copy and paste the contents of:')
      console.error('      supabase/migrations/20251105000000_fix_user_signup_trigger.sql')
      console.error('   4. Click "Run"')
      console.error('')
      process.exit(1)
    }

    console.log('✅ Migration applied successfully!')
    console.log('')
    console.log('📋 What was changed:')
    console.log('   ✓ Created/verified Default Organization')
    console.log('   ✓ Created handle_new_user() function')
    console.log('   ✓ Created trigger on auth.users table')
    console.log('   ✓ Granted necessary permissions')
    console.log('')
    console.log('🎉 New users can now sign up without database errors!')
    console.log('')

  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
    console.error('')
    console.error('⚠️  Please apply the migration manually:')
    console.error('')
    console.error('   1. Go to https://supabase.com/dashboard')
    console.error('   2. Select your project')
    console.error('   3. Go to SQL Editor')
    console.error('   4. Copy and paste the contents of:')
    console.error('      supabase/migrations/20251105000000_fix_user_signup_trigger.sql')
    console.error('   5. Click "Run"')
    console.error('')
    process.exit(1)
  }
}

applyMigration()
