'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { TrendingUp, Plus, Wallet, CreditCard, Banknote, Loader2, Calendar, Percent, Clock } from 'lucide-react';
import Modal from '../modals/Modal';

const InvestmentsView = () => {
  const { investments, addInvestment } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [institution, setInstitution] = useState('');
  const [contribution, setContribution] = useState('');
  const [balance, setBalance] = useState('');
  const [payrollDeduction, setPayrollDeduction] = useState(false);

  // CD Specific State
  const [tenor, setTenor] = useState('');
  const [rate, setRate] = useState('');
  const [valueDate, setValueDate] = useState('');
  const [maturityDate, setMaturityDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        date: new Date().toISOString().split('T')[0],
        institution,
        accountType: 'Investment',
        contribution: institution === 'CD' ? (contribution ? parseFloat(contribution) : 0) : parseFloat(contribution),
        currentBalance: institution === 'CD' ? (balance ? parseFloat(balance) : 0) : parseFloat(balance),
        payrollDeduction,
        monthKey: new Date().toISOString().slice(0, 7),
        // CD fields
        ...(institution === 'CD' ? {
          tenor,
          rate: rate ? parseFloat(rate) : 0,
          value_date: valueDate || null,
          maturity_date: maturityDate || null
        } : {})
      };
      await addInvestment(data);
      setIsModalOpen(false);
      // Reset form
      setInstitution('');
      setContribution('');
      setBalance('');
      setPayrollDeduction(false);
      setTenor('');
      setRate('');
      setValueDate('');
      setMaturityDate('');
    } catch (error) {
      console.error('Error adding investment:', error);
    } finally {
      setSaving(false);
    }
  };

  const currentMonth = new Date().toISOString().slice(0, 7);
  const totalInvested = investments.reduce((acc, inv) => acc + inv.currentBalance, 0);
  
  const totalContributionsMonth = investments
    .filter(inv => inv.monthKey === currentMonth)
    .reduce((acc, inv) => acc + inv.contribution, 0);

  const payrollContributions = investments
    .filter(inv => inv.monthKey === currentMonth && inv.payrollDeduction)
    .reduce((acc, inv) => acc + inv.contribution, 0);

  const manualContributions = investments
    .filter(inv => inv.monthKey === currentMonth && !inv.payrollDeduction)
    .reduce((acc, inv) => acc + inv.contribution, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-slate-900 dark:text-white">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight">Investment Portfolio</h2>
          <p className="text-sm text-slate-500 font-medium tracking-tight italic">Track your manually entered balances and contributions</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-xs uppercase tracking-widest"
        >
          <Plus size={16} />
          Add Investment
        </button>
      </div>

      {/* Manual Tracking Summary Card */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 dark:bg-blue-900/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-1">
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Total Investment Balance</p>
            <h3 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
              ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none bg-slate-50 dark:bg-slate-800/50 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 min-w-[180px]">
              <div className="flex items-center gap-2 mb-1">
                 <Wallet size={14} className="text-blue-500" />
                 <p className="text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-widest">Contrib. This Month</p>
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                ${totalContributionsMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="flex-1 md:flex-none bg-slate-50 dark:bg-slate-800/50 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 min-w-[180px]">
              <div className="flex items-center gap-2 mb-1">
                 <CreditCard size={14} className="text-emerald-500" />
                 <p className="text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-widest">Payroll Deduction</p>
              </div>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                ${payrollContributions.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="flex-1 md:flex-none bg-slate-50 dark:bg-slate-800/50 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 min-w-[180px]">
              <div className="flex items-center gap-2 mb-1">
                 <Banknote size={14} className="text-indigo-500" />
                 <p className="text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-widest">Manual Contrib.</p>
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                ${manualContributions.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Investment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {investments.map((inv) => (
          <div key={inv.id} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group text-slate-900 dark:text-white">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-all">
                <TrendingUp size={28} strokeWidth={2.5} />
              </div>
              {totalInvested > 0 && (
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Allocation</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {((inv.currentBalance / totalInvested) * 100).toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
            
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{inv.institution}</p>
              <h3 className="text-2xl font-black tracking-tight mb-1">
                ${inv.currentBalance.toLocaleString()}
              </h3>
              <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 italic uppercase tracking-widest leading-none mb-2">{inv.accountType}</p>
                
                {/* CD Info if available */}
                {inv.institution === 'CD' && inv.rate && (
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      <Percent size={10} />
                      <span>{inv.rate}% APY</span>
                    </div>
                    {inv.maturity_date && (
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        <Calendar size={10} />
                        <span>Matures: {inv.maturity_date}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {inv.payrollDeduction && (
                  <span className="inline-block mt-3 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-[8px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/30">Payroll</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {/* Placeholder States if empty */}
        {investments.length === 0 && (
          ['Stocks/ETF', '401k', 'Roth IRA', 'CD'].map(label => (
            <div key={label} className="bg-slate-50/50 dark:bg-slate-950 p-8 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center opacity-60">
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 mb-4 italic font-black text-lg">?</div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</h3>
              <p className="text-[10px] font-bold text-slate-400 italic">Track Manually</p>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Portfolio Investment">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Investment Type</label>
            <select 
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none font-bold text-slate-900 dark:text-white text-sm"
              required
            >
              <option value="">Select Type</option>
              <option value="Stocks/ETF">Stocks/ETF</option>
              <option value="401k">401k</option>
              <option value="Roth IRA">Roth IRA</option>
              <option value="HSA">HSA</option>
              <option value="HYSA">HYSA</option>
              <option value="CD">CD</option>
            </select>
          </div>

          {/* CD Specific Fields */}
          {institution === 'CD' && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Clock size={12} /> Tenor
                </label>
                <input 
                  type="text" 
                  value={tenor}
                  onChange={(e) => setTenor(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white font-bold text-sm"
                  placeholder="Ex: 12 Months"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Percent size={12} /> Rate (%)
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white font-bold text-sm"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Calendar size={12} /> Value Date
                </label>
                <input 
                  type="date" 
                  value={valueDate}
                  onChange={(e) => setValueDate(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white font-bold text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Calendar size={12} /> Maturity Date
                </label>
                <input 
                  type="date" 
                  value={maturityDate}
                  onChange={(e) => setMaturityDate(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white font-bold text-sm"
                />
              </div>
            </div>
          )}
          
          {institution !== 'CD' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Balance</label>
                <input 
                  type="number" 
                  required
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white font-bold text-sm"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Contribution</label>
                <input 
                  type="number" 
                  required
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white font-bold text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
             <input 
              type="checkbox" 
              id="payrollDeduction"
              checked={payrollDeduction}
              onChange={(e) => setPayrollDeduction(e.target.checked)}
              className="w-5 h-5 rounded-lg accent-blue-600"
             />
             <label htmlFor="payrollDeduction" className="text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
               Payroll Deduction? (Directly from paycheck)
             </label>
          </div>

          <div className="pt-2 flex justify-center">
            <button 
              type="submit"
              disabled={saving}
              className="w-full sm:max-w-[280px] py-3.5 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/25 active:scale-95 transition-all text-xs flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : 'Confirm Investment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InvestmentsView;
