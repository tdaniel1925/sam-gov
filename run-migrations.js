// Quick script to run database migrations via Supabase
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = 'https://dtcwjaunekcbnrtshgok.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Y3dqYXVuZWtjYm5ydHNoZ29rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTEyODM2OSwiZXhwIjoyMDg0NzA0MzY5fQ.c9Re91kz3xydo5SCiavSjl2LVq0FNTzi0q7tDw-CYUo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  console.log('🔧 Running database migrations...\n');

  try {
    // Read SQL files
    const setupSql = readFileSync(join(__dirname, 'server', 'setup-database.sql'), 'utf-8');
    const featuresSql = readFileSync(join(__dirname, 'server', 'add-new-features.sql'), 'utf-8');

    console.log('📄 Running setup-database.sql...');
    const { data: setupData, error: setupError } = await supabase.rpc('exec_sql', {
      sql: setupSql
    });

    if (setupError) {
      console.error('❌ Error running setup:', setupError.message);

      // Try alternative approach - check if tables exist
      console.log('\n🔍 Checking if tables already exist...');
      const { data: tables, error: checkError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['saved_opportunities', 'notification_subscriptions', 'discovered_opportunities', 'company_profile']);

      if (!checkError && tables) {
        console.log('✅ Found existing tables:', tables.map(t => t.table_name).join(', '));
      }
    } else {
      console.log('✅ Setup SQL completed');
    }

    console.log('\n📄 Running add-new-features.sql...');
    const { data: featuresData, error: featuresError } = await supabase.rpc('exec_sql', {
      sql: featuresSql
    });

    if (featuresError) {
      console.error('❌ Error running features migration:', featuresError.message);
    } else {
      console.log('✅ Features SQL completed');
    }

    // Verify tables exist
    console.log('\n🔍 Verifying database tables...');
    const { data: verification, error: verifyError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');

    if (!verifyError && verification) {
      const tableNames = verification.map(t => t.tablename);
      console.log('\n✅ Tables in database:', tableNames.join(', '));

      const requiredTables = ['saved_opportunities', 'notification_subscriptions', 'discovered_opportunities', 'company_profile'];
      const missingTables = requiredTables.filter(t => !tableNames.includes(t));

      if (missingTables.length === 0) {
        console.log('\n🎉 All required tables exist!');
      } else {
        console.log('\n⚠️  Missing tables:', missingTables.join(', '));
        console.log('\n📝 Please run the SQL files manually in Supabase SQL Editor:');
        console.log('   https://supabase.com/dashboard/project/dtcwjaunekcbnrtshgok/sql/new');
      }
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.log('\n📝 Please run the SQL files manually in Supabase SQL Editor:');
    console.log('   1. https://supabase.com/dashboard/project/dtcwjaunekcbnrtshgok/sql/new');
    console.log('   2. Copy contents of server/setup-database.sql and run');
    console.log('   3. Copy contents of server/add-new-features.sql and run');
  }
}

runMigrations();
