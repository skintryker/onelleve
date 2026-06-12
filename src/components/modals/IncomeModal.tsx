'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext, IncomeLog } from '@/context/AppContext';
import { X, Loader2 } from 'lucide-react';
import { translations, Language } from '@/utils/translations';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingIncome?: IncomeLog | null;
}

export default function IncomeModal({ isOpen, onClose, editingIncome }: IncomeModalProps) {
  const { addIncome, accounts, settings } = useAppContext();
  const t = translations[(settings?.language as Language) || 'en'];

  const [source, setSource] = useState('');
  const [paycheckLabel, setPaycheckLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [depositBank, setDepositBank] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [alreadyIncluded, setAlreadyIncluded] = useState(false);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setSource('');
    setPaycheckLabel('');
    setAmount('');
    setDepositBank('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setAlreadyIncluded(false);
  };

  useEffect(() => {
    if (isOpen) {
      if (editingIncome) {
        setSource(editingIncome.source);
        setPaycheckLabel(editingIncome.paycheckLabel);
        setAmount(editingIncome.amount.toString());
        setDepositBank(editingIncome.depositBank);
        setDate(editingIncome.date);
        setNotes(editingIncome.notes || '');
        setAlreadyIncluded(editingIncome.already_included_in_bank_balance || false);
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingIncome]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addIncome({
        source, paycheckLabel, amount: parseFloat(amount), depositBank, date, notes, 
        already_included_in_bank_balance: alreadyIncluded, 
        monthKey: date.slice(0, 7)
      });
      onClose();
    } catch (error) {
      console.error('Error saving income:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/40 p-0 animate-in fade-in duration-300" onClick={onClose}>
      <div className="w-full max-w-[430px] max-h-[90dvh] bg-white dark:bg-slate-900 rounded-t-[32px] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editingIncome ? 'Edit Income' : 'Add Income'}</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><X size={20} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <form id="income-form" onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.source}</label>
              <input type="text" required placeholder="Ex: Salary, Freelance" value={source} onChange={(e) => setSource(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.amount} ($)</label>
                <input type="number" required step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.date}</label>
                <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deposit Bank</label>
              <select value={depositBank} onChange={(e) => setDepositBank(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none text-sm font-bold" required>
                <option value="">Select Bank</option>
                {accounts.map(acc => <option key={acc.id} value={acc.institution}>{acc.institution}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              <input type="checkbox" id="alreadyIncluded" checked={alreadyIncluded} onChange={(e) => setAlreadyIncluded(e.target.checked)} className="mt-0.5 h-5 w-5 rounded-md border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/20" />
              <label htmlFor="alreadyIncluded" className="flex flex-col cursor-pointer">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Already included in bank balance</span>
                <span className="text-[11px] text-slate-500 font-medium">Use this if your bank balance already includes this income.</span>
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes (Optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold min-h-[60px]" placeholder="Add details..." />
            </div>
          </form>
        </div>
        
        <div className="flex-shrink-0 p-4 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button type="submit" form="income-form" disabled={saving} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-emerald-500/25 active:scale-95 transition-all text-xs flex items-center justify-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin"/> : (editingIncome ? 'Update Income' : 'Add Income')}
          </button>
        </div>
      </div>
    </div>
  );
};
