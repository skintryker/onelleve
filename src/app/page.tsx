'use client';

import { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import SummaryCards from '@/components/SummaryCards';
import Charts from '@/components/Charts';
import RecentTransactions from '@/components/RecentTransactions';
import AccountsView from '@/components/views/AccountsView';
import CardsView from '@/components/views/CardsView';
import InvestmentsView from '@/components/views/InvestmentsView';
import TransactionsView from '@/components/views/TransactionsView';
import ReportsView from '@/components/views/ReportsView';
import SettingsView from '@/components/views/SettingsView';
import TransactionModal from '@/components/modals/TransactionModal';
import AccountModal from '@/components/modals/AccountModal';
import { Search, Bell, Menu, Plus, LayoutDashboard, Clock, AlertCircle, X } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export default function Dashboard() {
  const { transactions } = useAppContext();
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // 1. Functional Search Logic
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.category.toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  // 2. Notification Logic (Due Expenses)
  const notifications = useMemo(() => {
    interface Alert {
      id: string;
      title: string;
      message: string;
      type: 'overdue' | 'due-soon';
    }
    const alerts: Alert[] = [];
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const pendingExpenses = transactions.filter(t => 
      t.type === 'expense' && (t.status === 'Pending' || t.status === 'Planned')
    );

    pendingExpenses.forEach(exp => {
      const expDate = new Date(exp.date);
      if (expDate <= threeDaysFromNow) {
        alerts.push({
          id: exp.id,
          title: 'Upcoming Payment',
          message: `${exp.name} ($${Math.abs(exp.amount)}) is due on ${exp.date}`,
          type: expDate < today ? 'overdue' : 'due-soon'
        });
      }
    });

    return alerts;
  }, [transactions]);

  // 3. Update Timestamp
  useEffect(() => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setLastUpdate(now);
  }, [transactions]);

  const renderView = () => {
    switch (activeItem) {
      case 'Dashboard':
        return (
          <>
            <SummaryCards />
            {searchQuery && (
               <div className="mt-8 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Search Results for &quot;{searchQuery}&quot;</h3>
                  <div className="space-y-4">
                    {filteredTransactions.slice(0, 10).map(t => (
                      <div key={t.id} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-900 dark:text-white">
                        <div className="flex gap-4 items-center">
                           <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                             <Clock size={18} />
                           </div>
                           <div>
                             <p className="font-bold">{t.name}</p>
                             <p className="text-xs text-slate-500">{t.category} • {t.date}</p>
                           </div>
                        </div>
                        <p className={`font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                          {t.type === 'income' ? '+' : '-'}${Math.abs(t.amount).toLocaleString()}
                        </p>
                      </div>
                    ))}
                    {filteredTransactions.length === 0 && <p className="text-center py-10 text-slate-400 font-medium italic text-slate-900 dark:text-white">No matches found.</p>}
                  </div>
               </div>
            )}
          </>
        );
      case 'Accounts': return <AccountsView />;
      case 'Cards': return <CardsView />;
      case 'Investments': return <InvestmentsView />;
      case 'Income': return <TransactionsView initialType="income" />;
      case 'Expenses': return <TransactionsView initialType="expense" />;
      case 'Reports': return <ReportsView />;
      case 'Settings': return <SettingsView />;
      default: return <div className="p-12 text-center text-slate-500">View not found</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors selection:bg-blue-100 dark:selection:bg-blue-900/30 text-slate-900 dark:text-white">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-4 w-full md:w-auto text-slate-900 dark:text-white">
            <button className="md:hidden p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={22} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-0.5 text-slate-900 dark:text-white">
                <LayoutDashboard size={18} className="text-blue-600 hidden sm:block" />
                <h1 className="text-2xl font-black tracking-tight">{activeItem}</h1>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Clock size={12} className="text-blue-500" />
                <span>Last updated at {lastUpdate}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative group flex-grow md:flex-grow-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm text-slate-900 dark:text-white shadow-sm font-medium"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setIsTransactionModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg text-sm text-nowrap">
                <Plus size={18} />
                <span className="hidden lg:inline">Add Transaction</span>
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2.5 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all shadow-sm active:scale-95 relative ${showNotifications ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-blue-600'}`}
                >
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-4 w-80 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl z-[100] animate-in zoom-in-95 duration-200 overflow-hidden text-slate-900 dark:text-white">
                    <div className="p-4 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500">Proactive Alerts</p>
                      <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className="p-4 border-b border-slate-50 dark:border-slate-800 flex gap-4 items-start hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-slate-900 dark:text-white">
                          <div className={`mt-1 p-2 rounded-lg ${n.type === 'overdue' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                            <AlertCircle size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold leading-tight mb-1">{n.title}</p>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">{n.message}</p>
                          </div>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <div className="p-10 text-center">
                          <p className="text-sm font-medium text-slate-400 italic">Everything&apos;s on track! No alerts.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800 group cursor-pointer hover:bg-white dark:hover:bg-slate-900 p-1 rounded-2xl transition-all ml-1">
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">Reggie Martins</p>
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Premium Account</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-inner group-hover:scale-105 transition-transform">
                RM
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-slate-900 dark:text-white">
          {renderView()}
        </div>
      </main>

      {/* Modals */}
      <TransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={() => setIsTransactionModalOpen(false)} 
      />
      <AccountModal 
        isOpen={isAccountModalOpen} 
        onClose={() => setIsAccountModalOpen(false)} 
      />
    </div>
  );
}
