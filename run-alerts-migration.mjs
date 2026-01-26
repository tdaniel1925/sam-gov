import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const SUPABASE_URL = 'https://dtcwjaunekcbnrtshgok.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Y3dqYXVuZWtjYm5ydHNoZ29rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTEyODM2OSwiZXhwIjoyMDg0NzA0MzY5fQ.c9Re91kz3xydo5SCiavSjl2LVq0FNTzi0q7tDw-CYUo'

console.log('🚀 Setting up email alerts tables...')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function setupAlertsTables() {
  // Read the SQL file
  const sql = fs.readFileSync('setup-alerts-tables.sql', 'utf8')
  
  // Split SQL into individual statements
  const statements = sql.split(';').filter(stmt => stmt.trim().length > 0)
  
  console.log(`📋 Running ${statements.length} SQL statements...`)
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i].trim()
    if (!statement) continue
    
    console.log(`[${i + 1}/${statements.length}] Executing statement...`)
    
    try {
      // Use the REST API directly to execute SQL
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: statement + ';'
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.log(`   ⚠️ Statement may have failed: ${errorText.substring(0, 100)}...`)
      } else {
        console.log('   ✅ Success')
      }
    } catch (err) {
      console.log(`   ⚠️ Error: ${err.message}`)
    }
  }
  
  console.log('\n🔍 Testing table creation...')
  
  // Test if tables exist
  try {
    const { data: alertsTest, error: alertsError } = await supabase
      .from('search_alerts')
      .select('id')
      .limit(0)
    
    if (alertsError) {
      console.log('❌ search_alerts table: MISSING')
      console.log('💡 Please run the SQL manually in Supabase dashboard')
    } else {
      console.log('✅ search_alerts table: EXISTS')
    }
  } catch (err) {
    console.log('❌ search_alerts table: ERROR -', err.message)
  }
  
  try {
    const { data: schedulesTest, error: schedulesError } = await supabase
      .from('alert_schedules')
      .select('id')
      .limit(0)
    
    if (schedulesError) {
      console.log('❌ alert_schedules table: MISSING')
    } else {
      console.log('✅ alert_schedules table: EXISTS')
    }
  } catch (err) {
    console.log('❌ alert_schedules table: ERROR -', err.message)
  }
  
  console.log('\n🌟 Email alerts system setup completed!')
  console.log('📋 If tables are missing, run setup-alerts-tables.sql manually in Supabase Dashboard')
  
  return true
}

setupAlertsTables()
  .then(() => {
    console.log('\n✨ Email alerts database setup completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error.message)
    process.exit(1)
  })