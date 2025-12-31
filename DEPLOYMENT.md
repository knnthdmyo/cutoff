# Cutoff - Deployment Guide

This guide will walk you through deploying the Cutoff application to production.

## Prerequisites

- A Supabase account (https://supabase.com)
- A Vercel account (https://vercel.com)
- Git installed locally
- Node.js 18+ installed

## Step 1: Set Up Supabase

### 1.1 Create a New Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name:** cutoff (or your preferred name)
   - **Database Password:** Generate a strong password (save this!)
   - **Region:** Choose closest to your users (e.g., Singapore for Philippines)
5. Click "Create new project"
6. Wait 2-3 minutes for project to be provisioned

### 1.2 Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` from your project
4. Paste into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. Verify success: You should see "Success. No rows returned"

### 1.3 Get Your API Keys

1. Go to **Settings** → **API** (left sidebar)
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
3. Keep these handy for the next steps

### 1.4 Verify Tables

1. Go to **Table Editor** (left sidebar)
2. You should see 4 tables:
   - `accounts`
   - `incomes`
   - `expenses`
   - `goals`
3. Click on each table to verify columns are created correctly

## Step 2: Deploy to Vercel

### 2.1 Push Code to GitHub

If you haven't already:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/cutoff.git
git branch -M main
git push -u origin main
```

### 2.2 Deploy on Vercel

1. Go to https://vercel.com and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

### 2.3 Add Environment Variables

In the Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
```

**Important:** Use the values you copied from Supabase in Step 1.3

### 2.4 Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. Your app will be live at `https://your-project.vercel.app`

## Step 3: Configure Supabase Authentication

### 3.1 Add Site URL

1. Go back to Supabase dashboard
2. Go to **Authentication** → **URL Configuration**
3. Add your Vercel URL to **Site URL:**
   - `https://your-project.vercel.app`
4. Add to **Redirect URLs:**
   - `https://your-project.vercel.app/**`
5. Click "Save"

### 3.2 Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize confirmation and password reset emails
3. Update email links to point to your domain

## Step 4: Test Your Deployment

1. Visit your Vercel URL
2. Click "Sign Up"
3. Create a test account
4. Complete the setup flow
5. Verify dashboard loads with forecast

## Step 5: Custom Domain (Optional)

### 5.1 Add Domain in Vercel

1. In Vercel project settings, go to **Domains**
2. Enter your domain (e.g., `cutoff.com`)
3. Follow DNS configuration instructions

### 5.2 Update Supabase URLs

1. Add your custom domain to Supabase authentication settings
2. Update Site URL and Redirect URLs

## Local Development Setup

To run the app locally:

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Troubleshooting

### Build Fails on Vercel

- Check that all dependencies are in `package.json`
- Verify TypeScript has no errors locally: `npm run build`
- Check Vercel build logs for specific errors

### Authentication Doesn't Work

- Verify environment variables are set correctly in Vercel
- Check that Site URL is configured in Supabase
- Clear browser cookies and try again

### Database Queries Fail

- Verify RLS policies are enabled (check SQL schema)
- Test queries in Supabase SQL Editor
- Check browser console for specific error messages

### App Shows "No Forecast Data"

- Ensure user completed the `/setup` flow
- Check that data was inserted into tables (use Supabase Table Editor)
- Verify user is authenticated (check browser dev tools → Application → Cookies)

## Production Checklist

Before going live:

- [ ] Database schema applied successfully
- [ ] Environment variables set in Vercel
- [ ] Authentication working (sign up + sign in)
- [ ] Setup flow working
- [ ] Dashboard displaying forecast
- [ ] What-if scenarios working
- [ ] Goals page working
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Test on mobile devices
- [ ] Monitor Vercel analytics for errors

## Monitoring & Maintenance

### Vercel Analytics

- Enable Vercel Analytics in project settings
- Monitor page load times and errors

### Supabase Monitoring

- Check **Database** → **Reports** for query performance
- Monitor **Authentication** → **Users** for user growth
- Set up email alerts for database errors

### Regular Backups

Supabase automatically backs up your database, but you can also:

1. Go to **Database** → **Backups**
2. Download manual backups periodically
3. Store backups securely

## Security Best Practices

1. **Never commit `.env.local` to git** (already in `.gitignore`)
2. **Use strong passwords** for Supabase dashboard
3. **Enable 2FA** on Supabase and Vercel accounts
4. **Review RLS policies** regularly to ensure data isolation
5. **Monitor authentication logs** for suspicious activity
6. **Keep dependencies updated:** Run `npm audit` regularly

## Scaling Considerations

This MVP is designed for individual users. If scaling to more users:

1. **Database:**
   - Upgrade Supabase plan for more connections
   - Add database indexes for frequently queried fields
   - Consider connection pooling

2. **Frontend:**
   - Implement caching strategies
   - Use Vercel Edge functions for better performance
   - Add CDN for static assets

3. **Authentication:**
   - Implement rate limiting
   - Add CAPTCHA for sign-ups
   - Set up abuse monitoring

## Support

For issues:
- Check Vercel deployment logs
- Review Supabase logs in dashboard
- Check browser console for errors
- Review Next.js documentation: https://nextjs.org/docs

---

**Congratulations!** Your Cutoff app is now deployed and ready to help users make better financial decisions. 🎉

