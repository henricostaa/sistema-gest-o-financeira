import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useFinance } from '../context/FinanceContext';
import type { FinancialGoal } from '../types/finance';
import { formatCurrency, formatDateBR, parseCurrencyInput } from '../utils/formatters';
import { GoalModal } from '../components/metas/GoalModal';
import { EmptyState } from '../components/layout/EmptyState';
import {
  Target,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  DollarSign,
  X,
  Check,
} from 'lucide-react';

export const GoalsView: React.FC = () => {
  const { goals, deleteGoal, addGoalContribution } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);

  const [selectedGoalForContrib, setSelectedGoalForContrib] = useState<FinancialGoal | null>(null);
  const [contribAmountStr, setContribAmountStr] = useState('');

  const handleOpenNew = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleEdit = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir esta meta?')) {
      deleteGoal(id);
    }
  };

  const handleConfirmContrib = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForContrib) return;

    const amount = parseCurrencyInput(contribAmountStr);
    if (amount <= 0) {
      alert('Informe um valor válido.');
      return;
    }

    addGoalContribution(selectedGoalForContrib.id, amount);

    if (selectedGoalForContrib.currentAmount + amount >= selectedGoalForContrib.targetAmount) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }

    setSelectedGoalForContrib(null);
    setContribAmountStr('');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Metas Financeiras
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-500">
              Sonhos & Objetivos
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhe o progresso de cada um dos seus projetos com clareza.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 transition active:scale-95"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Nova Meta</span>
        </button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Nenhuma meta cadastrada"
          description="Crie suas metas como viagens, compras planejadas, cursos ou quitação antecipada para acompanhar seu progresso visual."
          actionText="Cadastrar Primeira Meta"
          onAction={handleOpenNew}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const percent =
              goal.targetAmount > 0
                ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
                : 0;
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const isConcluded = goal.status === 'concluida' || percent >= 100;

            const priorityBadge = {
              alta: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
              media: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
              baixa: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
            }[goal.priority];

            return (
              <div
                key={goal.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize ${priorityBadge}`}
                    >
                      Prioridade {goal.priority}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition"
                        title="Editar"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                    {goal.title}
                  </h3>
                  {goal.description && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {goal.description}
                    </p>
                  )}

                  {/* Amount Progress */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-extrabold text-slate-900 dark:text-white text-lg">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        Alvo: {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>

                    <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isConcluded
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-blue-500 to-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <span>{percent.toFixed(0)}% Concluído</span>
                      <span>Prazo: {formatDateBR(goal.deadline)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {isConcluded ? (
                    <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Meta Concluída! 🎉</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Faltam {formatCurrency(remaining)}
                    </span>
                  )}

                  {!isConcluded && (
                    <button
                      onClick={() => {
                        setSelectedGoalForContrib(goal);
                        setContribAmountStr('');
                      }}
                      className="flex items-center space-x-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-sm"
                    >
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>Aportar</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingGoal={editingGoal}
      />

      {/* Contribution to Goal Modal */}
      {selectedGoalForContrib && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Adicionar Aporte para Meta
              </h3>
              <button
                onClick={() => setSelectedGoalForContrib(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmContrib} className="mt-4 space-y-4">
              <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 text-xs">
                <span className="text-slate-400 block font-medium">Meta Selecionada:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedGoalForContrib.title}
                </span>
                <span className="text-slate-400 block mt-1 font-medium">
                  Falta para concluir:{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(selectedGoalForContrib.targetAmount - selectedGoalForContrib.currentAmount)}
                  </strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Valor do Aporte (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0,00"
                  value={contribAmountStr}
                  onChange={(e) => setContribAmountStr(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedGoalForContrib(null)}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center space-x-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md transition"
                >
                  <Check className="h-4 w-4" />
                  <span>Confirmar Aporte</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
