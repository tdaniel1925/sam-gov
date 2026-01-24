# 🚀 Quick Start Guide - SAM.gov Opportunities App

## ✅ Step 1: Database Setup (2 minutes)

Your Supabase is already configured! Now you just need to create the database tables.

### Option A: Using Supabase SQL Editor (Recommended - Easiest!)

1. **Go to Supabase SQL Editor:**
   - Visit: https://supabase.com/dashboard/project/dtcwjaunekcbnrtshgok/sql/new

2. **Copy and paste this SQL:**
   - Open the file: `server/setup-database.sql`
   - Copy ALL the contents
   - Paste into the SQL Editor

3. **Click "Run"** (or press Ctrl+Enter)

4. **Verify Success:**
   - You should see: "Database setup completed successfully!"
   - You should see 2 tables listed: `notification_subscriptions` and `saved_opportunities`

### Option B: Using Supabase CLI (Alternative)

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Run the migration
cd server
supabase db push
```

---

## ✅ Step 2: Start the Application

### Option 1: Start Everything at Once (Easiest!)

```bash
# From the root directory
npm run dev
```

This starts both:
- ✅ Backend API on http://localhost:3001
- ✅ Frontend React app on http://localhost:3000

### Option 2: Start Separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

---

## ✅ Step 3: Use the Application

Open your browser to: **http://localhost:3000**

### Features to Try:

1. **Search for Opportunities**
   - Enter a NAICS code (e.g., `541330` for Engineering Services)
   - Select date range or use presets (Last 7/30/90 days)
   - Click "Search Opportunities"

2. **Save Opportunities**
   - Click the "Save" button on any opportunity
   - View saved items in the "Saved" tab

3. **Set Up Email Notifications**
   - Go to "Notifications" tab
   - Enter your email and NAICS code
   - Choose frequency (Daily/Weekly)
   - Click "Subscribe"

4. **Export Results**
   - After searching, click "CSV" or "Excel" to download results

---

## 🔧 Configuration Summary

### Backend Configuration (Already Set!)
✅ Supabase Database URL configured
✅ SAM.gov API Key: `SAM-4f367518-6b73-47dc-b6a7-a041f20c2c8f`
✅ Server Port: 3001

### Frontend Configuration (Already Set!)
✅ API URL: http://localhost:3001/api
✅ Supabase URL configured

### What You Still Need:

📧 **Email Notifications** (Optional - only if you want notifications):
- Edit `server/.env`
- Add your SMTP credentials:
  ```env
  EMAIL_USER=your-email@gmail.com
  EMAIL_PASSWORD=your-app-password
  ```

---

## 📊 Your Supabase Dashboard

**Project URL:** https://supabase.com/dashboard/project/dtcwjaunekcbnrtshgok

**Quick Links:**
- Table Editor: https://supabase.com/dashboard/project/dtcwjaunekcbnrtshgok/editor
- SQL Editor: https://supabase.com/dashboard/project/dtcwjaunekcbnrtshgok/sql
- API Docs: https://supabase.com/dashboard/project/dtcwjaunekcbnrtshgok/api

---

## 🧪 Test the API

Once the server is running, test it:

```bash
# Test server health
curl http://localhost:3001/health

# Test SAM.gov API integration
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "naicsCode": "541330",
    "postedFrom": "12/22/2025",
    "postedTo": "01/22/2026",
    "limit": 5
  }'
```

---

## 🐛 Troubleshooting

### Database Connection Issues

**Error:** "password authentication failed"
- **Solution:** Run the SQL manually in Supabase SQL Editor (Step 1, Option A)

### Port Already in Use

**Error:** "Port 3001 already in use"
```bash
# Windows - Kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Frontend Not Loading

1. Check that backend is running on port 3001
2. Check browser console for errors
3. Verify `client/.env` has correct API URL

---

## 📁 Project Structure

```
C:\dev\1 - SAM App
├── server/                    # Backend (Port 3001)
│   ├── src/
│   │   ├── db/               # Database schema & connection
│   │   ├── routes/           # API endpoints
│   │   └── services/         # Business logic
│   ├── .env                  # ✅ Configured
│   └── setup-database.sql    # 👈 Run this in Supabase!
│
├── client/                    # Frontend (Port 3000)
│   ├── src/
│   │   ├── pages/            # React pages
│   │   └── services/         # API client
│   └── .env                  # ✅ Configured
│
└── package.json              # Root scripts
```

---

## ✅ Checklist

- [ ] Run `server/setup-database.sql` in Supabase SQL Editor
- [ ] Start backend: `cd server && npm run dev`
- [ ] Start frontend: `cd client && npm run dev`
- [ ] Open http://localhost:3000
- [ ] Try searching for opportunities
- [ ] (Optional) Configure email credentials in `server/.env`

---

## 🎉 You're Ready!

Once you complete Step 1 (database setup), just run:

```bash
npm run dev
```

Then open **http://localhost:3000** and start searching for government contracting opportunities!

---

## 📞 Need Help?

- Check `README.md` for detailed documentation
- Review SAM.gov API docs: https://open.gsa.gov/api/get-opportunities-public-api/
- Check server logs for errors: Look at the terminal running `npm run dev`

---

**Built with CodeBakers patterns 🍪**
