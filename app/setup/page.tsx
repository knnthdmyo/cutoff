'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

type Step = 'income' | 'expenses' | 'goals' | 'complete';

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('income');
  const [loading, setLoading] = useState(false);

  // Income data
  const [salary, setSalary] = useState('');
  const [paydayRule, setPaydayRule] = useState<'15_30' | 'custom'>('15_30');
  const [customDay, setCustomDay] = useState('');
  const [currentBalance, setCurrentBalance] = useState('');

  // Expense data
  const [expenses, setExpenses] = useState<Array<{
    name: string;
    amount: string;
    dueDay: string;
  }>>([{ name: '', amount: '', dueDay: '' }]);

  // Goal data
  const [emergencyFundTarget, setEmergencyFundTarget] = useState('');
  const [emergencyFundCurrent, setEmergencyFundCurrent] = useState('0');

  const addExpense = () => {
    setExpenses([...expenses, { name: '', amount: '', dueDay: '' }]);
  };

  const updateExpense = (index: number, field: string, value: string) => {
    const updated = [...expenses];
    updated[index] = { ...updated[index], [field]: value };
    setExpenses(updated);
  };

  const removeExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const handleIncomeSubmit = () => {
    if (!salary || !currentBalance) {
      alert('Please fill in all fields');
      return;
    }
    setStep('expenses');
  };

  const handleExpensesSubmit = () => {
    const validExpenses = expenses.filter(e => e.name && e.amount && e.dueDay);
    if (validExpenses.length === 0) {
      alert('Please add at least one expense');
      return;
    }
    setStep('goals');
  };

  const handleGoalsSubmit = async () => {
    if (!emergencyFundTarget) {
      alert('Please set an emergency fund goal');
      return;
    }

    setLoading(true);

    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      // Save account
      const { data: account, error: accountError } = await (supabase as any)
        .from('accounts')
        .insert({
          user_id: user.id,
          name: 'Main Account',
          balance: parseFloat(currentBalance),
        })
        .select()
        .single();

      if (accountError) throw accountError;

      // Save income
      const { error: incomeError } = await (supabase as any)
        .from('incomes')
        .insert({
          user_id: user.id,
          amount: parseFloat(salary),
          frequency: 'biweekly',
          payday_rule: paydayRule,
          custom_day: paydayRule === 'custom' ? parseInt(customDay) : null,
        });

      if (incomeError) throw incomeError;

      // Save expenses
      const validExpenses = expenses.filter(e => e.name && e.amount && e.dueDay);
      const expenseInserts = validExpenses.map(e => ({
        user_id: user.id,
        name: e.name,
        amount: parseFloat(e.amount),
        type: 'fixed' as const,
        priority: 'needs' as const,
        due_day: parseInt(e.dueDay),
      }));

      const { error: expensesError } = await (supabase as any)
        .from('expenses')
        .insert(expenseInserts);

      if (expensesError) throw expensesError;

      // Save goal
      const { error: goalError } = await (supabase as any)
        .from('goals')
        .insert({
          user_id: user.id,
          name: 'Emergency Fund',
          target_amount: parseFloat(emergencyFundTarget),
          current_amount: parseFloat(emergencyFundCurrent),
          type: 'emergency',
          priority: 1,
        });

      if (goalError) throw goalError;

      setStep('complete');
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Setup error:', error);
      alert('Failed to save setup data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            All Set! 🎉
          </h2>
          <p className="text-gray-600">
            Your account is ready. Redirecting to dashboard...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Cutoff</h1>
          <p className="mt-2 text-gray-600">
            Let's set up your financial forecast
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'income' ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'expenses' ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'goals' ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>

        <Card>
          {step === 'income' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">
                Income & Pay Schedule
              </h2>

              <Input
                label="Current Balance"
                type="number"
                placeholder="10000"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
              />

              <Input
                label="Salary per Cutoff"
                type="number"
                placeholder="15000"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pay Schedule
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="15_30"
                      checked={paydayRule === '15_30'}
                      onChange={() => setPaydayRule('15_30')}
                      className="mr-2"
                    />
                    <span>15th and End of Month (Standard)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="custom"
                      checked={paydayRule === 'custom'}
                      onChange={() => setPaydayRule('custom')}
                      className="mr-2"
                    />
                    <span>Custom Day of Month</span>
                  </label>
                </div>
              </div>

              {paydayRule === 'custom' && (
                <Input
                  label="Custom Payday (1-31)"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="25"
                  value={customDay}
                  onChange={(e) => setCustomDay(e.target.value)}
                />
              )}

              <Button onClick={handleIncomeSubmit} fullWidth>
                Next: Expenses
              </Button>
            </div>
          )}

          {step === 'expenses' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">
                Fixed Monthly Expenses
              </h2>
              <p className="text-sm text-gray-600">
                Add recurring bills (rent, utilities, subscriptions, etc.)
              </p>

              {expenses.map((expense, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Expense #{index + 1}
                    </span>
                    {expenses.length > 1 && (
                      <button
                        onClick={() => removeExpense(index)}
                        className="text-danger-600 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <Input
                    placeholder="Rent, Electricity, etc."
                    value={expense.name}
                    onChange={(e) => updateExpense(index, 'name', e.target.value)}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={expense.amount}
                      onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                    />
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      placeholder="Due day"
                      value={expense.dueDay}
                      onChange={(e) => updateExpense(index, 'dueDay', e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <Button onClick={addExpense} variant="secondary" fullWidth>
                + Add Another Expense
              </Button>

              <div className="flex space-x-3">
                <Button onClick={() => setStep('income')} variant="secondary" fullWidth>
                  Back
                </Button>
                <Button onClick={handleExpensesSubmit} fullWidth>
                  Next: Goals
                </Button>
              </div>
            </div>
          )}

          {step === 'goals' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">
                Emergency Fund Goal
              </h2>
              <p className="text-sm text-gray-600">
                Financial experts recommend 3-6 months of expenses
              </p>

              <Input
                label="Target Amount"
                type="number"
                placeholder="50000"
                value={emergencyFundTarget}
                onChange={(e) => setEmergencyFundTarget(e.target.value)}
              />

              <Input
                label="Current Amount (if any)"
                type="number"
                placeholder="0"
                value={emergencyFundCurrent}
                onChange={(e) => setEmergencyFundCurrent(e.target.value)}
              />

              <div className="flex space-x-3">
                <Button onClick={() => setStep('expenses')} variant="secondary" fullWidth>
                  Back
                </Button>
                <Button onClick={handleGoalsSubmit} fullWidth disabled={loading}>
                  {loading ? 'Saving...' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

