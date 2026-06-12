'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
import IncomeModal from '@/components/modals/IncomeModal';
import Auth from '@/components/Auth';
import { Search, Bell, Menu, Plus, Clock, AlertCircle, X, Loader2, Eye, EyeOff, Wallet, CreditCard, TrendingUp, ArrowUpRight, ArrowDownLeft, FileText } from 'lucide-react';
import { useAppContext, IncomeLog } from '@/context/AppContext';
import { translations, Language, formatDate } from '@/utils/translations';
import { useRouter } from 'next/navigation';
import useDeviceType from '@/utils/useDeviceType';

export default function Dashboard() {
  const { transactions, user, loading, settings, isPrivacyMode, togglePrivacyMode, maskValue } = useAppContext();
  const router = useRouter();
  const { isMobile } = useDeviceType();
  const [isReady, setIsReady] = useState(false);
  
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [autoOpenModal, setAutoOpenModal] = useState<string | null>(null);
  const [editingIncome, setEditingIncome] = useState<IncomeLog | null>(null);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = (settings?.language as Language) || 'en';
  const dateFormat = settings?.date_format || 'MM/DD/YYYY';
  const t = translations[currentLang];

  useEffect(() => {
    if (!loading && user && settings) {
      if (settings.preferred_experience === 'mobile') {
        router.push('/mobile');
        return;
      }
      if (settings.preferred_experience === 'desktop') {
        setIsReady(true);
        return;
      }
      if (isMobile) {
        router.push('/mobile');
      } else {
        setIsReady(true);
      }
    }
  }, [loading, user, settings, isMobile, router]);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsQuickAddOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(t => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
  }, [transactions, searchQuery]);

  const notifications = useMemo(() => {
    const alerts: any[] = [];
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    const pendingExpenses = transactions.filter(t => t.type === 'expense' && (t.status === 'Pending' || t.status === 'Planned'));
    pendingExpenses.forEach(exp => {
      const expDate = new Date(exp.date);
      if (expDate <= threeDaysFromNow) {
        alerts.push({
          id: exp.id,
          title: 'Upcoming Payment',
          message: `${exp.name} ($${Math.abs(exp.amount)}) is due on ${formatDate(exp.date, dateFormat)}`,
          type: expDate < today ? 'overdue' : 'due-soon'
        });
      }
    });
    return alerts;
  }, [transactions, dateFormat]);

  const lastUpdate = useMemo(() => {
    return new Date().toLocaleTimeString(currentLang === 'en' ? 'en-US' : 'pt-BR', { hour: '2-digit', minute: '2-digit' });
  }, [transactions, currentLang]);

  if (!isReady || loading || !user) {
    if (!user && !loading) return <Auth />;
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  const renderView = () => {
    switch (activeItem) {
      case 'Dashboard': return <SummaryCards />;
      case 'Accounts': return <AccountsView autoOpenModal={autoOpenModal === 'account'} onModalClose={() => setAutoOpenModal(null)} />;
      case 'Credit Cards': return <CardsView autoOpenModal={autoOpenModal === 'card'} onModalClose={() => setAutoOpenModal(null)} />;
      case 'Investments': return <InvestmentsView autoOpenModal={autoOpenModal === 'investment'} onModalClose={() => setAutoOpenModal(null)} />;
      case 'Income': return <TransactionsView initialType="income" />;
      case 'Expenses': return <TransactionsView initialType="expense" />;
      case 'Reports': return <ReportsView autoOpenModal={autoOpenModal === 'report'} onModalClose={() => setAutoOpenModal(null)} />;
      case 'Settings': return <SettingsView />;
      default: return <SummaryCards />;
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
      <div className="hidden md:block sticky top-0 h-screen">
        <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-64 animate-in slide-in-from-left duration-300 h-full">
            <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} onClose={() => setIsMobileMenuOpen(false)} />
          </div>
          <button className="absolute top-4 right-4 p-2 text-white bg-slate-800 rounded-full" onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
        </div>
      )}

      <main className="flex-1 w-full max-w-full overflow-x-hidden min-h-screen flex flex-col items-center">
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 w-full text-slate-900 dark:text-white">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-3 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3">
              <button className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400" onClick={() => setIsMobileMenuOpen(true)}><Menu size={22} /></button>
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl font-black tracking-tighter uppercase">{getTranslatedActiveItem()}</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Clock size={10} className="text-slate-400" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{t.updatedAt} {lastUpdate}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end max-w-3xl">
              <div className="relative w-full max-w-xs md:max-w-md hidden lg:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="text" placeholder={t.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-xs md:text-sm font-bold focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-2 md:p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:scale-105 transition-all relative">
                    <Bell size={20} strokeWidth={2.5} />
                    {notifications.length > 0 && (<span className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-2 h-2 md:w-2.5 md:h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />)}
                  </button>
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-3 w-72 md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2 text-slate-900 dark:text-white">
                      <h3 className="text-xs font-black uppercase tracking-wider mb-4 px-2">{t.alerts}</h3>
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
                <button onClick={togglePrivacyMode} className="p-2 md:p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:scale-105 transition-all relative" title={isPrivacyMode ? "Show Values" : "Hide Values"}>
                  {isPrivacyMode ? <Eye size={20} strokeWidth={2.5} /> : <EyeOff size={20} strokeWidth={2.5} />}
                </button>
                <div className="h-8 md:h-10 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setIsQuickAddOpen(!isQuickAddOpen)} className="p-2 md:p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"><Plus size={20} strokeWidth={3} /></button>
                  {isQuickAddOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] shadow-2xl py-3 z-[100] animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-2 mb-1 border-b border-slate-50 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Add</p>
                      </div>
                      <div className="p-1.5 space-y-0.5">
                        <button onClick={() => { setActiveItem('Accounts'); setAutoOpenModal('account'); setIsQuickAddOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group text-left"><div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg group-hover:scale-110 transition-transform"><Wallet size={16} /></div><span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">{t.accounts}</span></button>
                        <button onClick={() => { setActiveItem('Credit Cards'); setAutoOpenModal('card'); setIsQuickAddOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group text-left"><div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg group-hover:scale-110 transition-transform"><CreditCard size={16} /></div><span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">{t.creditCards}</span></button>
                        <button onClick={() => { setIsIncomeModalOpen(true); setIsQuickAddOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group text-left"><div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform"><ArrowUpRight size={16} /></div><span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 transition-colors">{t.income}</span></button>
                        <button onClick={() => { setIsTransactionModalOpen(true); setIsQuickAddOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group text-left"><div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-lg group-hover:scale-110 transition-transform"><ArrowDownLeft size={16} /></div><span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-rose-600 transition-colors">{t.expenses}</span></button>
                        <button onClick={() => { setActiveItem('Investments'); setAutoOpenModal('investment'); setIsQuickAddOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group text-left"><div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg group-hover:scale-110 transition-transform"><TrendingUp size={16} /></div><span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-amber-600 transition-colors">{t.investments}</span></button>
                        <button onClick={() => { setActiveItem('Reports'); setAutoOpenModal('report'); setIsQuickAddOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group text-left"><div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg group-hover:scale-110 transition-transform"><FileText size={16} /></div><span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-purple-600 transition-colors">{t.generateReport}</span></button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="w-full flex-1 flex flex-col items-center">
          <div className="w-full max-w-[1400px] p-4 md:p-8 pt-2 md:pt-4">
            {searchQuery ? (
              <div className="mt-8 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">{t.searchResultsFor} "{searchQuery}"</h3>
                <div className="grid grid-cols-1 gap-4">
                  {filteredTransactions.map(tr => (
                    <div key={tr.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${tr.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}><Plus size={16} /></div>
                        <div>
                          <p className="font-bold">{tr.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{tr.category} • {formatDate(tr.date, dateFormat)}</p>
                        </div>
                      </div>
                      <p className={`font-black ${tr.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>{tr.type === 'income' ? '+' : '-'}${maskValue(Math.abs(tr.amount))}</p>
                    </div>
                  ))}
                  {filteredTransactions.length === 0 && <p className="text-slate-500 text-sm italic p-4 text-center font-medium">{t.noTransactionsMatchSearch}</p>}
                </div>
              </div>
            ) : renderView()}
          </div>
        </div>
      </main>
      <TransactionModal isOpen={isTransactionModalOpen} onClose={() => { setIsTransactionModalOpen(false); setEditingExpense(null); }} editingTransaction={editingExpense} />
      <AccountModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} />
      <IncomeModal isOpen={isIncomeModalOpen} onClose={() => { setIsIncomeModalOpen(false); setEditingIncome(null); }} editingIncome={editingIncome} />
    </div>
  );
}
