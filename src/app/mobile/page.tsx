'use client';

import React, { useState } from 'react';
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
import MoreView from '@/components/mobile/views/MoreView';
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
  
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [autoOpenModal, setAutoOpenModal] = useState<string | null>(null);
  const [editingIncome, setEditingIncome] = useState<IncomeLog | null>(null);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const secondaryViews = ['Accounts', 'Cards', 'Investments', 'Reports', 'Settings'];
  const isSecondaryView = secondaryViews.includes(activeItem);

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
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
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
          <div className="space-y-3 pb-24">
            <div className="grid grid-cols-2 gap-3">
              {/* Available Balance */}
              <div className="col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.availableBalance}</p>
                <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">
                  ${maskValue(summary.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                </h2>
              </div>

              {/* Income */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[90px]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight">{t.incomeThisMonth}</p>
                <p className="text-xl font-black text-emerald-600 tracking-tight break-words">
                  ${maskValue(summary.incomeThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                </p>
              </div>

              {/* Cash Out */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[90px]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight">{t.cashOutThisMonth}</p>
                <p className="text-xl font-black text-rose-600 tracking-tight break-words">
                  ${maskValue(summary.cashOutThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                </p>
              </div>

              {/* Credit Cards Outstanding */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[90px]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight">{t.creditCardsOutstanding}</p>
                <p className="text-xl font-black text-amber-600 tracking-tight break-words">
                  ${maskValue(summary.cardOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                </p>
              </div>

              {/* Investment This Month */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[90px]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight">{t.investmentThisMonth}</p>
                <p className="text-xl font-black text-indigo-600 tracking-tight break-words">
                  ${maskValue(summary.investmentThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                </p>
              </div>

              {/* Investments Total */}
              <div className="col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.investmentsTotal}</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">
                    ${maskValue(summary.investmentsTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>
          </div>
        );
      case 'Income':
        return <MobileTransactionsView type="income" onEditIncome={(log) => { setEditingIncome(log); setIsIncomeModalOpen(true); }} onEditExpense={() => {}} onAdd={() => { setEditingIncome(null); setIsIncomeModalOpen(true); }} autoOpenModal={autoOpenModal === 'income'} onModalClose={() => setAutoOpenModal(null)} />;
      case 'Expenses':
        return <MobileTransactionsView type="expense" onEditExpense={(log) => { setEditingExpense(log); setIsTransactionModalOpen(true); }} onEditIncome={() => {}} onAdd={() => { setEditingExpense(null); setIsTransactionModalOpen(true); }} autoOpenModal={autoOpenModal === 'expense'} onModalClose={() => setAutoOpenModal(null)} />;
      case 'More':
        return <MoreView onNavigate={setActiveItem} />;
      case 'Accounts':
        return <MobileAccountsView autoOpenModal={autoOpenModal === 'account'} onModalClose={() => setAutoOpenModal(null)} onEditAccount={(acc) => { setEditingAccount(acc); setIsAccountModalOpen(true); }} onAddAccount={() => { setEditingAccount(null); setIsAccountModalOpen(true); }} />;
      case 'Cards':
        return <MobileCardsView autoOpenModal={autoOpenModal === 'card'} onModalClose={() => setAutoOpenModal(null)} />;
      case 'Investments':
        return <MobileInvestmentsView autoOpenModal={autoOpenModal === 'investment'} onModalClose={() => setAutoOpenModal(null)} />;
      case 'Reports':
        return <MobileReportsView autoOpenModal={autoOpenModal === 'report'} onModalClose={() => setAutoOpenModal(null)} />;
      case 'Settings':
        return <MobileSettingsView />;
      case 'QuickAdd':
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-100 dark:bg-black flex justify-center selection:bg-blue-500/30">
      <div className="w-full max-w-[430px] bg-slate-50 dark:bg-[#020617] h-[100dvh] shadow-2xl relative flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="bg-white dark:bg-slate-900 pt-8 pb-6 px-4 relative">
            <div className="flex flex-col items-center text-center">
              <img
                src="/logo-onelleve-clean.png"
                alt="Onelleve"
                className="w-[210px] h-auto object-contain"
              />
              <p className="mt-2 text-center text-[12px] tracking-[0.22em] uppercase text-slate-500 font-semibold">
                Personal Finance Dashboard
              </p>
            </div>
          </div>
          <div className="p-4">
            {renderView()}
          </div>
        </main>

        <MobileNav 
          activeItem={activeItem} 
          isSecondaryView={isSecondaryView}
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

        <TransactionModal 
          isOpen={isTransactionModalOpen} 
          onClose={() => { setIsTransactionModalOpen(false); setEditingExpense(null); }} 
          editingTransaction={editingExpense}
        />
        <AccountModal 
          isOpen={isAccountModalOpen} 
          onClose={() => { setIsAccountModalOpen(false); setEditingAccount(null); setAutoOpenModal(null); }} 
          editingAccount={editingAccount}
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
