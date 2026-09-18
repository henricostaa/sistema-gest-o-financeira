import type { Debt, MonthlyBudget, Transaction } from '../types/finance';

// Calculate monthly metrics
export interface MonthlyMetrics {
  totalIncomePaid: number;
  totalIncomePending: number;
  totalIncome: number;
  totalExpensePaid: number;
  totalExpensePending: number;
  totalExpense: number;
  monthlyBalance: number;
  titheToSeparate: number; // 10% of total income
}

export const calculateMonthlyMetrics = (
  transactions: Transaction[],
  month: number,
  year: number,
  tithePercentage: number = 10
): MonthlyMetrics => {
  const filtered = transactions.filter((t) => {
    const d = new Date(t.date + 'T00:00:00');
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });

  let totalIncomePaid = 0;
  let totalIncomePending = 0;
  let totalExpensePaid = 0;
  let totalExpensePending = 0;

  filtered.forEach((t) => {
    if (t.type === 'receita') {
      if (t.status === 'pago') totalIncomePaid += t.amount;
      else totalIncomePending += t.amount;
    } else {
      if (t.status === 'pago') totalExpensePaid += t.amount;
      else totalExpensePending += t.amount;
    }
  });

  const totalIncome = totalIncomePaid + totalIncomePending;
  const totalExpense = totalExpensePaid + totalExpensePending;
  const monthlyBalance = totalIncomePaid - totalExpensePaid;
  const titheToSeparate = (totalIncome * tithePercentage) / 100;

  return {
    totalIncomePaid,
    totalIncomePending,
    totalIncome,
    totalExpensePaid,
    totalExpensePending,
    totalExpense,
    monthlyBalance,
    titheToSeparate,
  };
};

// Calculate annual accumulative metrics (Jan to Dec of selected year)
export interface AnnualMetrics {
  annualIncome: number;
  annualExpense: number;
  annualBalance: number;
}

export const calculateAnnualMetrics = (
  transactions: Transaction[],
  year: number
): AnnualMetrics => {
  const filtered = transactions.filter((t) => {
    const d = new Date(t.date + 'T00:00:00');
    return d.getFullYear() === year && t.status === 'pago';
  });

  let annualIncome = 0;
  let annualExpense = 0;

  filtered.forEach((t) => {
    if (t.type === 'receita') annualIncome += t.amount;
    else annualExpense += t.amount;
  });

  return {
    annualIncome,
    annualExpense,
    annualBalance: annualIncome - annualExpense,
  };
};

// Snowball Debt calculations
export interface DebtMetrics {
  totalOriginal: number;
  totalNegotiated: number;
  totalPaid: number;
  totalRemaining: number;
  percentPaid: number;
  sortedDebts: Debt[];
  nextSnowballTarget: Debt | null;
  monthsUntilTargetDate: number;
  monthlyPaceNeeded: number;
}

export const calculateDebtMetrics = (
  debts: Debt[],
  targetDateStr: string = '2026-12-31'
): DebtMetrics => {
  let totalOriginal = 0;
  let totalNegotiated = 0;
  let totalPaid = 0;

  const processed: Debt[] = debts.map((d) => {
    const baseAmount = d.negotiatedAmount > 0 ? d.negotiatedAmount : d.originalAmount;
    const remaining = Math.max(0, baseAmount - d.paidAmount);
    const status = remaining === 0 ? 'quitada' : d.status;
    return {
      ...d,
      effectiveAmount: baseAmount,
      remainingAmount: remaining,
      status,
    };
  });

  processed.forEach((d) => {
    totalOriginal += d.originalAmount;
    totalNegotiated += d.effectiveAmount || d.originalAmount;
    totalPaid += d.paidAmount;
  });

  const totalRemaining = Math.max(0, totalNegotiated - totalPaid);
  const percentPaid = totalNegotiated > 0 ? (totalPaid / totalNegotiated) * 100 : 100;

  // Snowball sort: Sort by remaining amount ascending (smallest debt first)
  const sortedDebts = [...processed].sort((a, b) => {
    if (a.status === 'quitada' && b.status !== 'quitada') return 1;
    if (a.status !== 'quitada' && b.status === 'quitada') return -1;
    return (a.remainingAmount || 0) - (b.remainingAmount || 0);
  });

  const nextSnowballTarget = sortedDebts.find((d) => (d.remainingAmount || 0) > 0) || null;

  // Calculate pace to clear debt by targetDate (Dec 2026)
  const now = new Date();
  const target = new Date(targetDateStr + 'T00:00:00');
  const monthDiff = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  const monthsUntilTargetDate = Math.max(1, monthDiff);
  const monthlyPaceNeeded = totalRemaining > 0 ? totalRemaining / monthsUntilTargetDate : 0;

  return {
    totalOriginal,
    totalNegotiated,
    totalPaid,
    totalRemaining,
    percentPaid,
    sortedDebts,
    nextSnowballTarget,
    monthsUntilTargetDate,
    monthlyPaceNeeded,
  };
};

// Category Budget Consumption
export interface CategoryBudgetAnalysis {
  categoryId: string;
  plannedAmount: number;
  realizedAmount: number;
  difference: number; // planned - realized
  percentUsed: number;
  statusColor: 'green' | 'yellow' | 'red';
}

export const calculateBudgetAnalysis = (
  budgets: MonthlyBudget[],
  transactions: Transaction[],
  categoryId: string,
  month: number,
  year: number
): CategoryBudgetAnalysis => {
  const budget = budgets.find(
    (b) => b.categoryId === categoryId && b.month === month && b.year === year
  );
  const plannedAmount = budget ? budget.plannedAmount : 0;

  // Realized = sum of paid expenses for this category in the month
  const realizedAmount = transactions
    .filter((t) => {
      const d = new Date(t.date + 'T00:00:00');
      return (
        t.categoryId === categoryId &&
        t.type === 'despesa' &&
        t.status === 'pago' &&
        d.getMonth() + 1 === month &&
        d.getFullYear() === year
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const difference = plannedAmount - realizedAmount;
  const percentUsed = plannedAmount > 0 ? (realizedAmount / plannedAmount) * 100 : realizedAmount > 0 ? 100 : 0;

  let statusColor: 'green' | 'yellow' | 'red' = 'green';
  if (percentUsed > 100) {
    statusColor = 'red';
  } else if (percentUsed >= 80) {
    statusColor = 'yellow';
  }

  return {
    categoryId,
    plannedAmount,
    realizedAmount,
    difference,
    percentUsed,
    statusColor,
  };
};

// Emergency Fund suggestions
export const calculateEmergencyFundSuggestions = (transactions: Transaction[]) => {
  // Calculate average monthly expenses
  const expenseMonthsMap: { [key: string]: number } = {};
  transactions.forEach((t) => {
    if (t.type === 'despesa' && t.status === 'pago') {
      const yearMonth = t.date.substring(0, 7); // YYYY-MM
      expenseMonthsMap[yearMonth] = (expenseMonthsMap[yearMonth] || 0) + t.amount;
    }
  });

  const monthKeys = Object.keys(expenseMonthsMap);
  const totalMonths = Math.max(1, monthKeys.length);
  const totalExpenseSum = Object.values(expenseMonthsMap).reduce((a, b) => a + b, 0);
  const averageMonthlyExpense = totalExpenseSum / totalMonths;

  return {
    averageMonthlyExpense,
    suggested3Months: averageMonthlyExpense * 3,
    suggested6Months: averageMonthlyExpense * 6,
  };
};
