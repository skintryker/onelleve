'use client';

import React, { useState } from 'react';
import { useAppContext, IncomeLog } from '@/context/AppContext';
import Auth from '@/components/Auth';
import MobileNav from '@/components/mobile/MobileNav';
import MobileQuickAdd from '@/components/mobile/MobileQuickAdd';
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
import { Loader2, ExternalLink, TrendingUp } from 'lucide-react';
import { translations, Language } from '@/utils/translations';
import Link from 'next/link';
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
          <div className="space-y-6 pb-24">
            <div className="flex justify-between items-center mb-2 pt-2">
              <div className="h-8">
                <img 
                  src="/logo-onelleve.jpg" 
                  alt="onelleve" 
                  className="h-full w-auto object-contain mix-blend-multiply dark:invert"
                />
              </div>
              <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full border border-blue-100 dark:border-blue-800">
                 <span className="text-[10px] font-black tracking-widest uppercase">Mobile</span>
              </div>
            </div>
            
            {/* Main Hero Card: Available Balance */}
            <div className="bg-blue-600 p-8 rounded-[40px] text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-blue-400/20 rounded-full blur-xl" />
              
              <div className="relative z-10">
                <p className="text-xs font-bold text-blue-100 uppercase tracking-widest mb-1">{t.availableBalance}</p>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
                  ${maskValue(summary.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                </h2>
                <p className="text-[10px] font-medium text-blue-200 mt-2 italic">{t.actualCashOutDesc}</p>
              </div>
            </div>

            {/* 2-Column Grid for Secondary KPIs */}
            <div className="grid grid-cols-2 gap-3">
              {/* Income */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-tight">{t.incomeThisMonth}</p>
                <p className="text-xl font-black text-emerald-600 tracking-tighter break-words">
                  ${maskValue(summary.incomeThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                </p>
              </div>

              {/* Cash Out */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-tight">{t.cashOutThisMonth}</p>
                <p className="text-xl font-black text-rose-600 tracking-tighter break-words">
                  ${maskValue(summary.cashOutThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                </p>
              </div>

              {/* Credit Cards Outstanding */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-tight">{t.creditCardsOutstanding}</p>
                <p className="text-xl font-black text-amber-600 tracking-tighter break-words">
                  ${maskValue(summary.cardOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                </p>
              </div>

              {/* Investment This Month */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-tight">{t.investmentThisMonth}</p>
                <p className="text-xl font-black text-indigo-600 tracking-tighter break-words">
                  ${maskValue(summary.investmentThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                </p>
              </div>
            </div>

            {/* Full Width Card for Investments Total */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.investmentsTotal}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                  ${maskValue(summary.investmentsTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                </p>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>
        );
      case 'Accounts':
        return <div className="pb-24"><AccountsView autoOpenModal={autoOpenModal === 'account'} onModalClose={() => setAutoOpenModal(null)} /></div>;
      case 'Cards':
        return <div className="pb-24"><CardsView autoOpenModal={autoOpenModal === 'card'} onModalClose={() => setAutoOpenModal(null)} /></div>;
      case 'Income':
        return <div className="pb-24"><TransactionsView initialType="income" onEditIncome={(log) => { setEditingIncome(log); setIsIncomeModalOpen(true); }} onAddIncome={() => { setEditingIncome(null); setIsIncomeModalOpen(true); }} /></div>;
      case 'Expenses':
        return <div className="pb-24"><TransactionsView initialType="expense" onEditExpense={(log) => { setEditingExpense(log); setIsTransactionModalOpen(true); }} onAddExpense={() => { setEditingExpense(null); setIsTransactionModalOpen(true); }} /></div>;
      case 'Investments':
        return <div className="pb-24"><InvestmentsView autoOpenModal={autoOpenModal === 'investment'} onModalClose={() => setAutoOpenModal(null)} /></div>;
      case 'Reports':
        return <div className="pb-24"><ReportsView autoOpenModal={autoOpenModal === 'report'} onModalClose={() => setAutoOpenModal(null)} /></div>;
      case 'Settings':
        return (
          <div className="space-y-6 pb-24">
            <SettingsView />
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800">
               <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Development</h3>
               <Link 
                 href="/"
                 className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 font-bold text-sm text-blue-600"
               >
                 <span>Preview Desktop Version</span>
                 <ExternalLink size={16} />
               </Link>
            </div>
          </div>
        );
      case 'QuickAdd':
        return null; // Handled by the overlay
      default:
        return <SummaryCards />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white font-sans selection:bg-blue-500/30">
      <main className="w-full max-w-md mx-auto p-4 pt-8 min-h-screen flex flex-col">
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
  );
}
