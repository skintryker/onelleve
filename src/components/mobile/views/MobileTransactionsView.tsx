'use client';

import React, { useMemo } from 'react';
import { useAppContext, UnifiedTransaction, IncomeLog, ExpenseLog } from '@/context/AppContext';
import { ArrowUpRight, ArrowDownLeft, Edit2, Trash2, TrendingUp, Search, Plus } from 'lucide-react';
import { translations, Language, formatDate } from '@/utils/translations';

interface MobileTransactionsViewProps {
  type: 'income' | 'expense';
  onEditIncome: (log: IncomeLog) => void;
  onEditExpense: (log: ExpenseLog) => void;
  onAdd: () => void;
  autoOpenModal?: boolean;
  onModalClose?: () => void;
}

export default function MobileTransactionsView({ 
  type, 
  onEditIncome, 
  onEditExpense, 
  onAdd,
  autoOpenModal,
  onModalClose
}: MobileTransactionsViewProps) {
  const { transactions, deleteTransaction, activeExpenseLogs, activeIncomeLogs, settings, maskValue } = useAppContext();
  const currentLang = (settings?.language as Language) || 'en';
  const dateFormat = settings?.date_format || 'MM/DD/YYYY';
  const t = translations[currentLang];

  // Handle auto-open from Quick Add
  React.useEffect(() => {
    if (autoOpenModal) {
      onAdd();
      if (onModalClose) onModalClose();
    }
  }, [autoOpenModal]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tr => tr.type === type);
  }, [transactions, type]);

  const handleEdit = (tr: UnifiedTransaction) => {
    if (tr.type === 'expense') {
      const log = activeExpenseLogs.find(e => e.id === tr.id);
      if (log) onEditExpense(log);
    } else {
      const log = activeIncomeLogs.find(i => i.id === tr.id);
      if (log) onEditIncome(log);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(currentLang === 'pt' ? 'Excluir?' : currentLang === 'es' ? '¿Eliminar?' : 'Delete this record?')) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-2 px-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          {type === 'income' ? t.income : t.expenses}
        </h2>
        <button 
          onClick={onAdd}
          className="p-2 bg-blue-600 text-white rounded-xl active:scale-95 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredTransactions.map((tr) => (
          <div key={tr.id} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`p-3 rounded-2xl shrink-0 ${
                tr.type === 'income' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 
                'bg-rose-50 text-rose-600 dark:bg-rose-900/20'
              }`}>
                {tr.type === 'income' ? <ArrowUpRight size={20} strokeWidth={2.5} /> : <ArrowDownLeft size={20} strokeWidth={2.5} />}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{tr.name}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{formatDate(tr.date, dateFormat)}</span>
                  <span className="text-[10px] text-slate-300">•</span>
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter truncate">{tr.category}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0 ml-3">
              <span className={`font-black text-base ${
                tr.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
              }`}>
                {tr.type === 'income' ? '+' : '-'}${maskValue(Math.abs(tr.amount).toLocaleString(undefined, { minimumFractionDigits: 2 }))}
              </span>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(tr)} className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 dark:bg-slate-800 rounded-lg"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(tr.id)} className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 dark:bg-slate-800 rounded-lg"><Trash2 size={14} /></button>
              </div>
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
