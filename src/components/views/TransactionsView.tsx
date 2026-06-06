'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext, UnifiedTransaction, ExpenseLog, IncomeLog } from '@/context/AppContext';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Edit2, 
  Trash2, 
  Plus,
  TrendingUp
} from 'lucide-react';
import TransactionModal from '../modals/TransactionModal';
import IncomeModal from '../modals/IncomeModal';

interface TransactionsViewProps {
  initialType?: 'income' | 'expense' | 'all' | 'investment';
}

const TransactionsView = ({ initialType = 'all' }: TransactionsViewProps) => {
  const { transactions, deleteTransaction, expenseLogs, incomeLogs } = useAppContext();
  const [searchTerm, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'income' | 'expense' | 'all' | 'investment'>(initialType);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  
  const [editingExpense, setEditingExpense] = useState<ExpenseLog | null>(null);
  const [editingIncome, setEditingIncome] = useState<IncomeLog | null>(null);

  // Sync internal state when initialType changes from sidebar clicks
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilterType(initialType);
  }, [initialType]);

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
    }
  };

  const handleEdit = (t: UnifiedTransaction) => {
    if (t.type === 'expense' || t.type === 'investment') {
      const log = expenseLogs.find(e => e.id === t.id);
      if (log) {
        setEditingExpense(log);
        setIsExpenseModalOpen(true);
      }
    } else {
      const log = incomeLogs.find(i => i.id === t.id);
      if (log) {
        setEditingIncome(log);
        setIsIncomeModalOpen(true);
      }
    }
  };

  const handleAddNew = () => {
    if (filterType === 'income') {
      setEditingIncome(null);
      setIsIncomeModalOpen(true);
    } else {
      setEditingExpense(null);
      setIsExpenseModalOpen(true);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 text-slate-900 dark:text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-full md:w-auto overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setFilterType('all')}
            className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${filterType === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-blue-600'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilterType('income')}
            className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${filterType === 'income' ? 'bg-emerald-50 text-white shadow-lg' : 'text-slate-500 hover:text-emerald-500'}`}
          >
            Income
          </button>
          <button 
            onClick={() => setFilterType('expense')}
            className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${filterType === 'expense' ? 'bg-rose-50 text-white shadow-lg' : 'text-slate-500 hover:text-rose-500'}`}
          >
            Expenses
          </button>
          <button 
            onClick={() => setFilterType('investment')}
            className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${filterType === 'investment' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-600'}`}
          >
            Investments
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs md:text-sm font-bold text-slate-900 dark:text-white"
            />
          </div>
          <button 
            onClick={handleAddNew}
            className={`flex items-center gap-1.5 px-3 md:px-4 py-2 ${filterType === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : filterType === 'investment' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-xl font-bold transition-all shadow-lg text-nowrap text-xs md:text-sm`}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">{filterType === 'income' ? 'Add Income' : filterType === 'investment' ? 'Add Investment' : 'Add Expense'}</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[24px] md:rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px] md:min-w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {filterType === 'income' ? 'Source' : 'Transaction'}
                </th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {filterType === 'income' ? 'Label' : 'Category'}
                </th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-900 dark:text-white">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div className="flex items-center gap-3">
                      <div className={`hidden sm:flex p-2 rounded-lg ${
                        t.type === 'income' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 
                        t.type === 'investment' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800'
                      }`}>
                        {t.type === 'income' ? <ArrowUpRight size={14} /> : t.type === 'investment' ? <TrendingUp size={14} /> : <ArrowDownLeft size={14} />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-xs md:text-sm truncate">{t.name}</span>
                        {t.paymentPlan === 'Installment' && (
                          <span className="text-[8px] md:text-[10px] font-black text-blue-600 uppercase tracking-widest">
                            {t.currentInstallment}/{t.totalInstallments}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <span className={`px-2 md:px-3 py-1 ${
                      t.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 
                      t.type === 'investment' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' :
                      'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    } rounded-full text-[9px] md:text-xs font-black uppercase tracking-wider whitespace-nowrap`}>
                      {t.category}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                    {t.date}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <span className={`font-black text-xs md:text-base ${
                      t.type === 'income' ? 'text-emerald-600' : 
                      t.type === 'investment' ? 'text-indigo-600' :
                      'text-slate-900 dark:text-white'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}${Math.abs(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                    <div className="flex justify-end gap-1 md:gap-2">
                      <button 
                        onClick={() => handleEdit(t)}
                        className="p-1.5 md:p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 md:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="p-20 text-center text-slate-900 dark:text-white">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4 text-slate-900 dark:text-white">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-bold">No transactions found</h3>
            <p className="text-slate-500 font-medium text-sm">Try adjusting your filters or search term.</p>
          </div>
        )}
      </div>

      <TransactionModal 
        isOpen={isExpenseModalOpen} 
        onClose={() => { setIsExpenseModalOpen(false); setEditingExpense(null); }} 
        editingTransaction={editingExpense}
      />
      <IncomeModal 
        isOpen={isIncomeModalOpen} 
        onClose={() => { setIsIncomeModalOpen(false); setEditingIncome(null); }} 
        editingIncome={editingIncome}
      />
    </div>
  );
};

export default TransactionsView;
