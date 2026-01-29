-- =============================================================================
-- FREEMIUM TIER SYSTEM MIGRATION
-- Adds user tier tracking and free tier rate limiting
-- =============================================================================

-- Add tier enum
DO $$ BEGIN
  CREATE TYPE user_tier AS ENUM ('free', 'paid');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add tier and rate limiting columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS tier user_tier DEFAULT 'free' NOT NULL,
ADD COLUMN IF NOT EXISTS daily_searches_used INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS last_search_date DATE,
ADD COLUMN IF NOT EXISTS setup_fee_paid BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS setup_paid_at TIMESTAMP;

-- Create index for tier queries
CREATE INDEX IF NOT EXISTS users_tier_idx ON users(tier);
CREATE INDEX IF NOT EXISTS users_last_search_date_idx ON users(last_search_date);

-- Update apiKeys table to support both SAM.gov and OpenAI keys
-- (Provider field already exists, just need to ensure it supports both)
COMMENT ON COLUMN api_keys.provider IS 'API provider: sam_gov or openai';

-- Add simple payments table for PayPal one-time payments
CREATE TABLE IF NOT EXISTS user_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Payment details
  payment_type TEXT NOT NULL, -- 'setup' or 'monthly'
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'completed', 'failed'

  -- PayPal details
  paypal_order_id TEXT,
  paypal_payer_id TEXT,
  paypal_transaction_id TEXT,

  -- Timestamps
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for payments
CREATE INDEX IF NOT EXISTS user_payments_user_id_idx ON user_payments(user_id);
CREATE INDEX IF NOT EXISTS user_payments_status_idx ON user_payments(status);
CREATE INDEX IF NOT EXISTS user_payments_payment_type_idx ON user_payments(payment_type);
CREATE INDEX IF NOT EXISTS user_payments_paid_at_idx ON user_payments(paid_at);

-- Migration complete
COMMENT ON TABLE user_payments IS 'Tracks PayPal payments for setup fee and monthly subscriptions';
