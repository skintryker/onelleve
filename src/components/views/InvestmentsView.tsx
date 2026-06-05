'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Plus, TrendingUp } from 'lucide-react';
import Modal from '../modals/Modal';

const InvestmentsView = () => {
  const { investments, addInvestment } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [institution, setInstitution] = useState('');
  const [type, setType] = useState('Stock');
  const [contribution, setContribution] = useState('');
  const [balance, setBalance] = useState('');
  const [payrollDeduction, setPayrollDeduction] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      date: new Date().toISOString().split('T')[0],
      institution,
      accountType: type,
      contribution: parseFloat(contribution),
      currentBalance: parseFloat(balance),
      payrollDeduction,
      monthKey: new Date().toISOString().slice(0, 7)
    };
    addInvestment(data);
    setIsModalOpen(false);
    // Reset form
    setInstitution('');
    setContribution('');
    setBalance('');
    setPayrollDeduction(false);
  };

  const totalInvested = investments.reduce((acc, inv) => acc + inv.currentBalance, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Investment Portfolio</h2>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Track your Robinhood, 401k, HSA and more</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus size={20} />
          Add Investment
        </button>
      </div>

      {/* Summary Card for Portfolio */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="text-blue-100/60 text-xs font-black uppercase tracking-[0.2em] mb-2">Total Net Assets</p>
            <h3 className="text-5xl font-black tracking-tighter">${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
              <p className="text-blue-100/60 text-[10px] font-black uppercase tracking-widest mb-1">Monthly Gain</p>
              <p className="text-xl font-black text-emerald-400">+$2,450.00</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
              <p className="text-blue-100/60 text-[10px] font-black uppercase tracking-widest mb-1">Portfolio ROI</p>
              <p className="text-xl font-black text-white">+8.4%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {investments.map((inv) => (
          <div key={inv.id} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group text-slate-900 dark:text-white">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">{inv.institution}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{inv.accountType}</p>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Position</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                ${inv.currentBalance.toLocaleString()}
              </p>
              {inv.payrollDeduction && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[9px] font-black uppercase tracking-tighter text-slate-900 dark:text-white">Payroll Deduction</span>
              )}
            </div>
          </div>
        ))}
        {/* Placeholder if empty */}
        {investments.length === 0 && (
          ['Robinhood', '401k', 'HSA', 'Apple Savings'].map(label => (
            <div key={label} className="bg-slate-50 dark:bg-slate-950 p-8 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center opacity-60">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 mb-4 italic font-black text-sm">?</div>
              <h3 className="text-sm font-bold text-slate-400 mb-1">{label}</h3>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Connect Account</p>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Portfolio Investment">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest text-slate-900 dark:text-white">Institution</label>
            <select 
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none font-bold text-slate-900 dark:text-white"
              required
            >
              <option value="">Select Institution</option>
              <option value="Robinhood">Robinhood</option>
              <option value="401k">401k</option>
              <option value="HSA">HSA</option>
              <option value="Apple Savings">Apple Savings</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-slate-900 dark:text-white">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Initial Balance</label>
              <input 
                type="number" 
                required
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white font-bold"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2 text-slate-900 dark:text-white">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Investment Type</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none appearance-none font-bold text-slate-900 dark:text-white"
              >
                <option value="Stock">Stock / ETF</option>
                <option value="Savings">High-Yield Savings</option>
                <option value="Retirement">Retirement (401k/IRA)</option>
                <option value="Crypto">Crypto</option>
              </select>
            </div>
          </div>

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

          <button 
            type="submit"
            className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl transition-all"
          >
            Confirm Investment
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default InvestmentsView;
