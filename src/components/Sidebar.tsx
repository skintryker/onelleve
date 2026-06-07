'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  PieChart, 
  Settings, 
  LogOut,
  CreditCard,
  X,
  Building2
} from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import { useAppContext } from '@/context/AppContext';
import { translations, Language } from '@/utils/translations';

interface SidebarProps {
  activeItem: string;
  setActiveItem: (item: string) => void;
  onClose?: () => void;
}

const Sidebar = ({ activeItem, setActiveItem, onClose }: SidebarProps) => {
  const { settings } = useAppContext();
  const currentLang = (settings?.language as Language) || 'en';
  const t = translations[currentLang];

  const menuItems = [
    { icon: LayoutDashboard, label: t.dashboard, original: 'Dashboard' },
    { icon: Wallet, label: t.accounts, original: 'Accounts' },
    { icon: CreditCard, label: t.creditCards, original: 'Credit Cards' },
    { icon: Building2, label: t.investments, original: 'Investments' },
    { icon: ArrowUpRight, label: t.income, original: 'Income' },
    { icon: ArrowDownLeft, label: t.expenses, original: 'Expenses' },
    { icon: PieChart, label: t.reports, original: 'Reports' },
  ];

  const handleItemClick = (label: string) => {
    setActiveItem(label);
    if (onClose) onClose();
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      if (supabase) await supabase.auth.signOut();
    }
  };

  return (
    <div className="w-64 md:w-64 bg-white dark:bg-slate-900 h-full md:h-screen border-r border-slate-200 dark:border-slate-800 flex flex-col transition-colors shadow-2xl md:shadow-none relative z-[60]">
      {/* LOGO AREA: OFFICIAL WORDMARK ASSET - INCREASED BY ~50% */}
      <div className="w-full h-32 flex items-center justify-center overflow-hidden pt-4 shrink-0">
        <div className="relative w-full h-full flex items-center justify-center px-4">
          <img 
            src="/logo-onelleve.jpg" 
            alt="onelleve" 
            className="w-full h-auto max-h-full object-contain mix-blend-multiply dark:invert scale-[1.85]"
          />
          <button className="md:hidden absolute -right-2 top-2 p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" onClick={onClose}>
            <X size={22} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-0">
        <nav className="space-y-1.5 mt-4">
          {menuItems.map((item, index) => (
            <button 
              key={index}
              onClick={() => handleItemClick(item.original)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeItem === item.original 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]' 
                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 hover:translate-x-1'
              }`}
            >
              <item.icon size={18} strokeWidth={2.5} className={`${activeItem === item.original ? 'text-white' : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-1.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative z-10 pb-10">
        <button 
          onClick={() => handleItemClick('Settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
            activeItem === 'Settings' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Settings size={18} strokeWidth={2.5} className={`${activeItem === 'Settings' ? 'text-white' : 'group-hover:text-blue-600'}`} />
          <span className="font-bold text-sm tracking-tight">{t.settings}</span>
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all font-bold text-sm tracking-tight active:scale-95"
        >
          <LogOut size={18} strokeWidth={2.5} />
          <span>{t.logout}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
