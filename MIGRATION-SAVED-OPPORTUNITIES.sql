-- Migration: Add saved_opportunities table
-- This table tracks which opportunities users have bookmarked/saved

CREATE TABLE IF NOT EXISTS saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id TEXT NOT NULL,
  title TEXT,
  solicitation_number TEXT,
  naics_code TEXT,
  posted_date TEXT,
  response_deadline TEXT,
  agency_name TEXT,
  notes TEXT,
  tags TEXT[],
  ui_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, opportunity_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_saved_opportunities_user_id ON saved_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_opportunities_opportunity_id ON saved_opportunities(opportunity_id);

-- Enable RLS
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own saved opportunities"
  ON saved_opportunities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved opportunities"
  ON saved_opportunities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved opportunities"
  ON saved_opportunities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved opportunities"
  ON saved_opportunities FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_saved_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_saved_opportunities_updated_at
  BEFORE UPDATE ON saved_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_opportunities_updated_at();
