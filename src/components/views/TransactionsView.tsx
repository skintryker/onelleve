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
import { translations, Language, formatDate } from '@/utils/translations';

interface TransactionsViewProps {
  initialType?: 'income' | 'expense' | 'all';
  onEditIncome?: (income: IncomeLog) => void;
  onAddIncome?: () => void;
  onEditExpense?: (expense: ExpenseLog) => void;
  onAddExpense?: () => void;
}

const TransactionsView = ({ 
  initialType = 'all', 
  onEditIncome, 
  onAddIncome, 
  onEditExpense, 
  onAddExpense 
}: TransactionsViewProps) => {
  const { transactions, deleteTransaction, activeExpenseLogs, activeIncomeLogs, settings, maskValue } = useAppContext();
  const [searchTerm, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'income' | 'expense' | 'all'>(initialType);

  const currentLang = (settings?.language as Language) || 'en';
  const dateFormat = settings?.date_format || 'MM/DD/YYYY';
  const t = translations[currentLang];

  // Sync internal state when initialType changes from sidebar clicks
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilterType(initialType);
  }, [initialType]);

  const filteredTransactions = transactions.filter(tr => {
    const matchesSearch = tr.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         tr.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || tr.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = (id: string) => {
    if (confirm(currentLang === 'pt' ? 'Tem certeza que deseja excluir esta transação?' : currentLang === 'es' ? '¿Estás seguro de que quieres eliminar esta transacción?' : 'Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
    }
  };

  const handleEdit = (tr: UnifiedTransaction) => {
    if (tr.type === 'expense' || tr.type === 'investment') {
      const log = activeExpenseLogs.find(e => e.id === tr.id);
      if (log && onEditExpense) {
        onEditExpense(log);
      }
    } else {
      const log = activeIncomeLogs.find(i => i.id === tr.id);
      if (log && onEditIncome) {
        onEditIncome(log);
      }
    }
  };

  const handleAddNew = () => {
    if (filterType === 'income') {
      if (onAddIncome) onAddIncome();
    } else {
      if (onAddExpense) onAddExpense();
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 text-slate-900 dark:text-white pt-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-full md:w-auto overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setFilterType('all')}
            className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${filterType === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-blue-600'}`}
          >
            {t.all}
          </button>
          <button 
            onClick={() => setFilterType('income')}
            className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${filterType === 'income' ? 'bg-emerald-50 text-emerald-900 shadow-lg' : 'text-slate-500 hover:text-emerald-500'}`}
          >
            {t.income}
          </button>
          <button 
            onClick={() => setFilterType('expense')}
            className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${filterType === 'expense' ? 'bg-rose-50 text-rose-900 shadow-lg' : 'text-slate-500 hover:text-rose-500'}`}
          >
            {t.expenses}
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder={currentLang === 'pt' ? 'Buscar...' : currentLang === 'es' ? 'Buscar...' : 'Search...'}
              value={searchTerm}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs md:text-sm font-bold text-slate-900 dark:text-white"
            />
          </div>
          <button 
            onClick={handleAddNew}
            className={`flex items-center gap-1.5 px-3 md:px-4 py-2 ${filterType === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-xl font-bold transition-all shadow-lg text-nowrap text-xs md:text-sm`}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">
                {filterType === 'income' 
                    ? (currentLang === 'pt' ? 'Adicionar Renda' : currentLang === 'es' ? 'Agregar Ingreso' : 'Add Income')
                    : (currentLang === 'pt' ? 'Adicionar Despesa' : currentLang === 'es' ? 'Agregar Gasto' : 'Add Expense')
                }
            </span>
            <span className="sm:hidden">{t.add}</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[24px] md:rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px] md:min-w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {filterType === 'income' 
                    ? t.source
                    : t.transaction}
                </th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {filterType === 'income' 
                    ? 'Label' 
                    : t.category}
                </th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t.date}
                </th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t.amount}
                </th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-900 dark:text-white">
              {filteredTransactions.map((tr) => (
                <tr key={tr.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div className="flex items-center gap-3">
                      <div className={`hidden sm:flex p-2 rounded-lg ${
                        tr.type === 'income' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 
                        tr.type === 'investment' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800'
                      }`}>
                        {tr.type === 'income' ? <ArrowUpRight size={14} /> : tr.type === 'investment' ? <TrendingUp size={14} /> : <ArrowDownLeft size={14} />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-xs md:text-sm truncate">{tr.name}</span>
                        {tr.paymentPlan === 'Installment' && (
                          <span className="text-[8px] md:text-[10px] font-black text-blue-600 uppercase tracking-widest">
                            {tr.currentInstallment}/{tr.totalInstallments}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <span className={`px-2 md:px-3 py-1 ${
                      tr.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 
                      tr.type === 'investment' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' :
                      'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    } rounded-full text-[9px] md:text-xs font-black uppercase tracking-wider whitespace-nowrap`}>
                      {tr.category}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                    {formatDate(tr.date, dateFormat)}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <span className={`font-black text-xs md:text-base ${
                      tr.type === 'income' ? 'text-emerald-600' : 
                      tr.type === 'investment' ? 'text-indigo-600' :
                      'text-slate-900 dark:text-white'
                    }`}>
                      {tr.type === 'income' ? '+' : '-'}${maskValue(Math.abs(tr.amount).toLocaleString(undefined, { minimumFractionDigits: 2 }))}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                    <div className="flex justify-end gap-1 md:gap-2">
                      <button 
                        onClick={() => handleEdit(tr)}
                        className="p-1.5 md:p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(tr.id)}
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
            <h3 className="text-lg font-bold">
                {t.noTransactionsFound}
            </h3>
            <p className="text-slate-500 font-medium text-sm">
                {t.tryAdjustingFilters}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsView;
