/**
 * Financial recommendations engine
 * Provides personalized suggestions for savings, investments, and emergency fund
 */

import type { ForecastResult } from './forecast';

export interface Expense {
  amount: number;
  type: 'fixed' | 'variable';
  priority: 'needs' | 'wants';
}

export interface Goal {
  name: string;
  target_amount: number;
  current_amount: number;
  type: 'emergency' | 'investment' | 'general';
}

export interface RecommendationInput {
  safeToSpend: number;
  monthlyIncome: number;
  expenses: Expense[];
  goals: Goal[];
  currentBalance: number;
  minimumBalance: number;
}

export interface AllocationRecommendation {
  emergencyFund: {
    recommended: number;
    reasoning: string;
    priority: 'high' | 'medium' | 'low';
    targetMonths: number;
  };
  savings: {
    recommended: number;
    reasoning: string;
    percentage: number;
  };
  investments: {
    recommended: number;
    reasoning: string;
    percentage: number;
  };
  discretionary: {
    recommended: number;
    reasoning: string;
  };
  summary: {
    totalAllocated: number;
    healthScore: number; // 0-100
    keyAdvice: string[];
  };
}

/**
 * Calculate 50/30/20 rule allocations
 * 50% needs, 30% wants, 20% savings/investments
 */
function calculate50_30_20(monthlyIncome: number) {
  return {
    needs: monthlyIncome * 0.5,
    wants: monthlyIncome * 0.3,
    savings: monthlyIncome * 0.2,
  };
}

/**
 * Calculate emergency fund target (3-6 months of expenses)
 */
function calculateEmergencyFundTarget(expenses: Expense[]): number {
  const monthlyNeeds = expenses
    .filter(e => e.priority === 'needs')
    .reduce((sum, e) => sum + e.amount, 0);
  
  // Target: 3 months minimum, 6 months ideal
  return monthlyNeeds * 6;
}

/**
 * Determine emergency fund health
 */
function getEmergencyFundHealth(current: number, target: number): 'critical' | 'building' | 'good' | 'excellent' {
  const percentage = (current / target) * 100;
  
  if (percentage < 25) return 'critical';
  if (percentage < 50) return 'building';
  if (percentage < 100) return 'good';
  return 'excellent';
}

/**
 * Generate comprehensive recommendations
 */
export function generateRecommendations(input: RecommendationInput): AllocationRecommendation {
  const {
    safeToSpend,
    monthlyIncome,
    expenses,
    goals,
    currentBalance,
    minimumBalance,
  } = input;

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const needsExpenses = expenses
    .filter(e => e.priority === 'needs')
    .reduce((sum, e) => sum + e.amount, 0);
  const wantsExpenses = expenses
    .filter(e => e.priority === 'wants')
    .reduce((sum, e) => sum + e.amount, 0);

  // Get emergency fund goal
  const emergencyGoal = goals.find(g => g.type === 'emergency');
  const emergencyFundTarget = emergencyGoal?.target_amount || calculateEmergencyFundTarget(expenses);
  const emergencyFundCurrent = emergencyGoal?.current_amount || 0;
  const emergencyFundGap = Math.max(0, emergencyFundTarget - emergencyFundCurrent);
  const emergencyHealth = getEmergencyFundHealth(emergencyFundCurrent, emergencyFundTarget);

  // Calculate surplus (income - expenses)
  const monthlySurplus = monthlyIncome - totalExpenses;

  // 50/30/20 reference
  const idealAllocation = calculate50_30_20(monthlyIncome);

  // Key advice array
  const keyAdvice: string[] = [];

  // === EMERGENCY FUND RECOMMENDATION ===
  let emergencyRecommended = 0;
  let emergencyPriority: 'high' | 'medium' | 'low' = 'medium';
  let emergencyReasoning = '';
  
  if (emergencyHealth === 'critical') {
    // Urgent: allocate 30-40% of surplus
    emergencyRecommended = monthlySurplus * 0.35;
    emergencyPriority = 'high';
    emergencyReasoning = 'Your emergency fund is critically low. Prioritize building it to at least 3 months of expenses.';
    keyAdvice.push('🚨 Build emergency fund urgently - you\'re vulnerable to unexpected expenses');
  } else if (emergencyHealth === 'building') {
    // Important: allocate 25% of surplus
    emergencyRecommended = monthlySurplus * 0.25;
    emergencyPriority = 'high';
    emergencyReasoning = 'You\'re making progress! Continue building your emergency fund to reach 6 months of expenses.';
    keyAdvice.push('💪 Keep building emergency fund - you\'re halfway there');
  } else if (emergencyHealth === 'good') {
    // Maintenance: allocate 15% of surplus
    emergencyRecommended = monthlySurplus * 0.15;
    emergencyPriority = 'medium';
    emergencyReasoning = 'Almost there! Top up your emergency fund to reach the ideal 6-month target.';
  } else {
    // Excellent: minimal allocation
    emergencyRecommended = 0;
    emergencyPriority = 'low';
    emergencyReasoning = 'Great job! Your emergency fund is fully funded. Focus on other financial goals.';
    keyAdvice.push('✅ Emergency fund is solid - focus on growth');
  }

  // Cap emergency fund recommendation at the gap
  emergencyRecommended = Math.min(emergencyRecommended, emergencyFundGap);

  // === SAVINGS RECOMMENDATION ===
  // Savings = short-term goals, liquid funds
  let savingsRecommended = 0;
  let savingsPercentage = 0;
  let savingsReasoning = '';

  const remainingAfterEmergency = monthlySurplus - emergencyRecommended;

  if (emergencyHealth === 'excellent') {
    // If emergency fund is good, allocate more to savings
    savingsRecommended = remainingAfterEmergency * 0.4; // 40% of remaining
    savingsPercentage = (savingsRecommended / monthlyIncome) * 100;
    savingsReasoning = 'With a solid emergency fund, you can focus on building short-term savings for goals and opportunities.';
  } else {
    // Otherwise, moderate savings
    savingsRecommended = remainingAfterEmergency * 0.3; // 30% of remaining
    savingsPercentage = (savingsRecommended / monthlyIncome) * 100;
    savingsReasoning = 'Build savings for short-term goals while maintaining emergency fund contributions.';
  }

  // === INVESTMENTS RECOMMENDATION ===
  // Investments = long-term growth
  let investmentsRecommended = 0;
  let investmentsPercentage = 0;
  let investmentsReasoning = '';

  const remainingAfterSavings = remainingAfterEmergency - savingsRecommended;

  if (emergencyHealth === 'critical' || emergencyHealth === 'building') {
    // Don't invest until emergency fund is solid
    investmentsRecommended = 0;
    investmentsPercentage = 0;
    investmentsReasoning = 'Focus on emergency fund first. Start investing once you have 3-6 months of expenses saved.';
    keyAdvice.push('⏳ Hold off on investing until emergency fund is built');
  } else if (emergencyHealth === 'good') {
    // Start small with investments
    investmentsRecommended = remainingAfterSavings * 0.5; // 50% of remaining
    investmentsPercentage = (investmentsRecommended / monthlyIncome) * 100;
    investmentsReasoning = 'You can start investing for long-term growth. Consider index funds or retirement accounts.';
    keyAdvice.push('🌱 You\'re ready to start investing for the future');
  } else {
    // Maximize investments
    investmentsRecommended = remainingAfterSavings * 0.7; // 70% of remaining
    investmentsPercentage = (investmentsRecommended / monthlyIncome) * 100;
    investmentsReasoning = 'Strong financial foundation! Maximize long-term wealth building through consistent investments.';
    keyAdvice.push('📈 Great position to maximize investment growth');
  }

  // === DISCRETIONARY (SPENDING MONEY) ===
  const discretionaryRecommended = remainingAfterSavings - investmentsRecommended;
  const discretionaryReasoning = 'This is your flexible spending money after all allocations. Enjoy responsibly!';

  // === HEALTH SCORE (0-100) ===
  let healthScore = 0;
  
  // Emergency fund health (40 points)
  const efPercentage = (emergencyFundCurrent / emergencyFundTarget) * 100;
  healthScore += Math.min(40, (efPercentage / 100) * 40);
  
  // Savings rate (30 points) - targeting 20% of income
  const totalSavingsRate = ((savingsRecommended + investmentsRecommended + emergencyRecommended) / monthlyIncome) * 100;
  healthScore += Math.min(30, (totalSavingsRate / 20) * 30);
  
  // Expense ratio (30 points) - needs should be under 50% of income
  const needsRatio = (needsExpenses / monthlyIncome) * 100;
  if (needsRatio <= 50) {
    healthScore += 30;
  } else if (needsRatio <= 60) {
    healthScore += 20;
  } else {
    healthScore += 10;
  }

  healthScore = Math.round(Math.min(100, healthScore));

  // Additional advice based on analysis
  if (needsExpenses > monthlyIncome * 0.5) {
    keyAdvice.push('⚠️ Your "needs" expenses exceed 50% of income - look for ways to reduce');
  }

  if (wantsExpenses > monthlyIncome * 0.3) {
    keyAdvice.push('💰 Consider reducing "wants" spending to free up more for savings');
  }

  if (monthlySurplus < 0) {
    keyAdvice.push('🚨 URGENT: Expenses exceed income - reduce spending or increase income');
  }

  if (totalSavingsRate >= 20) {
    keyAdvice.push('🏆 Excellent! You\'re saving 20%+ of income');
  }

  // === ASSEMBLE FINAL RECOMMENDATION ===
  const totalAllocated = emergencyRecommended + savingsRecommended + investmentsRecommended + discretionaryRecommended;

  return {
    emergencyFund: {
      recommended: Math.max(0, Math.round(emergencyRecommended)),
      reasoning: emergencyReasoning,
      priority: emergencyPriority,
      targetMonths: 6,
    },
    savings: {
      recommended: Math.max(0, Math.round(savingsRecommended)),
      reasoning: savingsReasoning,
      percentage: Math.round(savingsPercentage * 10) / 10,
    },
    investments: {
      recommended: Math.max(0, Math.round(investmentsRecommended)),
      reasoning: investmentsReasoning,
      percentage: Math.round(investmentsPercentage * 10) / 10,
    },
    discretionary: {
      recommended: Math.max(0, Math.round(discretionaryRecommended)),
      reasoning: discretionaryReasoning,
    },
    summary: {
      totalAllocated: Math.round(totalAllocated),
      healthScore,
      keyAdvice,
    },
  };
}

/**
 * Get health score interpretation
 */
export function getHealthScoreLabel(score: number): { label: string; color: string; emoji: string } {
  if (score >= 80) {
    return { label: 'Excellent', color: 'text-green-700', emoji: '🌟' };
  } else if (score >= 60) {
    return { label: 'Good', color: 'text-primary-700', emoji: '👍' };
  } else if (score >= 40) {
    return { label: 'Fair', color: 'text-yellow-700', emoji: '⚠️' };
  } else {
    return { label: 'Needs Improvement', color: 'text-danger-700', emoji: '🚨' };
  }
}

