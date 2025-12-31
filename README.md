# Cutoff

**Forecast-first personal finance for Filipino professionals**

Cutoff is a personal finance application designed specifically for Filipinos paid on a 15/30 cutoff schedule. Unlike traditional budgeting apps that focus on tracking past expenses, Cutoff is **forecast-first** — it simulates your future cash flow and tells you exactly how much you can safely spend before your next payday.

## The Core Question

> "What should I do with my money this cutoff so I don't run out before my next paycheck?"

Cutoff answers this with a simple number: **Safe to Spend**.

## Key Features

### 🔮 Forward-Looking Forecasting
- Day-by-day cash flow simulation until next payday
- Accounts for upcoming income and fixed expenses
- Shows minimum balance and warns of potential negatives

### 📅 Philippine Cutoff Support
- Built-in 15/30 payday schedule (15th and end of month)
- Support for custom payday schedules
- Automatic calculation of next payday

### ✅ Decision-Oriented, Not Chart-Heavy
- Clear "Safe to Spend" amount displayed prominently
- Visual warnings if budget goes negative
- Actionable recommendations, not just data

### 🎯 What-If Scenarios
- Test hypothetical purchases before making them
- See real-time impact on your forecast
- Get clear ✅/❌ recommendations

### 💰 Goal Management
- Add, edit, and delete financial goals
- Track progress with visual indicators
- Add or subtract contributions
- Set goal types (Emergency/Investment/General)
- Prioritize goals (1-10 scale)
- Edit goal details anytime

### 💳 Expense Management
- View all expenses (fixed and variable)
- Add, edit, and delete expenses
- See total monthly expenses
- Organize by type and priority

### ✅ Bill Payment Tracker
- Monthly checklist for fixed expenses
- Mark bills as paid/unpaid
- Track actual amount paid
- Record payment dates and notes
- View paid vs unpaid totals
- Navigate between months
- **Beautiful pastel green theme**
- **Mobile-first responsive design**

### 💰 Income & Balance Management
- View current income and balance information
- Edit salary amount and pay schedule
- Update current account balance
- See next payday and cutoff period
- Change frequency and payday rules

### 💡 Financial Recommendations
- Get personalized allocation suggestions
- Financial health score (0-100)
- Emergency fund recommendations
- Savings and investment guidance
- Discretionary spending amount
- Tailored advice based on your situation

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Deployment:** Vercel

## Project Structure

```
/app                    # Next.js app directory
  /auth                 # Authentication pages
    /login
    /signup
  /dashboard            # Main dashboard with forecast
  /setup                # Onboarding flow
  /what-if              # What-if scenario simulator
  /goals                # Goals tracking page
  /expenses             # Expense management page
    /tracker            # Bill payment tracker
  /income               # Income & balance management
  /recommendations      # Financial recommendations

/components            # Reusable React components
  /ui                  # UI primitives (Button, Input, Card)

/lib                   # Core business logic
  forecast.ts          # Cash flow forecasting engine
  payday.ts            # Philippine payday calculation
  supabase.ts          # Supabase client setup
  auth.ts              # Authentication utilities
  currency.ts          # PHP formatting utilities

/types                 # TypeScript type definitions
  database.ts          # Supabase database types
```

## Core Logic

### Forecasting Engine (`/lib/forecast.ts`)

The forecasting engine is the heart of the application. It:

1. Takes current balance and scheduled transactions
2. Simulates day-by-day cash flow until next payday
3. Tracks minimum balance (lowest point before payday)
4. Calculates "safe to spend" = minimum balance - safety buffer

**Example:**

```typescript
const forecast = forecastUntilNextPayday(
  10000,  // Starting balance
  incomes,
  expenses
);

console.log(forecast.safeToSpend);      // 3500
console.log(forecast.minimumBalance);   // 4000
console.log(forecast.endingBalance);    // 12000
```

### Payday Logic (`/lib/payday.ts`)

Handles Philippine-specific pay schedules:

- **15/30 Schedule:** Paid on 15th and last day of month
- **Custom Schedule:** Any day of the month

```typescript
const nextPayday = getNextPayday(
  new Date(),
  '15_30'
);
// Returns: Next 15th or end of month
```

## Database Schema

Four main tables:

- **accounts:** User bank accounts and balances
- **incomes:** Income sources and pay schedules
- **expenses:** Fixed and variable expenses
- **goals:** Savings goals and progress

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/cutoff.git
cd cutoff
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Supabase**

- Create a new project at https://supabase.com
- Run the SQL schema from `supabase-schema.sql` in the SQL Editor
- Copy your project URL and anon key

4. **Configure environment variables**

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. **Run development server**

```bash
npm run dev
```

Visit `http://localhost:3000`

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

**Quick Deploy to Vercel:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click button above
2. Import your GitHub repository
3. Add environment variables
4. Deploy!

## Usage Flow

### 1. Sign Up / Sign In
New users create an account with email and password.

### 2. Setup (First Time)
Users provide:
- Current balance
- Salary amount and pay schedule
- Fixed monthly expenses (rent, bills, etc.)
- Emergency fund goal

### 3. Dashboard
Shows:
- Current balance
- Next payday
- **Safe to Spend amount** (the main insight)
- Upcoming transactions
- Forecast summary

### 4. What-If Scenarios
Users can test hypothetical purchases:
- Enter amount to spend
- See updated forecast
- Get ✅/❌ recommendation

### 5. Goals
Track progress on savings goals with visual progress bars.

### 6. Expenses
Manage recurring bills and expenses:
- Add new expenses with amounts and due dates
- Edit existing expenses
- Delete old or cancelled expenses
- View total monthly spending

## Design Philosophy

### Forecast-First, Not Tracking-First

Most budgeting apps focus on categorizing past expenses. Cutoff focuses on **predicting the future** — because knowing what you *can* spend is more useful than knowing what you *did* spend.

### Decisions Over Data

Users don't want charts. They want answers:
- "Can I afford this?"
- "How much can I spend?"
- "Will I run out of money?"

Cutoff provides clear answers with minimal cognitive load.

### Philippine Context

Built specifically for the 15/30 cutoff system common in the Philippines. No need to adapt foreign budgeting concepts.

### Minimal Viable Product

This is an MVP. It deliberately excludes:
- Bank syncing (too complex, security concerns)
- AI features (unnecessary complexity)
- Social features (not core to value)
- Ads (clean, focused experience)

## Future Enhancements (Post-MVP)

Potential features for V2:

- Multiple account support
- Recurring transactions (auto-scheduled)
- Budget categories
- Export to CSV
- Mobile app (React Native)
- Expense tracking (manual entry)
- Bill reminders
- Shared accounts (family budgets)

## Contributing

This is a personal project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this code for your own projects.

## Acknowledgments

Built for Filipino professionals who want to make smarter financial decisions without the complexity of traditional budgeting tools.

---

**Made with ☕ in the Philippines**

For questions or support, open an issue on GitHub.

# cutoff
