'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { formatCurrency } from '@/lib/currency';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Expense {
  id: string;
  name: string;
  amount: number;
  due_day: number | null;
  type: 'fixed' | 'variable';
  priority: 'needs' | 'wants';
}

interface Payment {
  id: string;
  expense_id: string;
  paid_date: string | null;
  actual_amount: number | null;
  notes: string | null;
}

export default function ExpenseTrackerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    actual_amount: '',
    paid_date: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [currentMonth, currentYear]);

  const loadData = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Load fixed expenses only
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'fixed')
        .order('due_day', { ascending: true, nullsFirst: false });

      if (expensesError) throw expensesError;

      // Load payments for current month
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('expense_payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .eq('year', currentYear);

      if (paymentsError) throw paymentsError;

      setExpenses(expensesData || []);
      setPayments(paymentsData || []);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentForExpense = (expenseId: string): Payment | undefined => {
    return payments.find(p => p.expense_id === expenseId);
  };

  const togglePaid = async (expense: Expense) => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const existingPayment = getPaymentForExpense(expense.id);

      if (existingPayment) {
        // Unmark as paid
        const { error } = await supabase
          .from('expense_payments')
          .delete()
          .eq('id', existingPayment.id);

        if (error) throw error;
      } else {
        // Mark as paid with default values
        const { error } = await (supabase as any)
          .from('expense_payments')
          .insert({
            user_id: user.id,
            expense_id: expense.id,
            month: currentMonth,
            year: currentYear,
            paid_date: new Date().toISOString().split('T')[0],
            actual_amount: expense.amount,
          });

        if (error) throw error;
      }

      await loadData();
    } catch (error) {
      console.error('Toggle error:', error);
      alert('Failed to update payment status');
    }
  };

  const startEditPayment = (expense: Expense) => {
    const payment = getPaymentForExpense(expense.id);
    setEditingPayment(expense.id);
    setPaymentForm({
      actual_amount: payment?.actual_amount?.toString() || expense.amount.toString(),
      paid_date: payment?.paid_date || new Date().toISOString().split('T')[0],
      notes: payment?.notes || '',
    });
  };

  const savePaymentDetails = async (expense: Expense) => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const existingPayment = getPaymentForExpense(expense.id);
      
      const paymentData = {
        user_id: user.id,
        expense_id: expense.id,
        month: currentMonth,
        year: currentYear,
        paid_date: paymentForm.paid_date || null,
        actual_amount: paymentForm.actual_amount ? parseFloat(paymentForm.actual_amount) : null,
        notes: paymentForm.notes || null,
      };

      if (existingPayment) {
        const { error } = await (supabase as any)
          .from('expense_payments')
          .update(paymentData)
          .eq('id', existingPayment.id);

        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from('expense_payments')
          .insert(paymentData);

        if (error) throw error;
      }

      setEditingPayment(null);
      await loadData();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save payment details');
    }
  };

  const changeMonth = (delta: number) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const getPaidTotal = () => {
    return payments.reduce((sum, p) => sum + (p.actual_amount || 0), 0);
  };

  const getUnpaidTotal = () => {
    const unpaidExpenses = expenses.filter(e => !getPaymentForExpense(e.id));
    return unpaidExpenses.reduce((sum, e) => sum + e.amount, 0);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/expenses">
            <h1 className="text-2xl font-bold text-gray-900">← Payment Tracker</h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Month Selector */}
          <Card>
            <div className="flex justify-between items-center">
              <Button onClick={() => changeMonth(-1)} variant="secondary">
                ← Previous
              </Button>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {monthNames[currentMonth - 1]} {currentYear}
                </h2>
                <p className="text-sm text-gray-600">
                  Track your monthly bill payments
                </p>
              </div>
              <Button onClick={() => changeMonth(1)} variant="secondary">
                Next →
              </Button>
            </div>
          </Card>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <p className="text-sm text-gray-600 mb-1">Total Bills</p>
              <p className="text-2xl font-bold text-gray-900 currency">
                {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
              </p>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <p className="text-sm text-green-700 mb-1">Paid</p>
              <p className="text-2xl font-bold text-green-700 currency">
                {formatCurrency(getPaidTotal())}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {payments.length} of {expenses.length} bills
              </p>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <p className="text-sm text-red-700 mb-1">Unpaid</p>
              <p className="text-2xl font-bold text-red-700 currency">
                {formatCurrency(getUnpaidTotal())}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {expenses.length - payments.length} remaining
              </p>
            </Card>
          </div>

          {/* Expenses List */}
          {expenses.length === 0 ? (
            <Card className="text-center">
              <p className="text-gray-600">No fixed expenses to track.</p>
              <p className="text-sm text-gray-500 mt-2">
                Add fixed expenses in the Expenses page.
              </p>
              <Link href="/expenses" className="mt-4 block">
                <Button fullWidth>Go to Expenses</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => {
                const payment = getPaymentForExpense(expense.id);
                const isPaid = !!payment;
                const isEditing = editingPayment === expense.id;

                return (
                  <Card key={expense.id} className={isPaid ? 'bg-green-50 border-green-200' : ''}>
                    <div className="space-y-3">
                      {/* Expense Header */}
                      <div className="flex items-start gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Checkbox */}
                          <button
                            onClick={() => togglePaid(expense)}
                            className="mt-1"
                          >
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                              isPaid 
                                ? 'bg-green-600 border-green-600' 
                                : 'bg-white border-gray-300 hover:border-green-500'
                            }`}>
                              {isPaid && (
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </button>

                          <div className="flex-1 min-w-0">
                            <h3 className={`text-base sm:text-lg font-semibold truncate ${
                              isPaid ? 'text-green-900 line-through decoration-2' : 'text-green-900'
                            }`}>
                              {expense.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-xs sm:text-sm text-green-700 font-medium">
                                Day {expense.due_day}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                expense.priority === 'needs'
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                  : 'bg-sky-100 text-sky-700 border border-sky-200'
                              }`}>
                                {expense.priority === 'needs' ? 'Need' : 'Want'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className={`text-lg sm:text-xl font-bold currency ${
                            isPaid ? 'text-green-800' : 'text-green-900'
                          }`}>
                            {formatCurrency(expense.amount)}
                          </p>
                        </div>
                      </div>

                      {/* Payment Details */}
                      {isPaid && !isEditing && (
                        <div className="pl-9 pt-2 border-t border-green-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-green-700">
                                <strong>Paid:</strong> {formatCurrency(payment.actual_amount || expense.amount)}
                              </p>
                              {payment.paid_date && (
                                <p className="text-sm text-green-600">
                                  <strong>Date:</strong> {new Date(payment.paid_date).toLocaleDateString('en-PH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </p>
                              )}
                              {payment.notes && (
                                <p className="text-sm text-green-600 mt-1">
                                  <strong>Notes:</strong> {payment.notes}
                                </p>
                              )}
                            </div>
                            <Button
                              onClick={() => startEditPayment(expense)}
                              variant="secondary"
                              className="text-sm"
                            >
                              Edit Details
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Edit Payment Form */}
                      {isEditing && (
                        <div className="pl-9 pt-2 border-t border-gray-200 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              label="Actual Amount Paid (₱)"
                              type="number"
                              value={paymentForm.actual_amount}
                              onChange={(e) => setPaymentForm({ ...paymentForm, actual_amount: e.target.value })}
                            />
                            <Input
                              label="Date Paid"
                              type="date"
                              value={paymentForm.paid_date}
                              onChange={(e) => setPaymentForm({ ...paymentForm, paid_date: e.target.value })}
                            />
                          </div>
                          <Input
                            label="Notes (optional)"
                            placeholder="Payment confirmation number, etc."
                            value={paymentForm.notes}
                            onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                          />
                          <div className="flex space-x-2">
                            <Button onClick={() => savePaymentDetails(expense)} fullWidth>
                              Save Details
                            </Button>
                            <Button onClick={() => setEditingPayment(null)} variant="secondary" fullWidth>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Quick Actions */}
                      {!isPaid && !isEditing && (
                        <div className="pl-9">
                          <Button
                            onClick={() => startEditPayment(expense)}
                            variant="secondary"
                            className="text-sm"
                          >
                            Add Payment Details
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Back Button */}
          <div className="text-center pt-4">
            <Link href="/dashboard">
              <Button variant="secondary">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

