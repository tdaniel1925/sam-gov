// =============================================================================
// RUN DATABASE MIGRATION SCRIPT
// Runs the freemium tier system migration
// =============================================================================

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  console.log('🔧 Running freemium tier system migration...\n');

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'src', 'db', 'migrations', 'add-freemium-tier-system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log('🚀 Executing SQL migration...\n');

    // Execute migration using Supabase's raw SQL API
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL }).catch(async () => {
      // If rpc doesn't exist, try using the REST API directly
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({ sql: migrationSQL }),
      });

      if (!response.ok) {
        // Try using pg_meta instead (Supabase SQL Editor API)
        console.log('⚠️  Standard RPC not available, using direct SQL execution...');

        const metaResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: migrationSQL,
          }),
        });

        if (!metaResponse.ok) {
          throw new Error(`Failed to execute migration: ${await metaResponse.text()}`);
        }

        return { data: await metaResponse.json(), error: null };
      }

      return { data: await response.json(), error: null };
    });

    if (error) {
      console.error('❌ Migration error:', error);
      throw error;
    }

    console.log('✅ Migration executed successfully!\n');
    console.log('📊 Changes applied:');
    console.log('   • Created user_tier enum (free, paid)');
    console.log('   • Added tier column to users table');
    console.log('   • Added daily_searches_used column');
    console.log('   • Added last_search_date column');
    console.log('   • Added setup_fee_paid column');
    console.log('   • Created user_payments table');
    console.log('   • Created indexes for performance');

  } catch (error) {
    console.error('❌ Failed to run migration:', error.message);
    console.log('\n💡 Alternative: Run the SQL manually in Supabase SQL Editor:');
    console.log('   1. Go to https://supabase.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Go to SQL Editor');
    console.log('   4. Copy and paste the SQL from:');
    console.log('      server/src/db/migrations/add-freemium-tier-system.sql');
    process.exit(1);
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('\n✅ Migration complete!');
    console.log('🎯 Next step: Re-run the demo user creation script');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
