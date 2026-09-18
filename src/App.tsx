import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { Header } from './components/layout/Header';
import { Sidebar, type TabType } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardView } from './views/DashboardView';
import { TransactionsView } from './views/TransactionsView';
import { BudgetView } from './views/BudgetView';
import { DebtsView } from './views/DebtsView';
import { EmergencyFundView } from './views/EmergencyFundView';
import { GoalsView } from './views/GoalsView';
import { SettingsView } from './views/SettingsView';
import { TitheNoticeModal } from './components/common/TitheNoticeModal';
import { TransactionModal } from './components/lancamentos/TransactionModal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isQuickTransactionOpen, setIsQuickTransactionOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar for Desktop */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header Bar */}
        <Header onOpenNewTransaction={() => setIsQuickTransactionOpen(true)} />

        {/* Dynamic View Scroll Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          <div className="mx-auto max-w-7xl">
            {activeTab === 'dashboard' && (
              <DashboardView
                setActiveTab={setActiveTab}
                onOpenNewTransaction={() => setIsQuickTransactionOpen(true)}
              />
            )}
            {activeTab === 'lancamentos' && <TransactionsView />}
            {activeTab === 'orcamento' && <BudgetView />}
            {activeTab === 'dividas' && <DebtsView />}
            {activeTab === 'reserva' && <EmergencyFundView />}
            {activeTab === 'metas' && <GoalsView />}
            {activeTab === 'configuracoes' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Global Modals */}
      <TitheNoticeModal />
      <TransactionModal
        isOpen={isQuickTransactionOpen}
        onClose={() => setIsQuickTransactionOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}

export default App;
