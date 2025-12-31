# Quick Start Guide

Get Cutoff running locally in 5 minutes.

## Prerequisites Check

Before starting, verify you have:

```bash
node --version  # Should be v18 or higher
npm --version   # Should be v9 or higher
```

If not installed, get Node.js from: https://nodejs.org/

## Step 1: Install Dependencies

```bash
npm install
```

This will install:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Supabase client (`@supabase/supabase-js`)
- Supabase SSR (`@supabase/ssr`) - for authentication

**Expected time:** 1-2 minutes

**Note:** If you've already run `npm install` before, run it again to get the updated dependencies.

## Step 2: Set Up Supabase

### Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name:** cutoff-dev
   - **Password:** (generate and save)
   - **Region:** Southeast Asia (Singapore) for Philippines
5. Click "Create project"
6. Wait 2-3 minutes

### Apply Database Schema

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "+ New query"
3. Copy entire contents of `supabase-schema.sql`
4. Paste into editor
5. Click **Run** (Cmd/Ctrl + Enter)
6. Should see "Success. No rows returned"

### Get API Credentials

1. Go to **Settings** → **API** (left sidebar)
2. Copy these values:
   - **Project URL**
   - **anon public key**

## Step 3: Configure Environment

Create `.env.local` file in project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...your-key-here
```

Replace with your actual values from Step 2.

## Step 4: Run Development Server

```bash
npm run dev
```

You should see:

```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully
```

## Step 5: Test the App

1. Open http://localhost:3000
2. Click "Sign Up"
3. Create account: `test@example.com` / `password123`
4. Complete setup:
   - Current balance: ₱10,000
   - Salary: ₱15,000
   - Schedule: 15th and End of Month
   - Add expense: Rent, ₱5,000, due on 1st
   - Emergency fund: ₱30,000
5. View dashboard

You should see:
- Current balance: ₱10,000
- Next payday information
- **Safe to Spend** amount
- Forecast details

## Troubleshooting

### Port 3000 Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### "Missing Environment Variables" Error

- Verify `.env.local` exists in project root
- Check no typos in variable names
- Restart dev server after creating `.env.local`

### Database Connection Fails

- Verify API credentials are correct
- Check Supabase project is active (not paused)
- Ensure RLS policies were created (re-run schema SQL)

### "No Forecast Data" on Dashboard

- Complete the `/setup` flow first
- Check browser console for errors
- Verify data in Supabase Table Editor

### TypeScript Errors

```bash
# Rebuild type definitions
rm -rf .next
npm run dev
```

## What's Next?

Now that it's running:

1. **Explore the code:**
   - `/lib/forecast.ts` - Core forecasting logic
   - `/lib/payday.ts` - Philippine payday calculations
   - `/app/dashboard/page.tsx` - Main dashboard

2. **Customize:**
   - Adjust safety buffer in `forecast.ts` (default: ₱500)
   - Modify pay schedules in `payday.ts`
   - Update UI colors in `tailwind.config.ts`

3. **Deploy:**
   - See `DEPLOYMENT.md` for Vercel deployment guide

## Development Tips

### Hot Reload

Changes to files automatically reload the browser. No need to restart server.

### View Database

Access Supabase Table Editor to see all your data in real-time.

### Test Multiple Users

- Use incognito window for second account
- Or use different browser

### Reset Database

To start fresh:

1. Go to Supabase SQL Editor
2. Run:
   ```sql
   TRUNCATE accounts, incomes, expenses, goals CASCADE;
   ```

### Check Logs

- **Client errors:** Browser console (F12)
- **Server errors:** Terminal running `npm run dev`
- **Database errors:** Supabase logs

## Common Development Tasks

### Add New Dependency

```bash
npm install package-name
```

### Run Type Check

```bash
npx tsc --noEmit
```

### Format Code

```bash
npx prettier --write .
```

### Build for Production (Test)

```bash
npm run build
npm start
```

## Need Help?

- Check `README.md` for architecture overview
- Review `ARCHITECTURE.md` for design decisions
- See `DEPLOYMENT.md` for production deployment

---

**Happy coding!** 🚀

