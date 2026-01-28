import pg from 'pg'
const { Client } = pg

// Supabase connection details
const connectionString = 'postgresql://postgres.dtcwjaunekcbnrtshgok:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Y3dqYXVuZWtjYm5ydHNoZ29rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTEyODM2OSwiZXhwIjoyMDg0NzA0MzY5fQ.c9Re91kz3xydo5SCiavSjl2LVq0FNTzi0q7tDw-CYUo@aws-0-us-west-1.pooler.supabase.com:6543/postgres'

console.log('🚀 Adding new tables for Proposal Generation MVP...')

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
})

async function runMigration() {
  try {
    await client.connect()
    console.log('✅ Connected to Supabase PostgreSQL')

    // Create content_blocks table
    console.log('📋 Creating content_blocks table...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS "content_blocks" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid,
        "team_id" uuid,
        "category" text NOT NULL,
        "title" text NOT NULL,
        "content" text NOT NULL,
        "tags" jsonb,
        "is_shared" boolean DEFAULT false NOT NULL,
        "usage_count" integer DEFAULT 0 NOT NULL,
        "last_used" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `)
    console.log('✅ content_blocks table created')

    // Create saved_searches table
    console.log('📋 Creating saved_searches table...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS "saved_searches" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "search_params" jsonb NOT NULL,
        "alert_enabled" boolean DEFAULT false NOT NULL,
        "alert_frequency" "notification_frequency" DEFAULT 'daily',
        "last_alert_sent" timestamp,
        "last_run" timestamp,
        "result_count" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `)
    console.log('✅ saved_searches table created')

    // Create indexes for content_blocks
    console.log('🚀 Creating indexes for content_blocks...')
    await client.query(`CREATE INDEX IF NOT EXISTS "content_blocks_user_id_idx" ON "content_blocks" USING btree ("user_id");`)
    await client.query(`CREATE INDEX IF NOT EXISTS "content_blocks_team_id_idx" ON "content_blocks" USING btree ("team_id");`)
    await client.query(`CREATE INDEX IF NOT EXISTS "content_blocks_category_idx" ON "content_blocks" USING btree ("category");`)
    console.log('✅ content_blocks indexes created')

    // Create indexes for saved_searches
    console.log('🚀 Creating indexes for saved_searches...')
    await client.query(`CREATE INDEX IF NOT EXISTS "saved_searches_user_id_idx" ON "saved_searches" USING btree ("user_id");`)
    await client.query(`CREATE INDEX IF NOT EXISTS "saved_searches_alert_enabled_idx" ON "saved_searches" USING btree ("alert_enabled");`)
    console.log('✅ saved_searches indexes created')

    console.log('')
    console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY!')
    console.log('✅ Tables: content_blocks, saved_searches')
    console.log('🚀 Indexes: Created for optimal performance')
    console.log('')
    console.log('💫 Your SAM.gov platform now has:')
    console.log('📝 Content Library - Reusable proposal content blocks')
    console.log('🔍 Saved Searches - Save and rerun search configurations')
    console.log('🤖 AI Summarization - Comprehensive opportunity analysis')
    console.log('📄 Proposal Generation - Auto-generate proposal outlines')
    console.log('✅ Compliance Matrix - Section L & M parsing')

  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.message.includes('already exists')) {
      console.log('✅ Tables already exist - system is ready!')
    } else {
      throw error
    }
  } finally {
    await client.end()
    console.log('🔌 Database connection closed')
  }
}

runMigration()
