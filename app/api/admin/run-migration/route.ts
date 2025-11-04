/**
 * Admin API Route to run database migration
 * WARNING: This is a one-time use endpoint for deploying the master API keys migration
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Read the processed migration SQL
    const migrationPath = path.join(process.cwd(), 'migration-processed.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Create Supabase client with service role
    const supabase = await createClient();

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^={5,}/));

    const results = [];
    const errors = [];

    console.log(`Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();

      // Skip empty or comment-only statements
      if (!statement || statement.startsWith('--')) {
        continue;
      }

      console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);
      console.log(statement.substring(0, 100) + '...');

      try {
        // Execute each statement using raw SQL query
        const { data, error } = await supabase.rpc('exec', {
          sql_query: statement + ';'
        });

        if (error) {
          console.error(`Error in statement ${i + 1}:`, error);
          errors.push({
            statement: i + 1,
            error: error.message,
            sql: statement.substring(0, 200)
          });
        } else {
          console.log(`✓ Statement ${i + 1} executed successfully`);
          results.push({
            statement: i + 1,
            success: true
          });
        }
      } catch (err) {
        console.error(`Exception in statement ${i + 1}:`, err);
        errors.push({
          statement: i + 1,
          error: err instanceof Error ? err.message : 'Unknown error',
          sql: statement.substring(0, 200)
        });
      }
    }

    // Verify the tables were created
    console.log('\nVerifying tables...');
    const { data: apiKeys, error: apiKeysError } = await supabase
      .from('admin_api_keys')
      .select('*')
      .limit(5);

    const { data: usageTracking, error: usageError } = await supabase
      .from('usage_tracking')
      .select('*')
      .limit(1);

    return NextResponse.json({
      success: errors.length === 0,
      executedStatements: results.length,
      errors: errors,
      verification: {
        admin_api_keys: {
          exists: !apiKeysError,
          records: apiKeys?.length || 0,
          error: apiKeysError?.message
        },
        usage_tracking: {
          exists: !usageError,
          error: usageError?.message
        }
      }
    });

  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
