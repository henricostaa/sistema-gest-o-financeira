import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import type { Debt } from '../types/finance';
import { calculateDebtMetrics } from '../utils/calculations';
import { formatCurrency, formatDateBR } from '../utils/formatters';
import { DebtModal } from '../components/dividas/DebtModal';
import { PaymentModal } from '../components/dividas/PaymentModal';
import { EmptyState } from '../components/layout/EmptyState';
import {
  Flame,
  PlusCircle,
  Sparkles,
  DollarSign,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const DebtsView: React.FC = () => {
  const { debts, deleteDebt, settings } = useFinance();

  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState<Debt | null>(null);

  const metrics = calculateDebtMetrics(debts, settings.debtClearanceTargetDate || '2026-12-31');

  const handleOpenNew = () => {
    setEditingDebt(null);
    setIsDebtModalOpen(true);
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setIsDebtModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir esta dívida?')) {
      deleteDebt(id);
    }
  };

  const handleOpenPayment = (debt: Debt) => {
    setSelectedDebtForPayment(debt);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Quitação de Dívidas - Método Bola de Neve
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-500">
              Bola de Neve
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Foque na menor dívida primeiro para acelerar vitórias financeiras até Dezembro de 2026.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 transition active:scale-95"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Cadastrar Dívida</span>
        </button>
      </div>

      {/* Strategy Explanation & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Original</span>
          <h4 className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(metrics.totalOriginal)}
          </h4>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Negociado</span>
          <h4 className="mt-1 text-lg font-extrabold text-blue-600 dark:text-blue-400">
            {formatCurrency(metrics.totalNegotiated)}
          </h4>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Já Quitado</span>
          <h4 className="mt-1 text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(metrics.totalPaid)}
          </h4>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Saldo Devedor Restante</span>
          <h4 className="mt-1 text-lg font-extrabold text-rose-600 dark:text-rose-400">
            {formatCurrency(metrics.totalRemaining)}
          </h4>
        </div>
      </div>

      {/* Recommended Target Card */}
      {metrics.nextSnowballTarget && (
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-black shadow-md">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <span className="inline-block rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                  Recomendação Bola de Neve #1
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Próxima Dívida Alvo: {metrics.nextSnowballTarget.creditor}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Falta apenas{' '}
                  <strong className="text-amber-600 dark:text-amber-400">
                    {formatCurrency(metrics.nextSnowballTarget.remainingAmount)}
                  </strong>{' '}
                  para quitar completamente e comemorar esta vitória!
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenPayment(metrics.nextSnowballTarget!)}
              className="flex items-center justify-center space-x-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-md transition self-start sm:self-auto"
            >
              <DollarSign className="h-4 w-4" />
              <span>Registrar Pagamento</span>
            </button>
          </div>
        </div>
      )}

      {/* Debts Table */}
      {debts.length === 0 ? (
        <EmptyState
          icon={Flame}
          title="Nenhuma dívida cadastrada"
          description="Parabéns! Se você tem pendências bancárias ou dívidas para negociar, cadastre-as para montar sua estratégia bola de neve rumo ao nome limpo."
          actionText="Cadastrar Primeira Dívida"
          onAction={handleOpenNew}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Dívidas Ordenadas da Menor para a Maior (Estratégia Bola de Neve)
            </span>
            <span className="text-[11px] text-slate-400">
              Total: {debts.length} registro(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Credor</th>
                  <th className="px-4 py-3.5">Valor Original</th>
                  <th className="px-4 py-3.5">Desconto</th>
                  <th className="px-4 py-3.5">Valor Negociado</th>
                  <th className="px-4 py-3.5">Valor Pago</th>
                  <th className="px-4 py-3.5">Saldo Devedor</th>
                  <th className="px-4 py-3.5">Situação</th>
                  <th className="px-4 py-3.5">Vencimento</th>
                  <th className="px-4 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {metrics.sortedDebts.map((debt) => {
                  const isQuitada = debt.status === 'quitada';
                  const isNextTarget = metrics.nextSnowballTarget?.id === debt.id;

                  return (
                    <tr
                      key={debt.id}
                      className={`transition ${
                        isNextTarget
                          ? 'bg-amber-500/10 dark:bg-amber-500/10 hover:bg-amber-500/20'
                          : isQuitada
                          ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/40'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Credor */}
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center space-x-2">
                          {isNextTarget && (
                            <span className="rounded-full bg-amber-500 text-slate-950 px-1.5 py-0.5 text-[9px] font-black uppercase">
                              #1 Bola de Neve
                            </span>
                          )}
                          <span>{debt.creditor}</span>
                        </div>
                      </td>

                      {/* Original */}
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                        {formatCurrency(debt.originalAmount)}
                      </td>

                      {/* Desconto */}
                      <td className="px-4 py-3.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                        {debt.negotiatedDiscount > 0
                          ? `- ${formatCurrency(debt.negotiatedDiscount)}`
                          : '-'}
                      </td>

                      {/* Valor Negociado */}
                      <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(debt.effectiveAmount)}
                      </td>

                      {/* Valor Pago */}
                      <td className="px-4 py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(debt.paidAmount)}
                      </td>

                      {/* Saldo Devedor */}
                      <td className="px-4 py-3.5 font-extrabold text-sm text-rose-600 dark:text-rose-400">
                        {formatCurrency(debt.remainingAmount)}
                      </td>

                      {/* Situação */}
                      <td className="px-4 py-3.5">
                        {isQuitada ? (
                          <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Quitada</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            <Clock className="h-3 w-3" />
                            <span>Em Aberto</span>
                          </span>
                        )}
                      </td>

                      {/* Vencimento */}
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                        {formatDateBR(debt.dueDate)}
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {!isQuitada && (
                            <button
                              onClick={() => handleOpenPayment(debt)}
                              className="flex items-center space-x-1 rounded-lg bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500 transition"
                              title="Registrar pagamento"
                            >
                              <DollarSign className="h-3 w-3" />
                              <span>Pagar</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleEdit(debt)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
                            title="Editar"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(debt.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
                            title="Excluir"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <DebtModal
        isOpen={isDebtModalOpen}
        onClose={() => setIsDebtModalOpen(false)}
        editingDebt={editingDebt}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        debt={selectedDebtForPayment}
      />
    </div>
  );
};
