'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Wallet, DollarSign, CreditCard, Banknote, Building2, Target } from 'lucide-react';
import { translations, Language } from '@/utils/translations';

const SummaryCards = () => {
  const { summary, settings, maskValue } = useAppContext();
  const currentLang = (settings?.language as Language) || 'en';
  const t = translations[currentLang];
  
  const cards = [
    {
      title: t.availableBalance,
      amount: summary.availableBalance,
      icon: Wallet,
      color: 'blue',
      subtitle: t.actualCashOutDesc
    },
    {
      title: t.incomeThisMonth,
      amount: summary.incomeThisMonth,
      icon: DollarSign,
      color: 'emerald',
      subtitle: t.incomeDesc
    },
    {
      title: t.cashOutThisMonth,
      amount: summary.cashOutThisMonth,
      icon: Target,
      color: 'rose',
      subtitle: t.actualCashOutDesc
    },
    {
      title: t.creditCardsOutstanding,
      amount: summary.cardOutstanding,
      icon: CreditCard,
      color: 'amber',
      subtitle: currentLang === 'pt' ? 'Saldo devedor total' : currentLang === 'es' ? 'Saldo pendiente total' : 'Remaining unpaid balance'
    },
    {
      title: t.investmentThisMonth,
      amount: summary.investmentThisMonth,
      icon: Banknote,
      color: 'blue',
      subtitle: t.contribThisMonth
    },
    {
      title: t.investmentsTotal,
      amount: summary.investmentsTotal,
      icon: Building2,
      color: 'indigo',
      subtitle: currentLang === 'pt' ? 'Investimentos acumulados' : currentLang === 'es' ? 'Inversiones acumuladas' : 'Accumulated investments'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl group text-slate-900 dark:text-white">
          <div className="flex justify-between items-start mb-4 md:mb-6">
            <div className={`p-3 md:p-4 rounded-2xl transition-all group-hover:scale-110 ${
              card.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
              card.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' :
              card.color === 'rose' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' :
              card.color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' :
              'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
            }`}>
              <card.icon className="w-5 h-5 md:w-7 md:h-7" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{card.title}</p>
            <h3 className="text-2xl md:text-3xl font-black tracking-tighter">
              ${maskValue(card.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
            </h3>
            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 mt-1 md:mt-2 italic tracking-tight">{card.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
