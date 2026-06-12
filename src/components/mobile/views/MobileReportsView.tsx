'use client';

import React, { useState, useMemo } from 'react';
import { useAppContext, SavedReport } from '@/context/AppContext';
import { FileText, Trash2, Eye, Calendar, Loader2 } from 'lucide-react';
import { translations, Language } from '@/utils/translations';
import MobileReportResultView from './MobileReportResultView';

interface MobileReportsViewProps {
  autoOpenModal?: boolean;
  onModalClose?: () => void;
}

export default function MobileReportsView({ autoOpenModal, onModalClose }: MobileReportsViewProps) {
  const { reports, deleteReport, settings, addReport, calculateSummary, incomeLogs, expenseLogs, investments, accounts, cards } = useAppContext();
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

  React.useEffect(() => {
    if (autoOpenModal) {
      handleGenerateReport();
      if (onModalClose) onModalClose();
    }
  }, [autoOpenModal]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const reportData = calculateSummary(selectedMonth, selectedMonth === new Date().toISOString().slice(0, 7), incomeLogs, expenseLogs, investments, accounts, cards);
      if (!reportData.incomeThisMonth && !reportData.cashOutThisMonth) {
        alert('No data available to generate a report.');
        return;
      }
      const savedReport = await addReport({
        title: `${months.find(m => m.key === selectedMonth)?.label || selectedMonth} Financial Summary`,
        period: months.find(m => m.key === selectedMonth)?.label || selectedMonth,
        report_data: reportData
      });
      if (savedReport) {
        setViewingReport(savedReport);
        setIsViewModalOpen(true);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report.');
    } finally {
      setIsGenerating(false);
    }
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

      {isViewModalOpen && (
        <MobileReportResultView 
          report={viewingReport}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}
    </div>
  );
}
