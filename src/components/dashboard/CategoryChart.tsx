import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Category, Transaction } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';

interface CategoryChartProps {
  transactions: Transaction[];
  categories: Category[];
  month: number;
  year: number;
  getEffectiveTransactionsForMonthYear?: (month: number, year: number) => Transaction[];
}

export const CategoryChart: React.FC<CategoryChartProps> = ({
  transactions,
  categories,
  month,
  year,
  getEffectiveTransactionsForMonthYear,
}) => {
  const [statusFilter, setStatusFilter] = React.useState<'todos' | 'pago' | 'pendente'>('todos');
  const categoryTotals: { [categoryId: string]: number } = {};

  const monthTxs = getEffectiveTransactionsForMonthYear
    ? getEffectiveTransactionsForMonthYear(month, year)
    : transactions.filter((t) => {
        const d = new Date(t.date + 'T00:00:00');
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      });

  monthTxs.forEach((t) => {
    const matchStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'pago' && t.status === 'pago') ||
      (statusFilter === 'pendente' && t.status === 'pendente');

    if (t.type === 'despesa' && matchStatus) {
      categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount;
    }
  });

  const chartData = Object.keys(categoryTotals)
    .map((catId) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        name: cat ? cat.name : 'Outros',
        value: categoryTotals[catId],
        color: cat ? cat.color : '#6B7280',
      };
    })
    .sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-800 dark:bg-slate-900 text-xs">
          <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.payload.color }}
            />
            {item.name}
          </p>
          <p className="mt-1 font-semibold text-rose-600 dark:text-rose-400">
            {formatCurrency(item.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Despesas por Categoria
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Distribuição no mês</p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
        >
          <option value="todos">Todos os Status</option>
          <option value="pago">Apenas Pagos</option>
          <option value="pendente">Apenas Pendentes</option>
        </select>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center text-center text-xs text-slate-400">
          <p>Nenhuma despesa registrada neste mês.</p>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
