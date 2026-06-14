'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext, Investment } from '@/context/AppContext';
import { TrendingUp, Edit2, Trash2, Plus, Calendar, Percent, Loader2, X } from 'lucide-react';
import { translations, Language, formatDate } from '@/utils/translations';

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

  const [institution, setInstitution] = useState('');
  const [contribution, setContribution] = useState('');
  const [balance, setBalance] = useState('');
  const [payrollDeduction, setPayrollDeduction] = useState(false);
  const [fromBank, setFromBank] = useState('');
  const [tenor, setTenor] = useState('');
  const [rate, setRate] = useState('');
  const [valueDate, setValueDate] = useState('');
  const [maturityDate, setMaturityDate] = useState('');

  const resetForm = () => {
    setInstitution('');
    setContribution('');
    setBalance('');
    setPayrollDeduction(false);
    setFromBank('');
    setTenor('');
    setRate('');
    setValueDate('');
    setMaturityDate('');
  };
  
  useEffect(() => {
    if (autoOpenModal) {
      handleOpenModal();
    }
  }, [autoOpenModal]);

  const handleOpenModal = (inv: Investment | null = null) => {
    if (inv) {
      setEditingInvestment(inv);
      setInstitution(inv.institution);
      setContribution(inv.contribution.toString());
      setBalance(inv.currentBalance.toString());
      setPayrollDeduction(inv.payrollDeduction || false);
      setFromBank(inv.fromBank || '');
      setTenor(inv.tenor || '');
      setRate(inv.rate?.toString() || '');
      setValueDate(inv.value_date || '');
      setMaturityDate(inv.maturity_date || '');
    } else {
      resetForm();
      setEditingInvestment(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingInvestment(null);
    if (onModalClose) onModalClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        date: editingInvestment ? editingInvestment.date : new Date().toISOString().split('T')[0],
        institution,
        accountType: 'Investment' as const,
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
    } catch (error) {
      console.error('Error saving investment:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(t.deleteThisRecord)) {
      deleteInvestment(id);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-2 px-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t.investments}</h2>
        <button onClick={() => handleOpenModal()} className="p-2 bg-blue-600 text-white rounded-xl active:scale-95 transition-all shadow-lg shadow-blue-500/20">
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {activeInvestments.length > 0 ? (
          activeInvestments.map((inv) => (
            <div key={inv.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl shrink-0"><TrendingUp size={20} strokeWidth={2.5} /></div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{inv.institution}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{formatDate(inv.date, dateFormat)}</span>
                      {inv.tenor && (<><span className="text-[10px] text-slate-300">•</span><span className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter truncate">{inv.tenor}</span></>)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleOpenModal(inv)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 rounded-xl transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(inv.id)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.contribution}</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">${maskValue(inv.contribution.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 text-right">{t.currentBalance}</p>
                  <p className="text-lg font-black text-indigo-600 tracking-tighter text-right">${maskValue(inv.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 border-dashed">
            <TrendingUp size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No investments yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add your first investment to start tracking your portfolio.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/40 p-0 animate-in fade-in duration-300" onClick={handleCloseModal}>
          <div className="w-full max-w-[430px] max-h-[90dvh] bg-white dark:bg-slate-900 rounded-t-[32px] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editingInvestment ? t.editInvestment : t.newInvestment}</h2>
              <button onClick={handleCloseModal} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <form id="investment-form" onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.institution}</label>
                  <select required value={institution} onChange={(e) => setInstitution(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-bold text-slate-900 dark:text-white appearance-none focus:ring-2 focus:ring-blue-500/20">
                    <option value="">{t.selectType}</option>
                    <option value="Stocks/ETF">Stocks/ETF</option>
                    <option value="401k">401k</option>
                    <option value="Roth IRA">Roth IRA</option>
                    <option value="HSA">HSA</option>
                    <option value="HYSA">HYSA</option>
                    <option value="CD">CD</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.contribution} ($)</label>
                    <input type="number" step="0.01" required value={contribution} onChange={(e) => setContribution(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.currentBalance} ($)</label>
                    <input type="number" step="0.01" required value={balance} onChange={(e) => setBalance(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-bold" />
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{t.payrollDeduction}</span>
                    <input type="checkbox" checked={payrollDeduction} onChange={(e) => setPayrollDeduction(e.target.checked)} className="w-5 h-5 rounded-lg border-slate-300 text-blue-600" />
                  </div>
                  {!payrollDeduction && (
                    <div className="space-y-2 animate-in fade-in duration-300">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.sourceBank}</label>
                      <select required value={fromBank} onChange={(e) => setFromBank(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-bold">
                        <option value="">{t.selectBank}</option>
                        {accounts.map(acc => <option key={acc.id} value={acc.institution}>{acc.institution}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                {institution === 'CD' && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300">
                    {/* CD fields */}
                  </div>
                )}
              </form>
            </div>
            <div className="flex-shrink-0 p-4 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <button id="investment-form" type="submit" form="investment-form" disabled={saving} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/25 active:scale-95 transition-all text-xs flex items-center justify-center gap-2">
                {saving ? <Loader2 className="animate-spin" size={16} /> : (editingInvestment ? t.updateInvestment : t.addInvestment)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
