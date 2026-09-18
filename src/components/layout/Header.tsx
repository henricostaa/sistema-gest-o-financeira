import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { MONTH_NAMES_PT } from '../../utils/formatters';
import { ChevronLeft, ChevronRight, Moon, Sun, PlusCircle, User } from 'lucide-react';

interface HeaderProps {
  onOpenNewTransaction: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewTransaction }) => {
  const { selectedMonth, selectedYear, setSelectedMonthYear, settings, updateSettings, user } = useFinance();

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonthYear(12, selectedYear - 1);
    } else {
      setSelectedMonthYear(selectedMonth - 1, selectedYear);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonthYear(1, selectedYear + 1);
    } else {
      setSelectedMonthYear(selectedMonth + 1, selectedYear);
    }
  };

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const yearsList = [2024, 2025, 2026, 2027, 2028];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
      {/* Month & Year Selector */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handlePrevMonth}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
          title="Mês anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-1 font-bold text-slate-800 dark:text-white">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonthYear(Number(e.target.value), selectedYear)}
            className="cursor-pointer rounded-md bg-transparent px-2 py-1 text-sm font-semibold hover:bg-slate-100 focus:outline-none dark:hover:bg-slate-800"
          >
            {MONTH_NAMES_PT.map((name, idx) => (
              <option key={idx} value={idx + 1} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                {name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedMonthYear(selectedMonth, Number(e.target.value))}
            className="cursor-pointer rounded-md bg-transparent px-2 py-1 text-sm font-semibold hover:bg-slate-100 focus:outline-none dark:hover:bg-slate-800"
          >
            {yearsList.map((y) => (
              <option key={y} value={y} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleNextMonth}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
          title="Próximo mês"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Right Controls & Quick Actions */}
      <div className="flex items-center space-x-3">
        {/* Quick New Transaction Button */}
        <button
          onClick={onOpenNewTransaction}
          className="flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 active:scale-95 transition"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Novo Lançamento</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 shadow-sm hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
          title={settings.theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        >
          {settings.theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-600" />
          )}
        </button>

        {/* User profile */}
        <div className="hidden md:flex items-center space-x-2 border-l border-slate-200 pl-3 dark:border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white dark:bg-emerald-600 font-bold text-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
          </div>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{user?.name || 'Usuário'}</span>
        </div>
      </div>
    </header>
  );
};
