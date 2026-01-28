-- =============================================================================
-- ADD NEW TABLES FOR PROPOSAL GENERATION MVP
-- Tables: content_blocks, saved_searches
-- Run this in Supabase SQL Editor
-- =============================================================================

-- Content Blocks Table (for reusable proposal content)
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

-- Saved Searches Table (for alerts and quick access)
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

-- Create indexes for content_blocks
CREATE INDEX IF NOT EXISTS "content_blocks_user_id_idx" ON "content_blocks" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "content_blocks_team_id_idx" ON "content_blocks" USING btree ("team_id");
CREATE INDEX IF NOT EXISTS "content_blocks_category_idx" ON "content_blocks" USING btree ("category");

-- Create indexes for saved_searches
CREATE INDEX IF NOT EXISTS "saved_searches_user_id_idx" ON "saved_searches" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "saved_searches_alert_enabled_idx" ON "saved_searches" USING btree ("alert_enabled");

-- Success message
SELECT 'New tables created successfully: content_blocks, saved_searches' AS status;
