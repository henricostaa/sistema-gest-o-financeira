import React, { createContext, useContext, useEffect, useState } from 'react';
import type {
  Category,
  Debt,
  DebtPayment,
  EmergencyContribution,
  EmergencyFund,
  FinancialGoal,
  MonthlyBudget,
  PaymentMethod,
  Settings,
  Transaction,
  UserProfile,
} from '../types/finance';
import { DEFAULT_SETTINGS, INITIAL_CATEGORIES, INITIAL_PAYMENT_METHODS } from '../utils/constants';

import { getNthBusinessDay, getFixedDayOfMonth } from '../utils/dateUtils';
import { getSupabaseClient } from '../supabase/client';

const STORAGE_KEY_PREFIX = 'finance_app_v1_';

interface TitheNotice {
  isOpen: boolean;
  incomeAmount: number;
  calculatedTithe: number;
}

interface FinanceContextType {
  // Selected period
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonthYear: (month: number, year: number) => void;

  // Data
  transactions: Transaction[];
  getEffectiveTransactionsForMonthYear: (month: number, year: number) => Transaction[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  budgets: MonthlyBudget[];
  debts: Debt[];
  debtPayments: DebtPayment[];
  emergencyFund: EmergencyFund;
  goals: FinancialGoal[];
  settings: Settings;
  user: UserProfile | null;

  // Tithe notice popup state
  titheNotice: TitheNotice;
  closeTitheNotice: () => void;
  confirmAddTitheExpense: () => void;

  // Actions - Transactions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Actions - Categories
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Actions - Payment Methods
  addPaymentMethod: (name: string) => void;
  deletePaymentMethod: (id: string) => void;

  // Actions - Budget
  setPlannedBudget: (categoryId: string, month: number, year: number, plannedAmount: number) => void;

  // Actions - Debts
  addDebt: (debt: Omit<Debt, 'id' | 'paidAmount' | 'status'>) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  addDebtPayment: (debtId: string, amount: number, notes?: string) => void;

  // Actions - Emergency Fund
  updateEmergencyFundTarget: (targetAmount: number, monthlyPlannedContribution: number) => void;
  addEmergencyContribution: (amount: number, type: 'aporte' | 'retirada', notes?: string) => void;

  // Actions - Goals
  addGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  updateGoal: (id: string, goal: Partial<FinancialGoal>) => void;
  deleteGoal: (id: string) => void;
  addGoalContribution: (id: string, amount: number) => void;

  // Actions - Settings & Data Management
  updateSettings: (newSettings: Partial<Settings>) => void;
  setUser: (user: UserProfile | null) => void;
  resetAllData: () => void;
  importAllData: (data: any) => void;
  importCSVList: (txs: Partial<Transaction>[]) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  // App State loaded from LocalStorage
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'categories');
    let loaded: Category[] = saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    // Auto-migrate new default categories if missing in existing local storage
    INITIAL_CATEGORIES.forEach((initCat) => {
      if (!loaded.some((c) => c.id === initCat.id)) {
        loaded.push(initCat);
      }
    });
    return loaded;
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'payment_methods');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_METHODS;
  });

  const [budgets, setBudgets] = useState<MonthlyBudget[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'budgets');
    return saved ? JSON.parse(saved) : [];
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'debts');
    return saved ? JSON.parse(saved) : [];
  });

  const [debtPayments, setDebtPayments] = useState<DebtPayment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'debt_payments');
    return saved ? JSON.parse(saved) : [];
  });

  const [emergencyFund, setEmergencyFund] = useState<EmergencyFund>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'emergency_fund');
    return saved
      ? JSON.parse(saved)
      : {
          targetAmount: 10000,
          currentAmount: 0,
          monthlyPlannedContribution: 500,
          contributions: [],
        };
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'user');
    return saved ? JSON.parse(saved) : { id: 'usr-default', name: 'Usuário', email: 'usuario@financeiro.com' };
  });

  // Tithe notice modal state
  const [titheNotice, setTitheNotice] = useState<TitheNotice>({
    isOpen: false,
    incomeAmount: 0,
    calculatedTithe: 0,
  });

  // Sync state to local storage on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'payment_methods', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'debt_payments', JSON.stringify(debtPayments));
  }, [debtPayments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'emergency_fund', JSON.stringify(emergencyFund));
  }, [emergencyFund]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'settings', JSON.stringify(settings));
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'user', JSON.stringify(user));
  }, [user]);

  // Sync Supabase Auth session (OAuth callbacks, token persistence, auto-login)
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    let isMounted = true;

    const syncUserFromSession = async (sessionUser: any) => {
      if (!sessionUser) return;

      let name =
        sessionUser.user_metadata?.full_name ||
        sessionUser.user_metadata?.name ||
        sessionUser.email?.split('@')[0] ||
        'Usuário';
      let avatarUrl = sessionUser.user_metadata?.avatar_url || sessionUser.user_metadata?.picture;

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, avatar_url')
          .eq('id', sessionUser.id)
          .maybeSingle();

        if (profile) {
          if (profile.name) name = profile.name;
          if (profile.avatar_url) avatarUrl = profile.avatar_url;
        }
      } catch {
        // Ignore profile query failure
      }

      if (!isMounted) return;

      const newUser: UserProfile = {
        id: sessionUser.id,
        name,
        email: sessionUser.email || '',
        avatarUrl,
      };

      setUser((prev) => {
        if (
          prev &&
          prev.id === newUser.id &&
          prev.name === newUser.name &&
          prev.email === newUser.email &&
          prev.avatarUrl === newUser.avatarUrl
        ) {
          return prev;
        }
        return newUser;
      });
    };

    // Check current session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUserFromSession(session.user);
      }
    });

    // Listen for Auth changes (OAuth login completion, sign-outs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        syncUserFromSession(session.user);
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setUser(null);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [settings.supabaseUrl, settings.supabaseAnonKey]);

  const setSelectedMonthYear = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  // Transaction Actions
  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const id = 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const newTx: Transaction = {
      ...tx,
      id,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Check if it's an Income to trigger automatic tithe notice (10%)
    if (tx.type === 'receita') {
      const tithePercentage = settings.tithePercentage || 10;
      const calculatedTithe = (tx.amount * tithePercentage) / 100;
      if (calculatedTithe > 0) {
        setTitheNotice({
          isOpen: true,
          incomeAmount: tx.amount,
          calculatedTithe,
        });
      }
    }
  };

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const closeTitheNotice = () => {
    setTitheNotice({ isOpen: false, incomeAmount: 0, calculatedTithe: 0 });
  };

  const getEffectiveTransactionsForMonthYear = (month: number, year: number): Transaction[] => {
    const exactMonthTxs = transactions.filter((t) => {
      const d = new Date(t.date + 'T00:00:00');
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    // Automatically carry over recurring fixed expenses & incomes (isRecurring: true) from previous months
    const recurringPastTxs = transactions
      .filter((t) => {
        if (!t.isRecurring) return false;
        const d = new Date(t.date + 'T00:00:00');
        const tYear = d.getFullYear();
        const tMonth = d.getMonth() + 1;
        if (tYear > year || (tYear === year && tMonth >= month)) return false;

        // Check recurrence limit / validity period
        if (t.hasRecurrenceLimit) {
          if (t.recurrenceEndType === 'date' && t.recurrenceEndDate) {
            const endDateParts = t.recurrenceEndDate.split('-');
            const endYear = parseInt(endDateParts[0], 10);
            const endMonth = parseInt(endDateParts[1], 10);
            if (!isNaN(endYear) && !isNaN(endMonth)) {
              if (year > endYear || (year === endYear && month > endMonth)) {
                return false; // Out of validity range
              }
            }
          } else if (t.recurrenceDurationMonths && t.recurrenceDurationMonths > 0) {
            const monthDiff = (year - tYear) * 12 + (month - tMonth);
            if (monthDiff >= t.recurrenceDurationMonths) {
              return false; // Exceeded duration limit in months
            }
          }
        }

        // Check if an explicit transaction for this category already exists in target (month, year)
        const existsInTargetMonth = exactMonthTxs.some(
          (et) => et.categoryId === t.categoryId && Math.abs(et.amount - t.amount) < 0.01
        );
        return !existsInTargetMonth;
      })
      .map((t) => {
        let calculatedDateStr = `${year}-${String(month).padStart(2, '0')}-01`;
        
        if (t.recurrenceRule === '4th_business_day') {
          calculatedDateStr = getNthBusinessDay(year, month, 4);
        } else if (t.recurrenceRule === '5th_business_day') {
          calculatedDateStr = getNthBusinessDay(year, month, 5);
        } else if (t.recurrenceRule === '1st_business_day') {
          calculatedDateStr = getNthBusinessDay(year, month, 1);
        } else if (t.recurrenceRule === 'fixed_day' && t.recurrenceDay) {
          calculatedDateStr = getFixedDayOfMonth(year, month, t.recurrenceDay);
        } else {
          // Fallback: use the original day of month if valid
          const origDay = parseInt(t.date.split('-')[2] || '1', 10);
          calculatedDateStr = getFixedDayOfMonth(year, month, origDay);
        }

        const d = new Date(t.date + 'T00:00:00');
        const tYear = d.getFullYear();
        const tMonth = d.getMonth() + 1;
        const currentMonthNum = (year - tYear) * 12 + (month - tMonth) + 1;
        let limitSuffix = '';
        if (t.hasRecurrenceLimit && t.recurrenceDurationMonths) {
          limitSuffix = ` - Mês ${currentMonthNum}/${t.recurrenceDurationMonths}`;
        }

        return {
          ...t,
          id: `rec-${t.id}-${year}-${month}`,
          date: calculatedDateStr,
          status: 'pendente' as const,
          notes: `${t.notes || ''} [Recorrente Mensal${limitSuffix}]`,
        };
      });

    return [...exactMonthTxs, ...recurringPastTxs];
  };

  const confirmAddTitheExpense = () => {
    if (titheNotice.calculatedTithe <= 0) return;
    const todayStr = new Date().toISOString().split('T')[0];
    addTransaction({
      date: todayStr,
      type: 'despesa',
      categoryId: 'cat-dizimo',
      amount: titheNotice.calculatedTithe,
      paymentMethod: 'PIX',
      status: 'pago',
      isRecurring: true,
      notes: `Dízimo referente à receita de ${titheNotice.incomeAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
    });
    closeTitheNotice();
  };

  // Categories
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const id = 'cat-' + Date.now();
    setCategories((prev) => [...prev, { ...cat, id }]);
  };

  const updateCategory = (id: string, updated: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Payment Methods
  const addPaymentMethod = (name: string) => {
    const id = 'pm-' + Date.now();
    setPaymentMethods((prev) => [...prev, { id, name }]);
  };

  const deletePaymentMethod = (id: string) => {
    setPaymentMethods((prev) => prev.filter((p) => p.id !== id));
  };

  // Monthly Budget
  const setPlannedBudget = (categoryId: string, month: number, year: number, plannedAmount: number) => {
    setBudgets((prev) => {
      const existingIndex = prev.findIndex(
        (b) => b.categoryId === categoryId && b.month === month && b.year === year
      );
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = { ...copy[existingIndex], plannedAmount };
        return copy;
      }
      return [
        ...prev,
        {
          id: 'bdg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          categoryId,
          month,
          year,
          plannedAmount,
        },
      ];
    });
  };

  // Debts (Snowball)
  const addDebt = (debt: Omit<Debt, 'id' | 'paidAmount' | 'status'>) => {
    const id = 'debt-' + Date.now();
    const negotiatedAmount = debt.negotiatedAmount > 0 ? debt.negotiatedAmount : debt.originalAmount;
    const newDebt: Debt = {
      ...debt,
      id,
      negotiatedAmount,
      paidAmount: 0,
      status: 'em_aberto',
    };
    setDebts((prev) => [...prev, newDebt]);
  };

  const updateDebt = (id: string, updated: Partial<Debt>) => {
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const merged = { ...d, ...updated };
        const effective = merged.negotiatedAmount > 0 ? merged.negotiatedAmount : merged.originalAmount;
        const remaining = Math.max(0, effective - merged.paidAmount);
        merged.status = remaining === 0 ? 'quitada' : merged.status;
        return merged;
      })
    );
  };

  const deleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
    setDebtPayments((prev) => prev.filter((p) => p.debtId !== id));
  };

  const addDebtPayment = (debtId: string, amount: number, notes?: string) => {
    if (amount <= 0) return;
    const paymentId = 'pay-' + Date.now();
    const dateStr = new Date().toISOString().split('T')[0];

    // Add payment record
    const newPayment: DebtPayment = {
      id: paymentId,
      debtId,
      date: dateStr,
      amount,
      notes,
    };
    setDebtPayments((prev) => [newPayment, ...prev]);

    // Update debt paid amount and status automatically
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id !== debtId) return d;
        const newPaidAmount = d.paidAmount + amount;
        const effective = d.negotiatedAmount > 0 ? d.negotiatedAmount : d.originalAmount;
        const remaining = Math.max(0, effective - newPaidAmount);
        const newStatus = remaining === 0 ? 'quitada' : 'pagando';
        return {
          ...d,
          paidAmount: newPaidAmount,
          status: newStatus,
        };
      })
    );

    // Also auto-add a paid transaction in category "Pagamento de dívidas"
    const targetDebt = debts.find((d) => d.id === debtId);
    addTransaction({
      date: dateStr,
      type: 'despesa',
      categoryId: 'cat-dividas',
      amount,
      paymentMethod: 'PIX',
      status: 'pago',
      notes: `Pagamento de dívida - ${targetDebt?.creditor || 'Credor'}${notes ? ': ' + notes : ''}`,
    });
  };

  // Emergency Fund
  const updateEmergencyFundTarget = (targetAmount: number, monthlyPlannedContribution: number) => {
    setEmergencyFund((prev) => ({
      ...prev,
      targetAmount,
      monthlyPlannedContribution,
    }));
  };

  const addEmergencyContribution = (amount: number, type: 'aporte' | 'retirada', notes?: string) => {
    if (amount <= 0) return;
    const contributionId = 'efc-' + Date.now();
    const dateStr = new Date().toISOString().split('T')[0];
    const newContrib: EmergencyContribution = {
      id: contributionId,
      date: dateStr,
      amount,
      type,
      notes,
    };

    setEmergencyFund((prev) => {
      const delta = type === 'aporte' ? amount : -amount;
      const newCurrent = Math.max(0, prev.currentAmount + delta);
      return {
        ...prev,
        currentAmount: newCurrent,
        contributions: [newContrib, ...prev.contributions],
      };
    });

    // Also add paid transaction under Reserva de Emergência category
    addTransaction({
      date: dateStr,
      type: type === 'aporte' ? 'despesa' : 'receita',
      categoryId: 'cat-reserva',
      amount,
      paymentMethod: 'PIX',
      status: 'pago',
      notes: `${type === 'aporte' ? 'Aporte na' : 'Retirada da'} Reserva de Emergência${notes ? ': ' + notes : ''}`,
    });
  };

  // Financial Goals
  const addGoal = (goal: Omit<FinancialGoal, 'id'>) => {
    const id = 'goal-' + Date.now();
    setGoals((prev) => [...prev, { ...goal, id }]);
  };

  const updateGoal = (id: string, updated: Partial<FinancialGoal>) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const merged = { ...g, ...updated };
        if (merged.currentAmount >= merged.targetAmount) {
          merged.status = 'concluida';
        }
        return merged;
      })
    );
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const addGoalContribution = (id: string, amount: number) => {
    if (amount <= 0) return;
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const newCurrent = g.currentAmount + amount;
        const newStatus = newCurrent >= g.targetAmount ? 'concluida' : g.status;
        return {
          ...g,
          currentAmount: newCurrent,
          status: newStatus,
        };
      })
    );
  };

  // Settings
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Reset & Import
  const resetAllData = () => {
    setTransactions([]);
    setBudgets([]);
    setDebts([]);
    setDebtPayments([]);
    setEmergencyFund({
      targetAmount: 10000,
      currentAmount: 0,
      monthlyPlannedContribution: 500,
      contributions: [],
    });
    setGoals([]);
    setCategories(INITIAL_CATEGORIES);
    setPaymentMethods(INITIAL_PAYMENT_METHODS);
    setSettings(DEFAULT_SETTINGS);
  };

  const importAllData = (data: any) => {
    if (data.transactions) setTransactions(data.transactions);
    if (data.categories) setCategories(data.categories);
    if (data.paymentMethods) setPaymentMethods(data.paymentMethods);
    if (data.budgets) setBudgets(data.budgets);
    if (data.debts) setDebts(data.debts);
    if (data.debtPayments) setDebtPayments(data.debtPayments);
    if (data.emergencyFund) setEmergencyFund(data.emergencyFund);
    if (data.goals) setGoals(data.goals);
    if (data.settings) setSettings(data.settings);
  };

  const importCSVList = (txList: Partial<Transaction>[]) => {
    const formatted: Transaction[] = txList.map((t, idx) => ({
      id: 'tx-csv-' + Date.now() + '-' + idx,
      date: t.date || new Date().toISOString().split('T')[0],
      type: t.type || 'despesa',
      categoryId: t.categoryId || 'cat-outros-exp',
      amount: t.amount || 0,
      paymentMethod: t.paymentMethod || 'PIX',
      status: t.status || 'pago',
      notes: t.notes || 'Importado via CSV',
      createdAt: new Date().toISOString(),
    }));
    setTransactions((prev) => [...formatted, ...prev]);
  };

  return (
    <FinanceContext.Provider
      value={{
        selectedMonth,
        selectedYear,
        setSelectedMonthYear,
        transactions,
        getEffectiveTransactionsForMonthYear,
        categories,
        paymentMethods,
        budgets,
        debts,
        debtPayments,
        emergencyFund,
        goals,
        settings,
        user,
        titheNotice,
        closeTitheNotice,
        confirmAddTitheExpense,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        addPaymentMethod,
        deletePaymentMethod,
        setPlannedBudget,
        addDebt,
        updateDebt,
        deleteDebt,
        addDebtPayment,
        updateEmergencyFundTarget,
        addEmergencyContribution,
        addGoal,
        updateGoal,
        deleteGoal,
        addGoalContribution,
        updateSettings,
        setUser,
        resetAllData,
        importAllData,
        importCSVList,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance deve ser usado dentro de um FinanceProvider');
  }
  return context;
};
