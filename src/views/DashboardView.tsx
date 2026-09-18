import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { calculateAnnualMetrics, calculateDebtMetrics, calculateMonthlyMetrics } from '../utils/calculations';
import { formatCurrency, formatMonthYear, formatPercent } from '../utils/formatters';
import { MetricCard } from '../components/dashboard/MetricCard';
import { MonthlyChart } from '../components/dashboard/MonthlyChart';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { DebtProgressBar } from '../components/dashboard/DebtProgressBar';
import { AlertsBanner } from '../components/dashboard/AlertsBanner';
import type { TabType } from '../components/layout/Sidebar';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  HeartHandshake,
  Flame,
  CheckCircle2,
  PieChart,
  Calendar,
  ShieldCheck,
  PlusCircle,
} from 'lucide-react';

interface DashboardViewProps {
  setActiveTab: (tab: TabType) => void;
  onOpenNewTransaction: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenNewTransaction,
}) => {
  const {
    selectedMonth,
    selectedYear,
    transactions,
    categories,
    budgets,
    debts,
    emergencyFund,
    goals,
    settings,
  } = useFinance();

  const monthlyMetrics = calculateMonthlyMetrics(
    transactions,
    selectedMonth,
    selectedYear,
    settings.tithePercentage || 10
  );

  const annualMetrics = calculateAnnualMetrics(transactions, selectedYear);
  const debtMetrics = calculateDebtMetrics(debts, settings.debtClearanceTargetDate || '2026-12-31');

  // Emergency Fund progress
  const emergencyProgressPercent =
    emergencyFund.targetAmount > 0
      ? Math.min(100, (emergencyFund.currentAmount / emergencyFund.targetAmount) * 100)
      : 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-16 md:pb-6">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Painel Financeiro - {formatMonthYear(selectedMonth, selectedYear)}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhe o equilíbrio do seu orçamento, dízimo e a conquista do seu nome limpo.
          </p>
        </div>

        <button
          onClick={onOpenNewTransaction}
          className="flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 transition active:scale-95"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Cadastrar Lançamento</span>
        </button>
      </div>

      {/* Real-time Alerts */}
      <AlertsBanner
        transactions={transactions}
        categories={categories}
        budgets={budgets}
        debts={debts}
        goals={goals}
        month={selectedMonth}
        year={selectedYear}
      />

      {/* Debt Freedom Milestone Banner (Dec 2026) */}
      <DebtProgressBar
        debts={debts}
        targetDate={settings.debtClearanceTargetDate || '2026-12-31'}
        onNavigateToDebts={() => setActiveTab('dividas')}
      />

      {/* 10 Required Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. Receitas do Mês */}
        <MetricCard
          title="Receitas do Mês"
          value={formatCurrency(monthlyMetrics.totalIncome)}
          subtitle={
            monthlyMetrics.totalIncomePending > 0
              ? `Pendente: ${formatCurrency(monthlyMetrics.totalIncomePending)}`
              : '100% Recebido'
          }
          icon={TrendingUp}
          colorScheme="green"
        />

        {/* 2. Despesas do Mês */}
        <MetricCard
          title="Despesas do Mês"
          value={formatCurrency(monthlyMetrics.totalExpense)}
          subtitle={
            monthlyMetrics.totalExpensePending > 0
              ? `Pendente: ${formatCurrency(monthlyMetrics.totalExpensePending)}`
              : '100% Quitado'
          }
          icon={TrendingDown}
          colorScheme="red"
        />

        {/* 3. Saldo do Mês */}
        <MetricCard
          title="Saldo do Mês"
          value={formatCurrency(monthlyMetrics.monthlyBalance)}
          subtitle={monthlyMetrics.monthlyBalance >= 0 ? 'Superávit positivo' : 'Déficit no mês'}
          icon={Scale}
          colorScheme={monthlyMetrics.monthlyBalance >= 0 ? 'green' : 'red'}
        />

        {/* 4. Dízimo a Separar (10%) */}
        <MetricCard
          title={`Dízimo (${settings.tithePercentage || 10}%)`}
          value={formatCurrency(monthlyMetrics.titheToSeparate)}
          subtitle="A separar de receitas"
          icon={HeartHandshake}
          colorScheme="purple"
          badgeText="10% Automático"
        />

        {/* 5. Total Dívidas em Aberto */}
        <MetricCard
          title="Dívidas em Aberto"
          value={formatCurrency(debtMetrics.totalRemaining)}
          subtitle={`${debtMetrics.sortedDebts.filter((d) => d.status !== 'quitada').length} pendência(s)`}
          icon={Flame}
          colorScheme="amber"
        />

        {/* 6. Total Dívidas Quitadas */}
        <MetricCard
          title="Total Já Quitado"
          value={formatCurrency(debtMetrics.totalPaid)}
          subtitle="Já pago em acertos"
          icon={CheckCircle2}
          colorScheme="emerald"
        />

        {/* 7. Percentual Dívida Quitada */}
        <MetricCard
          title="% Dívida Quitada"
          value={formatPercent(debtMetrics.percentPaid)}
          subtitle="Do total negociado"
          icon={PieChart}
          colorScheme="blue"
        />

        {/* 8. Receita Acumulada no Ano */}
        <MetricCard
          title={`Receita Acumulada (${selectedYear})`}
          value={formatCurrency(annualMetrics.annualIncome)}
          subtitle="Jan até Dez"
          icon={Calendar}
          colorScheme="green"
        />

        {/* 9. Despesa Acumulada no Ano */}
        <MetricCard
          title={`Despesa Acumulada (${selectedYear})`}
          value={formatCurrency(annualMetrics.annualExpense)}
          subtitle="Jan até Dez"
          icon={Calendar}
          colorScheme="red"
        />

        {/* 10. Reserva de Emergência */}
        <MetricCard
          title="Reserva Atual"
          value={formatCurrency(emergencyFund.currentAmount)}
          subtitle={`Meta: ${formatCurrency(emergencyFund.targetAmount)} (${emergencyProgressPercent.toFixed(0)}%)`}
          icon={ShieldCheck}
          colorScheme="emerald"
        />
      </div>

      {/* Emergency Fund Quick Progress Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="font-bold text-slate-800 dark:text-white">Reserva de Emergência</span>
          </div>
          <button
            onClick={() => setActiveTab('reserva')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Ver Detalhes →
          </button>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${emergencyProgressPercent}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Guardado: {formatCurrency(emergencyFund.currentAmount)}</span>
          <span>Meta Alvo: {formatCurrency(emergencyFund.targetAmount)}</span>
        </div>
      </div>

      {/* Recharts Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyChart transactions={transactions} year={selectedYear} />
        </div>
        <div>
          <CategoryChart
            transactions={transactions}
            categories={categories}
            month={selectedMonth}
            year={selectedYear}
          />
        </div>
      </div>
    </div>
  );
};
