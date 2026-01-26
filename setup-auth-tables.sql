-- =============================================================================
-- SUPABASE AUTHENTICATION SETUP FOR SAM.GOV PLATFORM
-- =============================================================================

-- Enable RLS (Row Level Security)
-- This should already be enabled by default in Supabase

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    company_name TEXT,
    naics_codes TEXT[] DEFAULT '{}', -- Array of NAICS codes user is interested in
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create saved_opportunities table
CREATE TABLE IF NOT EXISTS saved_opportunities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    notice_id TEXT NOT NULL,
    title TEXT NOT NULL,
    solicitation_number TEXT,
    naics_code TEXT,
    posted_date DATE,
    deadline TIMESTAMP WITH TIME ZONE,
    department TEXT,
    description TEXT,
    sam_gov_url TEXT,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure user can't save the same opportunity twice
    UNIQUE(user_id, notice_id)
);

-- Enable RLS on tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles 
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles 
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for saved_opportunities  
CREATE POLICY "Users can view own saved opportunities" ON saved_opportunities 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved opportunities" ON saved_opportunities 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved opportunities" ON saved_opportunities 
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_naics ON user_profiles USING gin(naics_codes);
CREATE INDEX IF NOT EXISTS idx_saved_opportunities_user_id ON saved_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_opportunities_naics ON saved_opportunities(naics_code);
CREATE INDEX IF NOT EXISTS idx_saved_opportunities_posted_date ON saved_opportunities(posted_date);

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

-- Insert some common NAICS codes for reference (optional)
-- This is just for documentation - the codes are hardcoded in the frontend
/*
Common NAICS codes for government contracting:
541330 - Engineering Services
541511 - Custom Computer Programming Services  
541512 - Computer Systems Design Services
541513 - Computer Facilities Management Services
541519 - Other Computer Related Services
541611 - Administrative Management and General Management Consulting Services
541612 - Human Resources Consulting Services
541613 - Marketing Consulting Services
541618 - Other Management Consulting Services
541620 - Environmental Consulting Services
541690 - Other Scientific and Technical Consulting Services
561210 - Facilities Support Services
561990 - All Other Support Services
334111 - Electronic Computer Manufacturing
423430 - Computer and Computer Peripheral Equipment and Software Merchant Wholesalers
811219 - Other Electronic and Precision Equipment Repair and Maintenance
*/

-- Grant necessary permissions (Supabase handles this automatically, but for reference)
-- GRANT ALL ON user_profiles TO authenticated;
-- GRANT ALL ON saved_opportunities TO authenticated;