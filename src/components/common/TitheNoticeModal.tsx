import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { HeartHandshake, Check, X, Info } from 'lucide-react';

export const TitheNoticeModal: React.FC = () => {
  const { titheNotice, closeTitheNotice, confirmAddTitheExpense, settings } = useFinance();

  if (!titheNotice.isOpen) return null;

  const percentage = settings.tithePercentage || 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Dízimo Separado ({percentage}%)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cálculo automático de receita</p>
            </div>
          </div>
          <button
            onClick={closeTitheNotice}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-5 space-y-3">
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Receita Cadastrada:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {formatCurrency(titheNotice.incomeAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-emerald-600 dark:text-emerald-400 pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>Dízimo Calculado ({percentage}%):</span>
              <span className="text-base font-extrabold">{formatCurrency(titheNotice.calculatedTithe)}</span>
            </div>
          </div>

          <div className="flex items-start space-x-2 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              Deseja registrar este valor automaticamente como um lançamento de <strong>Despesa (Dízimo)</strong> em status <strong>Pago</strong>?
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={closeTitheNotice}
            className="flex-1 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
          >
            Agora Não
          </button>
          <button
            onClick={confirmAddTitheExpense}
            className="flex flex-1 items-center justify-center space-x-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md transition"
          >
            <Check className="h-4 w-4" />
            <span>Confirmar Despesa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
