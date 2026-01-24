# SAM.gov Contracting Opportunities Search Application

A full-stack web application for searching, saving, and tracking U.S. government contracting opportunities from SAM.gov by NAICS code.

## 🚀 Quick Start

**All credentials are already configured!** Just follow these 2 steps:

1. **Set up database:** Run `server/setup-database.sql` in [Supabase SQL Editor](https://supabase.com/dashboard/project/dtcwjaunekcbnrtshgok/sql/new)
2. **Start the app:** Run `npm run dev` from the root directory

👉 **See [QUICKSTART.md](QUICKSTART.md) for detailed step-by-step instructions!**

---

## Features

- **🔍 Search Opportunities** - Search by NAICS code and date range
- **💾 Save Favorites** - Bookmark opportunities for later review
- **📧 Email Notifications** - Get alerts for new opportunities matching your NAICS codes
- **📊 Export Data** - Download results as CSV or Excel
- **📅 Date Filtering** - Filter by custom date ranges with quick presets

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- Drizzle ORM + PostgreSQL
- Zod (validation)
- Nodemailer (email notifications)
- node-cron (scheduled jobs)
- ExcelJS & json2csv (exports)

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- React Hook Form + Zod
- Axios
- React Router
- Sonner (toast notifications)

## Project Structure

```
├── server/                 # Backend API
│   ├── src/
│   │   ├── db/            # Database schema and connection
│   │   ├── lib/           # SAM.gov API client
│   │   ├── routes/        # Express routes
│   │   ├── services/      # Business logic
│   │   └── types/         # TypeScript types
│   └── package.json
│
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API client
│   │   └── types/         # TypeScript types
│   └── package.json
│
└── shared/                # Shared types (future)
```

## Prerequisites

- Node.js 18+ and npm
- ✅ **Supabase Database** (already configured!)
- ✅ **SAM.gov API key** (already configured!)
- SMTP credentials for email notifications (optional - only needed for notifications feature)

## Setup Instructions

### 1. Database Setup (Supabase)

**The database connection is already configured!** You just need to create the tables:

1. Go to your [Supabase SQL Editor](https://supabase.com/dashboard/project/dtcwjaunekcbnrtshgok/sql/new)
2. Open `server/setup-database.sql` and copy all the SQL
3. Paste into SQL Editor and click "Run"
4. Verify you see: "Database setup completed successfully!"

### 2. Install Dependencies & Start

```bash
# From the root directory, install all dependencies
npm install

# Start both backend and frontend together
npm run dev
```

**OR run separately:**

```bash
# Terminal 1 - Backend (Port 3001)
cd server
npm install
npm run dev

# Terminal 2 - Frontend (Port 3000)
cd client
npm install
npm run dev
```

- **Backend:** http://localhost:3001
- **Frontend:** http://localhost:3000

### 3. Configure Email (Optional)

Email is only needed if you want to use the notifications feature. Edit `server/.env`:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

**For Gmail:**
1. Enable 2-factor authentication
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use that password (not your regular Gmail password)

## Environment Variables

### ✅ Already Configured

The following are already set up in your `.env` files:

**Backend (`server/.env`):**
- ✅ Supabase database connection
- ✅ SAM.gov API key
- ✅ Server configuration

**Frontend (`client/.env`):**
- ✅ API URL
- ✅ Supabase connection

### 📧 Optional - Email Notifications

Only needed if you want email notifications. Add to `server/.env`:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Usage

### Search for Opportunities

1. Navigate to the Search page (home page)
2. Enter a NAICS code (optional) - e.g., 541330 for Engineering Services
3. Select a date range or use quick presets (Last 7/30/90 days)
4. Click "Search Opportunities"
5. Results will display with options to Save or View on SAM.gov

### Save Opportunities

- Click the "Save" button on any opportunity
- View saved opportunities on the "Saved" page
- Delete saved items when no longer needed

### Set Up Email Notifications

1. Navigate to the Notifications page
2. Enter your email address
3. Enter the NAICS code to watch
4. Choose notification frequency (Daily, Weekly, or Real-time)
5. Click "Subscribe"

Notifications will be sent via email when new opportunities are posted.

### Export Results

- After searching, click "CSV" or "Excel" buttons to download results
- Exports include all visible search results with key details

## API Endpoints

### Search
- `POST /api/search` - Search opportunities
- `GET /api/search/recent` - Get recent opportunities

### Saved Opportunities
- `GET /api/saved` - Get all saved opportunities
- `POST /api/saved` - Save an opportunity
- `DELETE /api/saved/:id` - Delete saved opportunity
- `PATCH /api/saved/:id` - Update notes

### Notifications
- `GET /api/notifications` - Get subscriptions (requires email param)
- `POST /api/notifications` - Create subscription
- `DELETE /api/notifications/:id` - Unsubscribe
- `PATCH /api/notifications/:id` - Update subscription

### Export
- `POST /api/export` - Export opportunities to CSV/Excel

## Testing

### Backend Tests

```bash
cd server
npm test
```

### Frontend Tests

```bash
cd client
npm test
```

## Email Notification Scheduling

The application runs cron jobs to check for new opportunities and send email notifications:

- **Daily notifications**: Run every day at 8 AM
- **Weekly notifications**: Run every Monday at 8 AM
- **Real-time**: Processed as opportunities are posted (requires webhook setup)

## Deployment

### Backend Deployment (Example: Heroku)

```bash
cd server

# Login to Heroku
heroku login

# Create app
heroku create sam-opportunities-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set SAM_API_KEY=SAM-4f367518-6b73-47dc-b6a7-a041f20c2c8f
heroku config:set EMAIL_HOST=smtp.gmail.com
# ... set other vars

# Deploy
git push heroku main

# Run migrations
heroku run npm run db:migrate
```

### Frontend Deployment (Example: Vercel)

```bash
cd client

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable
vercel env add VITE_API_URL production
# Enter your production API URL
```

## Development

### CodeBakers Patterns

This project follows CodeBakers production patterns for:
- Type-safe API routes with Zod validation
- Error handling and standardized responses
- Database schemas with Drizzle ORM
- React forms with validation
- External API integration patterns

### Adding New Features

1. Backend: Add route in `server/src/routes/`
2. Backend: Add business logic in `server/src/services/`
3. Frontend: Add API calls in `client/src/services/api.ts`
4. Frontend: Create UI components in `client/src/pages/` or `client/src/components/`
5. Write tests for new functionality

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in server/.env
- Ensure database exists: `psql -l`

### Email Not Sending

- Verify SMTP credentials are correct
- For Gmail, use an App Password (not account password)
- Check EMAIL_HOST and EMAIL_PORT match your provider

### API Key Issues

- Verify SAM_API_KEY is set in server/.env
- Test API key: Visit `https://api.sam.gov/opportunities/v2/search?api_key=YOUR_KEY&postedFrom=01/01/2025&postedTo=01/31/2025&limit=1`

## License

MIT

## Support

For issues or questions:
- Review the SAM.gov API documentation: https://open.gsa.gov/api/get-opportunities-public-api/
- Check server logs for API errors
- Verify all environment variables are set correctly

---

**Built with CodeBakers patterns** 🍪
