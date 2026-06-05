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
    <div className="w-64 bg-white dark:bg-slate-900 h-screen border-r border-slate-200 dark:border-slate-800 flex flex-col transition-colors shadow-xl md:shadow-none">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
              <Wallet size={24} />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Spendly</span>
          </div>
          <button className="md:hidden p-2 text-slate-500" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item, index) => (
            <button 
              key={index}
              onClick={() => handleItemClick(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeItem === item.label 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 hover:translate-x-1'
              }`}
            >
              <item.icon size={20} className={`${activeItem === item.label ? 'text-white' : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-1 border-t border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => handleItemClick('Settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
            activeItem === 'Settings' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Settings size={20} className={`${activeItem === 'Settings' ? 'text-white' : 'group-hover:text-blue-600'}`} />
          <span className="font-semibold">Settings</span>
        </button>
        <button 
          onClick={() => alert('Logging out...')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-semibold active:scale-95"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
