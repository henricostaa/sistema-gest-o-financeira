import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import type { Transaction } from '../types/finance';
import { formatCurrency, formatDateBR } from '../utils/formatters';
import { exportToCSV } from '../utils/exportImport';
import { EmptyState } from '../components/layout/EmptyState';
import { TransactionModal } from '../components/lancamentos/TransactionModal';
import {
  Receipt,
  PlusCircle,
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

type SortField = 'date' | 'category' | 'amount' | 'paymentMethod' | 'status' | 'notes';
type SortOrder = 'asc' | 'desc';

export const TransactionsView: React.FC = () => {
  const {
    transactions,
    getEffectiveTransactionsForMonthYear,
    categories,
    paymentMethods,
    deleteTransaction,
    updateTransaction,
    selectedMonth,
    selectedYear,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');

  // Sorting state
  const [sortField, setSortField] = useState<SortField | null>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleOpenNew = () => {
    setEditingTx(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir este lançamento?')) {
      deleteTransaction(id);
    }
  };

  const handleToggleStatus = (tx: Transaction) => {
    const newStatus = tx.status === 'pago' ? 'pendente' : 'pago';
    updateTransaction(tx.id, { status: newStatus });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'amount' || field === 'date' ? 'desc' : 'asc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 opacity-30 group-hover:opacity-75 transition shrink-0" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
    );
  };

  // Obtain effective list for the selected period
  const effectiveList = getEffectiveTransactionsForMonthYear(selectedMonth, selectedYear);

  // Filter transactions
  const filteredTransactions = effectiveList.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterCategory !== 'all' && t.categoryId !== filterCategory) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterPaymentMethod !== 'all' && t.paymentMethod !== filterPaymentMethod) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const cat = categories.find((c) => c.id === t.categoryId);
      const catName = cat ? cat.name.toLowerCase() : '';
      const notes = (t.notes || '').toLowerCase();
      const amountStr = t.amount.toString();

      if (!catName.includes(term) && !notes.includes(term) && !amountStr.includes(term)) {
        return false;
      }
    }

    return true;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (!sortField) return 0;

    let comparison = 0;

    switch (sortField) {
      case 'date': {
        comparison = a.date.localeCompare(b.date);
        if (comparison === 0) {
          comparison = a.type.localeCompare(b.type);
        }
        break;
      }
      case 'category': {
        const catA = categories.find((c) => c.id === a.categoryId)?.name || '';
        const catB = categories.find((c) => c.id === b.categoryId)?.name || '';
        comparison = catA.localeCompare(catB, 'pt-BR');
        break;
      }
      case 'amount': {
        const valA = a.type === 'receita' ? a.amount : -a.amount;
        const valB = b.type === 'receita' ? b.amount : -b.amount;
        comparison = valA - valB;
        break;
      }
      case 'paymentMethod': {
        comparison = (a.paymentMethod || '').localeCompare(b.paymentMethod || '', 'pt-BR');
        break;
      }
      case 'status': {
        comparison = (a.status || '').localeCompare(b.status || '', 'pt-BR');
        break;
      }
      case 'notes': {
        comparison = (a.notes || '').localeCompare(b.notes || '', 'pt-BR');
        break;
      }
      default:
        comparison = 0;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleExportCSV = () => {
    exportToCSV(sortedTransactions, `lancamentos_${selectedMonth}_${selectedYear}.csv`);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 md:pb-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Lançamentos Financeiros
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gerencie todas as suas receitas e despesas com praticidade.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            <Download className="h-4 w-4" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleOpenNew}
            className="flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 transition active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Filter className="h-4 w-4 text-emerald-500" />
          <span>Filtros e Busca</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {/* Search Term */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por categoria, obs ou valor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
          >
            <option value="all">Todos os Tipos</option>
            <option value="receita">Receitas (+)</option>
            <option value="despesa">Despesas (-)</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
          >
            <option value="all">Todas Categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
          >
            <option value="all">Todos os Status</option>
            <option value="pago">Pago / Recebido</option>
            <option value="pendente">Pendente / A vencer</option>
          </select>

          {/* Payment Method Filter */}
          <select
            value={filterPaymentMethod}
            onChange={(e) => setFilterPaymentMethod(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
          >
            <option value="all">Todas as Formas</option>
            {paymentMethods.map((pm) => (
              <option key={pm.id} value={pm.name}>
                {pm.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List / Table */}
      {sortedTransactions.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={transactions.length === 0 ? 'Cadastre sua primeira receita' : 'Nenhum lançamento encontrado'}
          description={
            transactions.length === 0
              ? 'Comece agora a registrar seus ganhos e despesas para acompanhar seu orçamento mensal e separar o dízimo automaticamente.'
              : 'Tente ajustar os filtros ou o termo de busca para encontrar as movimentações desejadas.'
          }
          actionText="Cadastrar Lançamento"
          onAction={handleOpenNew}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400 font-semibold select-none">
                <tr>
                  <th
                    onClick={() => handleSort('date')}
                    className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Tipo / Data</span>
                      {renderSortIcon('date')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('category')}
                    className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Categoria</span>
                      {renderSortIcon('category')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('amount')}
                    className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Valor</span>
                      {renderSortIcon('amount')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('paymentMethod')}
                    className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Forma de Pagamento</span>
                      {renderSortIcon('paymentMethod')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Status</span>
                      {renderSortIcon('status')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('notes')}
                    className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Observação</span>
                      {renderSortIcon('notes')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedTransactions.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.categoryId);
                  const isIncome = tx.type === 'receita';
                  const isPaid = tx.status === 'pago';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      {/* Tipo / Data */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {isIncome ? (
                            <ArrowUpCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : (
                            <ArrowDownCircle className="h-4 w-4 text-rose-500 shrink-0" />
                          )}
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {isIncome ? 'Receita' : 'Despesa'}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {formatDateBR(tx.date)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                            style={{
                              backgroundColor: (cat?.color || '#6B7280') + '20',
                              color: cat?.color || '#6B7280',
                            }}
                          >
                            {cat ? cat.name : 'Outros'}
                          </span>
                          {tx.isRecurring && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${
                                isIncome
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                              }`}
                            >
                              {isIncome ? 'Receita Fixa' : 'Despesa Fixa'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Valor */}
                      <td className="px-4 py-3">
                        <span
                          className={`font-extrabold text-sm ${
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                        </span>
                      </td>

                      {/* Forma de Pagamento */}
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {tx.paymentMethod}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStatus(tx)}
                          className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition ${
                            isPaid
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                          }`}
                        >
                          {isPaid ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Pago</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3" />
                              <span>Pendente</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Observação */}
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                        {tx.notes || '-'}
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleEdit(tx)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
                            title="Editar"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
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

      {/* Modal Lançamento */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingTx={editingTx}
      />
    </div>
  );
};
