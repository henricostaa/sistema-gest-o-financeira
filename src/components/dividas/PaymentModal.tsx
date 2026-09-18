import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useFinance } from '../../context/FinanceContext';
import type { Debt } from '../../types/finance';
import { formatCurrency, formatDateBR, parseCurrencyInput } from '../../utils/formatters';
import { X, Check, DollarSign, History } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, debt }) => {
  const { addDebtPayment, debtPayments } = useFinance();
  const [amountStr, setAmountStr] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen || !debt) return null;

  const baseAmount = debt.negotiatedAmount > 0 ? debt.negotiatedAmount : debt.originalAmount;
  const remaining = Math.max(0, baseAmount - debt.paidAmount);
  const debtHistory = debtPayments.filter((p) => p.debtId === debt.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseCurrencyInput(amountStr);
    if (amount <= 0) {
      alert('Por favor, informe um valor de pagamento válido.');
      return;
    }

    addDebtPayment(debt.id, amount, notes);

    // If payment completes the debt, trigger confetti celebration!
    if (amount >= remaining) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    setAmountStr('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Registrar Pagamento de Dívida
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Credor: {debt.creditor}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Debt summary */}
        <div className="my-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Valor Acordado:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(baseAmount)}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Saldo Devedor Restante:</span>
            <span className="font-extrabold text-rose-600 dark:text-rose-400">
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Valor do Pagamento (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={remaining}
              required
              placeholder={formatCurrency(remaining)}
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Observação do Pagamento
            </label>
            <input
              type="text"
              placeholder="Ex: Pagamento 1ª parcela do acordo"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex flex-1 items-center justify-center space-x-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md transition"
            >
              <Check className="h-4 w-4" />
              <span>Confirmar Pagamento</span>
            </button>
          </div>
        </form>

        {/* History Log */}
        {debtHistory.length > 0 && (
          <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              <History className="h-4 w-4 text-emerald-500" />
              <span>Histórico de Pagamentos ({debtHistory.length})</span>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {debtHistory.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-2 dark:bg-slate-800/40"
                >
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatDateBR(p.date)}
                    </span>
                    {p.notes && <p className="text-[11px] text-slate-400">{p.notes}</p>}
                  </div>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    + {formatCurrency(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
