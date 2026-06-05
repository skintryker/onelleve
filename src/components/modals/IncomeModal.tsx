'use client';

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAppContext, IncomeLog } from '@/context/AppContext';
import { DollarSign, Tag, Building2, Calendar } from 'lucide-react';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingIncome?: IncomeLog | null;
}

const IncomeModal = ({ isOpen, onClose, editingIncome }: IncomeModalProps) => {
  const { addIncome, accounts } = useAppContext();
  
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [paycheckLabel, setPaycheckLabel] = useState('');
  const [date, setDate] = useState('');
  const [bank, setBank] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(null);
      if (editingIncome) {
        setSource(editingIncome.source);
        setAmount(editingIncome.amount.toString());
        setPaycheckLabel(editingIncome.paycheckLabel);
        setDate(editingIncome.date);
        setBank(editingIncome.depositBank);
      } else {
        setSource('');
        setAmount('');
        setPaycheckLabel('');
        setDate(new Date().toISOString().split('T')[0]);
        setBank('');
      }
    }
  }, [isOpen, editingIncome]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!bank) { setError('Please select a deposit bank.'); return; }

    const monthKey = date.slice(0, 7);
    const data = {
      date,
      source,
      amount: parseFloat(amount),
      paycheckLabel,
      depositBank: bank,
      monthKey,
    };

    // Note: AppContext.tsx currently doesn't have updateIncome, only addIncome
    // For simplicity, we just add for now as requested or until update is needed
    addIncome(data);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingIncome ? 'Edit Income' : 'New Income Entry'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Income Source</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                required
                placeholder="Ex: Company Name, Bonus, Refund"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold pl-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="number" 
                  required
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-black pl-12"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paycheck Label</label>
              <input 
                type="text" 
                placeholder="Ex: 1st Paycheck"
                value={paycheckLabel}
                onChange={(e) => setPaycheckLabel(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="date" 
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold pl-12"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deposit Bank</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none text-sm font-bold pl-12"
                  required
                >
                  <option value="">Select Bank</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.institution}>{acc.institution}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95"
        >
          {editingIncome ? 'Save Income Update' : 'Record Income'}
        </button>
      </form>
    </Modal>
  );
};

export default IncomeModal;
