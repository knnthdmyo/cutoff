/**
 * Core forecasting engine for cash flow simulation
 * 
 * This module simulates day-by-day cash flow from current date until next payday
 * and calculates safe-to-spend amounts.
 */

import { getNextPayday, getPaydaysBetween, type PaydayRule } from './payday';

export interface Income {
  amount: number;
  frequency: 'monthly' | 'biweekly';
  payday_rule: PaydayRule;
  custom_day?: number;
}

export interface Expense {
  name: string;
  amount: number;
  type: 'fixed' | 'variable';
  priority: 'needs' | 'wants';
  due_day?: number; // Day of month (1-31)
}

export interface ForecastInput {
  startingBalance: number;
  incomes: Income[];
  expenses: Expense[];
  fromDate: Date;
  toDate: Date;
}

export interface DailyBalance {
  date: Date;
  balance: number;
  events: Array<{
    type: 'income' | 'expense';
    name: string;
    amount: number;
  }>;
}

export interface ForecastResult {
  dailyBalances: DailyBalance[];
  endingBalance: number;
  minimumBalance: number;
  safeToSpend: number;
  hasNegativeBalance: boolean;
  negativeBalanceDate?: Date;
}

/**
 * Run a complete cash flow forecast
 */
export function runForecast(input: ForecastInput): ForecastResult {
  const { startingBalance, incomes, expenses, fromDate, toDate } = input;
  
  // Generate all scheduled transactions
  const scheduledTransactions = generateScheduledTransactions(
    incomes,
    expenses,
    fromDate,
    toDate
  );
  
  // Simulate day by day
  const dailyBalances: DailyBalance[] = [];
  let currentBalance = startingBalance;
  let minimumBalance = startingBalance;
  let hasNegativeBalance = false;
  let negativeBalanceDate: Date | undefined;
  
  // Iterate through each day
  let currentDate = new Date(fromDate);
  while (currentDate <= toDate) {
    const dateKey = formatDateKey(currentDate);
    const dayTransactions = scheduledTransactions.get(dateKey) || [];
    
    const dayEvents: DailyBalance['events'] = [];
    
    // Process all transactions for this day
    for (const transaction of dayTransactions) {
      currentBalance += transaction.amount;
      dayEvents.push({
        type: transaction.type,
        name: transaction.name,
        amount: transaction.amount,
      });
    }
    
    // Record daily balance
    dailyBalances.push({
      date: new Date(currentDate),
      balance: currentBalance,
      events: dayEvents,
    });
    
    // Track minimum and negative balances
    if (currentBalance < minimumBalance) {
      minimumBalance = currentBalance;
    }
    
    if (currentBalance < 0 && !hasNegativeBalance) {
      hasNegativeBalance = true;
      negativeBalanceDate = new Date(currentDate);
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const endingBalance = currentBalance;
  
  // Calculate safe to spend
  // Safe to spend = minimum projected balance minus safety buffer
  const safetyBuffer = 500; // Keep at least ₱500 buffer
  const safeToSpend = Math.max(0, minimumBalance - safetyBuffer);
  
  return {
    dailyBalances,
    endingBalance,
    minimumBalance,
    safeToSpend,
    hasNegativeBalance,
    negativeBalanceDate,
  };
}

/**
 * Generate all scheduled transactions between two dates
 */
function generateScheduledTransactions(
  incomes: Income[],
  expenses: Expense[],
  fromDate: Date,
  toDate: Date
): Map<string, Array<{ type: 'income' | 'expense'; name: string; amount: number }>> {
  const transactions = new Map<string, Array<{ type: 'income' | 'expense'; name: string; amount: number }>>();
  
  // Schedule income events
  for (const income of incomes) {
    const paydays = getPaydaysBetween(
      fromDate,
      toDate,
      income.payday_rule,
      income.custom_day
    );
    
    for (const payday of paydays) {
      const key = formatDateKey(payday);
      if (!transactions.has(key)) {
        transactions.set(key, []);
      }
      transactions.get(key)!.push({
        type: 'income',
        name: 'Salary',
        amount: income.amount,
      });
    }
  }
  
  // Schedule expense events
  for (const expense of expenses) {
    if (expense.type === 'fixed' && expense.due_day) {
      // Schedule on specific day of each month
      const expenseDates = getMonthlyExpenseDates(
        fromDate,
        toDate,
        expense.due_day
      );
      
      for (const expenseDate of expenseDates) {
        const key = formatDateKey(expenseDate);
        if (!transactions.has(key)) {
          transactions.set(key, []);
        }
        transactions.get(key)!.push({
          type: 'expense',
          name: expense.name,
          amount: -expense.amount, // Negative for expense
        });
      }
    }
    // Variable expenses are not scheduled - user adds them manually
  }
  
  return transactions;
}

/**
 * Get all dates for a monthly expense between date range
 */
function getMonthlyExpenseDates(
  fromDate: Date,
  toDate: Date,
  dayOfMonth: number
): Date[] {
  const dates: Date[] = [];
  let current = new Date(fromDate);
  
  // Start from the first occurrence
  current.setDate(dayOfMonth);
  if (current < fromDate) {
    current.setMonth(current.getMonth() + 1);
  }
  
  while (current <= toDate) {
    dates.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
    
    // Safety check
    if (dates.length > 12) break;
  }
  
  return dates;
}

/**
 * Format date as YYYY-MM-DD for map keys
 */
function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Run a what-if scenario: what happens if I spend X amount?
 */
export function runWhatIfScenario(
  baseInput: ForecastInput,
  hypotheticalSpend: number
): ForecastResult {
  // Create new input with reduced starting balance
  const whatIfInput: ForecastInput = {
    ...baseInput,
    startingBalance: baseInput.startingBalance - hypotheticalSpend,
  };
  
  return runForecast(whatIfInput);
}

/**
 * Quick forecast until next payday (most common use case)
 */
export function forecastUntilNextPayday(
  startingBalance: number,
  incomes: Income[],
  expenses: Expense[]
): ForecastResult {
  const fromDate = new Date();
  
  // Find the earliest next payday from all income sources
  const nextPaydays = incomes.map(income =>
    getNextPayday(fromDate, income.payday_rule, income.custom_day)
  );
  
  const toDate = nextPaydays.reduce((earliest, current) =>
    current < earliest ? current : earliest
  );
  
  return runForecast({
    startingBalance,
    incomes,
    expenses,
    fromDate,
    toDate,
  });
}

