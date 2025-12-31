# Expense Management Feature

## Overview

Users can now fully manage their expenses after initial setup. The new `/expenses` page provides complete CRUD (Create, Read, Update, Delete) operations for all expense types.

## Features

### ✅ View All Expenses
- See all expenses organized by type (Fixed vs. Variable)
- View total monthly expenses at the top
- Each expense shows:
  - Name
  - Amount (₱)
  - Type (Fixed/Variable)
  - Priority (Needs/Wants)
  - Due day (for fixed expenses)

### ✅ Add New Expenses
- Click "Add New Expense" button
- Fill in expense details:
  - **Name** - e.g., "Rent", "Electricity", "Groceries"
  - **Amount** - Monthly amount in PHP
  - **Type** - Fixed (recurring) or Variable (manual tracking)
  - **Priority** - Needs (essential) or Wants (discretionary)
  - **Due Day** - Day of month (1-31) for fixed expenses only
- Click "Add Expense" to save

### ✅ Edit Existing Expenses
- Click "Edit" button on any expense
- Update any field
- Click "Save Changes" to update
- Click "Cancel" to discard changes

### ✅ Delete Expenses
- Click "Delete" button on any expense
- Confirm deletion in popup dialog
- Expense is permanently removed

### ✅ Smart Organization
- **Fixed Expenses** - Recurring bills with specific due dates
  - Shows due day of month
  - Used in cash flow forecasting
- **Variable Expenses** - Manually tracked amounts
  - No due date required
  - Not auto-scheduled in forecast

## Access Points

### From Dashboard
1. Look for "Quick Actions" section
2. Click **"Manage Expenses"** button
3. Opens expense management page

### Direct URL
Navigate to: `/expenses`

## User Interface

### Summary Card
```
┌─────────────────────────────────────────┐
│ Monthly Expenses    Total Monthly       │
│ Manage your...      ₱15,000            │
└─────────────────────────────────────────┘
```

### Add/Edit Form
```
┌─────────────────────────────────────────┐
│ Add New Expense / Edit Expense          │
├─────────────────────────────────────────┤
│ Expense Name: [____________]            │
│ Amount (₱):   [____________]            │
│ Type:         [Fixed ▼]                 │
│ Priority:     [Needs ▼]                 │
│ Due Day:      [5]                       │
│                                         │
│ [Add Expense] [Cancel]                  │
└─────────────────────────────────────────┘
```

### Expense Card
```
┌─────────────────────────────────────────┐
│ Rent                    [Need]          │
│ Due on day 5 of each month              │
│ ₱8,000              [Edit] [Delete]     │
└─────────────────────────────────────────┘
```

## Field Descriptions

### Name
- Required
- Any text (e.g., "Rent", "Internet", "Gym Membership")
- Displays as expense title

### Amount
- Required
- Number only
- Monthly amount in Philippine Pesos (₱)
- Used in forecasting calculations

### Type

**Fixed:**
- Recurring expenses with predictable amounts
- Scheduled on specific day each month
- Examples: Rent, utilities, subscriptions
- Requires "Due Day" field

**Variable:**
- Expenses that vary month-to-month
- Not automatically scheduled
- Examples: Groceries, gas, entertainment
- No due date needed

### Priority

**Needs:**
- Essential expenses
- Must be paid to maintain basic living
- Examples: Rent, food, utilities, insurance
- Badge color: Red

**Wants:**
- Discretionary spending
- Can be reduced if needed
- Examples: Dining out, subscriptions, hobbies
- Badge color: Blue

### Due Day (Fixed expenses only)
- Optional for variable expenses
- Required for fixed expenses
- Number between 1-31
- Day of month when expense is due
- Used to schedule in cash flow forecast

## Impact on Forecasting

### Fixed Expenses
- **Automatically scheduled** in forecast
- Appear on their due day each month
- Reduce balance on scheduled date
- Included in "safe to spend" calculation

### Variable Expenses
- **Not auto-scheduled** in forecast
- User enters manually when spent
- Tracked for budgeting purposes
- Not included in automatic projections

## Examples

### Example 1: Adding Fixed Rent Expense
```
Name:     Rent
Amount:   8000
Type:     Fixed
Priority: Needs
Due Day:  5
```
Result: ₱8,000 deducted on the 5th of each month in forecast

### Example 2: Adding Variable Grocery Expense
```
Name:     Groceries
Amount:   3000
Type:     Variable
Priority: Needs
Due Day:  (leave empty)
```
Result: Not auto-scheduled, tracked for monthly budget

### Example 3: Editing Existing Expense
1. Click "Edit" on "Internet" expense
2. Change amount from ₱1,500 to ₱1,800
3. Click "Save Changes"
Result: Updated in database, new amount used in forecasts

## Data Validation

- ✅ Name cannot be empty
- ✅ Amount must be a valid number
- ✅ Amount must be greater than 0
- ✅ Due day must be 1-31 (if provided)
- ✅ Fixed expenses should have a due day
- ✅ Confirmation required before deletion

## Database Operations

All changes are saved immediately to Supabase:

- **Create:** Insert new row in `expenses` table
- **Read:** Query all expenses for current user
- **Update:** Modify existing expense row
- **Delete:** Remove expense row (with confirmation)

Row Level Security ensures users can only access their own expenses.

## Tips for Users

### Best Practices

1. **Be Specific**
   - "Electric Bill" instead of "Utilities"
   - Easier to track and understand

2. **Use Fixed Type for Predictable Bills**
   - Rent, subscriptions, loan payments
   - Allows accurate forecasting

3. **Mark True Needs**
   - Only essentials get "Needs" priority
   - Helps identify cutting opportunities

4. **Keep Variable Expenses Updated**
   - Review monthly
   - Update amounts as spending habits change

5. **Delete Old Expenses**
   - Cancelled subscriptions
   - Paid-off loans
   - Keeps forecast accurate

### Common Use Cases

**Adding a New Bill:**
1. Got a new gym membership
2. Click "Add New Expense"
3. Enter details with due date
4. Automatically included in future forecasts

**Subscription Price Changed:**
1. Netflix increased price
2. Click "Edit" on Netflix expense
3. Update amount
4. Forecasts now use new price

**Cancelled Service:**
1. Cancelled unused subscription
2. Click "Delete"
3. Confirm deletion
4. No longer deducted in forecasts

**Review Spending:**
1. Open expenses page
2. See total monthly expenses
3. Identify areas to reduce
4. Edit or delete unnecessary expenses

## Integration with Dashboard

After editing expenses:
1. Return to dashboard
2. Forecast automatically uses updated data
3. "Safe to Spend" recalculates
4. Upcoming transactions reflect changes

## Mobile Experience

Fully responsive design:
- Touch-friendly buttons
- Clear labels
- Easy to scroll through expenses
- Form fits mobile screens
- No horizontal scrolling required

## Technical Details

**File:** `/app/expenses/page.tsx`

**Features:**
- Client-side React component
- Real-time Supabase queries
- Optimistic UI updates
- Form validation
- Confirmation dialogs

**Database Table:** `expenses`
```sql
- id (uuid)
- user_id (uuid, foreign key)
- name (text)
- amount (decimal)
- type ('fixed' | 'variable')
- priority ('needs' | 'wants')
- due_day (integer, 1-31, nullable)
```

## Future Enhancements

Possible improvements for V2:
- Recurring expense templates
- Expense categories
- Monthly spending history
- Expense trends/charts
- Bulk import/export
- Duplicate expense button
- Search and filter

---

**Status:** ✅ Live and Functional

Users can now fully manage their expenses with a clean, intuitive interface!

