import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { calculateBudgetAnalysis } from '../utils/calculations';
import { formatCurrency, formatMonthYear } from '../utils/formatters';
import { Save, CheckCircle2, AlertTriangle, AlertCircle, Edit3 } from 'lucide-react';

export const BudgetView: React.FC = () => {
  const {
    selectedMonth,
    selectedYear,
    categories,
    budgets,
    transactions,
    setPlannedBudget,
  } = useFinance();

  // State for editable inputs
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>('');

  const expenseCategories = categories.filter((c) => c.type === 'despesa' || c.type === 'ambos');

  const handleStartEdit = (catId: string, currentPlanned: number) => {
    setEditingCategoryId(catId);
    setInputValue(currentPlanned > 0 ? currentPlanned.toString() : '');
  };

  const handleSaveBudget = (catId: string) => {
    const amount = parseFloat(inputValue.replace(',', '.')) || 0;
    setPlannedBudget(catId, selectedMonth, selectedYear, Math.max(0, amount));
    setEditingCategoryId(null);
  };

  // Global totals
  let totalPlanned = 0;
  let totalRealized = 0;

  const categoryAnalyses = expenseCategories.map((cat) => {
    const analysis = calculateBudgetAnalysis(
      budgets,
      transactions,
      cat.id,
      selectedMonth,
      selectedYear
    );
    totalPlanned += analysis.plannedAmount;
    totalRealized += analysis.realizedAmount;
    return { ...analysis, category: cat };
  });

  const totalDifference = totalPlanned - totalRealized;
  const totalPercentUsed = totalPlanned > 0 ? (totalRealized / totalPlanned) * 100 : 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-16 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Orçamento Mensal - {formatMonthYear(selectedMonth, selectedYear)}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Defina o planejamento por categoria e acompanhe o consumo em tempo real.
          </p>
        </div>
      </div>

      {/* Totals Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Planejado</span>
          <h4 className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(totalPlanned)}
          </h4>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Realizado (Pago)</span>
          <h4 className="mt-1 text-lg font-extrabold text-rose-600 dark:text-rose-400">
            {formatCurrency(totalRealized)}
          </h4>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Diferença Restante</span>
          <h4
            className={`mt-1 text-lg font-extrabold ${
              totalDifference >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(totalDifference)}
          </h4>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">% Consumido Global</span>
          <h4
            className={`mt-1 text-lg font-extrabold ${
              totalPercentUsed > 100
                ? 'text-rose-600 dark:text-rose-400'
                : totalPercentUsed >= 80
                ? 'text-amber-500'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {totalPercentUsed.toFixed(1)}%
          </h4>
        </div>
      </div>

      {/* Budget Category Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400 font-semibold">
              <tr>
                <th className="px-4 py-3.5">Categoria</th>
                <th className="px-4 py-3.5">Planejado (R$)</th>
                <th className="px-4 py-3.5">Realizado (Pago)</th>
                <th className="px-4 py-3.5">Diferença (Saldo)</th>
                <th className="px-4 py-3.5">Progresso / Consumo</th>
                <th className="px-4 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categoryAnalyses.map((item) => {
                const isEditing = editingCategoryId === item.categoryId;

                return (
                  <tr
                    key={item.categoryId}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                  >
                    {/* Categoria */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center space-x-2.5">
                        <span
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.category.color }}
                        />
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.category.name}
                        </span>
                      </div>
                    </td>

                    {/* Planejado */}
                    <td className="px-4 py-3.5">
                      {isEditing ? (
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            step="0.01"
                            autoFocus
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveBudget(item.categoryId)}
                            className="w-24 rounded-lg border border-emerald-500 bg-white px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none dark:bg-slate-800 dark:text-white"
                          />
                          <button
                            onClick={() => handleSaveBudget(item.categoryId)}
                            className="rounded-lg bg-emerald-600 p-1 text-white hover:bg-emerald-500"
                          >
                            <Save className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 group">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {formatCurrency(item.plannedAmount)}
                          </span>
                          <button
                            onClick={() => handleStartEdit(item.categoryId, item.plannedAmount)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-emerald-500 transition"
                            title="Editar orçamento"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Realizado */}
                    <td className="px-4 py-3.5 font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(item.realizedAmount)}
                    </td>

                    {/* Diferença */}
                    <td
                      className={`px-4 py-3.5 font-bold ${
                        item.difference >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {formatCurrency(item.difference)}
                    </td>

                    {/* Progresso / Consumo */}
                    <td className="px-4 py-3.5 min-w-[160px]">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {item.percentUsed.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            item.statusColor === 'red'
                              ? 'bg-rose-500'
                              : item.statusColor === 'yellow'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, item.percentUsed)}%` }}
                        />
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3.5 text-center">
                      {item.statusColor === 'red' ? (
                        <span className="inline-flex items-center space-x-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                          <AlertCircle className="h-3 w-3" />
                          <span>Estourado</span>
                        </span>
                      ) : item.statusColor === 'yellow' ? (
                        <span className="inline-flex items-center space-x-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Atenção</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Normal</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
