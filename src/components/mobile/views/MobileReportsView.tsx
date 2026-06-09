'use client';

import React, { useState, useMemo } from 'react';
import { useAppContext, SavedReport } from '@/context/AppContext';
import { FileText, Trash2, Eye, Calendar, Loader2 } from 'lucide-react';
import Modal from '@/components/modals/Modal';
import { translations, Language } from '@/utils/translations';
import Charts from '@/components/Charts';

interface MobileReportsViewProps {
  autoOpenModal?: boolean;
  onModalClose?: () => void;
}

export default function MobileReportsView({ autoOpenModal, onModalClose }: MobileReportsViewProps) {
  const { reports, deleteReport, settings, addReport, calculateSummary, incomeLogs, expenseLogs, investments, accounts, cards, maskValue } = useAppContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<SavedReport | null>(null);

  const currentLang = (settings?.language as Language) || 'en';
  const t = translations[currentLang];

  const months = useMemo(() => {
    const opts = [];
    const d = new Date();
    for (let i = 0; i < 12; i++) {
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleString(currentLang === 'en' ? 'en-US' : currentLang === 'pt' ? 'pt-BR' : 'es-ES', { month: 'long', year: 'numeric' });
      opts.push({ key, label });
      d.setMonth(d.getMonth() - 1);
    }
    return opts;
  }, [currentLang]);

  // Handle auto-open
  React.useEffect(() => {
    if (autoOpenModal) {
      handleGenerateReport();
      if (onModalClose) onModalClose();
    }
  }, [autoOpenModal]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const currentMonthKey = new Date().toISOString().slice(0, 7);
      const isSelectedCurrent = selectedMonth === currentMonthKey;

      const reportData = calculateSummary(
        selectedMonth,
        isSelectedCurrent,
        incomeLogs,
        expenseLogs,
        investments,
        accounts,
        cards
      );

      const hasData = 
        reportData.incomeThisMonth > 0 || 
        reportData.cashOutThisMonth > 0 || 
        reportData.investmentThisMonth > 0 ||
        reportData.investmentsTotal > 0 ||
        reportData.availableBalance > 0 ||
        reportData.cardOutstanding > 0;

      if (!hasData) {
        alert('No data available to generate a report.');
        return;
      }

      const periodLabel = months.find(m => m.key === selectedMonth)?.label || selectedMonth;

      const newReportData = {
        title: `${periodLabel} Financial Summary`,
        period: periodLabel,
        report_data: reportData
      };

      const savedReport = await addReport(newReportData);
      
      if (savedReport) {
        setViewingReport(savedReport);
        setIsViewModalOpen(true);
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      alert(`Failed to generate report: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentData = useMemo(() => {
    if (!viewingReport) return null;
    return viewingReport.report_data || (viewingReport as any).snapshot_data || {};
  }, [viewingReport]);

  const safeFormat = (val: any) => {
    return maskValue(Number(val ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-2 px-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t.reports}</h2>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl">
            <Calendar size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t.reportGenerator}</h3>
            <p className="text-[10px] text-slate-500 font-medium">{t.selectPeriodToAnalyze}</p>
          </div>
        </div>

        <div className="space-y-3">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold text-slate-900 dark:text-white appearance-none"
          >
            {months.map(m => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
          <button 
            disabled={isGenerating}
            onClick={handleGenerateReport}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-purple-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : t.generateReport}
          </button>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.recentReports}</h3>
        {reports.map((report) => (
          <div key={report.id} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl shrink-0">
                <FileText size={16} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{report.title}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{report.period}</p>
              </div>
            </div>
            <div className="flex gap-1 shrink-0 ml-3">
              <button onClick={() => { setViewingReport(report); setIsViewModalOpen(true); }} className="p-2 text-slate-400 hover:text-purple-600 bg-slate-50 dark:bg-slate-800 rounded-xl transition-colors"><Eye size={16} /></button>
              <button onClick={() => deleteReport(report.id)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 dark:bg-slate-800 rounded-xl transition-colors"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {reports.length === 0 && (
          <div className="p-6 text-center text-slate-500 text-sm font-bold bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
            {t.noReports}
          </div>
        )}
      </div>

      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={viewingReport?.title || 'Report'}>
        {currentData && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.totalIncome}</p>
                <p className="text-xl font-black text-emerald-600">${safeFormat(currentData.incomeThisMonth)}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.totalCashOut}</p>
                <p className="text-xl font-black text-rose-600">${safeFormat(currentData.cashOutThisMonth)}</p>
              </div>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-center">
              <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">{t.availableBalance}</p>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">${safeFormat(currentData.availableBalance)}</p>
            </div>
            {/* The Charts component works nicely if wrapped, but might be too tall for mobile. Let's just use it and rely on its own responsiveness */}
            <Charts />
          </div>
        )}
      </Modal>
    </div>
  );
}
