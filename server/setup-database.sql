-- =====================================================
-- SAM.gov Opportunities Database Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create ENUM type for notification frequency (with existence check)
DO $$ BEGIN
    CREATE TYPE "public"."notification_frequency" AS ENUM('daily', 'weekly', 'realtime');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create saved_opportunities table
CREATE TABLE IF NOT EXISTS "public"."saved_opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notice_id" text NOT NULL,
	"title" text NOT NULL,
	"solicitation_number" text,
	"department" text,
	"posted_date" text,
	"response_deadline" text,
	"naics_code" text,
	"opportunity_data" jsonb NOT NULL,
	"notes" text,
	"saved_at" timestamp DEFAULT now() NOT NULL
);

-- Create notification_subscriptions table
CREATE TABLE IF NOT EXISTS "public"."notification_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"naics_code" text NOT NULL,
	"frequency" "notification_frequency" DEFAULT 'daily' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"last_checked" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for saved_opportunities
CREATE INDEX IF NOT EXISTS "saved_opportunities_notice_id_idx" ON "public"."saved_opportunities" USING btree ("notice_id");
CREATE INDEX IF NOT EXISTS "saved_opportunities_naics_code_idx" ON "public"."saved_opportunities" USING btree ("naics_code");

-- Create indexes for notification_subscriptions
CREATE INDEX IF NOT EXISTS "notification_subscriptions_email_idx" ON "public"."notification_subscriptions" USING btree ("email");
CREATE INDEX IF NOT EXISTS "notification_subscriptions_naics_code_idx" ON "public"."notification_subscriptions" USING btree ("naics_code");
CREATE INDEX IF NOT EXISTS "notification_subscriptions_active_idx" ON "public"."notification_subscriptions" USING btree ("active");

-- Enable Row Level Security (RLS) - Optional but recommended for Supabase
ALTER TABLE "public"."saved_opportunities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."notification_subscriptions" ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (you can customize these later)
DO $$ BEGIN
    CREATE POLICY "Enable all operations for saved_opportunities" ON "public"."saved_opportunities"
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable all operations for notification_subscriptions" ON "public"."notification_subscriptions"
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Verify tables were created
SELECT
    table_name,
    table_schema
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('saved_opportunities', 'notification_subscriptions')
ORDER BY table_name;

-- Show success message
SELECT 'Database setup completed successfully!' as status;
