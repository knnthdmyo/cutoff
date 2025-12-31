# Payment Tracker Setup Guide

## Prerequisites
- Cutoff app already installed and running
- Supabase project set up
- At least one fixed expense added

## Installation Steps

### Step 1: Run Database Migration

1. **Open Supabase Dashboard**
   - Go to your project at [supabase.com](https://supabase.com)
   - Navigate to "SQL Editor"

2. **Run Migration Script**
   - Open `supabase-payments-schema.sql`
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click "RUN"

3. **Verify Tables Created**
   ```sql
   -- Run this to check:
   SELECT * FROM expense_payments LIMIT 1;
   ```
   - Should return empty result (no errors)

### Step 2: Test the Feature

1. **Access Payment Tracker**
   - Go to your app dashboard
   - Click "✅ Track Bill Payments" button
   - OR navigate to `/expenses/tracker`

2. **Mark a Test Payment**
   - Click checkbox next to any expense
   - Should mark as paid ✅
   - Click again to unmark

3. **Add Payment Details**
   - Click "Add Payment Details"
   - Enter amount, date, notes
   - Click "Save Details"
   - Details should appear

### Step 3: Verify Functionality

**Test Checklist:**
- [ ] See list of fixed expenses
- [ ] Mark expense as paid
- [ ] Unmark expense
- [ ] Add payment details
- [ ] Edit payment details
- [ ] Navigate to next month
- [ ] Navigate to previous month
- [ ] See correct totals (paid/unpaid)

## Database Schema

### New Table: `expense_payments`

```sql
CREATE TABLE expense_payments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  expense_id UUID REFERENCES expenses,
  month INTEGER (1-12),
  year INTEGER (YYYY),
  paid_date DATE,
  actual_amount DECIMAL,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Key Features
- **Unique constraint**: One payment per expense per month
- **RLS enabled**: Users see only their own payments
- **Indexed**: Fast queries on user_id, expense_id, month, year
- **Cascading delete**: Payments deleted if expense deleted

## File Changes

### New Files
```
app/expenses/tracker/page.tsx     # Payment tracker UI
supabase-payments-schema.sql      # Database migration
PAYMENT_TRACKER.md                # Full documentation
PAYMENT_TRACKER_SUMMARY.md        # Quick reference
SETUP_PAYMENT_TRACKER.md          # This file
```

### Modified Files
```
app/dashboard/page.tsx            # Added tracker button
app/expenses/page.tsx             # Added tracker button
types/database.ts                 # Added expense_payments types
CHANGELOG.md                      # Version 1.0.6
README.md                         # Updated features list
```

## Configuration

No configuration needed! The feature uses:
- Existing Supabase connection
- Existing authentication
- Existing expense data

## Troubleshooting

### Problem: Can't see payment tracker
**Solution:** Check URL is `/expenses/tracker` (not `/expenses/track`)

### Problem: "Table doesn't exist" error
**Solution:** Run the database migration script in Supabase

### Problem: No expenses showing
**Solution:** 
- Add fixed expenses in Expenses page first
- Tracker only shows `type: 'fixed'` expenses

### Problem: Can't mark as paid
**Solution:**
- Check you're logged in
- Verify RLS policies were created
- Check browser console for errors

### Problem: Payments disappear next month
**Solution:** This is expected! Each month is independent.

### Problem: Can't edit payment details
**Solution:**
- Expense must be marked as paid first
- Try refreshing the page

## Usage Tips

### Best Practices
1. **Track regularly** - Check off bills as you pay them
2. **Add confirmations** - Store confirmation numbers in notes
3. **Review monthly** - Check previous months for patterns
4. **Update amounts** - Record actual amounts for variable bills

### Workflow Suggestions

**Weekly Check-In:**
```
1. Open payment tracker
2. See upcoming due dates
3. Pay bills that are due
4. Check them off immediately
```

**Month-End Review:**
```
1. Navigate to current month
2. Verify all bills paid
3. Check totals match expectations
4. Navigate to next month
```

**Tax Time:**
```
1. Navigate through past months
2. Review all payments
3. Check notes for confirmations
4. Export data (if needed)
```

## Security

### Row Level Security (RLS)
- ✅ Enabled on `expense_payments` table
- ✅ Users can only see/edit their own payments
- ✅ Automatic user_id filtering
- ✅ Secure by default

### Data Privacy
- Payment data never shared
- Stored in your Supabase instance
- Encrypted at rest
- Secured in transit

## Performance

### Optimizations
- Indexed queries (fast lookups)
- Month-based filtering (small datasets)
- Efficient rendering
- Minimal re-renders

### Scalability
- Handles years of data
- Fast with 100s of expenses
- Efficient pagination (future)

## Next Steps

1. ✅ Run database migration
2. ✅ Test the feature
3. 📝 Add your fixed expenses (if not done)
4. ✅ Start tracking payments
5. 🎉 Never miss a bill again!

## Support

### Documentation
- **Full Docs**: `PAYMENT_TRACKER.md`
- **Quick Reference**: `PAYMENT_TRACKER_SUMMARY.md`
- **This Guide**: `SETUP_PAYMENT_TRACKER.md`

### Common Tasks

**How to mark as paid:**
- Click checkbox next to expense

**How to add details:**
- Click "Add Payment Details" button

**How to edit:**
- Click "Edit Details" on paid expense

**How to unmark:**
- Click checked checkbox

**How to change months:**
- Click "← Previous" or "Next →"

## Verification

After setup, you should be able to:

✅ See all your fixed expenses  
✅ Mark them as paid/unpaid  
✅ Add payment amounts and dates  
✅ Record confirmation numbers  
✅ Navigate between months  
✅ See paid vs unpaid totals  
✅ Review payment history  

## Quick Test

```
1. Go to /expenses/tracker
2. Click checkbox on first expense
3. Verify it turns green ✅
4. Click "Edit Details"
5. Add a note: "Test payment"
6. Save
7. See note displayed
8. Click checkbox again to unmark
9. Verify it turns white again
```

If all steps work: **Setup successful!** 🎉

## Rollback (if needed)

To remove the feature:

```sql
-- In Supabase SQL Editor:
DROP TABLE IF EXISTS expense_payments CASCADE;
```

Then remove the tracker button from dashboard/expenses pages.

---

## Summary

✅ **Database**: Run `supabase-payments-schema.sql`  
✅ **Test**: Visit `/expenses/tracker`  
✅ **Use**: Start checking off bills!  

**Estimated setup time: 2 minutes**

Enjoy never missing a bill payment again! 🎉✅

