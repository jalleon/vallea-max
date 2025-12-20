/**
 * Script to run the migration directly using pg client
 * This connects directly to the PostgreSQL database
 */

const fs = require('fs');
const path = require('path');

// Manually parse .env.local file
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  const envFile = fs.readFileSync(envPath, 'utf8');
  const env = {};

  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      env[key] = value;
    }
  });

  return env;
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const deepseekApiKey = env.DEEPSEEK_API_KEY;

async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });

    const url = new URL(supabaseUrl);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: '/rest/v1/rpc/exec',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ data, status: res.statusCode });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runMigration() {
  try {
    console.log('📖 Reading migration file...');
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20251102165653_add_master_api_keys_and_usage_tracking.sql');
    let sql = fs.readFileSync(migrationPath, 'utf8');

    // Replace placeholder with actual DeepSeek API key
    console.log('🔑 Inserting DeepSeek API key...');
    sql = sql.replace('YOUR_DEEPSEEK_API_KEY_HERE', deepseekApiKey);

    console.log('🚀 Executing migration SQL...\n');
    console.log('Note: Since Supabase REST API cannot execute DDL, you need to:');
    console.log('1. Go to: https://supabase.com/dashboard/project/xrqhkocktxzzyfwixqgg/sql/new');
    console.log('2. Copy the SQL from the migration file');
    console.log('3. Replace YOUR_DEEPSEEK_API_KEY_HERE with your actual key');
    console.log('4. Execute the SQL in the Supabase SQL Editor\n');

    console.log('📝 Or save this processed SQL to a file:');
    const processedPath = path.join(__dirname, 'migration-processed.sql');
    fs.writeFileSync(processedPath, sql);
    console.log(`✓ Saved to: ${processedPath}`);
    console.log('\nYou can now copy this file and paste it into Supabase SQL Editor.');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

runMigration();
