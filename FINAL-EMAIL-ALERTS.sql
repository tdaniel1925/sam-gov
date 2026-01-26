-- =============================================================================
-- FINAL EMAIL ALERTS MIGRATION - RUN THIS IN SUPABASE DASHBOARD
-- =============================================================================
-- Go to: https://supabase.com/dashboard/project/dtcwjaunekcbnrtshgok/sql/new
-- Copy this entire file, paste it, and click "Run"
-- =============================================================================

-- Create the main email alerts table
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

-- Enable Row Level Security (RLS)
ALTER TABLE search_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies so users can only access their own alerts
CREATE POLICY "Users can view own alerts" ON search_alerts 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own alerts" ON search_alerts 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON search_alerts 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts" ON search_alerts 
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_search_alerts_user_id ON search_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_search_alerts_enabled ON search_alerts(enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_search_alerts_frequency ON search_alerts(frequency);
CREATE INDEX IF NOT EXISTS idx_search_alerts_naics ON search_alerts USING gin(naics_codes);

-- Create optional alert_schedules table for tracking when emails are sent
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

-- Enable RLS on schedules table
ALTER TABLE alert_schedules ENABLE ROW LEVEL SECURITY;

-- RLS policy for schedules (users can view schedules for their alerts)
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

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to auto-update updated_at field
DROP TRIGGER IF EXISTS update_search_alerts_updated_at ON search_alerts;
CREATE TRIGGER update_search_alerts_updated_at
    BEFORE UPDATE ON search_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- VERIFICATION QUERIES (Optional - run these to test the tables)
-- =============================================================================

-- Test 1: Check if tables exist
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name IN ('search_alerts', 'alert_schedules') 
AND table_schema = 'public';

-- Test 2: Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('search_alerts', 'alert_schedules');

-- Test 3: List all policies
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('search_alerts', 'alert_schedules');

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================
-- If this SQL runs without errors, your email alerts system is ready!
-- Users can now create, manage, and schedule email alerts in the dashboard.
-- =============================================================================