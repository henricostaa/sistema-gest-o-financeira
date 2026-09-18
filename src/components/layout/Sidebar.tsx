import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Flame,
  ShieldCheck,
  Target,
  Settings,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'lancamentos'
  | 'orcamento'
  | 'dividas'
  | 'reserva'
  | 'metas'
  | 'configuracoes';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'lancamentos' as TabType, label: 'Lançamentos', icon: Receipt },
    { id: 'orcamento' as TabType, label: 'Orçamento Mensal', icon: PieChart },
    { id: 'dividas' as TabType, label: 'Dívidas (Bola de Neve)', icon: Flame },
    { id: 'reserva' as TabType, label: 'Reserva de Emergência', icon: ShieldCheck },
    { id: 'metas' as TabType, label: 'Metas Financeiras', icon: Target },
    { id: 'configuracoes' as TabType, label: 'Configurações', icon: Settings },
  ];

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-slate-900 text-slate-300 dark:border-slate-800 dark:bg-slate-950 md:flex">
      {/* Brand Header */}
      <div className="flex items-center space-x-3 border-b border-slate-800 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-extrabold shadow-lg shadow-emerald-500/20">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white leading-tight">Finanças Pessoais</h1>
          <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
            <HeartHandshake className="h-3 w-3 inline" /> 10% Dízimo & Bola de Neve
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold border-l-4 border-emerald-400'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Milestone Footer */}
      <div className="m-4 rounded-xl border border-emerald-500/20 bg-gradient-to-b from-emerald-950/30 to-slate-900/60 p-4 text-center">
        <span className="inline-block rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
          Meta 2026
        </span>
        <p className="text-xs text-slate-300 font-medium">Limpar o Nome até</p>
        <p className="text-sm font-extrabold text-emerald-400">Dezembro de 2026</p>
      </div>
    </aside>
  );
};
