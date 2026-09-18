import React from 'react';
import type { TabType } from './Sidebar';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Flame,
  ShieldCheck,
  Target,
  Settings,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: 'dashboard' as TabType, label: 'Inicio', icon: LayoutDashboard },
    { id: 'lancamentos' as TabType, label: 'Lançamentos', icon: Receipt },
    { id: 'orcamento' as TabType, label: 'Orçamento', icon: PieChart },
    { id: 'dividas' as TabType, label: 'Dívidas', icon: Flame },
    { id: 'reserva' as TabType, label: 'Reserva', icon: ShieldCheck },
    { id: 'metas' as TabType, label: 'Metas', icon: Target },
    { id: 'configuracoes' as TabType, label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-slate-200 bg-white/95 px-1 py-1.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 md:hidden shadow-lg">
      <div className="flex w-full justify-around items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center px-1.5 py-1 text-[10px] font-medium transition ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <div
                className={`rounded-lg p-1.5 transition ${
                  isActive ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : ''
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="mt-0.5 truncate max-w-[52px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
