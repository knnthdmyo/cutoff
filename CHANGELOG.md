# Changelog

## [1.0.7] - 2025-01-01

### Changed
- **Payment Tracker Styling** - Beautiful pastel green theme with mobile-first design
  - Gradient backgrounds (green-50, emerald-50, teal-50)
  - Soft pastel green color scheme throughout
  - Mobile-first responsive design
  - Rounded corners (rounded-2xl) for modern look
  - Smooth transitions and hover effects
  - Touch-friendly buttons with active states
  - Sticky header with backdrop blur
  - Enhanced visual feedback for paid/unpaid states
  - Improved spacing and typography for mobile
  - Gradient cards for summary stats
  - Better color contrast and accessibility

---

## [1.0.6] - 2025-01-01

### Added
- **Bill Payment Tracker** - Track which fixed expenses have been paid
  - Monthly payment checklist for fixed expenses
  - Mark expenses as paid/unpaid with checkbox
  - Track actual amount paid (if different from scheduled)
  - Record payment date
  - Add payment notes (confirmation numbers, etc.)
  - View paid vs unpaid totals
  - Navigate between months
  - Automatic monthly reset
  - Featured button on dashboard ("✅ Track Bill Payments")
  - New database table: `expense_payments`

### Changed
- **Dashboard** - Added "Track Bill Payments" button (6 quick actions)
- **Expenses Page** - Added "Track Payments" button in header

---

## [1.0.5] - 2025-01-01

### Fixed
- **Sign Out Functionality** - Properly clears session and redirects
  - Created dedicated /auth/signout page
  - Clears Supabase session and local storage
  - Forces full page reload to update middleware
  - Updated middleware to allow signout page access
  - Improved error handling during signout

### Added

### Added
- **Enhanced Goals Management** - Full CRUD operations for goals
  - Add new goals with custom details
  - Edit existing goals (name, target, current amount, type, priority)
  - Delete goals with confirmation
  - Add contributions (+ add to current amount)
  - Subtract contributions (- reduce current amount)
  - Improved UI with inline editing
  - Goal type selection (Emergency/Investment/General)
  - Priority levels (1-10)
- **Goals Summary on Dashboard** - Quick view of goal progress
  - Shows top 3 goals by priority
  - Progress bars with percentage
  - Goal icons and completion status
  - "View All" link to goals page

### Changed
- **Goals Page** - Complete redesign with comprehensive management features
- **Dashboard** - Added Goals Summary section with visual progress tracking

---

## [1.0.4] - 2025-01-01

### Added
- **Financial Recommendations System** - Smart allocation suggestions
  - Financial health score (0-100)
  - Personalized emergency fund recommendations
  - Savings allocation suggestions
  - Investment recommendations based on financial position
  - Discretionary spending guidance
  - Key financial advice tailored to user situation
  - Based on 50/30/20 rule and emergency fund principles
  - Priority system (high/medium/low) for allocations
  - How-to guide for implementing recommendations
  - Prominent button on dashboard ("💡 Get Recommendations")

### Changed
- **Dashboard** - Quick Actions now has 5 buttons with featured recommendations button at top

---

## [1.0.3] - 2025-01-01

### Added
- **Income & Balance Management Page** - Edit salary and account balance
  - View current income information
  - Edit salary amount
  - Update current account balance
  - Change pay schedule (15/30 or custom)
  - See next payday date and countdown
  - View current cutoff period
  - Direct link from dashboard ("Edit Income & Balance" button)

### Changed
- **Dashboard** - Quick Actions now shows 4 buttons in 2x2 grid (added "Edit Income & Balance")

---

## [1.0.2] - 2025-01-01

### Added
- **Expense Management Page** - Full CRUD operations for expenses
  - View all expenses (fixed and variable)
  - Add new expenses with name, amount, type, priority, and due date
  - Edit existing expenses
  - Delete expenses with confirmation
  - See total monthly expenses
  - Separate sections for fixed vs. variable expenses
  - Direct link from dashboard ("Manage Expenses" button)

### Changed
- **Dashboard** - Quick Actions now shows 3 buttons (added "Manage Expenses")

---

## [1.0.1] - 2025-01-01

### Fixed
- **Authentication Login Issue** - Users can now successfully login and stay authenticated
  - Fixed middleware to properly check Supabase sessions
  - Updated to use `@supabase/ssr` for proper cookie handling
  - Added `router.refresh()` after login/signup to update auth state
  - Created server-side Supabase utilities

### Changed
- **Middleware** (`middleware.ts`)
  - Now uses proper Supabase SSR authentication
  - Checks actual session state instead of wrong cookie name
  - Handles cookie refresh automatically

- **Supabase Client** (`lib/supabase.ts`)
  - Changed to `createBrowserClient` for proper browser cookie handling

- **Login/Signup Pages**
  - Added router refresh after authentication for immediate state update

### Added
- **New Dependency:** `@supabase/ssr` v0.0.10
- **New File:** `lib/supabase-server.ts` - Server-side Supabase utilities
- **New File:** `AUTH_FIX.md` - Detailed fix documentation

### Technical Details
The original middleware was checking for `sb-access-token` cookie which doesn't exist. Supabase uses project-specific cookie names that require proper SSR handling in Next.js App Router. The fix implements the recommended Supabase SSR pattern for Next.js.

---

## [1.0.0] - 2024-12-31

### Initial Release
- Complete MVP implementation
- Forecasting engine
- Philippine 15/30 cutoff support
- Dashboard with safe-to-spend calculation
- What-if scenario testing
- Goals tracking
- Full authentication system
- Row Level Security
- Responsive design

