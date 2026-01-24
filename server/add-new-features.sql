-- =====================================================
-- SAM.gov Opportunities - New Features Migration
-- Run this in Supabase SQL Editor to add new tables
-- =====================================================

-- Create discovered_opportunities table
CREATE TABLE IF NOT EXISTS "public"."discovered_opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notice_id" text NOT NULL UNIQUE,
	"title" text NOT NULL,
	"solicitation_number" text,
	"department" text,
	"posted_date" text,
	"response_deadline" text,
	"naics_code" text,
	"opportunity_data" jsonb NOT NULL,
	"ai_score" text,
	"discovered_at" timestamp DEFAULT now() NOT NULL,
	"is_new" boolean DEFAULT true NOT NULL
);

-- Create indexes for discovered_opportunities
CREATE INDEX IF NOT EXISTS "discovered_opportunities_notice_id_idx" ON "public"."discovered_opportunities" USING btree ("notice_id");
CREATE INDEX IF NOT EXISTS "discovered_opportunities_naics_code_idx" ON "public"."discovered_opportunities" USING btree ("naics_code");
CREATE INDEX IF NOT EXISTS "discovered_opportunities_posted_date_idx" ON "public"."discovered_opportunities" USING btree ("posted_date");
CREATE INDEX IF NOT EXISTS "discovered_opportunities_is_new_idx" ON "public"."discovered_opportunities" USING btree ("is_new");

-- Create company_profile table
CREATE TABLE IF NOT EXISTS "public"."company_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text NOT NULL,
	"uei_number" text,
	"duns_number" text,
	"cage_code" text,
	"naics_codes" jsonb NOT NULL,
	"certifications" jsonb,
	"primary_contact" jsonb,
	"address" jsonb,
	"capabilities" text,
	"past_performance" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE "public"."discovered_opportunities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."company_profile" ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations
DO $$ BEGIN
    CREATE POLICY "Enable all operations for discovered_opportunities" ON "public"."discovered_opportunities"
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable all operations for company_profile" ON "public"."company_profile"
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
AND table_name IN ('discovered_opportunities', 'company_profile')
ORDER BY table_name;

-- Show success message
SELECT 'New features migration completed successfully!' as status;
