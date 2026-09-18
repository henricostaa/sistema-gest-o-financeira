import React, { useEffect, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import type { Debt } from '../../types/finance';
import { parseCurrencyInput } from '../../utils/formatters';
import { X, Check, Flame } from 'lucide-react';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingDebt?: Debt | null;
}

export const DebtModal: React.FC<DebtModalProps> = ({ isOpen, onClose, editingDebt }) => {
  const { categories, addDebt, updateDebt } = useFinance();

  const [creditor, setCreditor] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [originalAmountStr, setOriginalAmountStr] = useState('');
  const [discountStr, setDiscountStr] = useState('');
  const [negotiatedAmountStr, setNegotiatedAmountStr] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingDebt) {
      setCreditor(editingDebt.creditor);
      setCategoryId(editingDebt.categoryId);
      setOriginalAmountStr(editingDebt.originalAmount.toString());
      setDiscountStr(editingDebt.negotiatedDiscount ? editingDebt.negotiatedDiscount.toString() : '');
      setNegotiatedAmountStr(editingDebt.negotiatedAmount ? editingDebt.negotiatedAmount.toString() : '');
      setDueDate(editingDebt.dueDate);
      setNotes(editingDebt.notes || '');
    } else {
      setCreditor('');
      setOriginalAmountStr('');
      setDiscountStr('');
      setNegotiatedAmountStr('');
      setDueDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [editingDebt, isOpen]);

  // Auto calculate negotiated amount if discount entered
  const handleDiscountChange = (val: string) => {
    setDiscountStr(val);
    const orig = parseCurrencyInput(originalAmountStr);
    const disc = parseCurrencyInput(val);
    if (orig > 0 && disc > 0) {
      setNegotiatedAmountStr(Math.max(0, orig - disc).toString());
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const originalAmount = parseCurrencyInput(originalAmountStr);
    if (originalAmount <= 0) {
      alert('Por favor, informe o valor original da dívida.');
      return;
    }

    const discount = parseCurrencyInput(discountStr);
    let negotiatedAmount = parseCurrencyInput(negotiatedAmountStr);
    if (negotiatedAmount <= 0) {
      negotiatedAmount = Math.max(0, originalAmount - discount);
    }

    const catToUse = categoryId || categories[0]?.id || 'cat-dividas';

    if (editingDebt) {
      updateDebt(editingDebt.id, {
        creditor,
        categoryId: catToUse,
        originalAmount,
        negotiatedDiscount: discount,
        negotiatedAmount,
        dueDate,
        notes,
      });
    } else {
      addDebt({
        creditor,
        categoryId: catToUse,
        originalAmount,
        negotiatedDiscount: discount,
        negotiatedAmount,
        dueDate,
        notes,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingDebt ? 'Editar Dívida' : 'Cadastrar Dívida'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Credor (Banco / Instituição / Loja) *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Banco Itaú, Cartão Santander, Empréstimo"
              value={creditor}
              onChange={(e) => setCreditor(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Valor Original (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0,00"
                value={originalAmountStr}
                onChange={(e) => setOriginalAmountStr(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Data de Vencimento *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Desconto Negociado (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 500,00"
                value={discountStr}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Valor Negociado Acordado (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Valor final com desconto"
                value={negotiatedAmountStr}
                onChange={(e) => setNegotiatedAmountStr(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-emerald-600 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Observações / Protocolo de Acordo
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Acordo parcelado em 3x com o gerente"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-center space-x-3 pt-3">
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
              <span>Salvar Dívida</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
