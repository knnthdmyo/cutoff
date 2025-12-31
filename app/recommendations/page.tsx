'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { forecastUntilNextPayday } from '@/lib/forecast';
import { generateRecommendations, getHealthScoreLabel, type AllocationRecommendation } from '@/lib/recommendations';
import { formatCurrency } from '@/lib/currency';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function RecommendationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<AllocationRecommendation | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState(0);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Fetch all user data
      const [accountsRes, incomesRes, expensesRes, goalsRes] = await Promise.all([
        supabase.from('accounts').select('*').eq('user_id', user.id),
        supabase.from('incomes').select('*').eq('user_id', user.id),
        supabase.from('expenses').select('*').eq('user_id', user.id),
        supabase.from('goals').select('*').eq('user_id', user.id),
      ]);

      if (accountsRes.error) throw accountsRes.error;
      if (incomesRes.error) throw incomesRes.error;
      if (expensesRes.error) throw expensesRes.error;
      if (goalsRes.error) throw goalsRes.error;

      const account = accountsRes.data?.[0] as any;
      const incomes = (incomesRes.data || []) as any[];
      const expenses = (expensesRes.data || []) as any[];
      const goals = (goalsRes.data || []) as any[];

      if (!account || incomes.length === 0) {
        router.push('/setup');
        return;
      }

      // Run forecast to get safe to spend
      const forecast = forecastUntilNextPayday(
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

      // Calculate monthly income (income per cutoff * 2 for biweekly)
      const income = incomes[0];
      const monthlyInc = income.frequency === 'biweekly' ? income.amount * 2 : income.amount;
      setMonthlyIncome(monthlyInc);

      // Generate recommendations
      const recs = generateRecommendations({
        safeToSpend: forecast.safeToSpend,
        monthlyIncome: monthlyInc,
        expenses: expenses.map(e => ({
          amount: e.amount,
          type: e.type,
          priority: e.priority,
        })),
        goals: goals.map(g => ({
          name: g.name,
          target_amount: g.target_amount,
          current_amount: g.current_amount,
          type: g.type,
        })),
        currentBalance: account.balance,
        minimumBalance: forecast.minimumBalance,
      });

      setRecommendations(recs);
    } catch (error) {
      console.error('Recommendations error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Calculating recommendations...</p>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <p className="text-gray-600">Unable to generate recommendations.</p>
          <p className="text-sm text-gray-500 mt-2">
            Please ensure you have completed setup.
          </p>
        </Card>
      </div>
    );
  }

  const healthInfo = getHealthScoreLabel(recommendations.summary.healthScore);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-gray-900">← Financial Recommendations</h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Financial Health Score */}
          <Card className="border-2 border-primary-500 bg-gradient-to-br from-primary-50 to-white">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">Your Financial Health Score</p>
              <div className="flex items-center justify-center space-x-3">
                <span className="text-5xl">{healthInfo.emoji}</span>
                <div className="text-left">
                  <p className="text-5xl font-bold text-gray-900">
                    {recommendations.summary.healthScore}
                  </p>
                  <p className={`text-lg font-semibold ${healthInfo.color}`}>
                    {healthInfo.label}
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
                <div
                  className="bg-primary-600 h-4 rounded-full transition-all"
                  style={{ width: `${recommendations.summary.healthScore}%` }}
                ></div>
              </div>
            </div>
          </Card>

          {/* Key Advice */}
          {recommendations.summary.keyAdvice.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-3">
                💡 Key Recommendations
              </h3>
              <ul className="space-y-2">
                {recommendations.summary.keyAdvice.map((advice, index) => (
                  <li key={index} className="text-blue-800 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Monthly Allocation Breakdown */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Recommended Monthly Allocation
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Based on your monthly income of {formatCurrency(monthlyIncome)}
            </p>

            <div className="space-y-4">
              {/* Emergency Fund */}
              <div className={`p-4 rounded-lg border-2 ${
                recommendations.emergencyFund.priority === 'high' 
                  ? 'border-danger-300 bg-danger-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🚨</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Emergency Fund
                      </h3>
                      {recommendations.emergencyFund.priority === 'high' && (
                        <span className="text-xs font-medium text-danger-700 uppercase">
                          High Priority
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 currency">
                    {formatCurrency(recommendations.emergencyFund.recommended)}
                  </p>
                </div>
                <p className="text-sm text-gray-700 mt-2">
                  {recommendations.emergencyFund.reasoning}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Target: {recommendations.emergencyFund.targetMonths} months of expenses
                </p>
              </div>

              {/* Savings */}
              <div className="p-4 rounded-lg border-2 border-primary-200 bg-primary-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">💰</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Short-Term Savings
                      </h3>
                      <span className="text-xs font-medium text-primary-700">
                        {recommendations.savings.percentage.toFixed(1)}% of income
                      </span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 currency">
                    {formatCurrency(recommendations.savings.recommended)}
                  </p>
                </div>
                <p className="text-sm text-gray-700 mt-2">
                  {recommendations.savings.reasoning}
                </p>
              </div>

              {/* Investments */}
              <div className="p-4 rounded-lg border-2 border-green-200 bg-green-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">📈</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Long-Term Investments
                      </h3>
                      <span className="text-xs font-medium text-green-700">
                        {recommendations.investments.percentage.toFixed(1)}% of income
                      </span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 currency">
                    {formatCurrency(recommendations.investments.recommended)}
                  </p>
                </div>
                <p className="text-sm text-gray-700 mt-2">
                  {recommendations.investments.reasoning}
                </p>
              </div>

              {/* Discretionary */}
              <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🎉</span>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Discretionary Spending
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 currency">
                    {formatCurrency(recommendations.discretionary.recommended)}
                  </p>
                </div>
                <p className="text-sm text-gray-700 mt-2">
                  {recommendations.discretionary.reasoning}
                </p>
              </div>
            </div>

            {/* Total */}
            <div className="mt-6 pt-4 border-t-2 border-gray-300">
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold text-gray-900">
                  Total Allocated:
                </p>
                <p className="text-2xl font-bold text-gray-900 currency">
                  {formatCurrency(recommendations.summary.totalAllocated)}
                </p>
              </div>
            </div>
          </Card>

          {/* How to Use These Recommendations */}
          <Card className="bg-yellow-50 border-yellow-200">
            <h3 className="text-lg font-bold text-yellow-900 mb-3">
              📋 How to Use These Recommendations
            </h3>
            <ol className="space-y-2 text-yellow-800">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                <span>Set up automatic transfers for emergency fund and savings</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">2.</span>
                <span>Open an investment account (COL Financial, Philstocks, or similar)</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                <span>Consider index funds or mutual funds for long-term investments</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">4.</span>
                <span>Use discretionary amount guilt-free for wants and lifestyle</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">5.</span>
                <span>Review and adjust monthly as income or expenses change</span>
              </li>
            </ol>
          </Card>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/goals">
              <Button fullWidth variant="secondary">
                Update Financial Goals
              </Button>
            </Link>
            <Link href="/expenses">
              <Button fullWidth variant="secondary">
                Review Expenses
              </Button>
            </Link>
          </div>

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

