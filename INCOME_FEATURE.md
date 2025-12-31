# Income & Balance Management Feature

## Overview

Users can now edit their income information and account balance after initial setup. The new `/income` page provides a clean interface to update salary, pay schedule, and current balance.

## Features

### ✅ View Income Information
- Current account balance
- Salary per cutoff
- Pay schedule (15/30 or custom)
- Payment frequency (bi-weekly or monthly)
- Next payday date with countdown
- Current cutoff period

### ✅ Edit Income Details
- Click "Edit" button to enter edit mode
- Update any of the following:
  - **Current Balance** - Your actual bank balance now
  - **Salary per Cutoff** - How much you earn each payday
  - **Frequency** - Bi-weekly (15/30) or Monthly
  - **Pay Schedule** - 15/30 standard or custom day
  - **Custom Payday** - Specific day of month (1-31)
- Click "Save Changes" to update
- Click "Cancel" to discard changes

### ✅ Smart Information Display
- Shows next payday date with full formatting
- Counts down days until next payday
- Displays current cutoff period (e.g., "January 1-15")
- Color-coded information cards
- Helpful tips about why to update

## Access Points

### From Dashboard
1. Look for "Quick Actions" section
2. Click **"Edit Income & Balance"** button
3. Opens income management page

### Direct URL
Navigate to: `/income`

## User Interface

### View Mode
```
┌─────────────────────────────────────────┐
│ Income Information           [Edit]     │
├─────────────────────────────────────────┤
│ Current Balance                         │
│ ₱10,000                                │
├─────────────────────────────────────────┤
│ Salary per Cutoff                       │
│ ₱15,000                                │
├─────────────────────────────────────────┤
│ Pay Schedule                            │
│ 15th and End of Month (15/30)          │
│ Frequency: Bi-weekly                    │
├─────────────────────────────────────────┤
│ Next Payday                             │
│ Friday, January 15, 2025                │
│ 5 days from now                         │
├─────────────────────────────────────────┤
│ Current Period                          │
│ January 1-15                            │
└─────────────────────────────────────────┘
```

### Edit Mode
```
┌─────────────────────────────────────────┐
│ Edit Income & Balance                   │
├─────────────────────────────────────────┤
│ Current Balance (₱)                     │
│ [10000]                                 │
│                                         │
│ Salary per Cutoff (₱)                   │
│ [15000]                                 │
│                                         │
│ Frequency                               │
│ [Bi-weekly (15/30) ▼]                  │
│                                         │
│ Pay Schedule                            │
│ ○ 15th and End of Month (Standard)     │
│ ○ Custom Day of Month                   │
│                                         │
│ ⚠️ Note: Changing your pay schedule... │
│                                         │
│ [Save Changes] [Cancel]                 │
└─────────────────────────────────────────┘
```

## Field Descriptions

### Current Balance
- **What it is:** Your actual bank account balance right now
- **When to update:** 
  - Got paid? Update to new balance
  - Made large purchase? Adjust down
  - Received money? Adjust up
- **Why important:** Forecasts start from this number
- **Format:** Philippine Pesos (₱)

### Salary per Cutoff
- **What it is:** Amount you receive each payday
- **When to update:**
  - Got a raise? Update immediately
  - Changed jobs? Enter new salary
  - Deductions changed? Adjust net amount
- **Why important:** Used to calculate safe-to-spend
- **Format:** Philippine Pesos (₱)

### Frequency

**Bi-weekly:**
- Paid every 2 weeks
- Typical: 15th and end of month
- Most common in Philippines

**Monthly:**
- Paid once per month
- Typically on specific day
- Less common but supported

### Pay Schedule

**15/30 (Standard):**
- Paid on 15th of month
- Paid on last day of month
- Most common Filipino cutoff
- Automatic date calculation

**Custom:**
- Specify exact day (1-31)
- For non-standard schedules
- Example: Paid every 25th
- Requires custom day input

### Custom Payday
- **Only for custom schedule**
- Number between 1-31
- Day of month you get paid
- Used in forecast calculations

## Common Use Cases

### Use Case 1: Got a Raise 🎉
**Before:**
- Salary: ₱15,000

**Action:**
1. Go to Income page
2. Click "Edit"
3. Change salary to ₱18,000
4. Click "Save Changes"

**Result:**
- Forecasts now show higher income
- Safe-to-spend increases
- More accurate projections

### Use Case 2: Updated Bank Balance
**Before:**
- Balance in app: ₱10,000
- Actual balance: ₱8,500

**Action:**
1. Go to Income page
2. Click "Edit"
3. Update balance to ₱8,500
4. Click "Save Changes"

**Result:**
- Forecast starts from correct balance
- Safe-to-spend recalculates
- No overestimation of available funds

### Use Case 3: Changed Jobs with Different Schedule
**Before:**
- Pay schedule: 15/30

**New job:**
- Pays on 25th of each month

**Action:**
1. Go to Income page
2. Click "Edit"
3. Update salary amount
4. Select "Custom Day of Month"
5. Enter "25" as custom day
6. Click "Save Changes"

**Result:**
- Next payday correctly shows 25th
- Forecasts use new schedule
- Cutoff calculations adjusted

### Use Case 4: Salary Deduction Changed
**Before:**
- Net salary: ₱15,000

**After new deduction:**
- Net salary: ₱14,500

**Action:**
1. Go to Income page
2. Click "Edit"
3. Update salary to ₱14,500
4. Click "Save Changes"

**Result:**
- Forecasts reflect lower take-home
- More conservative safe-to-spend
- Realistic projections

## Impact on Forecasting

### When You Update Income:
- ✅ All future forecasts use new amount
- ✅ Safe-to-spend recalculates immediately
- ✅ Next payday date updates
- ✅ Dashboard reflects changes instantly

### When You Update Balance:
- ✅ Forecast starting point adjusts
- ✅ Safe-to-spend recalculates
- ✅ "Going negative" warnings update
- ✅ What-if scenarios use new baseline

### When You Change Schedule:
- ✅ Next payday recalculates
- ✅ Cutoff period updates
- ✅ Forecast horizon adjusts
- ✅ Expense scheduling adapts

## Data Validation

- ✅ Salary amount required (must be > 0)
- ✅ Balance required (can be negative)
- ✅ Custom day required if custom schedule selected
- ✅ Custom day must be 1-31
- ✅ All fields validated before saving
- ✅ Error messages for invalid inputs

## Security & Privacy

- ✅ User can only edit their own income
- ✅ Row Level Security enforced
- ✅ Changes saved immediately to database
- ✅ No other users can see your data

## Best Practices

### Keep It Current
- Update balance weekly or after major transactions
- Update salary immediately after pay changes
- Review monthly for accuracy

### Be Accurate
- Use take-home pay (after taxes/deductions)
- Use actual bank balance, not rounded
- Include all income sources in salary amount

### Regular Reviews
- Check before planning large purchases
- Verify before running what-if scenarios
- Update after life changes (new job, raise, etc.)

## Tips for Users

### Why Update Balance?
Your forecast is only as good as your starting point. If your actual balance is ₱8,000 but the app thinks it's ₱10,000, you'll get incorrect safe-to-spend amounts.

### When to Update?
- After payday (balance increases)
- After large purchases (balance decreases)
- After unexpected expenses
- Before making financial decisions
- At least once per week

### Salary vs. Gross Pay
Always enter your **net/take-home** salary, not gross. This is the amount that actually hits your bank account after:
- Income tax
- SSS contributions
- PhilHealth
- Pag-IBIG
- Other deductions

### Custom Schedule Examples
- **Paid on 5th:** Select Custom, enter 5
- **Paid on 20th:** Select Custom, enter 20
- **Paid on 31st:** Select Custom, enter 31 (handled for short months)

## Helpful Information Card

The page includes a helpful info card explaining:
- ✅ Salary changed? Update for accuracy
- ✅ Got a raise? Reflect it immediately
- ✅ Balance changed? Keep forecasts in sync
- ✅ Changed jobs? Update schedule

## Warning on Schedule Changes

When editing pay schedule, users see:
> ⚠️ **Note:** Changing your pay schedule will affect all future forecasts. Your existing expenses and goals will remain unchanged.

This ensures users understand the impact before saving.

## Integration with Other Features

### Dashboard
- Updated income affects safe-to-spend
- Balance changes reflected immediately
- Next payday updates in real-time

### What-If Scenarios
- Uses current balance as baseline
- Salary affects future projections
- Schedule determines forecast horizon

### Expenses
- Fixed expenses scheduled around paydays
- Income covers expenses in forecast
- Balance sufficient for bills

### Goals
- Income available for goal contributions
- Balance affects ability to save
- Schedule affects saving frequency

## Technical Details

**File:** `/app/income/page.tsx`

**Database Tables:**
- `incomes` - Salary and schedule info
- `accounts` - Current balance

**Features:**
- View/Edit mode toggle
- Real-time Supabase updates
- Form validation
- Date calculations using payday.ts
- Responsive design

## Mobile Experience

Fully responsive:
- Touch-friendly edit button
- Clear form fields
- Easy radio button selection
- Readable text sizes
- Proper spacing

## Future Enhancements

Possible V2 features:
- [ ] Multiple income sources
- [ ] Income history tracking
- [ ] Pay stub upload
- [ ] Automatic balance sync (bank integration)
- [ ] Salary increase planning
- [ ] Tax calculator
- [ ] Deduction breakdown

---

**Status:** ✅ Live and Functional

Users now have full control over their income information and can keep their forecasts accurate by updating salary and balance anytime!

