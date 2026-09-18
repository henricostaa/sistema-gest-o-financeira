import * as XLSX from 'xlsx';
import type { Debt, FinancialGoal, MonthlyBudget, Transaction } from '../types/finance';
import { formatDateBR } from './formatters';

export const exportToCSV = (transactions: Transaction[], filename: string = 'transacoes.csv') => {
  const headers = ['Data', 'Tipo', 'Categoria ID', 'Valor (R$)', 'Forma de Pagamento', 'Status', 'Observação'];
  const rows = transactions.map((t) => [
    formatDateBR(t.date),
    t.type === 'receita' ? 'Receita' : 'Despesa',
    t.categoryId,
    t.amount.toFixed(2),
    t.paymentMethod,
    t.status === 'pago' ? 'Pago' : 'Pendente',
    t.notes || '',
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map((r) => r.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(';')),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

export const exportFullExcel = (
  transactions: Transaction[],
  debts: Debt[],
  budgets: MonthlyBudget[],
  goals: FinancialGoal[],
  filename: string = 'controle_financeiro_completo.xlsx'
) => {
  const wb = XLSX.utils.book_new();

  // Transactions Sheet
  const txData = transactions.map((t) => ({
    Data: formatDateBR(t.date),
    Tipo: t.type === 'receita' ? 'Receita' : 'Despesa',
    Categoria: t.categoryId,
    'Valor (R$)': t.amount,
    'Forma de Pagamento': t.paymentMethod,
    Status: t.status === 'pago' ? 'Pago' : 'Pendente',
    Observação: t.notes || '',
  }));
  const txSheet = XLSX.utils.json_to_sheet(txData);
  XLSX.utils.book_append_sheet(wb, txSheet, 'Lançamentos');

  // Debts Sheet
  const debtData = debts.map((d) => ({
    Credor: d.creditor,
    'Valor Original (R$)': d.originalAmount,
    'Desconto (R$)': d.negotiatedDiscount,
    'Valor Negociado (R$)': d.negotiatedAmount,
    'Valor Pago (R$)': d.paidAmount,
    'Saldo Devedor (R$)': Math.max(0, (d.negotiatedAmount > 0 ? d.negotiatedAmount : d.originalAmount) - d.paidAmount),
    Situação: d.status,
    Vencimento: formatDateBR(d.dueDate),
    Observação: d.notes || '',
  }));
  const debtSheet = XLSX.utils.json_to_sheet(debtData);
  XLSX.utils.book_append_sheet(wb, debtSheet, 'Dívidas (Bola de Neve)');

  // Budgets Sheet
  const budgetData = budgets.map((b) => ({
    Mês: b.month,
    Ano: b.year,
    Categoria: b.categoryId,
    'Planejado (R$)': b.plannedAmount,
  }));
  const budgetSheet = XLSX.utils.json_to_sheet(budgetData);
  XLSX.utils.book_append_sheet(wb, budgetSheet, 'Orçamento Mensal');

  // Goals Sheet
  const goalData = goals.map((g) => ({
    Meta: g.title,
    Descrição: g.description || '',
    'Valor Alvo (R$)': g.targetAmount,
    'Valor Atual (R$)': g.currentAmount,
    Prazo: formatDateBR(g.deadline),
    Prioridade: g.priority,
    Status: g.status,
  }));
  const goalSheet = XLSX.utils.json_to_sheet(goalData);
  XLSX.utils.book_append_sheet(wb, goalSheet, 'Metas Financeiras');

  XLSX.writeFile(wb, filename);
};

export const parseCSVTransactions = (csvText: string): Partial<Transaction>[] => {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const results: Partial<Transaction>[] = [];
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(';').map((c) => c.replace(/^"|"$/g, '').trim());
    if (cols.length >= 4) {
      const rawDate = cols[0];
      const typeStr = cols[1]?.toLowerCase();
      const categoryId = cols[2] || 'cat-outros-exp';
      const amount = parseFloat(cols[3].replace(',', '.')) || 0;
      const paymentMethod = cols[4] || 'PIX';
      const statusStr = cols[5]?.toLowerCase();
      const notes = cols[6] || '';

      // Convert DD/MM/YYYY to YYYY-MM-DD
      let date = rawDate;
      if (rawDate.includes('/')) {
        const [d, m, y] = rawDate.split('/');
        date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }

      results.push({
        date,
        type: typeStr.includes('rec') ? 'receita' : 'despesa',
        categoryId,
        amount,
        paymentMethod,
        status: statusStr.includes('pago') ? 'pago' : 'pendente',
        notes,
      });
    }
  }
  return results;
};
