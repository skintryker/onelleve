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

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard' },
  { icon: Wallet, label: 'Accounts' },
  { icon: CreditCard, label: 'Cards' },
  { icon: Building2, label: 'Investments' },
  { icon: ArrowUpRight, label: 'Income' },
  { icon: ArrowDownLeft, label: 'Expenses' },
  { icon: PieChart, label: 'Reports' },
];

interface SidebarProps {
  activeItem: string;
  setActiveItem: (item: string) => void;
  onClose?: () => void;
}

const Sidebar = ({ activeItem, setActiveItem, onClose }: SidebarProps) => {
  const handleItemClick = (label: string) => {
    setActiveItem(label);
    if (onClose) onClose();
  };

  return (
    <div className="w-64 bg-white dark:bg-slate-900 h-screen border-r border-slate-200 dark:border-slate-800 flex flex-col transition-colors shadow-xl md:shadow-none relative z-[60]">
      {/* LOGO AREA: REFINED SCALE */}
      <div className="w-full h-24 flex items-center justify-center overflow-hidden pt-2">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* 
            REFINED SCALE: 
            Reduced from 136% to 115% for a slightly more compact brand presence.
          */}
          <img 
            src="/logo-onelleve.jpg" 
            alt="onelleve" 
            className="w-[115%] max-w-none h-auto object-contain mix-blend-multiply dark:mix-blend-normal"
          />
          <button className="md:hidden absolute right-4 top-4 z-50 p-2 text-slate-500 bg-white/80 rounded-full" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="p-6 pt-0">
        <nav className="space-y-1.5 mt-4">
          {menuItems.map((item, index) => (
            <button 
              key={index}
              onClick={() => handleItemClick(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeItem === item.label 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]' 
                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 hover:translate-x-1'
              }`}
            >
              <item.icon size={18} strokeWidth={2.5} className={`${activeItem === item.label ? 'text-white' : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
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
          <span className="font-bold text-sm tracking-tight">Settings</span>
        </button>
        <button 
          onClick={() => alert('Logging out...')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all font-bold text-sm tracking-tight active:scale-95"
        >
          <LogOut size={18} strokeWidth={2.5} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
