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
  type: 'fixed' | 'variable';
  priority: 'needs' | 'wants';
  due_day: number | null;
}

export default function ExpensesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: 'fixed' as 'fixed' | 'variable',
    priority: 'needs' as 'needs' | 'wants',
    due_day: '',
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('due_day', { ascending: true, nullsFirst: false });

      if (error) throw error;

      setExpenses(data || []);
    } catch (error) {
      console.error('Expenses error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setFormData({
      name: expense.name,
      amount: expense.amount.toString(),
      type: expense.type,
      priority: expense.priority,
      due_day: expense.due_day?.toString() || '',
    });
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingId(null);
    setFormData({
      name: '',
      amount: '',
      type: 'fixed',
      priority: 'needs',
      due_day: '',
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAddingNew(false);
    setFormData({
      name: '',
      amount: '',
      type: 'fixed',
      priority: 'needs',
      due_day: '',
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.amount) {
      alert('Please fill in expense name and amount');
      return;
    }

    try {
      const user = await getCurrentUser();
      if (!user) return;

      const expenseData = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        type: formData.type,
        priority: formData.priority,
        due_day: formData.due_day ? parseInt(formData.due_day) : null,
      };

      if (isAddingNew) {
        // Create new expense
        const { error } = await (supabase as any)
          .from('expenses')
          .insert({
            ...expenseData,
            user_id: user.id,
          });

        if (error) throw error;
      } else if (editingId) {
        // Update existing expense
        const { error } = await (supabase as any)
          .from('expenses')
          .update(expenseData)
          .eq('id', editingId);

        if (error) throw error;
      }

      // Reload expenses
      await loadExpenses();
      handleCancel();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Reload expenses
      await loadExpenses();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete expense');
    }
  };

  const getTotalMonthlyExpenses = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

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
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-gray-900">← Expenses</h1>
          </Link>
          <Link href="/expenses/tracker">
            <Button variant="secondary">
              ✅ Track Payments
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Monthly Expenses
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your recurring bills and expenses
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Monthly</p>
                <p className="text-2xl font-bold text-gray-900 currency">
                  {formatCurrency(getTotalMonthlyExpenses())}
                </p>
              </div>
            </div>
          </Card>

          {/* Add New Button */}
          {!isAddingNew && !editingId && (
            <Button onClick={handleAddNew} fullWidth>
              + Add New Expense
            </Button>
          )}

          {/* Add/Edit Form */}
          {(isAddingNew || editingId) && (
            <Card className="border-2 border-primary-500">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {isAddingNew ? 'Add New Expense' : 'Edit Expense'}
              </h3>

              <div className="space-y-4">
                <Input
                  label="Expense Name"
                  placeholder="e.g., Rent, Electricity, Internet"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <Input
                  label="Amount (₱)"
                  type="number"
                  placeholder="1000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'fixed' | 'variable' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="fixed">Fixed</option>
                      <option value="variable">Variable</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'needs' | 'wants' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="needs">Needs</option>
                      <option value="wants">Wants</option>
                    </select>
                  </div>
                </div>

                {formData.type === 'fixed' && (
                  <Input
                    label="Due Day (1-31)"
                    type="number"
                    min="1"
                    max="31"
                    placeholder="e.g., 5 for 5th of month"
                    value={formData.due_day}
                    onChange={(e) => setFormData({ ...formData, due_day: e.target.value })}
                  />
                )}

                <div className="flex space-x-3 pt-2">
                  <Button onClick={handleSave} fullWidth>
                    {isAddingNew ? 'Add Expense' : 'Save Changes'}
                  </Button>
                  <Button onClick={handleCancel} variant="secondary" fullWidth>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Expenses List */}
          {expenses.length === 0 ? (
            <Card className="text-center">
              <p className="text-gray-600">No expenses added yet.</p>
              <p className="text-sm text-gray-500 mt-2">
                Click "Add New Expense" to get started.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {/* Fixed Expenses */}
              {expenses.filter(e => e.type === 'fixed').length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mt-4">
                    Fixed Expenses
                  </h3>
                  {expenses
                    .filter(e => e.type === 'fixed')
                    .map((expense) => (
                      <Card key={expense.id}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {expense.name}
                              </h4>
                              <span className={`text-xs px-2 py-1 rounded ${
                                expense.priority === 'needs' 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {expense.priority === 'needs' ? 'Need' : 'Want'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Due on day {expense.due_day} of each month
                            </p>
                            <p className="text-2xl font-bold text-gray-900 mt-2 currency">
                              {formatCurrency(expense.amount)}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(expense)}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="text-danger-600 hover:text-danger-700 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}
                </>
              )}

              {/* Variable Expenses */}
              {expenses.filter(e => e.type === 'variable').length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mt-6">
                    Variable Expenses
                  </h3>
                  {expenses
                    .filter(e => e.type === 'variable')
                    .map((expense) => (
                      <Card key={expense.id}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {expense.name}
                              </h4>
                              <span className={`text-xs px-2 py-1 rounded ${
                                expense.priority === 'needs' 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {expense.priority === 'needs' ? 'Need' : 'Want'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Variable amount (manually tracked)
                            </p>
                            <p className="text-2xl font-bold text-gray-900 mt-2 currency">
                              {formatCurrency(expense.amount)}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(expense)}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="text-danger-600 hover:text-danger-700 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}
                </>
              )}
            </div>
          )}

          {/* Back to Dashboard */}
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

