// =============================================================================
// SIMPLE MIGRATION RUNNER
// Uses postgres client directly
// =============================================================================

import postgres from 'postgres';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Missing DATABASE_URL in .env.local');
  process.exit(1);
}

async function runMigration() {
  console.log('🔧 Running freemium tier system migration...\n');

  const sql = postgres(databaseUrl);

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'src', 'db', 'migrations', 'add-freemium-tier-system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log('🚀 Executing SQL migration...\n');

    // Execute migration
    await sql.unsafe(migrationSQL);

    console.log('✅ Migration executed successfully!\n');
    console.log('📊 Changes applied:');
    console.log('   • Created user_tier enum (free, paid)');
    console.log('   • Added tier column to users table');
    console.log('   • Added daily_searches_used column');
    console.log('   • Added last_search_date column');
    console.log('   • Added setup_fee_paid column');
    console.log('   • Created user_payments table');
    console.log('   • Created indexes for performance');

    await sql.end();

  } catch (error) {
    console.error('❌ Failed to run migration:', error.message);
    await sql.end();
    process.exit(1);
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('\n✅ Migration complete!');
    console.log('🎯 Next step: Re-run create-demo-user.mjs');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
