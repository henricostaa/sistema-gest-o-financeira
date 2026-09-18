import React, { useEffect, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import type { FinancialGoal, GoalPriority, GoalStatus } from '../../types/finance';
import { parseCurrencyInput } from '../../utils/formatters';
import { X, Check, Target } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGoal?: FinancialGoal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, editingGoal }) => {
  const { addGoal, updateGoal } = useFinance();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [currentAmountStr, setCurrentAmountStr] = useState('');
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<GoalPriority>('media');
  const [status, setStatus] = useState<GoalStatus>('em_andamento');

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setDescription(editingGoal.description || '');
      setTargetAmountStr(editingGoal.targetAmount.toString());
      setCurrentAmountStr(editingGoal.currentAmount.toString());
      setDeadline(editingGoal.deadline);
      setPriority(editingGoal.priority);
      setStatus(editingGoal.status);
    } else {
      setTitle('');
      setDescription('');
      setTargetAmountStr('');
      setCurrentAmountStr('0');
      setDeadline(new Date().toISOString().split('T')[0]);
      setPriority('media');
      setStatus('em_andamento');
    }
  }, [editingGoal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmount = parseCurrencyInput(targetAmountStr);
    if (targetAmount <= 0) {
      alert('Informe um valor alvo válido maior que zero.');
      return;
    }

    const currentAmount = parseCurrencyInput(currentAmountStr);

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        title,
        description,
        targetAmount,
        currentAmount,
        deadline,
        priority,
        status: currentAmount >= targetAmount ? 'concluida' : status,
      });
    } else {
      addGoal({
        title,
        description,
        targetAmount,
        currentAmount,
        deadline,
        priority,
        status: currentAmount >= targetAmount ? 'concluida' : 'em_andamento',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingGoal ? 'Editar Meta Financeira' : 'Nova Meta Financeira'}
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
              Nome da Meta *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Viagem de Férias, Compra de Notebook, Curso Novo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descrição (Opcional)
            </label>
            <input
              type="text"
              placeholder="Detalhes adicionais ou motivação"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Valor Alvo (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0,00"
                value={targetAmountStr}
                onChange={(e) => setTargetAmountStr(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Valor Já Acumulado (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={currentAmountStr}
                onChange={(e) => setCurrentAmountStr(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Prazo Limite *
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Prioridade
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as GoalPriority)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="alta">Alta Prioridade</option>
                <option value="media">Média Prioridade</option>
                <option value="baixa">Baixa Prioridade</option>
              </select>
            </div>
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
              <span>Salvar Meta</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
