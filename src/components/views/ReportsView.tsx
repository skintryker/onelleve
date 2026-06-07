'use client';

import React, { useState, useMemo } from 'react';
import { useAppContext, SavedReport } from '@/context/AppContext';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Eye, 
  Calendar,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Building2,
  Wallet,
  Loader2
} from 'lucide-react';
import Charts from '@/components/Charts';
import Modal from '../modals/Modal';
import { translations, Language } from '@/utils/translations';

export default function ReportsView() {
  const { 
    incomeLogs, 
    expenseLogs, 
    cards, 
    accounts, 
    investments, 
    reports, 
    addReport, 
    deleteReport,
    settings,
    maskValue
  } = useAppContext();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<SavedReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const currentMonthKey = new Date().toISOString().slice(0, 7);
      const lastReset = settings?.last_reset_date || '1970-01-01T00:00:00.000Z';

      // Filtering logic: If selected month is current, apply lastReset filter.
      // Otherwise (past months), use all records for that month.
      const isSelectedCurrent = selectedMonth === currentMonthKey;

      const monthIncome = incomeLogs.filter(log => 
        log.monthKey === selectedMonth && (!isSelectedCurrent || log.created_at >= lastReset)
      );
      const monthExpense = expenseLogs.filter(log => 
        log.monthKey === selectedMonth && (!isSelectedCurrent || log.created_at >= lastReset)
      );
      const monthInvestments = investments.filter(inv => 
        inv.monthKey === selectedMonth && (!isSelectedCurrent || inv.created_at >= lastReset)
      );

      const totalIncome = monthIncome.reduce((acc, log) => acc + log.amount, 0);
      const totalSpending = monthExpense.filter(log => log.transactionType !== 'Payment').reduce((acc, log) => acc + log.amount, 0);
      
      const cardOutstanding = cards.reduce((acc, card) => acc + card.currentBalance, 0);
      const bankBalances = accounts.reduce((acc, accnt) => acc + accnt.balance, 0);
      const investmentsTotal = investments.reduce((acc, inv) => acc + inv.currentBalance, 0);

      const categories = monthExpense.reduce((acc: Record<string, number>, log) => {
        acc[log.category] = (acc[log.category] || 0) + log.amount;
        return acc;
      }, {});

      const periodLabel = months.find(m => m.key === selectedMonth)?.label || selectedMonth;

      // 1. Pure Bank/Cash Expenses (excluding CC payments and investments to avoid double counting)
      const pureBankExpenses = monthExpense.filter(log => 
        log.paymentChannel !== 'Credit Card' && 
        log.transactionType !== 'Payment' && 
        log.transactionType !== 'Investment' &&
        log.category !== 'Investment'
      ).reduce((acc, log) => acc + log.amount, 0);

      // 2. Credit Card Payments
      const cardPayments = monthExpense.filter(log => 
        log.transactionType === 'Payment'
      ).reduce((acc, log) => acc + log.amount, 0);
      
      // 3. Manual Investments (Contribution)
      const manualInvestments = monthInvestments.filter(inv => !inv.payrollDeduction).reduce((acc, inv) => acc + inv.contribution, 0);
      
      // 4. Payroll Investments (Contribution)
      const payrollDeduction = monthInvestments.filter(inv => inv.payrollDeduction).reduce((acc, inv) => acc + inv.contribution, 0);

      const reportData = {
        totalIncome,
        totalSpending,
        totalCashOut: pureBankExpenses + cardPayments + manualInvestments,
        pureBankExpenses,
        cardOutstanding,
        bankBalances,
        investmentsTotal,
        netPosition: bankBalances + investmentsTotal - cardOutstanding,
        categories,
        cardPayments,
        payrollDeduction,
        manualInvestments
      };

      // Validation: Only generate if there is real data
      const hasData = 
        totalIncome > 0 || 
        totalSpending > 0 || 
        reportData.totalCashOut > 0 ||
        investmentsTotal > 0 ||
        bankBalances > 0 ||
        cardOutstanding > 0;

      if (!hasData) {
        alert('No data available to generate a report.');
        return;
      }

      const newReportData = {
        title: `${periodLabel} Financial Summary`,
        period: periodLabel,
        report_data: reportData
      };

      const savedReport = await addReport(newReportData);
      
      // Open the modal immediately with the real data from DB
      if (savedReport) {
        setViewingReport(savedReport);
        setIsViewModalOpen(true);
      }
    } catch (error: any) {
      console.error('Full Error Object:', error);
      const errorMessage = error?.message || error?.details || 'Unknown error';
      alert(`Failed to generate report: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    await deleteReport(id);
  };

  const handleViewReport = (report: SavedReport) => {
    setViewingReport(report);
    setIsViewModalOpen(true);
  };

  const safeFormat = (val: any) => {
    return Number(val ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const currentData = useMemo(() => {
    if (!viewingReport) return null;
    return viewingReport.report_data || (viewingReport as any).snapshot_data || {};
  }, [viewingReport]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-slate-900 dark:text-white">
      {/* Real-time Charts */}
      <Charts />

      {/* Report Generator Controls */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
            <Calendar size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">{t.reportGenerator}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t.selectPeriodToAnalyze}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm font-bold text-slate-900 dark:text-white appearance-none min-w-[200px]"
          >
            {months.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
          <button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {t.generateReport}
          </button>
        </div>
      </div>

      {/* Generated Reports List */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-black tracking-tight">{t.recentReports}</h3>
        </div>
        
        <div className="overflow-x-auto">
          {reports.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/5">
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t.reportName}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t.period}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t.type}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                          <FileText size={18} />
                        </div>
                        <span className="font-bold text-sm">{report.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">{report.period}</td>
                    <td className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Summary</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleViewReport(report)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteReport(report.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
                <FileText size={32} />
              </div>
              <h4 className="text-xl font-black text-slate-900 dark:text-white">{t.noReportsGeneratedYet}</h4>
              <p className="text-sm text-slate-400 font-medium mt-2 italic">
                  {t.selectMonthToGenerate}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* View Summary Modal */}
      {viewingReport && currentData && (
        <Modal 
          isOpen={isViewModalOpen} 
          onClose={() => setIsViewModalOpen(false)} 
          title={`${viewingReport.period} Financial Summary`}
        >
          <div className="space-y-6 text-slate-900 dark:text-white">
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{t.totalIncome}</p>
                   <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">${maskValue(safeFormat(currentData.totalIncome))}</p>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/20">
                   <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">{t.totalCashOut}</p>
                   <p className="text-2xl font-black text-rose-700 dark:text-rose-400">${maskValue(safeFormat(currentData.totalCashOut))}</p>
                </div>
             </div>

             <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">{t.cashFlowBreakdown}</h4>
                <div className="space-y-3">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600"><TrendingUp size={14} /></div>
                         <p className="text-sm font-bold">{t.actualCashOut}</p>
                      </div>
                      <p className="text-sm font-black">${maskValue(safeFormat(currentData.totalCashOut))}</p>
                   </div>
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600"><CreditCard size={14} /></div>
                         <p className="text-sm font-bold">{t.cardPayments}</p>
                      </div>
                      <p className="text-sm font-black">${maskValue(safeFormat(currentData.cardPayments))}</p>
                   </div>
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600"><Building2 size={14} /></div>
                         <p className="text-sm font-bold">{t.payrollInvestments}</p>
                      </div>
                      <p className="text-sm font-black">${maskValue(safeFormat(currentData.payrollDeduction))}</p>
                   </div>
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600"><Wallet size={14} /></div>
                         <p className="text-sm font-bold">{t.manualInvestments}</p>
                      </div>
                      <p className="text-sm font-black">${maskValue(safeFormat(currentData.manualInvestments))}</p>
                   </div>
                   <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600"><Building2 size={14} /></div>
                         <p className="text-sm font-bold">{t.investmentsTotal}</p>
                      </div>
                      <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">${maskValue(safeFormat(currentData.investmentsTotal))}</p>
                   </div>
                </div>
             </div>

             <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                    {t.spendingByCategory}
                </p>
                <div className="space-y-2">
                   {Object.entries(currentData.categories || {}).map(([cat, val]: [string, any]) => (
                      <div key={cat} className="flex justify-between items-center">
                         <p className="text-xs font-bold">{cat}</p>
                         <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-500" style={{ width: `${(Number(val) / (currentData.totalSpending || 1) * 100)}%` }} />
                            </div>
                            <p className="text-xs font-black w-12 text-right">${maskValue(safeFormat(val))}</p>
                         </div>
                      </div>
                   ))}
                   {(!currentData.categories || Object.keys(currentData.categories).length === 0) && <p className="text-xs text-slate-400 italic">{t.noSpendingData}</p>}
                </div>
             </div>

             <button 
               onClick={() => setIsViewModalOpen(false)}
               className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px]"
             >
               {t.closeSummary}
             </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
