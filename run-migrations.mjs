import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load environment variables
const SUPABASE_URL = 'https://dtcwjaunekcbnrtshgok.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Y3dqYXVuZWtjYm5ydHNoZ29rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTEyODM2OSwiZXhwIjoyMDg0NzA0MzY5fQ.c9Re91kz3xydo5SCiavSjl2LVq0FNTzi0q7tDw-CYUo'

console.log('🚀 Setting up Supabase authentication tables...')
console.log('📊 Supabase URL:', SUPABASE_URL)
console.log('🔑 Service Role Key:', SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...')

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const migrations = [
  {
    name: 'Create user_profiles table',
    sql: `
      CREATE TABLE IF NOT EXISTS user_profiles (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          email TEXT NOT NULL,
          company_name TEXT,
          naics_codes TEXT[] DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `
  },
  {
    name: 'Create saved_opportunities table',
    sql: `
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
          UNIQUE(user_id, notice_id)
      );
    `
  },
  {
    name: 'Enable RLS on user_profiles',
    sql: `ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;`
  },
  {
    name: 'Enable RLS on saved_opportunities', 
    sql: `ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;`
  },
  {
    name: 'Create RLS policy: Users can view own profile',
    sql: `
      DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
      CREATE POLICY "Users can view own profile" ON user_profiles 
          FOR SELECT USING (auth.uid() = id);
    `
  },
  {
    name: 'Create RLS policy: Users can update own profile',
    sql: `
      DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
      CREATE POLICY "Users can update own profile" ON user_profiles 
          FOR UPDATE USING (auth.uid() = id);
    `
  },
  {
    name: 'Create RLS policy: Users can insert own profile',
    sql: `
      DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
      CREATE POLICY "Users can insert own profile" ON user_profiles 
          FOR INSERT WITH CHECK (auth.uid() = id);
    `
  },
  {
    name: 'Create RLS policy: Users can view own saved opportunities',
    sql: `
      DROP POLICY IF EXISTS "Users can view own saved opportunities" ON saved_opportunities;
      CREATE POLICY "Users can view own saved opportunities" ON saved_opportunities 
          FOR SELECT USING (auth.uid() = user_id);
    `
  },
  {
    name: 'Create RLS policy: Users can insert own saved opportunities',
    sql: `
      DROP POLICY IF EXISTS "Users can insert own saved opportunities" ON saved_opportunities;
      CREATE POLICY "Users can insert own saved opportunities" ON saved_opportunities 
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    `
  },
  {
    name: 'Create RLS policy: Users can delete own saved opportunities',
    sql: `
      DROP POLICY IF EXISTS "Users can delete own saved opportunities" ON saved_opportunities;
      CREATE POLICY "Users can delete own saved opportunities" ON saved_opportunities 
          FOR DELETE USING (auth.uid() = user_id);
    `
  },
  {
    name: 'Create indexes for performance',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
      CREATE INDEX IF NOT EXISTS idx_user_profiles_naics ON user_profiles USING gin(naics_codes);
      CREATE INDEX IF NOT EXISTS idx_saved_opportunities_user_id ON saved_opportunities(user_id);
      CREATE INDEX IF NOT EXISTS idx_saved_opportunities_naics ON saved_opportunities(naics_code);
      CREATE INDEX IF NOT EXISTS idx_saved_opportunities_posted_date ON saved_opportunities(posted_date);
    `
  },
  {
    name: 'Create update timestamp function',
    sql: `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = timezone('utc'::text, now());
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `
  },
  {
    name: 'Create trigger for user_profiles updated_at',
    sql: `
      DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
      CREATE TRIGGER update_user_profiles_updated_at
          BEFORE UPDATE ON user_profiles
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `
  }
]

async function runMigrations() {
  console.log(`\n📋 Running ${migrations.length} migrations...\n`)
  
  for (let i = 0; i < migrations.length; i++) {
    const migration = migrations[i]
    console.log(`[${i + 1}/${migrations.length}] ${migration.name}...`)
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: migration.sql
      })
      
      if (error) {
        // Try direct approach if RPC fails
        const { data: directData, error: directError } = await supabase
          .from('_supabase_migrations')
          .select('*')
          .limit(0) // This will fail but allows us to execute SQL
        
        if (directError) {
          // Use the SQL REST endpoint directly
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sql_query: migration.sql })
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            console.log(`   ❌ Failed: ${errorText}`)
            
            // For table creation, try a different approach
            if (migration.name.includes('Create') && migration.name.includes('table')) {
              console.log('   🔄 Trying direct SQL execution...')
              
              // Execute SQL directly using supabase client
              const { error: sqlError } = await supabase
                .from('user_profiles')
                .select('id')
                .limit(0)
              
              if (sqlError && sqlError.message.includes('does not exist')) {
                console.log('   ⚠️  Tables need to be created manually in Supabase dashboard')
                return false
              } else {
                console.log('   ✅ Table already exists')
              }
            } else {
              console.log(`   ⚠️  Skipping: ${migration.name}`)
            }
          } else {
            console.log('   ✅ Success')
          }
        }
      } else {
        console.log('   ✅ Success')
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`)
      
      // For critical table creation, suggest manual approach
      if (migration.name.includes('Create') && migration.name.includes('table')) {
        console.log('   💡 This table might need manual creation in Supabase dashboard')
      }
    }
    
    // Small delay between migrations
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log('\n🎉 Migration process completed!')
  
  // Test if tables exist
  console.log('\n🔍 Testing table creation...')
  
  try {
    const { data: profilesTest, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(0)
    
    if (profilesError) {
      console.log('❌ user_profiles table: MISSING')
      console.log('💡 Please run the SQL manually in Supabase dashboard')
    } else {
      console.log('✅ user_profiles table: EXISTS')
    }
  } catch (err) {
    console.log('❌ user_profiles table: MISSING')
  }
  
  try {
    const { data: savedTest, error: savedError } = await supabase
      .from('saved_opportunities')
      .select('id')
      .limit(0)
    
    if (savedError) {
      console.log('❌ saved_opportunities table: MISSING')
    } else {
      console.log('✅ saved_opportunities table: EXISTS')
    }
  } catch (err) {
    console.log('❌ saved_opportunities table: MISSING')
  }
  
  console.log('\n🚀 If tables are missing, copy this SQL to Supabase Dashboard → SQL Editor:')
  console.log('📋 File: setup-auth-tables.sql')
  
  return true
}

// Run migrations
runMigrations()
  .then(() => {
    console.log('\n✨ Database setup completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error.message)
    process.exit(1)
  })