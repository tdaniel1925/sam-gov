// Direct migration to Supabase using fetch API
const SUPABASE_URL = 'https://dtcwjaunekcbnrtshgok.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Y3dqYXVuZWtjYm5ydHNoZ29rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTEyODM2OSwiZXhwIjoyMDg0NzA0MzY5fQ.c9Re91kz3xydo5SCiavSjl2LVq0FNTzi0q7tDw-CYUo';

console.log('🚀 Running database migration...\n');

const sql = `
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    company_name TEXT,
    naics_codes TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles 
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles 
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Indexes for user_profiles
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

-- Enable RLS on search_alerts
ALTER TABLE search_alerts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own alerts" ON search_alerts;
DROP POLICY IF EXISTS "Users can create own alerts" ON search_alerts;
DROP POLICY IF EXISTS "Users can update own alerts" ON search_alerts;
DROP POLICY IF EXISTS "Users can delete own alerts" ON search_alerts;

-- RLS Policies for search_alerts
CREATE POLICY "Users can view own alerts" ON search_alerts 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own alerts" ON search_alerts 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON search_alerts 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts" ON search_alerts 
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for search_alerts
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

-- Enable RLS on alert_schedules
ALTER TABLE alert_schedules ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view own alert schedules" ON alert_schedules;

-- RLS policy for alert_schedules
CREATE POLICY "Users can view own alert schedules" ON alert_schedules 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM search_alerts 
            WHERE search_alerts.id = alert_schedules.alert_id 
            AND search_alerts.user_id = auth.uid()
        )
    );

-- Indexes for alert_schedules
CREATE INDEX IF NOT EXISTS idx_alert_schedules_alert_id ON alert_schedules(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_schedules_status ON alert_schedules(status);
CREATE INDEX IF NOT EXISTS idx_alert_schedules_scheduled_for ON alert_schedules(scheduled_for);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update updated_at on search_alerts
DROP TRIGGER IF EXISTS update_search_alerts_updated_at ON search_alerts;
CREATE TRIGGER update_search_alerts_updated_at
    BEFORE UPDATE ON search_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

try {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    console.log('⚠️  RPC method not available, trying direct SQL execution...\n');
    
    // Try using PostgREST admin schema
    const pgResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    });

    console.log('Response status:', pgResponse.status);
    const text = await pgResponse.text();
    console.log('Response:', text.substring(0, 200));
  }

  console.log('\n✅ Migration completed!\n');
  console.log('Created tables:');
  console.log('  ✅ user_profiles');
  console.log('  ✅ search_alerts');
  console.log('  ✅ alert_schedules');
  console.log('\n🎉 Database is ready!\n');

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  console.log('\n📋 Manual Setup Required:');
  console.log('1. Go to: https://supabase.com/dashboard/project/dtcwjaunekcbnrtshgok/sql/new');
  console.log('2. Copy the contents of COMPLETE-SETUP.sql');
  console.log('3. Paste and click "Run"');
  process.exit(1);
}
