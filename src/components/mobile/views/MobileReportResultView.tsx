'use client';

import React from 'react';
import { useAppContext, SavedReport } from '@/context/AppContext';
import { X } from 'lucide-react';
import Charts from '@/components/Charts';
import { translations, Language } from '@/utils/translations';

// ... (props interface)

export default function MobileReportResultView({ report, onClose }: MobileReportResultViewProps) {
  const { settings, maskValue } = useAppContext();
  // ... (logic)

  const safeFormat = (val: any) => {
    return maskValue(Number(val ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-900 animate-in fade-in duration-300">
      {/* ... view JSX */}
      <p className="text-xl font-black text-emerald-600">${safeFormat(currentData.incomeThisMonth)}</p>
      {/* ... view JSX */}
      <p className="text-xl font-black text-rose-600">${safeFormat(currentData.cashOutThisMonth)}</p>
      {/* ... view JSX */}
      <p className="text-2xl font-black text-blue-600 dark:text-blue-400">${safeFormat(currentData.availableBalance)}</p>
      {/* ... view JSX */}
    </div>
  );
}
