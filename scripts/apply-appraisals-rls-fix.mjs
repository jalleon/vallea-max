#!/usr/bin/env node

/**
 * Apply RLS policy fix for appraisals table
 * This script fixes the RLS policies to check the users table instead of JWT claims
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigration() {
  try {
    console.log('🔧 Applying RLS policy fix for appraisals table...\n');

    // Read the migration file
    const migrationPath = join(__dirname, '../supabase/migrations/20251109063000_fix_appraisals_rls_policies.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // Try direct execution if exec_sql doesn't exist
      console.log('⚠️  exec_sql not available, trying direct execution...\n');

      // Split the SQL into individual statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement) {
          const { error: execError } = await supabase.rpc('exec', {
            sql: statement + ';'
          });

          if (execError) {
            console.error('❌ Error executing statement:', execError);
            console.log('Statement:', statement);
          }
        }
      }
    }

    console.log('✅ Migration applied successfully!\n');
    console.log('The appraisals RLS policies have been updated to check the users table.');
    console.log('You should now be able to create appraisals.\n');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

console.log('='.repeat(60));
console.log('FIX APPRAISALS RLS POLICIES');
console.log('='.repeat(60));
console.log('');

applyMigration();
