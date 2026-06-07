'use client';

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAppContext, IncomeLog } from '@/context/AppContext';
import { DollarSign, Tag, Building2, Calendar } from 'lucide-react';
import { Language, translations } from '@/utils/translations';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingIncome?: IncomeLog | null;
}

const IncomeModal = ({ isOpen, onClose, editingIncome }: IncomeModalProps) => {
  const { addIncome, accounts, settings } = useAppContext();
  const currentLang = (settings?.language as Language) || 'en';
  const t = translations[currentLang];

  const [source, setSource] = useState('');
  const [paycheckLabel, setPaycheckLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [depositBank, setDepositBank] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingIncome) {
        setSource(editingIncome.source);
        setPaycheckLabel(editingIncome.paycheckLabel);
        setAmount(editingIncome.amount.toString());
        setDepositBank(editingIncome.depositBank);
        setDate(editingIncome.date);
        setNotes(editingIncome.notes || '');
      } else {
        setSource('');
        setPaycheckLabel('');
        setAmount('');
        setDepositBank('');
        setDate(new Date().toISOString().split('T')[0]);
        setNotes('');
      }
    }
  }, [isOpen, editingIncome]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        source,
        paycheckLabel,
        amount: parseFloat(amount),
        depositBank,
        date,
        notes,
        monthKey: date.slice(0, 7)
      };
      await addIncome(data);
      onClose();
    } catch (error) {
      console.error('Error saving income:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingIncome ? (currentLang === 'pt' ? 'Editar Renda' : currentLang === 'es' ? 'Editar Ingreso' : 'Edit Income') : (currentLang === 'pt' ? 'Adicionar Renda' : currentLang === 'es' ? 'Agregar Ingreso' : 'Add Income')}
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-slate-900 dark:text-white">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.source}</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                required
                placeholder={currentLang === 'pt' ? 'Ex: Salário, Freelance' : currentLang === 'es' ? 'Ej: Salario, Freelance' : 'Ex: Salary, Freelance'}
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold pl-12 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.amount} ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="number" 
                  required
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-black pl-12 text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.date}</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="date" 
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold pl-12 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{currentLang === 'pt' ? 'Banco de Depósito' : currentLang === 'es' ? 'Banco de Depósito' : 'Deposit Bank'}</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                value={depositBank}
                onChange={(e) => setDepositBank(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none text-sm font-bold pl-12 text-slate-900 dark:text-white"
                required
              >
                <option value="">{currentLang === 'pt' ? 'Selecionar Banco' : currentLang === 'es' ? 'Seleccionar Banco' : 'Select Bank'}</option>
                {accounts.map(acc => <option key={acc.id} value={acc.institution}>{acc.institution}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes (Optional)</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold min-h-[100px] text-slate-900 dark:text-white"
              placeholder="Add details..."
            />
          </div>
        </div>

        <div className="pt-2 flex justify-center">
          <button 
            type="submit"
            disabled={saving}
            className="w-full sm:max-w-[280px] py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-emerald-500/25 active:scale-95 transition-all text-xs flex items-center justify-center gap-2"
          >
            {editingIncome ? (currentLang === 'pt' ? 'Atualizar Renda' : currentLang === 'es' ? 'Actualizar Ingreso' : 'Update Income') : (currentLang === 'pt' ? 'Adicionar Renda' : currentLang === 'es' ? 'Agregar Ingreso' : 'Add Income')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default IncomeModal;
