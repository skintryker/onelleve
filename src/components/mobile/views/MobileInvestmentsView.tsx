'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext, Investment } from '@/context/AppContext';
import { TrendingUp, Edit2, Trash2, Plus, Calendar, Percent, Loader2 } from 'lucide-react';
import { translations, Language, formatDate } from '@/utils/translations';
import Modal from '@/components/modals/Modal';

interface MobileInvestmentsViewProps {
  autoOpenModal?: boolean;
  onModalClose?: () => void;
}

export default function MobileInvestmentsView({ autoOpenModal, onModalClose }: MobileInvestmentsViewProps) {

  const { activeInvestments, addInvestment, editInvestment, deleteInvestment, accounts, settings, maskValue } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

  const currentLang = (settings?.language as Language) || 'en';
  const dateFormat = settings?.date_format || 'MM/DD/YYYY';
  const t = translations[currentLang];

  // Form State
  const [institution, setInstitution] = useState('');
  const [contribution, setContribution] = useState('');
  const [balance, setBalance] = useState('');
  const [payrollDeduction, setPayrollDeduction] = useState(false);
  const [fromBank, setFromBank] = useState('');
  const [tenor, setTenor] = useState('');
  const [rate, setRate] = useState('');
  const [valueDate, setValueDate] = useState('');
  const [maturityDate, setMaturityDate] = useState('');

  // Handle auto-open from Quick Add
  useEffect(() => {
    if (autoOpenModal) {
      handleOpenModal();
    }
  }, [autoOpenModal]);

  useEffect(() => {
    if (editingInvestment) {
      setInstitution(editingInvestment.institution);
      setContribution(editingInvestment.contribution.toString());
      setBalance(editingInvestment.currentBalance.toString());
      setPayrollDeduction(editingInvestment.payrollDeduction || false);
      setFromBank(editingInvestment.fromBank || '');
      setTenor(editingInvestment.tenor || '');
      setRate(editingInvestment.rate?.toString() || '');
      setValueDate(editingInvestment.value_date || '');
      setMaturityDate(editingInvestment.maturity_date || '');
    } else {
      setInstitution('');
      setContribution('');
      setBalance('');
      setPayrollDeduction(false);
      setFromBank('');
      setTenor('');
      setRate('');
      setValueDate('');
      setMaturityDate('');
    }
  }, [editingInvestment]);

  const handleOpenModal = (inv: Investment | null = null) => {
    setEditingInvestment(inv);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (onModalClose) onModalClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        date: editingInvestment ? editingInvestment.date : new Date().toISOString().split('T')[0],
        institution,
        accountType: 'Investment',
        contribution: parseFloat(contribution) || 0,
        currentBalance: parseFloat(balance) || 0,
        payrollDeduction,
        fromBank: !payrollDeduction ? fromBank : undefined,
        monthKey: editingInvestment ? editingInvestment.monthKey : new Date().toISOString().slice(0, 7),
        ...(institution === 'CD' ? {
          tenor,
          rate: rate ? parseFloat(rate) : 0,
          value_date: valueDate || null,
          maturity_date: maturityDate || null
        } : {})
      };

      if (editingInvestment) {
        await editInvestment(editingInvestment.id, data);
      } else {
        await addInvestment(data);
      }
      
      handleCloseModal();
      setEditingInvestment(null);
    } catch (error) {
      console.error('Error saving investment:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(currentLang === 'pt' ? 'Excluir?' : currentLang === 'es' ? '¿Eliminar?' : 'Delete?')) {
      deleteInvestment(id);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-2 px-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t.investments}</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="p-2 bg-blue-600 text-white rounded-xl active:scale-95 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
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
                <button onClick={() => handleOpenModal(inv)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 rounded-xl transition-colors">
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingInvestment ? t.editInvestment : t.newInvestment}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.institution}</label>
            <select 
              required
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-bold text-slate-900 dark:text-white"
            >
              <option value="">{t.selectInstitution}</option>
              <option value="CD">Certificate of Deposit (CD)</option>
              <option value="Stocks">Stocks / Brokerage</option>
              <option value="Crypto">Crypto</option>
              <option value="Retirement">Retirement (401k/IRA)</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.contribution} ($)</label>
              <input 
                type="number" step="0.01" required
                value={contribution}
                onChange={(e) => setContribution(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-bold text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.currentBalance} ($)</label>
              <input 
                type="number" step="0.01" required
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white">{t.payrollDeduction}</span>
              <input 
                type="checkbox"
                checked={payrollDeduction}
                onChange={(e) => setPayrollDeduction(e.target.checked)}
                className="w-5 h-5 rounded-lg border-slate-300 text-blue-600"
              />
            </div>

            {!payrollDeduction && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.sourceBank}</label>
                <select 
                  required
                  value={fromBank}
                  onChange={(e) => setFromBank(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-bold text-slate-900 dark:text-white"
                >
                  <option value="">{t.selectBank}</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.institution}>{acc.institution}</option>)}
                </select>
              </div>
            )}
          </div>

          {institution === 'CD' && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.tenor}</label>
                    <input type="text" placeholder="e.g. 12 Months" value={tenor} onChange={(e)=>setTenor(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.rate} (%)</label>
                    <input type="number" step="0.01" placeholder="e.g. 5.25" value={rate} onChange={(e)=>setRate(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-bold" />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.valueDate}</label>
                    <input type="date" value={valueDate} onChange={(e)=>setValueDate(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.maturityDate}</label>
                    <input type="date" value={maturityDate} onChange={(e)=>setMaturityDate(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-bold" />
                  </div>
               </div>
            </div>
          )}

          <div className="pt-2">
            <button 
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/25 active:scale-95 transition-all text-xs flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : (editingInvestment ? t.updateInvestment : t.addInvestment)}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
