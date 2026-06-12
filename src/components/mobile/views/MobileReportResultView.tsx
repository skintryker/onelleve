'use client';

import React from 'react';
import { useAppContext, SavedReport } from '@/context/AppContext';
import { X } from 'lucide-react';
import Charts from '@/components/Charts';
import { translations, Language } from '@/utils/translations';

interface MobileReportResultViewProps {
  report: SavedReport | null;
  onClose: () => void;
}

export default function MobileReportResultView({ report, onClose }: MobileReportResultViewProps) {
  const { settings, maskValue } = useAppContext();
  const t = translations[(settings?.language as Language) || 'en'];

  if (!report) return null;

  const currentData = report.report_data || (report as any).snapshot_data || {};
  
  const safeFormat = (val: any) => {
    return maskValue(Number(val ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-900 animate-in fade-in duration-300">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-10">
        <div className="max-w-[430px] mx-auto flex items-center justify-between p-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">{report.title}</h2>
            <p className="text-xs text-slate-500">{report.period}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="overflow-y-auto h-full pb-24">
        <div className="max-w-[430px] mx-auto p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.totalIncome}</p>
              <p className="text-xl font-black text-emerald-600">${safeFormat(currentData.incomeThisMonth)}</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.totalCashOut}</p>
              <p className="text-xl font-black text-rose-600">${safeFormat(currentData.cashOutThisMonth)}</p>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">{t.availableBalance}</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">${safeFormat(currentData.availableBalance)}</p>
          </div>
          <Charts />
        </div>
      </div>
    </div>
  );
}
