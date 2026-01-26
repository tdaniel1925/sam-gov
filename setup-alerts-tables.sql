-- =============================================================================
-- EMAIL ALERTS TABLES FOR SAM.GOV PLATFORM
-- =============================================================================

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

-- Create alert_schedules table for tracking when alerts are sent
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

-- Enable RLS on alert tables
ALTER TABLE search_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for search_alerts
CREATE POLICY "Users can view own alerts" ON search_alerts 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own alerts" ON search_alerts 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON search_alerts 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts" ON search_alerts 
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for alert_schedules
CREATE POLICY "Users can view own alert schedules" ON alert_schedules 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM search_alerts 
            WHERE search_alerts.id = alert_schedules.alert_id 
            AND search_alerts.user_id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_search_alerts_user_id ON search_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_search_alerts_enabled ON search_alerts(enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_search_alerts_frequency ON search_alerts(frequency);
CREATE INDEX IF NOT EXISTS idx_search_alerts_naics ON search_alerts USING gin(naics_codes);

CREATE INDEX IF NOT EXISTS idx_alert_schedules_alert_id ON alert_schedules(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_schedules_status ON alert_schedules(status);
CREATE INDEX IF NOT EXISTS idx_alert_schedules_scheduled_for ON alert_schedules(scheduled_for);

-- Trigger to auto-update updated_at on search_alerts
DROP TRIGGER IF EXISTS update_search_alerts_updated_at ON search_alerts;
CREATE TRIGGER update_search_alerts_updated_at
    BEFORE UPDATE ON search_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to get next alert schedule time
CREATE OR REPLACE FUNCTION get_next_alert_time(alert_frequency TEXT, last_sent TIMESTAMP WITH TIME ZONE DEFAULT NULL)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    base_time TIMESTAMP WITH TIME ZONE;
    next_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Use last sent time as base, or current time if never sent
    base_time := COALESCE(last_sent, timezone('utc'::text, now()));
    
    CASE alert_frequency
        WHEN 'daily' THEN
            next_time := base_time + INTERVAL '1 day';
        WHEN 'weekly' THEN
            next_time := base_time + INTERVAL '7 days';
        WHEN 'monthly' THEN
            next_time := base_time + INTERVAL '1 month';
        ELSE
            next_time := base_time + INTERVAL '7 days'; -- Default to weekly
    END CASE;
    
    -- Always schedule for 8 AM UTC (adjust as needed)
    next_time := date_trunc('day', next_time) + INTERVAL '8 hours';
    
    RETURN next_time;
END;
$$ LANGUAGE plpgsql;

-- Function to schedule next alert automatically
CREATE OR REPLACE FUNCTION schedule_next_alert()
RETURNS TRIGGER AS $$
BEGIN
    -- When an alert is created or updated, schedule the next run
    IF (TG_OP = 'INSERT' AND NEW.enabled = true) OR 
       (TG_OP = 'UPDATE' AND NEW.enabled = true AND (OLD.enabled = false OR OLD.frequency != NEW.frequency)) THEN
        
        -- Delete any pending schedules for this alert
        DELETE FROM alert_schedules 
        WHERE alert_id = NEW.id AND status = 'pending';
        
        -- Insert new schedule
        INSERT INTO alert_schedules (alert_id, scheduled_for)
        VALUES (NEW.id, get_next_alert_time(NEW.frequency, NEW.last_sent));
        
    ELSIF TG_OP = 'UPDATE' AND NEW.enabled = false THEN
        -- If alert is disabled, cancel pending schedules
        DELETE FROM alert_schedules 
        WHERE alert_id = NEW.id AND status = 'pending';
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically schedule alerts
DROP TRIGGER IF EXISTS auto_schedule_alerts ON search_alerts;
CREATE TRIGGER auto_schedule_alerts
    AFTER INSERT OR UPDATE ON search_alerts
    FOR EACH ROW
    EXECUTE FUNCTION schedule_next_alert();

-- View for alert dashboard
CREATE OR REPLACE VIEW user_alert_summary AS
SELECT 
    sa.id,
    sa.name,
    sa.naics_codes,
    sa.frequency,
    sa.enabled,
    sa.created_at,
    sa.last_sent,
    sa.opportunities_found,
    CASE 
        WHEN sa.enabled THEN 
            COALESCE(
                (SELECT MIN(scheduled_for) FROM alert_schedules WHERE alert_id = sa.id AND status = 'pending'),
                get_next_alert_time(sa.frequency, sa.last_sent)
            )
        ELSE NULL
    END as next_scheduled,
    (SELECT COUNT(*) FROM alert_schedules WHERE alert_id = sa.id AND status = 'sent') as total_emails_sent
FROM search_alerts sa;

-- Grant permissions
GRANT ALL ON search_alerts TO authenticated;
GRANT ALL ON alert_schedules TO authenticated;
GRANT SELECT ON user_alert_summary TO authenticated;