'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Smartphone, ShoppingCart, Coffee, Play, Home, DollarSign, Briefcase } from 'lucide-react';

const componentMap: { [key: string]: React.ElementType } = {
  Smartphone,
  ShoppingCart,
  Coffee,
  Play,
  Home,
  DollarSign,
  Briefcase,
};

const RecentTransactions = () => {
  const { transactions } = useAppContext();
  const recentTransactions = transactions.filter(t => t.type === 'expense').slice(0, 5);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Recent Activity</h3>
        <button 
          onClick={() => alert('Viewing all transactions...')}
          className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline active:scale-95 transition-transform"
        >
          View All
        </button>
      </div>

      <div className="space-y-3 flex-grow overflow-y-auto">
        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => {
            const IconComponent = componentMap[transaction.icon] || DollarSign;
            return (
              <div key={transaction.id} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    <IconComponent size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{transaction.name}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{transaction.category} • {transaction.date}</p>
                  </div>
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  -${Math.abs(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 mb-3">
              <DollarSign size={24} />
            </div>
            <p className="text-sm font-medium text-slate-500">No recent transactions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;
