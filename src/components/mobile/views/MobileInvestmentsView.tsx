'use client';

import React from 'react';
import { useAppContext, Investment } from '@/context/AppContext';
import { TrendingUp, Edit2, Trash2 } from 'lucide-react';
import { translations, Language, formatDate } from '@/utils/translations';

interface MobileInvestmentsViewProps {
  autoOpenModal?: boolean;
  onModalClose?: () => void;
  onEditInvestment: (inv: Investment) => void;
}

export default function MobileInvestmentsView({ onEditInvestment }: MobileInvestmentsViewProps) {
  const { activeInvestments, deleteInvestment, settings, maskValue } = useAppContext();
  const currentLang = (settings?.language as Language) || 'en';
  const dateFormat = settings?.date_format || 'MM/DD/YYYY';
  const t = translations[currentLang];

  const handleDelete = (id: string) => {
    if (confirm(currentLang === 'pt' ? 'Excluir?' : currentLang === 'es' ? '¿Eliminar?' : 'Delete?')) {
      deleteInvestment(id);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-2 px-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t.investments}</h2>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {activeInvestments.map((inv) => (
          <div key={inv.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl shrink-0">
                  <TrendingUp size={20} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{inv.institution}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{formatDate(inv.date, dateFormat)}</span>
                    {inv.tenor && (
                      <>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter truncate">{inv.tenor}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => onEditInvestment(inv)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 rounded-xl transition-colors">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(inv.id)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-600 rounded-xl transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.contribution}</p>
                <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  ${maskValue(inv.contribution.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 text-right">{t.currentBalance}</p>
                <p className="text-lg font-black text-indigo-600 tracking-tighter text-right">
                  ${maskValue(inv.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                </p>
              </div>
            </div>
          </div>
        ))}

        {activeInvestments.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
            <TrendingUp size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-500">No investments found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
