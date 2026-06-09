'use client';

import React, { useState } from 'react';
import { useAppContext, IncomeLog } from '@/context/AppContext';
import Auth from '@/components/Auth';
import ExperienceSelector from '@/components/ExperienceSelector';
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
      if (settings.preferred_experience === 'desktop') {
        router.push('/');
      }
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

  // Show experience selector if no preference is set
  if (settings && !settings.preferred_experience) {
    return <ExperienceSelector />;
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
          <div className="space-y-6 pb-24">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Onelleve</h1>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                 <span className="text-xs font-black">MOBILE</span>
              </div>
            </div>
            <SummaryCards />
            
            {/* Shortcuts / Quick Access */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setActiveItem('Income')}
                className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-900/20 text-left"
              >
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{t.income}</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">${maskValue(summary.incomeThisMonth)}</p>
              </button>
              <button 
                onClick={() => setActiveItem('Expenses')}
                className="p-6 bg-rose-50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/20 text-left"
              >
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">{t.expenses}</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">${maskValue(summary.cashOutThisMonth)}</p>
              </button>
            </div>

            <div className="pt-4">
               <button 
                 onClick={() => setActiveItem('Investments')}
                 className="w-full p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-900/20 text-left flex justify-between items-center"
               >
                 <div>
                   <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{t.investments}</p>
                   <p className="text-lg font-black text-slate-900 dark:text-white">${maskValue(summary.investmentsTotal)}</p>
                 </div>
                 <TrendingUp className="text-indigo-600" size={24} />
               </button>
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
