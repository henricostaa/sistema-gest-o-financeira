export type TransactionType = 'receita' | 'despesa';
export type TransactionStatus = 'pago' | 'pendente';

export type RecurrenceRule = '4th_business_day' | '5th_business_day' | '1st_business_day' | 'fixed_day';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  categoryId: string;
  amount: number;
  paymentMethod: string;
  status: TransactionStatus;
  notes?: string;
  isRecurring?: boolean; // Marca como despesa/receita fixa mensal
  recurrenceRule?: RecurrenceRule; // ex: 4th_business_day ou fixed_day (dia 27)
  recurrenceDay?: number; // ex: 27
  hasRecurrenceLimit?: boolean; // Se possui prazo de vigência/contrato
  recurrenceEndType?: 'duration' | 'date'; // 'duration' (em meses) ou 'date' (data final YYYY-MM-DD)
  recurrenceDurationMonths?: number; // Quantidade de meses de vigência (ex: 12)
  recurrenceEndDate?: string; // Data final da vigência YYYY-MM-DD
  installmentsCount?: number; // Total de parcelas (ex: 12)
  currentInstallment?: number; // Parcela atual (ex: 1)
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'receita' | 'despesa' | 'ambos';
  color: string;
  icon: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
}

export interface MonthlyBudget {
  id: string;
  month: number; // 1 to 12
  year: number;
  categoryId: string;
  plannedAmount: number;
}

export type DebtStatus = 'em_aberto' | 'negociando' | 'pagando' | 'quitada';

export interface DebtPayment {
  id: string;
  debtId: string;
  date: string;
  amount: number;
  notes?: string;
}

export interface Debt {
  id: string;
  creditor: string; // Credor
  categoryId: string;
  originalAmount: number; // Valor original
  negotiatedDiscount: number; // Desconto negociado
  negotiatedAmount: number; // Valor negociado
  paidAmount: number; // Valor já pago
  status: DebtStatus;
  dueDate: string; // Data de vencimento YYYY-MM-DD
  notes?: string;
  effectiveAmount?: number;
  remainingAmount?: number;
}

export interface EmergencyContribution {
  id: string;
  date: string;
  amount: number;
  notes?: string;
  type: 'aporte' | 'retirada';
}

export interface EmergencyFund {
  targetAmount: number;
  currentAmount: number;
  monthlyPlannedContribution: number;
  contributions: EmergencyContribution[];
}

export type GoalPriority = 'alta' | 'media' | 'baixa';
export type GoalStatus = 'em_andamento' | 'concluida' | 'pausada';

export interface FinancialGoal {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  status: GoalStatus;
  priority: GoalPriority;
}

export interface Settings {
  tithePercentage: number; // default 10
  debtClearanceTargetDate: string; // default "2026-12-31"
  currency: string; // "BRL"
  theme: 'dark' | 'light';
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}
