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
  Wallet
} from 'lucide-react';
import Charts from '@/components/Charts';
import Modal from '../modals/Modal';

export default function ReportsView() {
  const { 
    incomeLogs, 
    expenseLogs, 
    cards, 
    accounts, 
    investments, 
    reports, 
    addReport, 
    deleteReport 
  } = useAppContext();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<SavedReport | null>(null);

  const months = useMemo(() => {
    const opts = [];
    const d = new Date();
    for (let i = 0; i < 12; i++) {
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      opts.push({ key, label });
      d.setMonth(d.getMonth() - 1);
    }
    return opts;
  }, []);

  const handleGenerateReport = async () => {
    const monthIncome = incomeLogs.filter(log => log.monthKey === selectedMonth);
    const monthExpense = expenseLogs.filter(log => log.monthKey === selectedMonth);
    const monthInvestments = investments.filter(inv => inv.monthKey === selectedMonth);

    const totalIncome = monthIncome.reduce((acc, log) => acc + log.amount, 0);
    const totalSpending = monthExpense.filter(log => log.transactionType !== 'Payment').reduce((acc, log) => acc + log.amount, 0);
    
    // Logic for Cash Out (Bank/Autopay/Card Payments + Investments)
    const cashOutExpenses = monthExpense.filter(log => 
      log.paymentChannel === 'Bank' || log.paymentChannel === 'Autopay' || log.transactionType === 'Payment'
    ).reduce((acc, log) => acc + log.amount, 0);
    
    const manualInvestments = monthInvestments.filter(inv => !inv.payrollDeduction).reduce((acc, inv) => acc + inv.contribution, 0);
    const totalCashOut = cashOutExpenses + manualInvestments;

    const cardOutstanding = cards.reduce((acc, card) => acc + card.currentBalance, 0);
    const bankBalances = accounts.reduce((acc, accnt) => acc + accnt.balance, 0);
    const investmentsTotal = investments.reduce((acc, inv) => acc + inv.currentBalance, 0);

    const categories = monthExpense.reduce((acc: Record<string, number>, log) => {
      acc[log.category] = (acc[log.category] || 0) + log.amount;
      return acc;
    }, {});

    const periodLabel = months.find(m => m.key === selectedMonth)?.label || selectedMonth;

    const reportData = {
      totalIncome,
      totalSpending,
      totalCashOut,
      cardOutstanding,
      bankBalances,
      investmentsTotal,
      netPosition: bankBalances + investmentsTotal - cardOutstanding,
      categories,
      cardPayments: monthExpense.filter(e => e.transactionType === 'Payment').reduce((acc, e) => acc + e.amount, 0),
      payrollDeduction: monthInvestments.filter(inv => inv.payrollDeduction).reduce((acc, inv) => acc + inv.contribution, 0),
      manualInvestments
    };

    await addReport({
      title: `${periodLabel} Financial Summary`,
      period: periodLabel,
      report_data: reportData
    });
  };

  const handleDeleteReport = async (id: string) => {
    await deleteReport(id);
  };

  const handleViewReport = (report: SavedReport) => {
    setViewingReport(report);
    setIsViewModalOpen(true);
  };

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
            <h3 className="text-xl font-black tracking-tight">Report Generator</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Select a period to analyze</p>
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
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus size={16} />
            Generate Report
          </button>
        </div>
      </div>

      {/* Generated Reports List */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-black tracking-tight">Recent Reports</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Export coming soon</p>
        </div>
        
        <div className="overflow-x-auto">
          {reports.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/5">
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Report Name</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Period</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
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
              <h4 className="text-xl font-black text-slate-900 dark:text-white">No reports generated yet</h4>
              <p className="text-sm text-slate-400 font-medium mt-2 italic">Select a month above to generate your first financial summary.</p>
            </div>
          )}
        </div>
      </div>

      {/* View Summary Modal */}
      {viewingReport && (
        <Modal 
          isOpen={isViewModalOpen} 
          onClose={() => setIsViewModalOpen(false)} 
          title={`${viewingReport.period} Financial Summary`}
        >
          <div className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Income</p>
                   <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">${viewingReport.report_data.totalIncome.toLocaleString()}</p>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/20">
                   <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Total Cash Out This Month</p>
                   <p className="text-2xl font-black text-rose-700 dark:text-rose-400">${viewingReport.report_data.totalCashOut.toLocaleString()}</p>
                </div>
             </div>

             <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Cash Flow Breakdown</h4>
                <div className="space-y-3">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600"><TrendingUp size={14} /></div>
                         <p className="text-sm font-bold">Actual Cash Out</p>
                      </div>
                      <p className="text-sm font-black">${viewingReport.report_data.totalCashOut.toLocaleString()}</p>
                   </div>
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600"><CreditCard size={14} /></div>
                         <p className="text-sm font-bold">Credit Card Payments</p>
                      </div>
                      <p className="text-sm font-black">${viewingReport.report_data.cardPayments.toLocaleString()}</p>
                   </div>
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600"><Building2 size={14} /></div>
                         <p className="text-sm font-bold">Payroll Investments</p>
                      </div>
                      <p className="text-sm font-black">${viewingReport.report_data.payrollDeduction.toLocaleString()}</p>
                   </div>
                   <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600"><Wallet size={14} /></div>
                         <p className="text-sm font-bold">Investments Total</p>
                      </div>
                      <p className="text-sm font-black text-blue-600">${viewingReport.report_data.investmentsTotal.toLocaleString()}</p>
                   </div>
                </div>
             </div>

             <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Spending by Category</p>
                <div className="space-y-2">
                   {Object.entries(viewingReport.report_data.categories).map(([cat, val]: [string, any]) => (
                      <div key={cat} className="flex justify-between items-center">
                         <p className="text-xs font-bold">{cat}</p>
                         <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-500" style={{ width: `${(val / (viewingReport.report_data.totalSpending || 1) * 100)}%` }} />
                            </div>
                            <p className="text-xs font-black w-12 text-right">${val.toLocaleString()}</p>
                         </div>
                      </div>
                   ))}
                   {Object.keys(viewingReport.report_data.categories).length === 0 && <p className="text-xs text-slate-400 italic">No spending data for this period.</p>}
                </div>
             </div>

             <button 
               onClick={() => setIsViewModalOpen(false)}
               className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px]"
             >
               Close Summary
             </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
