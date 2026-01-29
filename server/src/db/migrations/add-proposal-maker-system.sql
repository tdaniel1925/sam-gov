-- ============================================================================
-- PROPOSAL MAKER SYSTEM MIGRATION
-- Adds complete proposal creation and management system
-- ============================================================================

-- Create ENUMS for Proposal Maker
CREATE TYPE proposal_status AS ENUM ('draft', 'in_progress', 'under_review', 'submitted', 'won', 'lost', 'withdrawn');
CREATE TYPE proposal_section_type AS ENUM ('executive_summary', 'technical_approach', 'management_plan', 'staffing_plan', 'past_performance', 'cost_proposal', 'boe_narrative', 'custom');
CREATE TYPE requirement_type AS ENUM ('mandatory', 'desired', 'optional');
CREATE TYPE compliance_status AS ENUM ('addressed', 'partial', 'missing', 'not_applicable');
CREATE TYPE bid_decision AS ENUM ('bid', 'no_bid', 'maybe', 'undecided');

-- Proposals Table
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opportunity_id TEXT,
  title TEXT NOT NULL,
  solicitation_number TEXT,
  agency_name TEXT,
  due_date TIMESTAMP,
  status proposal_status NOT NULL DEFAULT 'draft',
  win_probability INTEGER,
  estimated_value DECIMAL(15,2),
  bid_decision bid_decision,
  bid_decision_reasoning TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX proposals_user_id_idx ON proposals(user_id);
CREATE INDEX proposals_status_idx ON proposals(status);
CREATE INDEX proposals_due_date_idx ON proposals(due_date);

-- Proposal Sections Table
CREATE TABLE IF NOT EXISTS proposal_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  section_type proposal_section_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  page_limit INTEGER,
  word_count INTEGER DEFAULT 0,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX proposal_sections_proposal_id_idx ON proposal_sections(proposal_id);
CREATE INDEX proposal_sections_order_idx ON proposal_sections("order");

-- Proposal Requirements Table
CREATE TABLE IF NOT EXISTS proposal_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  requirement_text TEXT NOT NULL,
  requirement_type requirement_type NOT NULL,
  section_reference TEXT,
  compliance_status compliance_status DEFAULT 'missing',
  response_location TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX proposal_requirements_proposal_id_idx ON proposal_requirements(proposal_id);
CREATE INDEX proposal_requirements_compliance_status_idx ON proposal_requirements(compliance_status);

-- Past Performance Projects Table
CREATE TABLE IF NOT EXISTS past_performance_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  contract_number TEXT,
  contract_value DECIMAL(15,2),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  description TEXT,
  outcomes TEXT,
  reference_name TEXT,
  reference_email TEXT,
  reference_phone TEXT,
  relevance_tags JSONB,
  performance_rating TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX past_performance_projects_user_id_idx ON past_performance_projects(user_id);

-- Proposal Team Members Table
CREATE TABLE IF NOT EXISTS proposal_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  resume_text TEXT,
  certifications JSONB,
  clearance_level TEXT,
  skills JSONB,
  hourly_rate DECIMAL(10,2),
  availability BOOLEAN DEFAULT TRUE,
  photo_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX proposal_team_members_user_id_idx ON proposal_team_members(user_id);

-- Proposal Content Blocks Table
CREATE TABLE IF NOT EXISTS proposal_content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags JSONB,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX proposal_content_blocks_user_id_idx ON proposal_content_blocks(user_id);
CREATE INDEX proposal_content_blocks_block_type_idx ON proposal_content_blocks(block_type);

-- Bid Decisions Table
CREATE TABLE IF NOT EXISTS bid_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  recommendation bid_decision NOT NULL,
  confidence_level INTEGER,
  win_probability INTEGER,
  past_performance_score INTEGER,
  technical_capability_score INTEGER,
  resource_availability_score INTEGER,
  competitive_landscape_score INTEGER,
  strengths JSONB,
  weaknesses JSONB,
  risks JSONB,
  recommendations JSONB,
  estimated_competitors INTEGER,
  competitor_names JSONB,
  analysis_date TIMESTAMP DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX bid_decisions_proposal_id_idx ON bid_decisions(proposal_id);

-- Capability Gaps Table
CREATE TABLE IF NOT EXISTS capability_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  required_skill TEXT NOT NULL,
  criticality TEXT NOT NULL,
  current_coverage BOOLEAN DEFAULT FALSE,
  gap_description TEXT,
  recommended_action TEXT,
  estimated_cost DECIMAL(10,2),
  time_to_fill INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX capability_gaps_proposal_id_idx ON capability_gaps(proposal_id);

-- Proposal Cost Items Table
CREATE TABLE IF NOT EXISTS proposal_cost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2),
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(15,2),
  boe_narrative TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX proposal_cost_items_proposal_id_idx ON proposal_cost_items(proposal_id);
