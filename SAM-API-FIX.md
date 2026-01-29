# SAM.gov API 403 Error - Diagnosis and Fix

## Problem

Frontend is receiving this error:
```
GET https://server-bot-makers.vercel.app/api/search/recent 500 (Internal Server Error)
```

Backend logs show SAM.gov API is returning **403 Forbidden**.

## Root Cause

The **SAM_API_KEY environment variable is missing or incorrect in Vercel**.

## Verification

I tested the API key locally and it **WORKS PERFECTLY**:

```bash
curl "https://api.sam.gov/opportunities/v2/search?api_key=SAM-4f367518-6b73-47dc-b6a7-a041f20c2c8f&postedFrom=01/01/2025&postedTo=01/28/2025&limit=1"
```

Response: 200 OK with valid opportunity data ✅

## Fix Required

You need to add the **SAM_API_KEY** to your Vercel backend project:

### Steps:

1. Go to https://vercel.com/dashboard
2. Click on your backend project: **server-bot-makers**
3. Go to **Settings** → **Environment Variables**
4. Add this variable:
   ```
   Name: SAM_API_KEY
   Value: SAM-4f367518-6b73-47dc-b6a7-a041f20c2c8f
   ```
5. Make sure to add it for **Production** environment
6. Click **Save**
7. Go to **Deployments** tab
8. Click the **...** menu on the latest deployment
9. Click **Redeploy**

## Verification After Fix

After redeploying, test the endpoint:

```bash
curl https://server-bot-makers.vercel.app/api/search/recent
```

You should get back opportunity data instead of a 500 error.

## What I Fixed

1. ✅ User profile auto-creation (AuthContext.tsx) - Pushed to GitHub
2. ✅ Added 403 error handling with detailed logging - Pushed to GitHub
3. ✅ Added debug endpoint to check environment variables - Pushed to GitHub
4. ⏳ Need to add SAM_API_KEY to Vercel backend - **YOU NEED TO DO THIS**

## Notes

- The frontend will automatically redeploy when I pushed the AuthContext fix
- The backend needs the environment variable added manually in Vercel dashboard
- All other environment variables are set correctly (DATABASE_URL, SUPABASE_*, etc.)
- Just the SAM_API_KEY is missing
