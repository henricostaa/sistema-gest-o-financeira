import React from 'react';
import type { Category, Debt, FinancialGoal, MonthlyBudget, Transaction } from '../../types/finance';
import { calculateBudgetAnalysis } from '../../utils/calculations';
import { formatCurrency, formatDateBR } from '../../utils/formatters';
import { AlertCircle, AlertTriangle } from 'lucide-react';

interface AlertsBannerProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: MonthlyBudget[];
  debts: Debt[];
  goals: FinancialGoal[];
  month: number;
  year: number;
}

export const AlertsBanner: React.FC<AlertsBannerProps> = ({
  transactions,
  categories,
  budgets,
  debts,
  goals,
  month,
  year,
}) => {
  const alerts: { id: string; type: 'error' | 'warning' | 'info'; title: string; desc: string }[] = [];

  // 1. Check over-budget categories
  categories.forEach((cat) => {
    const analysis = calculateBudgetAnalysis(budgets, transactions, cat.id, month, year);
    if (analysis.plannedAmount > 0) {
      if (analysis.percentUsed > 100) {
        alerts.push({
          id: `budget-over-${cat.id}`,
          type: 'error',
          title: `Orçamento excedido em ${cat.name}`,
          desc: `Realizado: ${formatCurrency(analysis.realizedAmount)} (Estourou ${formatCurrency(Math.abs(analysis.difference))})`,
        });
      } else if (analysis.percentUsed >= 85) {
        alerts.push({
          id: `budget-warn-${cat.id}`,
          type: 'warning',
          title: `Atenção ao orçamento de ${cat.name}`,
          desc: `Consumido ${analysis.percentUsed.toFixed(0)}% do planejado (${formatCurrency(analysis.realizedAmount)} de ${formatCurrency(analysis.plannedAmount)})`,
        });
      }
    }
  });

  // 2. Check pending / overdue debts
  const todayStr = new Date().toISOString().split('T')[0];
  debts.forEach((debt) => {
    const remaining = Math.max(0, (debt.negotiatedAmount > 0 ? debt.negotiatedAmount : debt.originalAmount) - debt.paidAmount);
    if (remaining > 0 && debt.dueDate < todayStr) {
      alerts.push({
        id: `debt-overdue-${debt.id}`,
        type: 'error',
        title: `Dívida Vencida: ${debt.creditor}`,
        desc: `Venceu em ${formatDateBR(debt.dueDate)}. Restante: ${formatCurrency(remaining)}`,
      });
    }
  });

  // 3. Check goals with past deadline that are not completed
  goals.forEach((goal) => {
    if (goal.status !== 'concluida' && goal.deadline < todayStr) {
      alerts.push({
        id: `goal-overdue-${goal.id}`,
        type: 'warning',
        title: `Meta Atrasada: ${goal.title}`,
        desc: `Prazo era ${formatDateBR(goal.deadline)}. Concluído: ${formatCurrency(goal.currentAmount)} de ${formatCurrency(goal.targetAmount)}`,
      });
    }
  });

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        Central de Alertas & Notificações ({alerts.length})
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start space-x-3 rounded-xl p-3.5 border transition ${
              alert.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
            }`}
          >
            {alert.type === 'error' ? (
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-500" />
            )}
            <div>
              <h5 className="text-xs font-bold">{alert.title}</h5>
              <p className="text-[11px] opacity-90 mt-0.5">{alert.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
