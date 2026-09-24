import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
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
import { AuthView } from './views/AuthView';
import { TitheNoticeModal } from './components/common/TitheNoticeModal';
import { TransactionModal } from './components/lancamentos/TransactionModal';
import { AuthModal } from './components/common/AuthModal';

const AppContent: React.FC = () => {
  const { user, setUser } = useFinance();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isQuickTransactionOpen, setIsQuickTransactionOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGuestSession, setIsGuestSession] = useState(false);

  // A user is truly authenticated if they have a logged in ID (not default and not guest)
  const isAuthenticated = Boolean(
    user && user.id && user.id !== 'usr-default' && user.id !== 'usr-guest'
  );

  const handleReturnToLogin = () => {
    setIsGuestSession(false);
    setUser(null);
    setIsAuthModalOpen(false);
  };

  // If user is not authenticated and not explicitly continuing as guest in this session, show initial AuthView
  if (!isAuthenticated && !isGuestSession) {
    return <AuthView onContinueAsGuest={() => setIsGuestSession(true)} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Sidebar for Desktop */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header Bar */}
        <Header
          onOpenNewTransaction={() => setIsQuickTransactionOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onReturnToLogin={handleReturnToLogin}
        />

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
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onOpenSettings={() => setActiveTab('configuracoes')}
        onReturnToLogin={handleReturnToLogin}
      />
    </div>
  );
};

import { ErrorBoundary } from './components/common/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <FinanceProvider>
        <AppContent />
      </FinanceProvider>
    </ErrorBoundary>
  );
}

export default App;
