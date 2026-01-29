import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

console.log('Testing database connection...');
console.log('Database host:', databaseUrl.split('@')[1]?.split(':')[0] || 'unknown');

const sql = postgres(databaseUrl, {
  max: 1,
  ssl: 'require',
  connection: {
    application_name: 'db-test'
  }
});

try {
  const result = await sql`SELECT NOW() as current_time, version() as version`;
  console.log('✅ Database connection successful!');
  console.log('Current time:', result[0].current_time);
  console.log('PostgreSQL version:', result[0].version.split(' ')[0] + ' ' + result[0].version.split(' ')[1]);

  // Test if we can query a table
  try {
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      LIMIT 5
    `;
    console.log(`\n✅ Found ${tables.length} tables in public schema`);
    tables.forEach(t => console.log(`  - ${t.table_name}`));
  } catch (err) {
    console.error('\n⚠️  Could not query tables:', err.message);
  }

} catch (error) {
  console.error('❌ Database connection failed!');
  console.error('Error:', error.message);
  console.error('Code:', error.code);
  if (error.code === 'XX000') {
    console.error('\n💡 This "Tenant or user not found" error usually means:');
    console.error('   1. The Supabase project is paused (check Supabase dashboard)');
    console.error('   2. The DATABASE_URL is incorrect');
    console.error('   3. The database password/JWT token expired');
  }
} finally {
  await sql.end();
}
