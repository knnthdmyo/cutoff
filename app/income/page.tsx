'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { formatCurrency } from '@/lib/currency';
import { getNextPayday, getCurrentCutoffPeriod } from '@/lib/payday';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Income {
  id: string;
  amount: number;
  frequency: 'monthly' | 'biweekly';
  payday_rule: '15_30' | 'custom';
  custom_day: number | null;
}

interface Account {
  id: string;
  balance: number;
}

export default function IncomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState<Income | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    frequency: 'biweekly' as 'monthly' | 'biweekly',
    payday_rule: '15_30' as '15_30' | 'custom',
    custom_day: '',
    balance: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Load income
      const { data: incomeData, error: incomeError } = await supabase
        .from('incomes')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (incomeError && incomeError.code !== 'PGRST116') throw incomeError;

      // Load account
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (accountError && accountError.code !== 'PGRST116') throw accountError;

      setIncome(incomeData);
      setAccount(accountData);

      if (incomeData) {
        setFormData({
          amount: (incomeData as any).amount.toString(),
          frequency: (incomeData as any).frequency,
          payday_rule: (incomeData as any).payday_rule,
          custom_day: (incomeData as any).custom_day?.toString() || '',
          balance: (accountData as any)?.balance?.toString() || '0',
        });
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (income) {
      setFormData({
        amount: income.amount.toString(),
        frequency: income.frequency,
        payday_rule: income.payday_rule,
        custom_day: income.custom_day?.toString() || '',
        balance: account?.balance?.toString() || '0',
      });
    }
  };

  const handleSave = async () => {
    if (!formData.amount || !formData.balance) {
      alert('Please fill in salary amount and current balance');
      return;
    }

    if (formData.payday_rule === 'custom' && !formData.custom_day) {
      alert('Please specify custom payday');
      return;
    }

    try {
      const user = await getCurrentUser();
      if (!user) return;

      const incomeData = {
        amount: parseFloat(formData.amount),
        frequency: formData.frequency,
        payday_rule: formData.payday_rule,
        custom_day: formData.payday_rule === 'custom' ? parseInt(formData.custom_day) : null,
      };

      // Update income
      if (income) {
        const { error } = await (supabase as any)
          .from('incomes')
          .update(incomeData)
          .eq('id', income.id);

        if (error) throw error;
      }

      // Update account balance
      if (account) {
        const { error } = await (supabase as any)
          .from('accounts')
          .update({ balance: parseFloat(formData.balance) })
          .eq('id', account.id);

        if (error) throw error;
      }

      // Reload data
      await loadData();
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save changes');
    }
  };

  const getNextPaydayDate = () => {
    if (!income) return null;
    return getNextPayday(
      new Date(),
      income.payday_rule,
      income.custom_day || undefined
    );
  };

  const getDaysUntilPayday = () => {
    const nextPayday = getNextPaydayDate();
    if (!nextPayday) return 0;
    return Math.ceil((nextPayday.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!income) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <p className="text-gray-600">No income data found.</p>
          <p className="text-sm text-gray-500 mt-2">
            Please complete setup first.
          </p>
          <Link href="/setup" className="mt-4 block">
            <Button fullWidth>Go to Setup</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const nextPayday = getNextPaydayDate();
  const daysUntilPayday = getDaysUntilPayday();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-gray-900">← Income & Balance</h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Current Info Card */}
          {!isEditing && (
            <>
              <Card>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-gray-900">
                      Income Information
                    </h2>
                    <Button onClick={handleEdit} variant="secondary">
                      Edit
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {/* Current Balance */}
                    <div className="border-b border-gray-200 pb-4">
                      <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                      <p className="text-3xl font-bold text-gray-900 currency">
                        {formatCurrency(account?.balance || 0)}
                      </p>
                    </div>

                    {/* Salary per Cutoff */}
                    <div className="border-b border-gray-200 pb-4">
                      <p className="text-sm text-gray-600 mb-1">Salary per Cutoff</p>
                      <p className="text-3xl font-bold text-gray-900 currency">
                        {formatCurrency(income.amount)}
                      </p>
                    </div>

                    {/* Pay Schedule */}
                    <div className="border-b border-gray-200 pb-4">
                      <p className="text-sm text-gray-600 mb-1">Pay Schedule</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {income.payday_rule === '15_30' 
                          ? '15th and End of Month (15/30)'
                          : `Custom: Day ${income.custom_day} of each month`
                        }
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Frequency: {income.frequency === 'biweekly' ? 'Bi-weekly' : 'Monthly'}
                      </p>
                    </div>

                    {/* Next Payday */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Next Payday</p>
                      <p className="text-lg font-semibold text-primary-600">
                        {nextPayday?.toLocaleDateString('en-PH', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {daysUntilPayday} {daysUntilPayday === 1 ? 'day' : 'days'} from now
                      </p>
                    </div>

                    {/* Current Cutoff Period */}
                    <div className="bg-primary-50 rounded-lg p-4">
                      <p className="text-sm text-primary-700 mb-1">Current Period</p>
                      <p className="text-lg font-semibold text-primary-900">
                        {getCurrentCutoffPeriod(new Date())}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Helpful Info */}
              <Card className="bg-blue-50 border-blue-200">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="font-medium text-blue-900">Why update this?</p>
                    <ul className="text-sm text-blue-800 mt-2 space-y-1">
                      <li>• Salary changed? Update to get accurate forecasts</li>
                      <li>• Got a raise? Reflect it here immediately</li>
                      <li>• Balance changed? Keep forecasts in sync</li>
                      <li>• Changed jobs? Update pay schedule</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Edit Form */}
          {isEditing && (
            <Card className="border-2 border-primary-500">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Edit Income & Balance
              </h3>

              <div className="space-y-4">
                <Input
                  label="Current Balance (₱)"
                  type="number"
                  placeholder="10000"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                />

                <Input
                  label="Salary per Cutoff (₱)"
                  type="number"
                  placeholder="15000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'monthly' | 'biweekly' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="biweekly">Bi-weekly (15/30)</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pay Schedule
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="15_30"
                        checked={formData.payday_rule === '15_30'}
                        onChange={() => setFormData({ ...formData, payday_rule: '15_30', custom_day: '' })}
                        className="mr-2"
                      />
                      <span>15th and End of Month (Standard)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="custom"
                        checked={formData.payday_rule === 'custom'}
                        onChange={() => setFormData({ ...formData, payday_rule: 'custom' })}
                        className="mr-2"
                      />
                      <span>Custom Day of Month</span>
                    </label>
                  </div>
                </div>

                {formData.payday_rule === 'custom' && (
                  <Input
                    label="Custom Payday (1-31)"
                    type="number"
                    min="1"
                    max="31"
                    placeholder="25"
                    value={formData.custom_day}
                    onChange={(e) => setFormData({ ...formData, custom_day: e.target.value })}
                  />
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">⚠️</span>
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Changing your pay schedule will affect all future forecasts. 
                      Your existing expenses and goals will remain unchanged.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <Button onClick={handleSave} fullWidth>
                    Save Changes
                  </Button>
                  <Button onClick={handleCancel} variant="secondary" fullWidth>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
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

