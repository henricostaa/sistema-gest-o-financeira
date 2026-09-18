import React from 'react';
import type { Debt } from '../../types/finance';
import { calculateDebtMetrics } from '../../utils/calculations';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { Flame, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface DebtProgressBarProps {
  debts: Debt[];
  targetDate: string;
  onNavigateToDebts: () => void;
}

export const DebtProgressBar: React.FC<DebtProgressBarProps> = ({
  debts,
  targetDate,
  onNavigateToDebts,
}) => {
  const metrics = calculateDebtMetrics(debts, targetDate);

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 p-5 text-white shadow-md relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Jornada Nome Limpo
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-400 border border-emerald-500/30">
                Dez/2026
              </span>
            </h3>
            <p className="text-xs text-slate-400">Estratégia Bola de Neve para Quitação Total</p>
          </div>
        </div>

        <button
          onClick={onNavigateToDebts}
          className="flex items-center space-x-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition self-start sm:self-auto"
        >
          <span>Gerenciar Dívidas</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {debts.length === 0 ? (
        <div className="my-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-emerald-300">Nenhuma dívida cadastrada!</h4>
          <p className="text-xs text-slate-300 mt-1">
            Seu nome está limpo ou você ainda não cadastrou suas pendências financeiras.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Progresso de Quitação:</span>
              <span className="font-extrabold text-emerald-400">
                {formatPercent(metrics.percentPaid)} ({formatCurrency(metrics.totalPaid)} de{' '}
                {formatCurrency(metrics.totalNegotiated)})
              </span>
            </div>

            <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400 transition-all duration-500 shadow-sm"
                style={{ width: `${Math.min(100, Math.max(0, metrics.percentPaid))}%` }}
              />
            </div>
          </div>

          {/* Stat grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
            <div className="rounded-xl bg-slate-800/60 p-3 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block font-medium">Saldo Devedor Atual</span>
              <span className="text-sm font-extrabold text-rose-400">
                {formatCurrency(metrics.totalRemaining)}
              </span>
            </div>

            <div className="rounded-xl bg-slate-800/60 p-3 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block font-medium">Pritmo Mensal Recomendado</span>
              <span className="text-sm font-extrabold text-amber-400">
                {formatCurrency(metrics.monthlyPaceNeeded)}/mês
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-xl bg-slate-800/60 p-3 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block font-medium">Tempo até Dez/2026</span>
              <span className="text-sm font-extrabold text-emerald-400">
                {metrics.monthsUntilTargetDate} meses restantes
              </span>
            </div>
          </div>

          {/* Next Snowball Target Card */}
          {metrics.nextSnowballTarget && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-300 font-medium">Próximo Alvo Bola de Neve: </span>
                  <span className="font-bold text-white">{metrics.nextSnowballTarget.creditor}</span>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-400">
                Falta {formatCurrency(metrics.nextSnowballTarget.remainingAmount)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
