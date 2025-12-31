'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { runWhatIfScenario, forecastUntilNextPayday, type ForecastResult } from '@/lib/forecast';
import { formatCurrency, parseCurrency } from '@/lib/currency';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function WhatIfPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [baseForecast, setBaseForecast] = useState<ForecastResult | null>(null);
  const [whatIfForecast, setWhatIfForecast] = useState<ForecastResult | null>(null);
  const [hypotheticalSpend, setHypotheticalSpend] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

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

      // Fetch all user data
      const [accountsRes, incomesRes, expensesRes] = await Promise.all([
        supabase.from('accounts').select('*').eq('user_id', user.id),
        supabase.from('incomes').select('*').eq('user_id', user.id),
        supabase.from('expenses').select('*').eq('user_id', user.id),
      ]);

      if (accountsRes.error) throw accountsRes.error;
      if (incomesRes.error) throw incomesRes.error;
      if (expensesRes.error) throw expensesRes.error;

      const account = accountsRes.data?.[0] as any;
      const incomesData = (incomesRes.data || []) as any[];
      const expensesData = (expensesRes.data || []) as any[];

      if (!account || incomesData.length === 0) {
        router.push('/setup');
        return;
      }

      setCurrentBalance(account.balance);
      setIncomes(incomesData);
      setExpenses(expensesData);

      // Run base forecast
      const baseResult = forecastUntilNextPayday(
        account.balance,
        incomesData.map((i: any) => ({
          amount: i.amount,
          frequency: i.frequency,
          payday_rule: i.payday_rule,
          custom_day: i.custom_day || undefined,
        })),
        expensesData.map(e => ({
          name: e.name,
          amount: e.amount,
          type: e.type,
          priority: e.priority,
          due_day: e.due_day || undefined,
        }))
      );

      setBaseForecast(baseResult);
    } catch (error) {
      console.error('What-if error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunScenario = () => {
    if (!baseForecast || !hypotheticalSpend) return;

    const spendAmount = parseFloat(hypotheticalSpend);
    if (isNaN(spendAmount) || spendAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const whatIfResult = runWhatIfScenario(
      {
        startingBalance: currentBalance,
        incomes: incomes.map(i => ({
          amount: i.amount,
          frequency: i.frequency,
          payday_rule: i.payday_rule,
          custom_day: i.custom_day || undefined,
        })),
        expenses: expenses.map(e => ({
          name: e.name,
          amount: e.amount,
          type: e.type,
          priority: e.priority,
          due_day: e.due_day || undefined,
        })),
        fromDate: new Date(),
        toDate: baseForecast.dailyBalances[baseForecast.dailyBalances.length - 1].date,
      },
      spendAmount
    );

    setWhatIfForecast(whatIfResult);
  };

  const handleClear = () => {
    setHypotheticalSpend('');
    setWhatIfForecast(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!baseForecast) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">No forecast data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-gray-900">← What-If Scenario</h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Test a Hypothetical Purchase
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              See how a purchase would impact your finances until next payday
            </p>

            <div className="space-y-4">
              <Input
                label="How much do you want to spend?"
                type="number"
                placeholder="1000"
                value={hypotheticalSpend}
                onChange={(e) => setHypotheticalSpend(e.target.value)}
              />

              <div className="flex space-x-3">
                <Button onClick={handleRunScenario} fullWidth>
                  Run Scenario
                </Button>
                {whatIfForecast && (
                  <Button onClick={handleClear} variant="secondary" fullWidth>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Comparison */}
          {whatIfForecast && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Forecast */}
                <Card className="border-2 border-gray-300">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Current Forecast
                    </h3>

                    <div>
                      <p className="text-sm text-gray-600">Ending Balance</p>
                      <p className="text-2xl font-bold text-gray-900 currency">
                        {formatCurrency(baseForecast.endingBalance)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Minimum Balance</p>
                      <p className="text-xl font-semibold text-gray-900 currency">
                        {formatCurrency(baseForecast.minimumBalance)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Safe to Spend</p>
                      <p className="text-xl font-semibold text-primary-600 currency">
                        {formatCurrency(baseForecast.safeToSpend)}
                      </p>
                    </div>

                    {baseForecast.hasNegativeBalance && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-sm text-danger-600">
                          ⚠️ Goes negative
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* What-If Forecast */}
                <Card className={`border-2 ${
                  whatIfForecast.hasNegativeBalance 
                    ? 'border-danger-500 bg-danger-50' 
                    : 'border-primary-500 bg-primary-50'
                }`}>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      After Spending {formatCurrency(parseFloat(hypotheticalSpend))}
                    </h3>

                    <div>
                      <p className="text-sm text-gray-600">Ending Balance</p>
                      <p className={`text-2xl font-bold currency ${
                        whatIfForecast.endingBalance < 0 ? 'text-danger-600' : 'text-gray-900'
                      }`}>
                        {formatCurrency(whatIfForecast.endingBalance)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Change: {formatCurrency(whatIfForecast.endingBalance - baseForecast.endingBalance)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Minimum Balance</p>
                      <p className={`text-xl font-semibold currency ${
                        whatIfForecast.minimumBalance < 0 ? 'text-danger-600' : 'text-gray-900'
                      }`}>
                        {formatCurrency(whatIfForecast.minimumBalance)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Change: {formatCurrency(whatIfForecast.minimumBalance - baseForecast.minimumBalance)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Safe to Spend (Remaining)</p>
                      <p className={`text-xl font-semibold currency ${
                        whatIfForecast.safeToSpend < 0 ? 'text-danger-600' : 'text-primary-600'
                      }`}>
                        {formatCurrency(whatIfForecast.safeToSpend)}
                      </p>
                    </div>

                    {whatIfForecast.hasNegativeBalance && (
                      <div className="pt-2 border-t border-danger-300">
                        <p className="text-sm font-semibold text-danger-700">
                          ⚠️ This would cause negative balance!
                        </p>
                        <p className="text-xs text-danger-600 mt-1">
                          Goes negative on{' '}
                          {whatIfForecast.negativeBalanceDate?.toLocaleDateString('en-PH', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Verdict */}
              <Card className={`text-center ${
                whatIfForecast.hasNegativeBalance 
                  ? 'border-2 border-danger-500' 
                  : 'border-2 border-primary-500'
              }`}>
                {whatIfForecast.hasNegativeBalance ? (
                  <>
                    <h3 className="text-2xl font-bold text-danger-700 mb-2">
                      ❌ Not Recommended
                    </h3>
                    <p className="text-danger-600">
                      This purchase would put you in a negative balance. Consider waiting until after your next payday.
                    </p>
                  </>
                ) : whatIfForecast.safeToSpend < baseForecast.safeToSpend * 0.3 ? (
                  <>
                    <h3 className="text-2xl font-bold text-yellow-700 mb-2">
                      ⚠️ Risky but Possible
                    </h3>
                    <p className="text-yellow-700">
                      This purchase would significantly reduce your buffer. Proceed with caution.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-primary-700 mb-2">
                      ✅ Safe to Proceed
                    </h3>
                    <p className="text-primary-600">
                      You can afford this purchase and still maintain a healthy buffer.
                    </p>
                  </>
                )}
              </Card>
            </>
          )}

          <div className="text-center">
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

