'use client';

import React, { useState, useMemo } from 'react';
import { useAppContext, IncomeLog, Account } from '@/context/AppContext';
import Auth from '@/components/Auth';
import MobileNav from '@/components/mobile/MobileNav';
import MobileQuickAdd from '@/components/mobile/MobileQuickAdd';
import MobileAccountsView from '@/components/mobile/views/MobileAccountsView';
import MobileCardsView from '@/components/mobile/views/MobileCardsView';
import MobileInvestmentsView from '@/components/mobile/views/MobileInvestmentsView';
import MobileTransactionsView from '@/components/mobile/views/MobileTransactionsView';
import MobileReportsView from '@/components/mobile/views/MobileReportsView';
import MobileSettingsView from '@/components/mobile/views/MobileSettingsView';
import TransactionModal from '@/components/modals/TransactionModal';
import AccountModal from '@/components/modals/AccountModal';
import IncomeModal from '@/components/modals/IncomeModal';
import { Loader2, TrendingUp, PieChart, Eye, EyeOff } from 'lucide-react';
import { translations, Language } from '@/utils/translations';
import { useRouter } from 'next/navigation';

export default function MobileApp() {
  const { user, loading, settings, summary, maskValue, isPrivacyMode, togglePrivacyMode } = useAppContext();
  const router = useRouter();
  const [activeItem, setActiveItem] = useState('Home');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [autoOpenModal, setAutoOpenModal] = useState<string | null>(null);
  const [editingIncome, setEditingIncome] = useState<IncomeLog | null>(null);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const isAnyModalOpen = isTransactionModalOpen || isAccountModalOpen || isIncomeModalOpen || isQuickAddOpen;

  const currentLang = (settings?.language as Language) || 'en';
  const t = translations[currentLang];

  React.useEffect(() => {
    if (!loading && user && settings) {
      if (!settings.preferred_experience) {
        router.push('/choose-experience');
      }
    }
  }, [loading, user, settings, router]);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  }
  if (!user) {
    return <Auth />;
  }

  const handleQuickAddSelect = (item: string, modal: string) => {
    setIsQuickAddOpen(false);
    if (modal === 'income') {
      setEditingIncome(null);
      setIsIncomeModalOpen(true);
    } else if (modal === 'expense') {
      setEditingExpense(null);
      setIsTransactionModalOpen(true);
    } else {
      setActiveItem(item);
      setAutoOpenModal(modal);
    }
  };

  const renderView = () => {
    switch (activeItem) {
      case 'Home':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setActiveItem('Accounts')} className="col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center active:scale-[0.98] transition-transform">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.availableBalance}</p>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">${maskValue(summary.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}</h2>
              </button>
              <button onClick={() => setActiveItem('Income')} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[80px] active:scale-[0.98] transition-transform">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">{t.incomeThisMonth}</p>
                <p className="text-lg font-black text-emerald-600 tracking-tight break-words self-start">${maskValue(summary.incomeThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}</p>
              </button>
              <button onClick={() => setActiveItem('Expenses')} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[80px] active:scale-[0.98] transition-transform">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">{t.cashOutThisMonth}</p>
                <p className="text-lg font-black text-rose-600 tracking-tight break-words self-start">${maskValue(summary.cashOutThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}</p>
              </button>
              <button onClick={() => setActiveItem('Cards')} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[80px] active:scale-[0.98] transition-transform">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">{t.creditCardsOutstanding}</p>
                <p className="text-lg font-black text-amber-600 tracking-tight break-words self-start">${maskValue(summary.cardOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}</p>
              </button>
              <button onClick={() => setActiveItem('Investments')} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[80px] active:scale-[0.98] transition-transform">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">{t.investmentThisMonth}</p>
                <p className="text-lg font-black text-indigo-600 tracking-tight break-words self-start">${maskValue(summary.investmentThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}</p>
              </button>
              <button onClick={() => setActiveItem('Investments')} className="col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.investmentsTotal}</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">${maskValue(summary.investmentsTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}</p>
                </div>
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg"><TrendingUp size={20} /></div>
              </button>
              <button onClick={() => setActiveItem('Reports')} className="col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform">
                <div className="text-left">
                  <p className="text-[14px] font-semibold text-slate-700 dark:text-white uppercase tracking-wider">{t.reports}</p>
                  <p className="text-[11px] font-normal text-slate-400">View financial summaries</p>
                </div>
                <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg"><PieChart size={18} /></div>
              </button>
            </div>
          </div>
        );
      case 'Income': return <MobileTransactionsView type="income" onEditIncome={(log: IncomeLog) => { setEditingIncome(log); setIsIncomeModalOpen(true); }} onAdd={() => { setEditingIncome(null); setIsIncomeModalOpen(true); }} autoOpenModal={autoOpenModal === 'income'} onModalClose={() => setAutoOpenModal(null)} onEditExpense={() => {}} />;
      case 'Expenses': return <MobileTransactionsView type="expense" onEditExpense={(log: any) => { setEditingExpense(log); setIsTransactionModalOpen(true); }} onAdd={() => { setEditingExpense(null); setIsTransactionModalOpen(true); }} autoOpenModal={autoOpenModal === 'expense'} onModalClose={() => setAutoOpenModal(null)} onEditIncome={() => {}} />;
      case 'Accounts': return <MobileAccountsView autoOpenModal={autoOpenModal === 'account'} onModalClose={() => setAutoOpenModal(null)} onEditAccount={(acc) => { setEditingAccount(acc); setIsAccountModalOpen(true); }} onAddAccount={() => { setEditingAccount(null); setIsAccountModalOpen(true); }} />;
      case 'Cards': return <MobileCardsView autoOpenModal={autoOpenModal === 'card'} onModalClose={() => setAutoOpenModal(null)} />;
      case 'Investments': return <MobileInvestmentsView autoOpenModal={autoOpenModal === 'investment'} onModalClose={() => setAutoOpenModal(null)} />;
      case 'Reports': return <MobileReportsView autoOpenModal={autoOpenModal === 'report'} onModalClose={() => setAutoOpenModal(null)} />;
      case 'Settings': return <MobileSettingsView />;
      default: return null;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-100 dark:bg-black flex justify-center">
      <div className="w-full max-w-[430px] bg-slate-50 dark:bg-[#020617] h-[100dvh] shadow-2xl relative flex flex-col overflow-hidden">
        <header className="flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl pt-safe-top z-10 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between p-3">
            <div className="w-8"></div>
            <img src="/logo-onelleve-clean.png" alt="Onelleve" className="w-auto h-8 object-contain" />
            <button onClick={togglePrivacyMode} className="p-2 text-slate-400 hover:text-slate-700" title={isPrivacyMode ? "Show Values" : "Hide Values"}>
              {isPrivacyMode ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3">
          {renderView()}
        </main>
        
        <TransactionModal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} editingTransaction={editingExpense} />
        <AccountModal isOpen={isAccountModalOpen} onClose={() => { setIsAccountModalOpen(false); setEditingAccount(null); }} editingAccount={editingAccount} />
        <IncomeModal isOpen={isIncomeModalOpen} onClose={() => setIsIncomeModalOpen(false)} editingIncome={editingIncome} />
        <MobileQuickAdd isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} onSelect={handleQuickAddSelect} />

        {!isAnyModalOpen && (
          <MobileNav 
            activeItem={activeItem}
            setActiveItem={(item) => {
              if (item === 'QuickAdd') {
                setIsQuickAddOpen(true);
              } else {
                setActiveItem(item);
              }
            }} 
          />
        )}
      </div>
    </div>
  );
}
