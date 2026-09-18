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
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ transactions, year }) => {
  // Aggregate data for each month 1..12
  const data = MONTH_NAMES_PT.map((name, idx) => {
    const month = idx + 1;
    let receita = 0;
    let despesa = 0;

    transactions.forEach((t) => {
      const d = new Date(t.date + 'T00:00:00');
      if (d.getFullYear() === year && d.getMonth() + 1 === month && t.status === 'pago') {
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
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Evolução Mensal (Receitas x Despesas)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Ano de {year}</p>
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
