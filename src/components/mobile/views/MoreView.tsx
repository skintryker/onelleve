'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Building2, CreditCard, TrendingUp, PieChart, Settings, ChevronRight } from 'lucide-react';
import { translations, Language } from '@/utils/translations';

interface MoreViewProps {
  onNavigate: (view: string) => void;
}

export default function MoreView({ onNavigate }: MoreViewProps) {
  const { settings } = useAppContext();
  const t = translations[(settings?.language as Language) || 'en'];

  const menuItems = [
    { id: 'Accounts', label: t.accounts, icon: Building2, color: 'text-blue-500' },
    { id: 'Cards', label: t.creditCards, icon: CreditCard, color: 'text-indigo-500' },
    { id: 'Investments', label: t.investments, icon: TrendingUp, color: 'text-amber-500' },
    { id: 'Reports', label: t.reports, icon: PieChart, color: 'text-purple-500' },
    { id: 'Settings', label: t.settings, icon: Settings, color: 'text-slate-500' },
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="px-1 mb-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">More</h2>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:scale-110 transition-transform ${item.color}`}>
                <item.icon size={18} strokeWidth={2.5} />
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{item.label}</p>
            </div>
            <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
          </button>
        ))}
      </div>
    </div>
  );
}
