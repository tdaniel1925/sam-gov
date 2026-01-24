import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;

async function applyMigration() {
  const sql = postgres(connectionString, {
    ssl: 'require',
    max: 1,
  });

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'drizzle', '0000_bizarre_dazzler.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Applying migration to Supabase...');
    console.log('Connection string:', connectionString.replace(/:[^:@]+@/, ':****@'));

    // Split by statement breakpoint and execute each statement
    const statements = migrationSQL
      .split('-->statement-breakpoint')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await sql.unsafe(statement);
      }
    }

    console.log('✅ Migration applied successfully!');

    // Verify tables were created
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('saved_opportunities', 'notification_subscriptions')
    `;

    console.log('\n📊 Tables created:');
    tables.forEach((table: any) => {
      console.log(`  - ${table.table_name}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

applyMigration().catch(console.error);
