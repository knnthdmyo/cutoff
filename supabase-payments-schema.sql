-- Payment Tracking for Expenses
-- Run this in your Supabase SQL Editor to add payment tracking

-- Create payments table to track expense payments
CREATE TABLE IF NOT EXISTS expense_payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE NOT NULL,
  month INTEGER NOT NULL, -- 1-12
  year INTEGER NOT NULL,
  paid_date DATE,
  actual_amount DECIMAL(12, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(expense_id, month, year)
);

-- Enable RLS
ALTER TABLE expense_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own payments"
  ON expense_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
  ON expense_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments"
  ON expense_payments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payments"
  ON expense_payments FOR DELETE
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_expense_payments_user_id ON expense_payments(user_id);
CREATE INDEX idx_expense_payments_expense_id ON expense_payments(expense_id);
CREATE INDEX idx_expense_payments_month_year ON expense_payments(month, year);

-- Updated_at trigger
CREATE TRIGGER update_expense_payments_updated_at 
  BEFORE UPDATE ON expense_payments
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

