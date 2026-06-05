'use client';

import React from 'react';
import Charts from '@/components/Charts';
import { FileText, Download } from 'lucide-react';

export default function ReportsView() {
  const reports = [
    { name: 'Monthly Financial Summary', date: 'May 2026', size: '1.2 MB', trend: '+12%' },
    { name: 'Expense Distribution Analysis', date: 'April 2026', size: '0.8 MB', trend: '-5%' },
    { name: 'Credit Card Utilization', date: 'March 2026', size: '2.1 MB', trend: '+2%' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 text-slate-900 dark:text-white">
      {/* Charts Section */}
      <Charts />

      {/* Reports Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-slate-900 dark:text-white">
          <h3 className="text-lg font-black tracking-tight">Generated Reports</h3>
          <button className="flex items-center gap-2 text-blue-600 text-sm font-bold hover:underline">
            <Download size={16} />
            Download All
          </button>
        </div>
        <div className="overflow-x-auto text-slate-900 dark:text-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Report Name</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Period</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Size</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {reports.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                        <FileText size={18} />
                      </div>
                      <span className="font-bold">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{item.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-bold">{item.size}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${item.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-red-700'}`}>
                      {item.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
