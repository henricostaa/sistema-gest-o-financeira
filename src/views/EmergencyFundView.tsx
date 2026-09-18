import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useFinance } from '../context/FinanceContext';
import { calculateEmergencyFundSuggestions } from '../utils/calculations';
import { formatCurrency, formatDateBR, parseCurrencyInput } from '../utils/formatters';
import {
  ShieldCheck,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Sparkles,
  History,
  X,
  Check,
} from 'lucide-react';

export const EmergencyFundView: React.FC = () => {
  const { emergencyFund, updateEmergencyFundTarget, addEmergencyContribution, transactions } =
    useFinance();

  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);

  const [contribAmountStr, setContribAmountStr] = useState('');
  const [contribType, setContribType] = useState<'aporte' | 'retirada'>('aporte');
  const [contribNotes, setContribNotes] = useState('');

  const [targetAmountStr, setTargetAmountStr] = useState(emergencyFund.targetAmount.toString());
  const [monthlyContribStr, setMonthlyContribStr] = useState(
    emergencyFund.monthlyPlannedContribution.toString()
  );

  const suggestions = calculateEmergencyFundSuggestions(transactions);

  const current = emergencyFund.currentAmount;
  const target = emergencyFund.targetAmount;
  const remaining = Math.max(0, target - current);
  const percentConcluded = target > 0 ? Math.min(100, (current / target) * 100) : 0;

  // Estimated months to finish
  const monthlyPlanned = emergencyFund.monthlyPlannedContribution || 1;
  const estimatedMonthsLeft = remaining > 0 ? Math.ceil(remaining / monthlyPlanned) : 0;

  const handleApplySuggestion = (amount: number) => {
    updateEmergencyFundTarget(amount, emergencyFund.monthlyPlannedContribution);
  };

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const newTarget = parseCurrencyInput(targetAmountStr);
    const newMonthly = parseCurrencyInput(monthlyContribStr);
    updateEmergencyFundTarget(newTarget, newMonthly);
    setIsTargetModalOpen(false);
  };

  const handleSaveContribution = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseCurrencyInput(contribAmountStr);
    if (amount <= 0) {
      alert('Informe um valor válido.');
      return;
    }

    addEmergencyContribution(amount, contribType, contribNotes);

    if (contribType === 'aporte' && current + amount >= target) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }

    setContribAmountStr('');
    setContribNotes('');
    setIsContributionModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Reserva de Emergência
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-500">
              Segurança Financeira
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Guarde um fundo para imprevistos e evite contrair novas dívidas.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsTargetModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            <span>Ajustar Meta</span>
          </button>

          <button
            onClick={() => setIsContributionModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 transition active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Novo Aporte / Retirada</span>
          </button>
        </div>
      </div>

      {/* Main Progress Card */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2 text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Progresso da Sua Reserva
              </span>
            </div>
            <h3 className="text-3xl font-extrabold text-white">
              {formatCurrency(current)}{' '}
              <span className="text-sm font-normal text-slate-400">de {formatCurrency(target)}</span>
            </h3>

            {/* Progress Bar */}
            <div className="pt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Concluído: {percentConcluded.toFixed(1)}%</span>
                <span className="text-emerald-400 font-bold">Faltam {formatCurrency(remaining)}</span>
              </div>
              <div className="h-3.5 w-full rounded-full bg-slate-800 p-0.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 shadow-sm"
                  style={{ width: `${percentConcluded}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
            <div className="rounded-xl bg-slate-800/60 p-3.5 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block font-medium">Aporte Mensal Planejado</span>
              <span className="text-sm font-extrabold text-emerald-400">
                {formatCurrency(emergencyFund.monthlyPlannedContribution)}
              </span>
            </div>

            <div className="rounded-xl bg-slate-800/60 p-3.5 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block font-medium">Estimativa Conclusão</span>
              <span className="text-sm font-extrabold text-amber-400">
                {remaining === 0 ? 'Concluída!' : `${estimatedMonthsLeft} meses`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Suggestions based on Expense Averages */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          <span>Sugestão Inteligente de Meta para Sua Reserva</span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Com base nas suas despesas pagas registradas (Média de{' '}
          <strong className="text-slate-700 dark:text-slate-200">
            {formatCurrency(suggestions.averageMonthlyExpense)}/mês
          </strong>
          ), recomendamos estabelecer:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* 3 months suggestion */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                3 Meses de Despesas (Essencial)
              </span>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(suggestions.suggested3Months)}
              </span>
            </div>
            <button
              onClick={() => handleApplySuggestion(suggestions.suggested3Months)}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
            >
              Usar Meta
            </button>
          </div>

          {/* 6 months suggestion */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                6 Meses de Despesas (Segurança Ideal)
              </span>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(suggestions.suggested6Months)}
              </span>
            </div>
            <button
              onClick={() => handleApplySuggestion(suggestions.suggested6Months)}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
            >
              Usar Meta
            </button>
          </div>
        </div>
      </div>

      {/* Contributions History */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white">
          <History className="h-4 w-4 text-emerald-500" />
          <span>Histórico de Aportes e Retiradas ({emergencyFund.contributions.length})</span>
        </div>

        {emergencyFund.contributions.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            Nenhum aporte registrado ainda. Clique em "Novo Aporte" para começar a guardar sua reserva.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {emergencyFund.contributions.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3 text-xs">
                <div className="flex items-center space-x-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      c.type === 'aporte'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {c.type === 'aporte' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {c.type === 'aporte' ? 'Aporte Realizado' : 'Retirada de Emergência'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDateBR(c.date)} {c.notes ? `• ${c.notes}` : ''}
                    </span>
                  </div>
                </div>

                <span
                  className={`font-extrabold text-sm ${
                    c.type === 'aporte'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {c.type === 'aporte' ? '+' : '-'} {formatCurrency(c.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contribution Modal */}
      {isContributionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Lançamento na Reserva
              </h3>
              <button
                onClick={() => setIsContributionModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContribution} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setContribType('aporte')}
                  className={`rounded-lg py-2 text-xs font-bold transition ${
                    contribType === 'aporte'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Aporte (+)
                </button>
                <button
                  type="button"
                  onClick={() => setContribType('retirada')}
                  className={`rounded-lg py-2 text-xs font-bold transition ${
                    contribType === 'retirada'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Retirada (-)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Valor (R$) *
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Observação
                </label>
                <input
                  type="text"
                  placeholder="Ex: Aporte mensal economia de combustível"
                  value={contribNotes}
                  onChange={(e) => setContribNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsContributionModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center space-x-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md transition"
                >
                  <Check className="h-4 w-4" />
                  <span>Salvar Registro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Target Modal */}
      {isTargetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ajustar Meta da Reserva
              </h3>
              <button
                onClick={() => setIsTargetModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTarget} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Valor Meta Alvo (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={targetAmountStr}
                  onChange={(e) => setTargetAmountStr(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Aporte Mensal Planejado (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={monthlyContribStr}
                  onChange={(e) => setMonthlyContribStr(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTargetModalOpen(false)}
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
      )}
    </div>
  );
};
