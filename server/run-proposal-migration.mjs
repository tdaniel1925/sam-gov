// =============================================================================
// PROPOSAL MAKER MIGRATION RUNNER
// Runs the proposal maker system migration
// =============================================================================

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  console.log('🚀 Starting Proposal Maker migration...\n');

  // Get database URL from environment
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log('✓ Database URL loaded');

  // Read migration file
  const migrationPath = join(__dirname, 'src', 'db', 'migrations', 'add-proposal-maker-system.sql');
  let migrationSQL;

  try {
    migrationSQL = readFileSync(migrationPath, 'utf8');
    console.log('✓ Migration SQL loaded\n');
  } catch (error) {
    console.error('❌ ERROR: Could not read migration file:', error.message);
    process.exit(1);
  }

  // Connect to database
  const sql = postgres(databaseUrl, {
    ssl: 'require',
    max: 1,
  });

  try {
    console.log('Executing migration...\n');

    // Execute migration
    await sql.unsafe(migrationSQL);

    console.log('✅ Migration completed successfully!\n');
    console.log('Created tables:');
    console.log('  • proposals');
    console.log('  • proposal_sections');
    console.log('  • proposal_requirements');
    console.log('  • past_performance_projects');
    console.log('  • proposal_team_members');
    console.log('  • proposal_content_blocks');
    console.log('  • bid_decisions');
    console.log('  • capability_gaps');
    console.log('  • proposal_cost_items');
    console.log('\n✓ All indexes created');
    console.log('✓ All ENUM types created\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('🎉 Proposal Maker system is ready to use!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
