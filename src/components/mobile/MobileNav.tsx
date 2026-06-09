'use client';

import React from 'react';
import { 
  Home, 
  Wallet, 
  CreditCard, 
  Plus, 
  PieChart, 
  Settings 
} from 'lucide-react';

interface MobileNavProps {
  activeItem: string;
  setActiveItem: (item: string) => void;
}

const MobileNav = ({ activeItem, setActiveItem }: MobileNavProps) => {
  const navItems = [
    { id: 'Home', icon: Home, label: 'Home' },
    { id: 'Accounts', icon: Wallet, label: 'Accounts' },
    { id: 'Cards', icon: CreditCard, label: 'Cards' },
    { id: 'QuickAdd', icon: Plus, label: 'Add', isCenter: true },
    { id: 'Reports', icon: PieChart, label: 'Reports' },
    { id: 'Settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe pt-2 px-2 flex justify-around items-center z-[100] h-20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveItem(item.id)}
          className={`flex flex-col items-center justify-center flex-1 transition-all ${
            item.isCenter 
              ? 'bg-blue-600 text-white rounded-2xl w-12 h-12 shadow-lg shadow-blue-500/30 -mt-8' 
              : activeItem === item.id 
                ? 'text-blue-600' 
                : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <item.icon size={item.isCenter ? 24 : 22} strokeWidth={item.isCenter ? 3 : 2.5} />
          {!item.isCenter && (
            <span className="text-[10px] font-bold mt-1 uppercase tracking-tight">{item.label}</span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default MobileNav;
