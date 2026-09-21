import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { Transaction } from '../../types/finance';
import { MONTH_NAMES_PT, formatCurrency } from '../../utils/formatters';

interface MonthlyChartProps {
  transactions: Transaction[];
  year: number;
  getEffectiveTransactionsForMonthYear?: (month: number, year: number) => Transaction[];
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({
  transactions,
  year,
  getEffectiveTransactionsForMonthYear,
}) => {
  const [statusFilter, setStatusFilter] = React.useState<'todos' | 'pago' | 'pendente'>('todos');

  // Aggregate data for each month 1..12
  const data = MONTH_NAMES_PT.map((name, idx) => {
    const month = idx + 1;
    let receita = 0;
    let despesa = 0;

    const monthTxs = getEffectiveTransactionsForMonthYear
      ? getEffectiveTransactionsForMonthYear(month, year)
      : transactions.filter((t) => {
          const d = new Date(t.date + 'T00:00:00');
          return d.getFullYear() === year && d.getMonth() + 1 === month;
        });

    monthTxs.forEach((t) => {
      const matchStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'pago' && t.status === 'pago') ||
        (statusFilter === 'pendente' && t.status === 'pendente');

      if (matchStatus) {
        if (t.type === 'receita') receita += t.amount;
        else despesa += t.amount;
      }
    });

    return {
      monthName: name.substring(0, 3),
      Receitas: receita,
      Despesas: despesa,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900 text-xs">
          <p className="font-bold text-slate-800 dark:text-white mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Receitas: {formatCurrency(payload[0].value)}
            </p>
            <p className="text-rose-600 dark:text-rose-400 font-semibold">
              Despesas: {formatCurrency(payload[1].value)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Evolução Mensal (Receitas x Despesas)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Ano de {year}</p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center space-x-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-[11px] font-semibold">
          <button
            onClick={() => setStatusFilter('todos')}
            className={`rounded-lg px-2.5 py-1 transition ${
              statusFilter === 'todos'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Todos (Previsto + Pago)
          </button>
          <button
            onClick={() => setStatusFilter('pago')}
            className={`rounded-lg px-2.5 py-1 transition ${
              statusFilter === 'pago'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Apenas Pagos
          </button>
          <button
            onClick={() => setStatusFilter('pendente')}
            className={`rounded-lg px-2.5 py-1 transition ${
              statusFilter === 'pendente'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Apenas Pendentes
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
            <XAxis dataKey="monthName" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `R$${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="Receitas" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Despesas" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
