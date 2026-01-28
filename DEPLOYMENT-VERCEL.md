# Deploying SAM.gov Backend to Vercel

## Prerequisites
- GitHub repository with your code
- Vercel account (https://vercel.com)

## Step 1: Deploy Backend to Vercel

1. Go to https://vercel.com/new
2. Import your repository: `tdaniel1925/sam-gov`
3. Configure the project:
   - **Framework Preset:** Other
   - **Root Directory:** `server`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. Add Environment Variables (click "Environment Variables"):
   ```
   DATABASE_URL=your_supabase_connection_string
   SUPABASE_URL=https://dtcwjaunekcbnrtshgok.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SAM_API_KEY=SAM-4f367518-6b73-47dc-b6a7-a041f20c2c8f
   OPENAI_API_KEY=your_openai_key
   STRIPE_SECRET_KEY=your_stripe_key (or placeholder)
   CLIENT_URL=https://sam-gov-nu.vercel.app
   NODE_ENV=production
   ```

5. Click "Deploy"

## Step 2: Update Frontend Environment Variables

After backend is deployed, you'll get a URL like: `https://sam-gov-server-xxx.vercel.app`

Update your frontend environment variables:

**In Vercel Dashboard for Frontend:**
1. Go to your frontend project settings
2. Environment Variables → Add:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   VITE_SUPABASE_URL=https://dtcwjaunekcbnrtshgok.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. Redeploy frontend

## Step 3: Create Database Tables

1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/dtcwjaunekcbnrtshgok/sql/new
2. Copy the entire contents of `COMPLETE-SETUP.sql`
3. Paste and click "Run"

This will create:
- `user_profiles` table (authentication)
- `search_alerts` table (email notifications)
- `alert_schedules` table (alert tracking)

## Step 4: Test Your Deployment

Visit your frontend URL: https://sam-gov-nu.vercel.app

The app should now:
- Connect to your deployed backend
- Access Supabase database
- Use AI features (GPT-4 summarization)
- Save opportunities and searches

## Troubleshooting

### CORS Errors
If you see CORS errors, verify:
1. `CLIENT_URL` env var in backend matches your frontend URL
2. Backend `vercel.json` is configured correctly
3. Redeploy backend after changing env vars

### Database Errors
- Verify all environment variables are set correctly
- Check that database tables were created successfully
- Ensure DATABASE_URL has `/postgres` at the end

### Build Errors
- Check build logs in Vercel dashboard
- Verify `server/vercel.json` exists
- Ensure all dependencies are in `package.json`

## Environment Variables Reference

**Backend (.env.local):**
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (admin)
- `SAM_API_KEY` - SAM.gov API key
- `OPENAI_API_KEY` - OpenAI API key for GPT-4
- `STRIPE_SECRET_KEY` - Stripe secret key
- `CLIENT_URL` - Frontend URL (for CORS)
- `NODE_ENV` - Environment (production)

**Frontend (.env.production):**
- `VITE_API_URL` - Backend API URL
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Public anon key
