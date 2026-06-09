'use client';

import React, { useState } from 'react';
import { useAppContext, IncomeLog } from '@/context/AppContext';
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
import { Loader2, TrendingUp } from 'lucide-react';
import { translations, Language } from '@/utils/translations';
import { useRouter } from 'next/navigation';

export default function MobileApp() {
  const { user, loading, settings, summary, maskValue } = useAppContext();
  const router = useRouter();
  const [activeItem, setActiveItem] = useState('Home');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  
  // Modal states
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [autoOpenModal, setAutoOpenModal] = useState<string | null>(null);
  const [editingIncome, setEditingIncome] = useState<IncomeLog | null>(null);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  const currentLang = (settings?.language as Language) || 'en';
  const t = translations[currentLang];

  // Routing and Experience Selection Logic
  React.useEffect(() => {
    if (!loading && user && settings) {
      if (!settings.preferred_experience) {
        router.push('/choose-experience');
      }
      // Note: We DO NOT redirect to desktop if they manually visited /mobile,
      // per the specific requirement to allow manual navigation.
    }
  }, [loading, user, settings, router]);

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

  const handleQuickAddSelect = (item: string, modal: string) => {    setIsQuickAddOpen(false);
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
          <div className="space-y-4 pb-24">
            
            {/* Main Hero Card: Available Balance */}
            <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />
              <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-blue-400/20 rounded-full blur-lg" />
              
              <div className="relative z-10 text-center">
                <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-1">{t.availableBalance}</p>
                <h2 className="text-4xl font-black tracking-tighter">
                  ${maskValue(summary.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                </h2>
                <p className="text-[9px] font-medium text-blue-200 mt-1 italic">{t.actualCashOutDesc}</p>
              </div>
            </div>

            {/* 2-Column Grid for Secondary KPIs */}
            <div className="grid grid-cols-2 gap-3">
              {/* Income */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[90px]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight">{t.incomeThisMonth}</p>
                <p className="text-lg font-black text-emerald-600 tracking-tighter break-words">
                  ${maskValue(summary.incomeThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                </p>
              </div>

              {/* Cash Out */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[90px]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight">{t.cashOutThisMonth}</p>
                <p className="text-lg font-black text-rose-600 tracking-tighter break-words">
                  ${maskValue(summary.cashOutThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                </p>
              </div>

              {/* Credit Cards Outstanding */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[90px]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight">{t.creditCardsOutstanding}</p>
                <p className="text-lg font-black text-amber-600 tracking-tighter break-words">
                  ${maskValue(summary.cardOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                </p>
              </div>

              {/* Investment This Month */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[90px]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight">{t.investmentThisMonth}</p>
                <p className="text-lg font-black text-indigo-600 tracking-tighter break-words">
                  ${maskValue(summary.investmentThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                </p>
              </div>
            </div>

            {/* Full Width Card for Investments Total */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.investmentsTotal}</p>
                <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                  ${maskValue(summary.investmentsTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                </p>
              </div>
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                <TrendingUp size={20} />
              </div>
            </div>
          </div>
        );
      case 'Accounts':
        return <div className="pb-24"><MobileAccountsView autoOpenModal={autoOpenModal === 'account'} onModalClose={() => setAutoOpenModal(null)} onEditAccount={(acc) => { setIsAccountModalOpen(true); }} /></div>;
      case 'Cards':
        return <div className="pb-24"><MobileCardsView onEditCard={(card) => { /* Desktop requires Cards modal handling, we'll just implement basic view for now or handle later */ }} /></div>;
      case 'Income':
        return <div className="pb-24"><MobileTransactionsView type="income" onEditIncome={(log) => { setEditingIncome(log); setIsIncomeModalOpen(true); }} onEditExpense={() => {}} /></div>;
      case 'Expenses':
        return <div className="pb-24"><MobileTransactionsView type="expense" onEditExpense={(log) => { setEditingExpense(log); setIsTransactionModalOpen(true); }} onEditIncome={() => {}} /></div>;
      case 'Investments':
        return <div className="pb-24"><MobileInvestmentsView autoOpenModal={autoOpenModal === 'investment'} onModalClose={() => setAutoOpenModal(null)} onEditInvestment={(inv) => { /* Handle edit */ }} /></div>;
      case 'Reports':
        return <div className="pb-24"><MobileReportsView autoOpenModal={autoOpenModal === 'report'} onModalClose={() => setAutoOpenModal(null)} /></div>;
      case 'Settings':
        return <div className="pb-24"><MobileSettingsView /></div>;
      case 'QuickAdd':
        return null; // Handled by the overlay
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-100 dark:bg-black flex justify-center selection:bg-blue-500/30">
      <div className="w-full max-w-[430px] bg-slate-50 dark:bg-[#020617] h-[100dvh] shadow-2xl relative flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 pt-4 pb-24">
          <div className="flex justify-between items-start mb-5">
            <div className="flex flex-col">
              <div className="w-[130px] h-8 flex items-center justify-start overflow-hidden relative">
                <img 
                  src="/logo-onelleve.jpg" 
                  alt="onelleve" 
                  className="w-full h-auto object-contain mix-blend-multiply dark:invert scale-[1.85] origin-left"
                />
              </div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mt-0.5">
                Personal Finance Dashboard
              </p>
            </div>
            <button 
              onClick={() => setActiveItem('Home')}
              className="px-4 py-1.5 mt-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors flex items-center gap-2 active:scale-95 shrink-0"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
               <span className="text-[10px] font-black tracking-widest uppercase">Home</span>
            </button>
          </div>
          {renderView()}
        </main>

        <MobileNav 
          activeItem={activeItem === 'QuickAdd' ? activeItem : activeItem} 
          setActiveItem={(item) => {
            if (item === 'QuickAdd') {
              setIsQuickAddOpen(true);
            } else {
              setActiveItem(item);
            }
          }} 
        />

        <MobileQuickAdd 
          isOpen={isQuickAddOpen} 
          onClose={() => setIsQuickAddOpen(false)} 
          onSelect={handleQuickAddSelect}
        />

        {/* Modals reused from desktop */}
        <TransactionModal 
          isOpen={isTransactionModalOpen} 
          onClose={() => { setIsTransactionModalOpen(false); setEditingExpense(null); }} 
          editingTransaction={editingExpense}
        />
        <AccountModal 
          isOpen={isAccountModalOpen} 
          onClose={() => { setIsAccountModalOpen(false); setAutoOpenModal(null); }} 
        />
        <IncomeModal
          isOpen={isIncomeModalOpen}
          onClose={() => { setIsIncomeModalOpen(false); setEditingIncome(null); }}
          editingIncome={editingIncome}
        />
      </div>
    </div>
  );
}
