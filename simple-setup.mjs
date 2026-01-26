import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dtcwjaunekcbnrtshgok.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Y3dqYXVuZWtjYm5ydHNoZ29rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTEyODM2OSwiZXhwIjoyMDg0NzA0MzY5fQ.c9Re91kz3xydo5SCiavSjl2LVq0FNTzi0q7tDw-CYUo'

console.log('🚀 Setting up essential tables for authentication...')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function setupTables() {
  // Test if user_profiles exists by trying to query it
  console.log('🔍 Checking if user_profiles table exists...')
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1)
    
    if (error && error.code === 'PGRST116') {
      console.log('❌ user_profiles table does not exist')
      console.log('📋 Please run this SQL in your Supabase Dashboard → SQL Editor:')
      console.log('')
      console.log(`-- Create user_profiles table
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    company_name TEXT,
    naics_codes TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON user_profiles 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles 
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles 
    FOR INSERT WITH CHECK (auth.uid() = id);`)
    } else {
      console.log('✅ user_profiles table exists!')
    }
  } catch (err) {
    console.log('❌ Error checking user_profiles:', err.message)
  }
  
  // Test saved_opportunities
  console.log('\n🔍 Checking if saved_opportunities table exists...')
  
  try {
    const { data, error } = await supabase
      .from('saved_opportunities')
      .select('id')
      .limit(1)
    
    if (error && error.code === 'PGRST116') {
      console.log('❌ saved_opportunities table does not exist')
      console.log('📋 Please also create this table:')
      console.log('')
      console.log(`-- Create saved_opportunities table
CREATE TABLE saved_opportunities (
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
    UNIQUE(user_id, notice_id)
);

-- Enable RLS
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own saved opportunities" ON saved_opportunities 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved opportunities" ON saved_opportunities 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved opportunities" ON saved_opportunities 
    FOR DELETE USING (auth.uid() = user_id);`)
    } else {
      console.log('✅ saved_opportunities table exists!')
    }
  } catch (err) {
    console.log('❌ Error checking saved_opportunities:', err.message)
  }
  
  console.log('\n🌟 Next Steps:')
  console.log('1. 📋 Copy the SQL above and paste it in your Supabase Dashboard → SQL Editor')
  console.log('2. ▶️ Click "Run" to create the tables')
  console.log('3. 🎯 Then test your app at http://localhost:3000')
  console.log('')
  console.log('🔗 Supabase Dashboard: https://supabase.com/dashboard/project/dtcwjaunekcbnrtshgok')
}

setupTables()
  .then(() => {
    console.log('\n✨ Setup check completed!')
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error.message)
  })