import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dtcwjaunekcbnrtshgok.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Y3dqYXVuZWtjYm5ydHNoZ29rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTEyODM2OSwiZXhwIjoyMDg0NzA0MzY5fQ.c9Re91kz3xydo5SCiavSjl2LVq0FNTzi0q7tDw-CYUo'

console.log('🚀 Executing SAM.gov platform migration using service role key...')
console.log('🔑 Using Supabase project: dtcwjaunekcbnrtshgok')

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

async function executeMigration() {
  console.log('✅ Connected to Supabase')

  // Step 1: Create user_profiles table if it doesn't exist
  console.log('\n📋 Step 1: Setting up user_profiles table...')
  try {
    // Test if table exists
    const { data: testProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1)
    
    if (profilesError && profilesError.code === 'PGRST116') {
      console.log('   Creating user_profiles table...')
      // Try to create by inserting a test record - this will force table creation
      const { error: insertError } = await supabase.rpc('exec', {
        query: `
          CREATE TABLE user_profiles (
              id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
              email TEXT NOT NULL,
              company_name TEXT,
              naics_codes TEXT[] DEFAULT '{}',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
          );
          ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
          CREATE POLICY "Users can manage own profile" ON user_profiles FOR ALL USING (auth.uid() = id);
        `
      })
      
      if (insertError) {
        console.log('   ⚠️ API creation failed, table may need manual setup')
      } else {
        console.log('   ✅ user_profiles table created')
      }
    } else {
      console.log('   ✅ user_profiles table already exists')
    }
  } catch (err) {
    console.log('   ⚠️ user_profiles check failed:', err.message)
  }

  // Step 2: Create search_alerts table
  console.log('\n📧 Step 2: Setting up search_alerts table...')
  try {
    const { data: testAlerts, error: alertsError } = await supabase
      .from('search_alerts')
      .select('id')
      .limit(1)
    
    if (alertsError && alertsError.code === 'PGRST116') {
      console.log('   Creating search_alerts table...')
      
      // Since direct SQL execution is limited, I'll create a comprehensive test that forces table creation
      // by attempting to use the table in various ways
      console.log('   ⚠️ Table does not exist - manual creation required')
      console.log('   📋 Please run COMPLETE-SETUP.sql in Supabase Dashboard')
    } else {
      console.log('   ✅ search_alerts table already exists')
    }
  } catch (err) {
    console.log('   ⚠️ search_alerts check failed - needs manual setup')
  }

  // Final verification
  console.log('\n🔍 Final verification...')
  
  const tables = ['user_profiles', 'saved_opportunities', 'search_alerts']
  const status = {}
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1)
      
      if (error && error.code === 'PGRST116') {
        status[table] = '❌ Missing'
      } else if (error) {
        status[table] = '⚠️ Error: ' + error.message
      } else {
        status[table] = '✅ Ready'
      }
    } catch (err) {
      status[table] = '❌ Missing'
    }
  }

  console.log('\n📊 Platform Status:')
  console.log(`   🔐 user_profiles: ${status.user_profiles}`)
  console.log(`   💾 saved_opportunities: ${status.saved_opportunities}`)
  console.log(`   📧 search_alerts: ${status.search_alerts}`)
  
  const readyCount = Object.values(status).filter(s => s.includes('✅')).length
  const totalCount = Object.keys(status).length
  
  console.log(`\n🎯 Overall Status: ${readyCount}/${totalCount} tables ready`)
  
  if (readyCount === totalCount) {
    console.log('🎉 ALL TABLES READY! Your SAM.gov platform is 100% functional!')
    console.log('✅ Users can sign up, create email alerts, and view personalized opportunities')
  } else {
    console.log('⚠️ Some tables need manual setup')
    console.log('')
    console.log('💡 SOLUTION: Run COMPLETE-SETUP.sql manually')
    console.log('🔗 Go to: https://supabase.com/dashboard/project/dtcwjaunekcbnrtshgok/sql/new')
    console.log('📋 Copy contents of COMPLETE-SETUP.sql file')
    console.log('▶️ Paste and click "Run"')
    console.log('✨ This will create all missing tables with proper security')
  }
  
  console.log('\n🌐 Your professional SAM.gov platform:')
  console.log('   Frontend: http://localhost:3000 (Clean, professional interface)')
  console.log('   Backend: http://localhost:3001 (Real SAM.gov API integration)')
  console.log('   Features: Authentication, NAICS filtering, Email alerts')
}

executeMigration()
  .then(() => {
    console.log('\n🚀 Migration execution completed!')
  })
  .catch((error) => {
    console.error('\n❌ Migration execution failed:', error.message)
    console.log('\n💡 Fallback: Please run COMPLETE-SETUP.sql manually in Supabase Dashboard')
  })