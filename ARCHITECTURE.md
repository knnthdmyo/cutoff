# Cutoff - System Architecture

## Overview

Cutoff is a personal finance forecasting application designed specifically for Filipino professionals paid on 15/30 cutoff schedules.

## Core Principle

**Forecast-first, not tracking-first.**  
The app simulates future cash flow to answer: "What can I safely spend this cutoff?"

## System Components

### 1. Frontend (Next.js App Router)
- Server components for initial data loading
- Client components for interactive forecasting
- Minimal UI, mobile-first design

### 2. Database (Supabase Postgres)
- User authentication data
- Financial accounts
- Income sources and schedules
- Fixed and variable expenses
- Savings goals

### 3. Forecasting Engine (`/lib/forecast.ts`)
- Pure TypeScript functions
- No external dependencies
- Day-by-day cash flow simulation
- Calculates safe-to-spend amounts

### 4. Payday Logic (`/lib/payday.ts`)
- Philippine cutoff calendar (15/30)
- Handles weekend/holiday adjustments
- Generates future payday dates

## Data Flow

```
User Input (Setup/Dashboard)
  ↓
Supabase (CRUD operations)
  ↓
Forecasting Engine (simulation)
  ↓
Results (safe-to-spend, warnings)
  ↓
UI Display
```

## Security

- Row Level Security on all tables
- Users can only access their own data
- No sensitive data in client state
- Environment variables for secrets

## Key Design Decisions

1. **No bank syncing**: Manual input only (reduces complexity, no API dependencies)
2. **No AI**: Rules-based logic only
3. **Single currency**: PHP (₱) only
4. **Simplified goals**: Emergency fund and basic savings only in MVP
5. **No recurring transactions**: Users define income/expense patterns, engine simulates

## File Structure

```
/app
  /auth
  /setup
  /dashboard
  /what-if
  /goals
/lib
  forecast.ts      # Core forecasting logic
  payday.ts        # Cutoff calendar logic
  supabase.ts      # Supabase client
/components
  ui/              # Reusable UI components
/types
  database.ts      # TypeScript types from Supabase
```

## Technology Constraints

- Next.js 14+ (App Router)
- TypeScript (strict mode)
- Tailwind CSS (no custom CSS)
- Supabase (hosted)
- Vercel (deployment)

