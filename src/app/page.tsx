'use client';

import { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import SummaryCards from '@/components/SummaryCards';
import AccountsView from '@/components/views/AccountsView';
import CardsView from '@/components/views/CardsView';
import InvestmentsView from '@/components/views/InvestmentsView';
import TransactionsView from '@/components/views/TransactionsView';
import ReportsView from '@/components/views/ReportsView';
import SettingsView from '@/components/views/SettingsView';
import TransactionModal from '@/components/modals/TransactionModal';
import AccountModal from '@/components/modals/AccountModal';
import Auth from '@/components/Auth';
import { Search, Bell, Menu, Plus, Clock, AlertCircle, X, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { translations, Language, formatDate } from '@/utils/translations';

export default function Dashboard() {
  const { transactions, user, loading, settings, isPrivacyMode, togglePrivacyMode, maskValue } = useAppContext();
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const currentLang = (settings?.language as Language) || 'en';
  const dateFormat = settings?.date_format || 'MM/DD/YYYY';
  const t = translations[currentLang];

  // 1. Search Logic
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.category.toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  // 2. Notification Logic (Due Expenses)
  const notifications = useMemo(() => {
    interface Alert {
      id: string;
      title: string;
      message: string;
      type: 'overdue' | 'due-soon';
    }
    const alerts: Alert[] = [];
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const pendingExpenses = transactions.filter(t => 
      t.type === 'expense' && (t.status === 'Pending' || t.status === 'Planned')
    );

    pendingExpenses.forEach(exp => {
      const expDate = new Date(exp.date);
      if (expDate <= threeDaysFromNow) {
        alerts.push({
          id: exp.id,
          title: currentLang === 'pt' ? 'Pagamento Próximo' : currentLang === 'es' ? 'Pago Próximo' : 'Upcoming Payment',
          message: `${exp.name} ($${Math.abs(exp.amount)}) ${currentLang === 'pt' ? 'vence em' : currentLang === 'es' ? 'vence el' : 'is due on'} ${formatDate(exp.date, dateFormat)}`,
          type: expDate < today ? 'overdue' : 'due-soon'
        });
      }
    });

    return alerts;
  }, [transactions, currentLang, dateFormat]);

  // 3. Update Timestamp
  const lastUpdate = useMemo(() => {
    return new Date().toLocaleTimeString(currentLang === 'en' ? 'en-US' : currentLang === 'pt' ? 'pt-BR' : 'es-ES', { hour: '2-digit', minute: '2-digit' });
  }, [transactions, currentLang]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderView = () => {
    switch (activeItem) {
      case 'Dashboard':
        return (
          <>
            <SummaryCards />
            {searchQuery && (
               <div className="mt-8 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
                      {t.searchResultsFor} "{searchQuery}"
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {filteredTransactions.map(tr => (
                      <div key={tr.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-xl ${tr.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {tr.type === 'income' ? <Plus size={16} /> : <AlertCircle size={16} />}
                          </div>
                          <div>
                            <p className="font-bold">{tr.name}</p>
                            <p className="text-xs text-slate-500 font-medium">{tr.category} • {formatDate(tr.date, dateFormat)}</p>
                          </div>
                        </div>
                        <p className={`font-black ${tr.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                          {tr.type === 'income' ? '+' : '-'}${maskValue(Math.abs(tr.amount))}
                        </p>
                      </div>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <p className="text-slate-500 text-sm italic p-4 text-center font-medium">
                          {t.noTransactionsMatchSearch}
                      </p>
                    )}
                  </div>
               </div>
            )}
          </>
        );
      case 'Accounts':
        return <AccountsView />;
      case 'Credit Cards':
        return <CardsView />;
      case 'Investments':
        return <InvestmentsView />;
      case 'Income':
        return <TransactionsView initialType="income" />;
      case 'Expenses':
        return <TransactionsView initialType="expense" />;
      case 'Reports':
        return <ReportsView />;
      case 'Settings':
        return <SettingsView />;
      default:
        return <SummaryCards />;
    }
  };

  const getTranslatedActiveItem = () => {
    switch (activeItem) {
      case 'Dashboard': return t.dashboard;
      case 'Accounts': return t.accounts;
      case 'Credit Cards': return t.creditCards;
      case 'Investments': return t.investments;
      case 'Income': return t.income;
      case 'Expenses': return t.expenses;
      case 'Reports': return t.reports;
      case 'Settings': return t.settings;
      default: return activeItem;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#020617] font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden text-slate-900 dark:text-white">
      {/* Sidebar Desktop */}
      <div className="hidden md:block sticky top-0 h-screen">
        <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-64 animate-in slide-in-from-left duration-300 h-full">
            <Sidebar 
              activeItem={activeItem} 
              setActiveItem={setActiveItem} 
              onClose={() => setIsMobileMenuOpen(false)} 
            />
          </div>
          <button 
            className="absolute top-4 right-4 p-2 text-white bg-slate-800 rounded-full"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden min-h-screen flex flex-col items-center">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 w-full text-slate-900 dark:text-white">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-3 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3">
              <button 
                className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={22} />
              </button>
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl font-black tracking-tighter uppercase">{getTranslatedActiveItem()}</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Clock size={10} className="text-slate-400" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">
                      {t.updatedAt} {lastUpdate}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end max-w-3xl">
              <div className="relative w-full max-w-xs md:max-w-md hidden lg:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-xs md:text-sm font-bold focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="p-2 md:p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:scale-105 transition-all relative"
                  >
                    <Bell size={20} strokeWidth={2.5} />
                    {notifications.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-2 h-2 md:w-2.5 md:h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
                    )}
                  </button>

                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-3 w-72 md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2 text-slate-900 dark:text-white">
                      <h3 className="text-xs font-black uppercase tracking-wider mb-4 px-2">
                          {t.alerts}
                      </h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                        {notifications.map(n => (
                          <div key={n.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                             <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">{n.title}</p>
                             <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-tight">{n.message}</p>
                          </div>
                        ))}
                        {notifications.length === 0 && <p className="text-xs text-slate-500 italic p-4 text-center">{t.noActiveAlerts}</p>}
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={togglePrivacyMode}
                  className="p-2 md:p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:scale-105 transition-all relative"
                  title={isPrivacyMode ? "Show Values" : "Hide Values"}
                >
                  {isPrivacyMode ? <Eye size={20} strokeWidth={2.5} /> : <EyeOff size={20} strokeWidth={2.5} />}
                </button>

                <div className="h-8 md:h-10 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
                
                <button 
                  onClick={() => setIsTransactionModalOpen(true)}
                  className="p-2 md:p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
                >
                  <Plus size={20} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="w-full flex-1 flex flex-col items-center">
          <div className="w-full max-w-[1400px] p-4 md:p-8 pt-2 md:pt-4">
            {renderView()}
          </div>
        </div>
      </main>

      {/* Shared Modals */}
      <TransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={() => setIsTransactionModalOpen(false)} 
      />
      <AccountModal 
        isOpen={isAccountModalOpen} 
        onClose={() => setIsAccountModalOpen(false)} 
      />
    </div>
  );
}
