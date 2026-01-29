import postgres from 'postgres';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

console.log('🚀 Connecting to database...\n');

const sql = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 1,
});

const migrationSQL = `
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    company_name TEXT,
    naics_codes TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_naics ON user_profiles USING gin(naics_codes);

-- Create search_alerts table
CREATE TABLE IF NOT EXISTS search_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    naics_codes TEXT[] NOT NULL DEFAULT '{}',
    frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly')) NOT NULL DEFAULT 'weekly',
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_sent TIMESTAMP WITH TIME ZONE,
    opportunities_found INTEGER DEFAULT 0
);

ALTER TABLE search_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own alerts" ON search_alerts;
DROP POLICY IF EXISTS "Users can create own alerts" ON search_alerts;
DROP POLICY IF EXISTS "Users can update own alerts" ON search_alerts;
DROP POLICY IF EXISTS "Users can delete own alerts" ON search_alerts;

CREATE POLICY "Users can view own alerts" ON search_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own alerts" ON search_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON search_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own alerts" ON search_alerts FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_search_alerts_user_id ON search_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_search_alerts_enabled ON search_alerts(enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_search_alerts_frequency ON search_alerts(frequency);
CREATE INDEX IF NOT EXISTS idx_search_alerts_naics ON search_alerts USING gin(naics_codes);

-- Create alert_schedules table
CREATE TABLE IF NOT EXISTS alert_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_id UUID REFERENCES search_alerts(id) ON DELETE CASCADE NOT NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'sent', 'failed')) NOT NULL DEFAULT 'pending',
    opportunities_found INTEGER DEFAULT 0,
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE alert_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own alert schedules" ON alert_schedules;

CREATE POLICY "Users can view own alert schedules" ON alert_schedules FOR SELECT USING (
    EXISTS (SELECT 1 FROM search_alerts WHERE search_alerts.id = alert_schedules.alert_id AND search_alerts.user_id = auth.uid())
);

CREATE INDEX IF NOT EXISTS idx_alert_schedules_alert_id ON alert_schedules(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_schedules_status ON alert_schedules(status);
CREATE INDEX IF NOT EXISTS idx_alert_schedules_scheduled_for ON alert_schedules(scheduled_for);

-- Function and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = timezone('utc'::text, now()); RETURN NEW; END; $$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_search_alerts_updated_at ON search_alerts;
CREATE TRIGGER update_search_alerts_updated_at BEFORE UPDATE ON search_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

try {
  console.log('📋 Running migration...\n');
  
  await sql.unsafe(migrationSQL);
  
  console.log('✅ Migration completed successfully!\n');
  
  const tables = await sql`
    SELECT table_name FROM information_schema.tables 
    WHERE table_name IN ('user_profiles', 'search_alerts', 'alert_schedules')
    AND table_schema = 'public'
    ORDER BY table_name
  `;
  
  console.log('📊 Created tables:');
  tables.forEach(t => console.log(`  ✅ ${t.table_name}`));
  console.log('\n🎉 Database is ready!\n');
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  if (error.code) console.error('Error code:', error.code);
  process.exit(1);
} finally {
  await sql.end();
}
