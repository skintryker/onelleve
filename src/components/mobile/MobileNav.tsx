'use client';

import React from 'react';
import { Home, ArrowUpRight, ArrowDownLeft, Plus, LayoutGrid } from 'lucide-react';

interface MobileNavProps {
  activeItem: string;
  setActiveItem: (item: string) => void;
  isSecondaryView: boolean;
}

const MobileNav = ({ activeItem, setActiveItem, isSecondaryView }: MobileNavProps) => {
  const navItems = [
    { id: 'Home', icon: Home, label: 'Home' },
    { id: 'Income', icon: ArrowUpRight, label: 'Income' },
    { id: 'QuickAdd', icon: Plus, label: 'Add', isCenter: true },
    { id: 'Expenses', icon: ArrowDownLeft, label: 'Expenses' },
    { id: 'More', icon: LayoutGrid, label: 'More' },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-safe pt-4 px-4 flex justify-around items-center z-[50] h-24 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = (item.id === 'More' && isSecondaryView) || activeItem === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveItem(item.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
              item.isCenter 
                ? '' 
                : isActive
                  ? 'text-blue-600' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {item.isCenter ? (
              <div className='bg-blue-600 text-white rounded-2xl w-14 h-14 flex items-center justify-center shadow-lg shadow-blue-500/30'>
                <item.icon size={28} strokeWidth={3} />
              </div>
            ) : (
              <>
                <item.icon size={24} strokeWidth={isActive ? 3 : 2.5} />
                <span className="text-[11px] font-bold mt-2 uppercase tracking-tight">{item.label}</span>
              </>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNav;
