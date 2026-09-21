import React, { useEffect, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import type { RecurrenceRule, Transaction } from '../../types/finance';
import { parseCurrencyInput } from '../../utils/formatters';
import { getNthBusinessDay, getFixedDayOfMonth, addMonthsToDate } from '../../utils/dateUtils';
import { X, Check, ArrowUpCircle, ArrowDownCircle, Repeat, CreditCard, Calendar } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTx?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  editingTx,
}) => {
  const { categories, paymentMethods, addTransaction, updateTransaction } = useFinance();

  const [type, setType] = useState<'receita' | 'despesa'>('despesa');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('PIX');
  const [status, setStatus] = useState<'pago' | 'pendente'>('pago');
  const [notes, setNotes] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>('fixed_day');
  const [recurrenceDay, setRecurrenceDay] = useState<number>(27);
  const [installmentsCount, setInstallmentsCount] = useState<number>(1);

  useEffect(() => {
    if (editingTx) {
      setType(editingTx.type);
      setDate(editingTx.date);
      setCategoryId(editingTx.categoryId);
      setAmountStr(editingTx.amount.toString());
      setPaymentMethod(editingTx.paymentMethod);
      setStatus(editingTx.status);
      setNotes(editingTx.notes || '');
      setIsRecurring(editingTx.isRecurring || false);
      setRecurrenceRule(editingTx.recurrenceRule || 'fixed_day');
      setRecurrenceDay(editingTx.recurrenceDay || 27);
      setInstallmentsCount(editingTx.installmentsCount || 1);
    } else {
      setType('despesa');
      setDate(new Date().toISOString().split('T')[0]);
      setAmountStr('');
      setPaymentMethod('PIX');
      setStatus('pago');
      setNotes('');
      setIsRecurring(false);
      setRecurrenceRule('fixed_day');
      setRecurrenceDay(27);
      setInstallmentsCount(1);
    }
  }, [editingTx, isOpen]);

  // Filter categories by type
  const availableCategories = categories.filter(
    (c) => c.type === 'ambos' || c.type === type
  );

  useEffect(() => {
    if (!editingTx && availableCategories.length > 0 && !categoryId) {
      setCategoryId(availableCategories[0].id);
    }
  }, [type, availableCategories]);

  // Handle category selection preset rules
  const handleCategorySelect = (catId: string) => {
    setCategoryId(catId);
    if (!editingTx) {
      if (catId === 'cat-salario-empresa') {
        setIsRecurring(true);
        setRecurrenceRule('4th_business_day');
        // Calculate date for 4th business day of current month
        const now = new Date();
        setDate(getNthBusinessDay(now.getFullYear(), now.getMonth() + 1, 4));
        setNotes('Salário Fixo da Empresa (4º Dia Útil)');
      } else if (catId === 'cat-beneficios') {
        setIsRecurring(true);
        setRecurrenceRule('fixed_day');
        setRecurrenceDay(27);
        const now = new Date();
        setDate(getFixedDayOfMonth(now.getFullYear(), now.getMonth() + 1, 27));
        setNotes('Benefícios Caju / VA / VR (Dia 27)');
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseCurrencyInput(amountStr);
    if (amount <= 0) {
      alert('Por favor, informe um valor válido maior que zero.');
      return;
    }

    const catToUse = categoryId || availableCategories[0]?.id || 'cat-outros-exp';

    if (editingTx) {
      updateTransaction(editingTx.id, {
        type,
        date,
        categoryId: catToUse,
        amount,
        paymentMethod,
        status,
        notes,
        isRecurring,
        recurrenceRule,
        recurrenceDay,
        installmentsCount,
      });
    } else {
      // If user selected installments > 1 (e.g. 6x credit card purchase)
      if (installmentsCount > 1 && !isRecurring) {
        for (let i = 0; i < installmentsCount; i++) {
          const dateStr = addMonthsToDate(date, i);
          const instNote = `${notes ? notes + ' ' : ''}(Parcela ${i + 1}/${installmentsCount})`;
          
          addTransaction({
            type,
            date: dateStr,
            categoryId: catToUse,
            amount,
            paymentMethod,
            status: i === 0 ? status : 'pendente',
            notes: instNote,
            isRecurring: false,
            installmentsCount,
            currentInstallment: i + 1,
          });
        }
      } else {
        addTransaction({
          type,
          date,
          categoryId: catToUse,
          amount,
          paymentMethod,
          status,
          notes,
          isRecurring,
          recurrenceRule,
          recurrenceDay,
          installmentsCount: 1,
          currentInstallment: 1,
        });
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {editingTx ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Toggle Type */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setType('receita')}
              className={`flex items-center justify-center space-x-2 rounded-lg py-2 text-xs font-bold transition ${
                type === 'receita'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowUpCircle className="h-4 w-4" />
              <span>Receita (+)</span>
            </button>

            <button
              type="button"
              onClick={() => setType('despesa')}
              className={`flex items-center justify-center space-x-2 rounded-lg py-2 text-xs font-bold transition ${
                type === 'despesa'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowDownCircle className="h-4 w-4" />
              <span>Despesa (-)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Categoria *
              </label>
              <select
                value={categoryId}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                required
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Data *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {paymentMethods.map((pm) => (
                  <option key={pm.id} value={pm.name}>
                    {pm.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Status *
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="status"
                  value="pago"
                  checked={status === 'pago'}
                  onChange={() => setStatus('pago')}
                  className="accent-emerald-600"
                />
                <span>Pago / Concluído</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="status"
                  value="pendente"
                  checked={status === 'pendente'}
                  onChange={() => setStatus('pendente')}
                  className="accent-amber-500"
                />
                <span>Pendente / Agendado</span>
              </label>
            </div>
          </div>

          {/* Recurrence & Installments Options */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/60 space-y-3 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => {
                  setIsRecurring(e.target.checked);
                  if (e.target.checked) setInstallmentsCount(1);
                }}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
              />
              <Repeat className="h-4 w-4 text-emerald-500" />
              <span>
                {type === 'receita'
                  ? 'Receita Fixa Recorrente (Repetir todo mês)'
                  : 'Despesa Fixa Recorrente (Repetir todo mês)'}
              </span>
            </label>

            {/* Recurrence Rule Options when isRecurring is true */}
            {isRecurring && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Regra de Cálculo de Vencimento/Recebimento:</span>
                </label>
                <select
                  value={recurrenceRule}
                  onChange={(e) => setRecurrenceRule(e.target.value as RecurrenceRule)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-semibold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="4th_business_day">4º Dia Útil do Mês (Salário Empresa)</option>
                  <option value="fixed_day">Dia Fixo do Mês (ex: Todo dia 27 - Caju/VA/VR)</option>
                  <option value="5th_business_day">5º Dia Útil do Mês</option>
                  <option value="1st_business_day">1º Dia Útil do Mês</option>
                </select>

                {recurrenceRule === 'fixed_day' && (
                  <div className="flex items-center space-x-2 pt-1">
                    <span className="text-slate-600 dark:text-slate-400">Dia do Mês:</span>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={recurrenceDay}
                      onChange={(e) => setRecurrenceDay(Number(e.target.value))}
                      className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1 font-bold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                )}
              </div>
            )}

            {!isRecurring && !editingTx && (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-xs">
                    <CreditCard className="h-4 w-4 text-blue-500" />
                    <span>Parcelar no Cartão (Número de Vezes):</span>
                  </span>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={installmentsCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setInstallmentsCount(isNaN(val) || val < 1 ? 1 : val);
                      }}
                      className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1 text-center font-bold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs"
                      placeholder="Ex: 12"
                    />
                    <span className="font-bold text-slate-600 dark:text-slate-400 text-xs">x</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Atalhos:</span>
                  {[1, 2, 3, 4, 6, 10, 12, 18, 24, 36].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setInstallmentsCount(num)}
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition ${
                        installmentsCount === num
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                      }`}
                    >
                      {num === 1 ? '1x (À vista)' : `${num}x`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Observação (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Benefícios Caju, Salário empresa, Aluguel"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Buttons */}
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
              <span>
                {editingTx
                  ? 'Salvar Alterações'
                  : installmentsCount > 1
                  ? `Gerar ${installmentsCount} Parcelas`
                  : 'Salvar Lançamento'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
