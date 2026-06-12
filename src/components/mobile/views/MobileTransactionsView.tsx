'use client';

import React, { useMemo } from 'react';
import { useAppContext, UnifiedTransaction } from '@/context/AppContext';
import { ArrowUpRight, ArrowDownLeft, Edit2, Trash2 } from 'lucide-react';
import { translations, Language, formatDate } from '@/utils/translations';

// ... (props interface)

export default function MobileTransactionsView({ type, onEditIncome, onEditExpense, onAdd, autoOpenModal, onModalClose }: MobileTransactionsViewProps) {
  const { transactions, deleteTransaction, settings, maskValue } = useAppContext();
  // ... (logic)

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ... view JSX */}
      <span className={`font-black text-base ${tr.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
        {tr.type === 'income' ? '+' : '-'}${maskValue(Math.abs(tr.amount).toLocaleString(undefined, { minimumFractionDigits: 2 }))}
      </span>
      {/* ... view JSX */}
    </div>
  );
}
