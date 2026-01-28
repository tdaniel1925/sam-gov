import postgres from 'postgres';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, 'server', '.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in server/.env.local');
  process.exit(1);
}

console.log('🚀 Running complete setup migration...\n');

const sql = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 1,
});

try {
  // Read the SQL file
  const sqlContent = fs.readFileSync(join(__dirname, 'COMPLETE-SETUP.sql'), 'utf8');

  // Execute the SQL
  await sql.unsafe(sqlContent);

  console.log('✅ Migration completed successfully!\n');

  // Verify tables were created
  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_name IN ('user_profiles', 'search_alerts', 'alert_schedules')
    AND table_schema = 'public'
    ORDER BY table_name
  `;

  console.log('📊 Created tables:');
  tables.forEach(t => console.log(`  ✅ ${t.table_name}`));

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
} finally {
  await sql.end();
}
