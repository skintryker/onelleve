'use client';

import React, { useMemo } from 'react';
import { useAppContext, UnifiedTransaction, IncomeLog, ExpenseLog } from '@/context/AppContext';
import { ArrowUpRight, ArrowDownLeft, Edit2, Trash2, Search, Plus } from 'lucide-react';
import { translations, Language, formatDate } from '@/utils/translations';

interface MobileTransactionsViewProps {
  type: 'income' | 'expense';
  onEditIncome: (log: IncomeLog) => void;
  onEditExpense: (log: ExpenseLog) => void;
  onAdd: () => void;
  autoOpenModal?: boolean;
  onModalClose?: () => void;
}

export default function MobileTransactionsView({ type, onEditIncome, onEditExpense, onAdd, autoOpenModal, onModalClose }: MobileTransactionsViewProps) {
  const { transactions, incomeLogs, expenseLogs, deleteTransaction, settings, maskValue } = useAppContext();
  const currentLang = (settings?.language as Language) || 'en';
  const dateFormat = settings?.date_format || 'MM/DD/YYYY';
  const t = translations[currentLang];
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    if (autoOpenModal) {
      onAdd();
      if (onModalClose) onModalClose();
    }
  }, [autoOpenModal]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tr => {
      const typeMatch = tr.type === type;
      if (!typeMatch) return false;
      if (searchQuery.trim() === '') return true;
      return tr.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [transactions, type, searchQuery]);

  const handleEdit = (transactionId: string, transactionType: 'income' | 'expense') => {
    if (transactionType === 'income') {
      const incomeRecord = incomeLogs.find(log => log.id === transactionId);
      if (incomeRecord) onEditIncome(incomeRecord);
    } else {
      const expenseRecord = expenseLogs.find(log => log.id === transactionId);
      if (expenseRecord) onEditExpense(expenseRecord);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(t.areYouSureDeleteCard.replace('card', 'transaction'))) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-2 px-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{type === 'income' ? t.income : t.expenses}</h2>
        <button onClick={onAdd} className="p-2 bg-blue-600 text-white rounded-xl active:scale-95 transition-all shadow-lg shadow-blue-500/20"><Plus size={20} strokeWidth={3} /></button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={3} />
        <input 
          type="text" 
          placeholder={`Search ${type === 'income' ? 'income' : 'expenses'}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold text-slate-900 dark:text-white focus:border-blue-500"
        />
      </div>

      <div className="space-y-3">
        {filteredTransactions.map(tr => (
          <div key={tr.id} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`p-3 rounded-2xl ${tr.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'}`}>
                {tr.type === 'income' ? <ArrowUpRight size={18} strokeWidth={3} /> : <ArrowDownLeft size={18} strokeWidth={3} />}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{tr.name}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{tr.category} &bull; {formatDate(tr.date, dateFormat)}</p>
              </div>
            </div>
            <div className="flex gap-1 items-center shrink-0 ml-3">
              <span className={`font-black text-base ${tr.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                {tr.type === 'income' ? '+' : '-'}${maskValue(Math.abs(tr.amount).toLocaleString(undefined, { minimumFractionDigits: 2 }))}
              </span>
              <button onClick={() => {
                if (tr.type === 'income' || tr.type === 'expense') {
                  handleEdit(tr.id, tr.type);
                }
              }} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 dark:bg-slate-800 rounded-xl transition-colors"><Edit2 size={16} /></button>
              <button onClick={() => handleDelete(tr.id)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 dark:bg-slate-800 rounded-xl transition-colors"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}

        {filteredTransactions.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
            <Search size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-500">No {type === 'income' ? 'income' : 'expenses'} found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
