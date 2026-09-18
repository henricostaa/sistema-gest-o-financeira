import React, { useRef, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { exportFullExcel, parseCSVTransactions } from '../utils/exportImport';
import {
  Settings as SettingsIcon,
  Tag,
  CreditCard,
  HeartHandshake,
  Calendar,
  Download,
  Upload,
  RefreshCw,
  Database,
  PlusCircle,
  Trash2,
  Check,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    categories,
    addCategory,
    deleteCategory,
    paymentMethods,
    addPaymentMethod,
    deletePaymentMethod,
    transactions,
    debts,
    budgets,
    goals,
    resetAllData,
    importAllData,
    importCSVList,
  } = useFinance();

  // Category state
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'receita' | 'despesa'>('despesa');
  const [newCatColor, setNewCatColor] = useState('#10B981');

  // Payment method state
  const [newPmName, setNewPmName] = useState('');

  // Settings inputs
  const [tithePct, setTithePct] = useState(settings.tithePercentage.toString());
  const [debtDate, setDebtDate] = useState(settings.debtClearanceTargetDate || '2026-12-31');

  // Supabase input
  const [supaUrl, setSupaUrl] = useState(settings.supabaseUrl || '');
  const [supaKey, setSupaKey] = useState(settings.supabaseAnonKey || '');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      tithePercentage: parseFloat(tithePct) || 10,
      debtClearanceTargetDate: debtDate,
      supabaseUrl: supaUrl,
      supabaseAnonKey: supaKey,
    });
    alert('Configurações salvas com sucesso!');
  };

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName.trim(),
      type: newCatType,
      color: newCatColor,
      icon: 'Tag',
    });
    setNewCatName('');
  };

  const handleAddPm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPmName.trim()) return;
    addPaymentMethod(newPmName.trim());
    setNewPmName('');
  };

  const handleExportExcel = () => {
    exportFullExcel(transactions, debts, budgets, goals);
  };

  const handleExportBackupJSON = () => {
    const data = {
      transactions,
      categories,
      paymentMethods,
      budgets,
      debts,
      goals,
      settings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `backup_financeiro_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportBackupJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        importAllData(parsed);
        alert('Backup restaurado com sucesso!');
      } catch (err) {
        alert('Erro ao carregar o arquivo de backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleImportCSVFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const txList = parseCSVTransactions(text);
        if (txList.length > 0) {
          importCSVList(txList);
          alert(`${txList.length} lançamentos importados com sucesso do CSV!`);
        } else {
          alert('Nenhum lançamento válido encontrado no CSV.');
        }
      } catch (err) {
        alert('Erro ao processar arquivo CSV.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('ATENÇÃO: Deseja realmente APAGAR TODOS os dados? Esta ação não poderá ser desfeita.')) {
      resetAllData();
      alert('Todos os dados foram redefinidos.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 md:pb-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          Configurações do Sistema
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personalize categorias, dízimo, metas de dívidas e faça backup dos seus dados.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
          <SettingsIcon className="h-4 w-4 text-emerald-500" />
          <span>Parâmetros Financeiros Globais</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Tithe percentage */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <HeartHandshake className="h-3.5 w-3.5 text-emerald-500" />
              <span>Percentual do Dízimo (%)</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={tithePct}
              onChange={(e) => setTithePct(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Debt clearance target date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-amber-500" />
              <span>Meta Nome Limpo (Data Final)</span>
            </label>
            <input
              type="date"
              value={debtDate}
              onChange={(e) => setDebtDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Currency */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Moeda do Sistema
            </label>
            <input
              type="text"
              disabled
              value="BRL - Real Brasileiro (R$)"
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400"
            />
          </div>
        </div>

        {/* Supabase optional credentials */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white">
            <Database className="h-4 w-4 text-emerald-500" />
            <span>Sincronização com Supabase / PostgreSQL (Opcional)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                URL do Projeto Supabase
              </label>
              <input
                type="text"
                placeholder="https://xxx.supabase.co"
                value={supaUrl}
                onChange={(e) => setSupaUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                Chave Anon (Public Key)
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                value={supaKey}
                onChange={(e) => setSupaKey(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 transition"
        >
          <Check className="h-4 w-4" />
          <span>Salvar Configurações</span>
        </button>
      </form>

      {/* Export / Import / Backup Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
          <Download className="h-4 w-4 text-emerald-500" />
          <span>Exportação, Importação & Backup dos Dados</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Excel Export */}
          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center space-x-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition"
          >
            <Download className="h-4 w-4" />
            <span>Exportar Excel (.xlsx)</span>
          </button>

          {/* JSON Backup Export */}
          <button
            onClick={handleExportBackupJSON}
            className="flex items-center justify-center space-x-2 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition"
          >
            <Download className="h-4 w-4" />
            <span>Baixar Backup JSON</span>
          </button>

          {/* CSV Import */}
          <button
            onClick={() => csvInputRef.current?.click()}
            className="flex items-center justify-center space-x-2 rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <Upload className="h-4 w-4" />
            <span>Importar CSV</span>
          </button>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            onChange={handleImportCSVFile}
            className="hidden"
          />

          {/* JSON Restore */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center space-x-2 rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <Upload className="h-4 w-4" />
            <span>Restaurar Backup</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportBackupJSON}
            className="hidden"
          />
        </div>

        {/* Reset */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleResetData}
            className="flex items-center space-x-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Zerar Todos os Dados</span>
          </button>
        </div>
      </div>

      {/* Category Management */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
          <Tag className="h-4 w-4 text-emerald-500" />
          <span>Gerenciamento de Categorias ({categories.length})</span>
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleAddCat} className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            required
            placeholder="Nome da nova categoria"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 min-w-[160px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />

          <select
            value={newCatType}
            onChange={(e) => setNewCatType(e.target.value as 'receita' | 'despesa')}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="despesa">Despesa</option>
            <option value="receita">Receita</option>
          </select>

          <input
            type="color"
            value={newCatColor}
            onChange={(e) => setNewCatColor(e.target.value)}
            className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
            title="Escolher cor"
          />

          <button
            type="submit"
            className="flex items-center space-x-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Adicionar</span>
          </button>
        </form>

        {/* Categories List */}
        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-800/60"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
              <span className="text-[10px] text-slate-400 capitalize">({cat.type})</span>
              {!cat.isDefault && (
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="text-slate-400 hover:text-rose-500 ml-1 transition"
                  title="Excluir Categoria"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods Management */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
          <CreditCard className="h-4 w-4 text-emerald-500" />
          <span>Formas de Pagamento ({paymentMethods.length})</span>
        </div>

        <form onSubmit={handleAddPm} className="flex items-center space-x-2">
          <input
            type="text"
            required
            placeholder="Nome da forma de pagamento (ex: Cartão XP, Vale)"
            value={newPmName}
            onChange={(e) => setNewPmName(e.target.value)}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="submit"
            className="flex items-center space-x-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Adicionar</span>
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          {paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200"
            >
              <span>{pm.name}</span>
              <button
                onClick={() => deletePaymentMethod(pm.id)}
                className="text-slate-400 hover:text-rose-500 ml-1 transition"
                title="Excluir Forma de Pagamento"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
