# Proposal Maker Migration Instructions

## Database Migration Required

The Proposal Maker feature requires new database tables. Follow these steps to complete the migration:

### Option 1: Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Migration**
   - Copy the entire contents of: `sam-gov/server/src/db/migrations/add-proposal-maker-system.sql`
   - Paste into the SQL editor
   - Click "Run" or press Ctrl+Enter

4. **Verify Success**
   - You should see: "Success. No rows returned"
   - Check the "Table Editor" to see 9 new tables:
     - proposals
     - proposal_sections
     - proposal_requirements
     - past_performance_projects
     - proposal_team_members
     - proposal_content_blocks
     - bid_decisions
     - capability_gaps
     - proposal_cost_items

### Option 2: Command Line (If Database is Active)

```bash
cd sam-gov/server
node run-proposal-migration.mjs
```

**Note:** This requires your DATABASE_URL to be correctly configured in `.env.local`

## After Migration

Once the migration is complete:

1. ✅ All Proposal Maker features will be fully functional
2. ✅ SAM.gov import will work
3. ✅ AI Bid Decision analysis will work
4. ✅ Capability Gap analysis will work

## New Features Available

### 1. Proposals Dashboard (`/proposals`)
- View all proposals
- Filter by status
- Track win probability

### 2. SAM.gov Import (`/proposals/import`)
- Import opportunities directly from SAM.gov
- Automatic requirement extraction
- Preview before importing

### 3. Proposal Detail Page (`/proposals/:id`)
- **Overview Tab**: View proposal info and requirements
- **Bid Decision Tab**: AI-powered bid/no-bid recommendation
- **Capability Gaps Tab**: Team readiness analysis

### 4. API Endpoints (20+ new endpoints)
- `/api/proposals` - Proposal CRUD
- `/api/proposal-sections` - Section management
- `/api/past-performance` - Past performance library
- `/api/proposal-team` - Team member management
- `/api/samgov-import` - SAM.gov direct import
- `/api/bid-decisions` - AI bid analysis
- `/api/capability-gaps` - AI gap analysis

## Troubleshooting

### "Tenant or user not found"
- Your Supabase project may be paused
- Check your DATABASE_URL in `.env.local`
- Use Option 1 (Supabase SQL Editor) instead

### Migration Already Run
If you see "type already exists" errors, the migration has already been run successfully. You can ignore these errors.

### Need to Rollback
To remove the Proposal Maker tables:

```sql
DROP TABLE IF EXISTS proposal_cost_items CASCADE;
DROP TABLE IF EXISTS capability_gaps CASCADE;
DROP TABLE IF EXISTS bid_decisions CASCADE;
DROP TABLE IF EXISTS proposal_content_blocks CASCADE;
DROP TABLE IF EXISTS proposal_team_members CASCADE;
DROP TABLE IF EXISTS past_performance_projects CASCADE;
DROP TABLE IF EXISTS proposal_requirements CASCADE;
DROP TABLE IF EXISTS proposal_sections CASCADE;
DROP TABLE IF EXISTS proposals CASCADE;

DROP TYPE IF EXISTS bid_decision;
DROP TYPE IF EXISTS compliance_status;
DROP TYPE IF EXISTS requirement_type;
DROP TYPE IF EXISTS proposal_section_type;
DROP TYPE IF EXISTS proposal_status;
```
