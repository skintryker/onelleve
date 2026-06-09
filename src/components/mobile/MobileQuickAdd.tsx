'use client';

import React from 'react';
import { 
  Wallet, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  FileText,
  X
} from 'lucide-react';
import { Language, translations } from '@/utils/translations';
import { useAppContext } from '@/context/AppContext';

interface MobileQuickAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: string, modal: string) => void;
}

const MobileQuickAdd = ({ isOpen, onClose, onSelect }: MobileQuickAddProps) => {
  const { settings } = useAppContext();
  const currentLang = (settings?.language as Language) || 'en';
  const t = translations[currentLang];

  if (!isOpen) return null;

  const items = [
    { id: 'Accounts', modal: 'account', icon: Wallet, label: t.accounts, color: 'blue' },
    { id: 'Credit Cards', modal: 'card', icon: CreditCard, label: t.creditCards, color: 'indigo' },
    { id: 'Income', modal: 'income', icon: ArrowUpRight, label: t.income, color: 'emerald' },
    { id: 'Expenses', modal: 'expense', icon: ArrowDownLeft, label: t.expenses, color: 'rose' },
    { id: 'Investments', modal: 'investment', icon: TrendingUp, label: t.investments, color: 'amber' },
    { id: 'Reports', modal: 'report', icon: FileText, label: t.generateReport, color: 'purple' },
  ];

  return (
    <div className="absolute inset-0 z-[110] animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-[40px] p-6 pb-12 animate-in slide-in-from-bottom duration-500">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Quick Add</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id, item.modal)}
              className="flex flex-col items-center gap-3 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 active:scale-95 transition-all"
            >
              <div className={`p-4 rounded-2xl ${
                item.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
                item.color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' :
                item.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' :
                item.color === 'rose' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' :
                item.color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' :
                'bg-purple-50 dark:bg-purple-900/20 text-purple-600'
              }`}>
                <item.icon size={24} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileQuickAdd;
