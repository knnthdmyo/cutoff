'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, signOut } from '@/lib/auth';
import { forecastUntilNextPayday, type ForecastResult } from '@/lib/forecast';
import { getNextPayday, getCurrentCutoffPeriod } from '@/lib/payday';
import { formatCurrency } from '@/lib/currency';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  type: 'emergency' | 'investment' | 'general';
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [nextPayday, setNextPayday] = useState<Date | null>(null);
  const [cutoffPeriod, setCutoffPeriod] = useState('');
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Fetch all user data
      const accountsRes = await supabase.from('accounts').select('*').eq('user_id', user.id);
      const incomesRes = await supabase.from('incomes').select('*').eq('user_id', user.id);
      const expensesRes = await supabase.from('expenses').select('*').eq('user_id', user.id);
      const goalsRes = await supabase.from('goals').select('*').eq('user_id', user.id).order('priority', { ascending: true });

      if (accountsRes.error) throw accountsRes.error;
      if (incomesRes.error) throw incomesRes.error;
      if (expensesRes.error) throw expensesRes.error;
      if (goalsRes.error) throw goalsRes.error;

      const account = accountsRes.data?.[0] as any;
      const incomes = (incomesRes.data || []) as any[];
      const expenses = (expensesRes.data || []) as any[];
      const goalsData = (goalsRes.data || []) as any[];
      
      setGoals(goalsData);

      if (!account || incomes.length === 0) {
        router.push('/setup');
        return;
      }

      setCurrentBalance(account.balance);

      // Calculate next payday
      const income = incomes[0];
      const payday = getNextPayday(
        new Date(),
        income.payday_rule,
        income.custom_day || undefined
      );
      setNextPayday(payday);
      setCutoffPeriod(getCurrentCutoffPeriod(new Date()));

      // Run forecast
      const forecastResult = forecastUntilNextPayday(
        account.balance,
        incomes.map((i: any) => ({
          amount: i.amount,
          frequency: i.frequency,
          payday_rule: i.payday_rule,
          custom_day: i.custom_day || undefined,
        })),
        expenses.map((e: any) => ({
          name: e.name,
          amount: e.amount,
          type: e.type,
          priority: e.priority,
          due_day: e.due_day || undefined,
        }))
      );

      setForecast(forecastResult);
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    // Redirect to signout page which handles the actual signout process
    router.push('/auth/signout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">No forecast data available</p>
      </div>
    );
  }

  const daysUntilPayday = nextPayday
    ? Math.ceil((nextPayday.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Cutoff</h1>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Current Status */}
          <Card>
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Current Period</p>
              <p className="text-lg font-semibold text-gray-900">{cutoffPeriod}</p>
              <p className="text-sm text-gray-600">
                {daysUntilPayday} {daysUntilPayday === 1 ? 'day' : 'days'} until next payday
              </p>
            </div>
          </Card>

          {/* Balance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <p className="text-sm text-gray-600 mb-1">Current Balance</p>
              <p className="text-3xl font-bold text-gray-900 currency">
                {formatCurrency(currentBalance)}
              </p>
            </Card>

            <Card>
              <p className="text-sm text-gray-600 mb-1">Ending Balance (Forecast)</p>
              <p className={`text-3xl font-bold currency ${
                forecast.endingBalance < 0 ? 'text-danger-600' : 'text-gray-900'
              }`}>
                {formatCurrency(forecast.endingBalance)}
              </p>
            </Card>
          </div>

          {/* Safe to Spend - The Star of the Show */}
          <Card className={`${
            forecast.hasNegativeBalance 
              ? 'border-2 border-danger-500 bg-danger-50' 
              : 'border-2 border-primary-500 bg-primary-50'
          }`}>
            <div className="text-center space-y-3">
              {forecast.hasNegativeBalance ? (
                <>
                  <h2 className="text-xl font-bold text-danger-700">
                    ⚠️ Warning: Budget Deficit
                  </h2>
                  <p className="text-danger-700">
                    Your balance will go negative on{' '}
                    {forecast.negativeBalanceDate?.toLocaleDateString('en-PH', {
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-danger-600">
                    Minimum balance: {formatCurrency(forecast.minimumBalance)}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-primary-700">
                    Safe to Spend This Cutoff
                  </h2>
                  <p className="text-5xl font-bold text-primary-700 currency">
                    {formatCurrency(forecast.safeToSpend)}
                  </p>
                  <p className="text-sm text-primary-600">
                    This keeps you ₱500 above your minimum balance
                  </p>
                </>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/recommendations">
              <Button fullWidth className="bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700">
                💡 Get Recommendations
              </Button>
            </Link>
            <Link href="/expenses/tracker">
              <Button fullWidth className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                ✅ Track Bill Payments
              </Button>
            </Link>
            <Link href="/income">
              <Button fullWidth variant="secondary">
                Edit Income & Balance
              </Button>
            </Link>
            <Link href="/expenses">
              <Button fullWidth variant="secondary">
                Manage Expenses
              </Button>
            </Link>
            <Link href="/what-if">
              <Button fullWidth variant="secondary">
                Run What-If Scenario
              </Button>
            </Link>
            <Link href="/goals">
              <Button fullWidth variant="secondary">
                View Goals
              </Button>
            </Link>
          </div>

          {/* Goals Summary */}
          {goals.length > 0 && (
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Financial Goals
                </h3>
                <Link href="/goals" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {goals.slice(0, 3).map((goal) => {
                  const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
                  const isComplete = progress >= 100;
                  
                  const getGoalIcon = (type: string) => {
                    switch (type) {
                      case 'emergency': return '🚨';
                      case 'investment': return '📈';
                      default: return '🎯';
                    }
                  };

                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{getGoalIcon(goal.type)}</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {goal.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {formatCurrency(goal.current_amount)} of {formatCurrency(goal.target_amount)}
                            </p>
                          </div>
                        </div>
                        {isComplete && <span className="text-lg">✅</span>}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isComplete ? 'bg-primary-600' : 'bg-primary-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600">
                        {progress.toFixed(0)}% complete
                      </p>
                    </div>
                  );
                })}
              </div>
              {goals.length > 3 && (
                <div className="mt-4 pt-3 border-t border-gray-200 text-center">
                  <Link href="/goals" className="text-sm text-gray-600 hover:text-gray-900">
                    +{goals.length - 3} more goal{goals.length - 3 !== 1 ? 's' : ''}
                  </Link>
                </div>
              )}
            </Card>
          )}

          {/* Upcoming Transactions */}
          {forecast.dailyBalances.length > 0 && (
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Upcoming Transactions
              </h3>
              <div className="space-y-3">
                {forecast.dailyBalances
                  .filter(day => day.events.length > 0)
                  .slice(0, 5)
                  .map((day, index) => (
                    <div key={index} className="border-b border-gray-200 pb-3 last:border-0">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {day.date.toLocaleDateString('en-PH', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      {day.events.map((event, eventIndex) => (
                        <div key={eventIndex} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">{event.name}</span>
                          <span className={`text-sm font-medium ${
                            event.type === 'income' ? 'text-primary-600' : 'text-gray-900'
                          }`}>
                            {event.type === 'income' ? '+' : ''}
                            {formatCurrency(Math.abs(event.amount))}
                          </span>
                        </div>
                      ))}
                      <div className="mt-1 text-right">
                        <span className="text-xs text-gray-500">
                          Balance: {formatCurrency(day.balance)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

