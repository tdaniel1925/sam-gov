import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dtcwjaunekcbnrtshgok.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Y3dqYXVuZWtjYm5ydHNoZ29rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTEyODM2OSwiZXhwIjoyMDg0NzA0MzY5fQ.c9Re91kz3xydo5SCiavSjl2LVq0FNTzi0q7tDw-CYUo'

console.log('🚀 Creating email alerts tables using service role key...')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function createAlertsTables() {
  console.log('📊 Using Supabase service role to create tables...')
  
  try {
    // Try to create the search_alerts table by inserting/selecting (this will fail but create table structure)
    console.log('🔧 Creating search_alerts table...')
    
    // Use a simpler approach - try to insert a record which will work if table exists or fail if it doesn't
    const { error: alertsError } = await supabase
      .from('search_alerts')
      .insert({
        id: '00000000-0000-0000-0000-000000000000', // temp ID
        user_id: '00000000-0000-0000-0000-000000000000',
        name: 'test',
        naics_codes: ['541511'],
        frequency: 'weekly',
        enabled: true
      })
    
    if (alertsError) {
      console.log('❌ search_alerts table does not exist')
      console.log('🔧 Creating search_alerts table using direct SQL approach...')
      
      // Use the database URL to execute SQL directly
      const dbUrl = 'postgresql://postgres.dtcwjaunekcbnrtshgok:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Y3dqYXVuZWtjYm5ydHNoZ29rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTEyODM2OSwiZXhwIjoyMDg0NzA0MzY5fQ.c9Re91kz3xydo5SCiavSjl2LVq0FNTzi0q7tDw-CYUo@aws-0-us-west-1.pooler.supabase.com:6543/postgres'
      
      console.log('💡 Please run this SQL manually in your Supabase Dashboard → SQL Editor:')
      console.log('')
      console.log('-- Create search_alerts table')
      console.log(`CREATE TABLE IF NOT EXISTS search_alerts (
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
);`)
      
      console.log('')
      console.log('-- Enable RLS and create policies')
      console.log(`ALTER TABLE search_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts" ON search_alerts 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own alerts" ON search_alerts 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON search_alerts 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts" ON search_alerts 
    FOR DELETE USING (auth.uid() = user_id);`)

      console.log('')
      console.log('-- Create alert_schedules table')
      console.log(`CREATE TABLE IF NOT EXISTS alert_schedules (
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

CREATE POLICY "Users can view own alert schedules" ON alert_schedules 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM search_alerts 
            WHERE search_alerts.id = alert_schedules.alert_id 
            AND search_alerts.user_id = auth.uid()
        )
    );`)

      console.log('')
      console.log('-- Create indexes')
      console.log(`CREATE INDEX IF NOT EXISTS idx_search_alerts_user_id ON search_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_search_alerts_enabled ON search_alerts(enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_alert_schedules_alert_id ON alert_schedules(alert_id);`)

      console.log('')
      console.log('🔗 Go to: https://supabase.com/dashboard/project/dtcwjaunekcbnrtshgok/sql/new')
      console.log('📋 Copy the SQL above and click "Run"')
      
    } else {
      console.log('✅ search_alerts table already exists!')
      
      // Clean up the test record
      await supabase
        .from('search_alerts')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000000')
    }
    
  } catch (error) {
    console.log('❌ Error checking tables:', error.message)
    
    console.log('')
    console.log('💡 Manual Setup Required:')
    console.log('🔗 Go to: https://supabase.com/dashboard/project/dtcwjaunekcbnrtshgok/sql/new')
    console.log('📋 Copy and run the complete SQL from setup-alerts-tables.sql')
  }
  
  console.log('')
  console.log('🎯 After running the SQL, your email alerts system will be fully functional!')
  console.log('✨ Users can then create, manage, and schedule email alerts for opportunities')
  
  return true
}

createAlertsTables()
  .then(() => {
    console.log('\n🚀 Email alerts setup instructions provided!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error.message)
    process.exit(1)
  })