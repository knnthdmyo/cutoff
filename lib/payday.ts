/**
 * Payday calculation logic for Philippine cutoff schedules
 */

export type PaydayRule = '15_30' | 'custom';

/**
 * Get the next payday date based on Philippine 15/30 cutoff
 */
export function getNextPayday(
  fromDate: Date,
  rule: PaydayRule,
  customDay?: number
): Date {
  const current = new Date(fromDate);
  
  if (rule === 'custom' && customDay) {
    return getNextCustomPayday(current, customDay);
  }
  
  // Default: 15/30 cutoff
  return getNext15_30Payday(current);
}

/**
 * Get next payday for 15/30 schedule
 */
function getNext15_30Payday(fromDate: Date): Date {
  const day = fromDate.getDate();
  const month = fromDate.getMonth();
  const year = fromDate.getFullYear();
  
  // If before or on the 15th, next payday is the 15th
  if (day <= 15) {
    return new Date(year, month, 15);
  }
  
  // If after the 15th, next payday is the last day of month
  // Move to next month, then get last day
  const nextMonth = new Date(year, month + 1, 1);
  return getLastDayOfMonth(nextMonth);
}

/**
 * Get the last day of the month for a given date
 */
function getLastDayOfMonth(date: Date): Date {
  const year = date.getFullYear();
  const month = date.getMonth();
  // Set to next month, day 0 = last day of previous month
  return new Date(year, month + 1, 0);
}

/**
 * Get next payday for custom day of month
 */
function getNextCustomPayday(fromDate: Date, day: number): Date {
  const current = fromDate.getDate();
  const month = fromDate.getMonth();
  const year = fromDate.getFullYear();
  
  // If current day is before payday, return this month's payday
  if (current < day) {
    return new Date(year, month, day);
  }
  
  // Otherwise, next month's payday
  return new Date(year, month + 1, day);
}

/**
 * Get all paydays between two dates
 */
export function getPaydaysBetween(
  startDate: Date,
  endDate: Date,
  rule: PaydayRule,
  customDay?: number
): Date[] {
  const paydays: Date[] = [];
  let current = new Date(startDate);
  
  while (current <= endDate) {
    const nextPayday = getNextPayday(current, rule, customDay);
    
    if (nextPayday <= endDate) {
      paydays.push(nextPayday);
    }
    
    // Move to day after this payday to find the next one
    current = new Date(nextPayday);
    current.setDate(current.getDate() + 1);
    
    // Safety check to prevent infinite loops
    if (paydays.length > 100) break;
  }
  
  return paydays;
}

/**
 * Calculate days until next payday
 */
export function daysUntilNextPayday(
  fromDate: Date,
  rule: PaydayRule,
  customDay?: number
): number {
  const nextPayday = getNextPayday(fromDate, rule, customDay);
  const diffTime = nextPayday.getTime() - fromDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get the current cutoff period (for display)
 */
export function getCurrentCutoffPeriod(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' });
  
  if (day <= 15) {
    return `${month} 1-15`;
  } else {
    return `${month} 16-End`;
  }
}

