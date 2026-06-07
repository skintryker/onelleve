'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { TrendingUp, Plus, Wallet, CreditCard, Banknote, Loader2, Calendar, Percent, Clock } from 'lucide-react';
import Modal from '../modals/Modal';
import { translations, Language, formatDate } from '@/utils/translations';

const InvestmentsView = () => {
  const { investments, addInvestment, accounts, settings } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [institution, setInstitution] = useState('');
  const [contribution, setContribution] = useState('');
  const [balance, setBalance] = useState('');
  const [payrollDeduction, setPayrollDeduction] = useState(false);
  const [fromBank, setFromBank] = useState('');

  // CD Specific State
  const [tenor, setTenor] = useState('');
  const [rate, setRate] = useState('');
  const [valueDate, setValueDate] = useState('');
  const [maturityDate, setMaturityDate] = useState('');

  const currentLang = (settings?.language as Language) || 'en';
  const dateFormat = settings?.date_format || 'MM/DD/YYYY';
  const t = translations[currentLang];

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
        fromBank: !payrollDeduction ? fromBank : undefined,
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
      setFromBank('');
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
          <h2 className="text-xl font-black uppercase tracking-tight">{t.investments}</h2>
          <p className="text-sm text-slate-500 font-medium tracking-tight italic">
              {currentLang === 'pt' ? 'Acompanhe seus saldos e contribuições inseridos manualmente' : currentLang === 'es' ? 'Siga sus saldos y contribuciones ingresados manualmente' : 'Track your manually entered balances and contributions'}
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-xs uppercase tracking-widest"
        >
          <Plus size={16} />
          {currentLang === 'pt' ? 'Adicionar Investimento' : currentLang === 'es' ? 'Agregar Inversión' : 'Add Investment'}
        </button>
      </div>

      {/* Manual Tracking Summary Card */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 dark:bg-blue-900/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-1">
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{currentLang === 'pt' ? 'Saldo Total de Investimento' : currentLang === 'es' ? 'Saldo Total de Inversión' : 'Total Investment Balance'}</p>
            <h3 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
              ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none bg-slate-50 dark:bg-slate-800/50 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 min-w-[180px]">
              <div className="flex items-center gap-2 mb-1">
                 <Wallet size={14} className="text-blue-500" />
                 <p className="text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-widest">{currentLang === 'pt' ? 'Contr. Este Mês' : currentLang === 'es' ? 'Contr. Este Mes' : 'Contrib. This Month'}</p>
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                ${totalContributionsMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="flex-1 md:flex-none bg-slate-50 dark:bg-slate-800/50 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 min-w-[180px]">
              <div className="flex items-center gap-2 mb-1">
                 <CreditCard size={14} className="text-emerald-500" />
                 <p className="text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-widest">{t.payrollInvestments}</p>
              </div>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                ${payrollContributions.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="flex-1 md:flex-none bg-slate-50 dark:bg-slate-800/50 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 min-w-[180px]">
              <div className="flex items-center gap-2 mb-1">
                 <Banknote size={14} className="text-indigo-500" />
                 <p className="text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-widest">{t.manualInvestments}</p>
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
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{currentLang === 'pt' ? 'Alocação' : currentLang === 'es' ? 'Asignación' : 'Allocation'}</p>
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
                        <span>{currentLang === 'pt' ? 'Vencimento' : currentLang === 'es' ? 'Vencimiento' : 'Matures'}: {formatDate(inv.maturity_date, dateFormat)}</span>
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
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentLang === 'pt' ? 'Novo Investimento de Portfólio' : currentLang === 'es' ? 'Nueva Inversión de Portafolio' : 'New Portfolio Investment'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{currentLang === 'pt' ? 'Tipo de Investimento' : currentLang === 'es' ? 'Tipo de Inversión' : 'Investment Type'}</label>
            <select 
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none font-bold text-slate-900 dark:text-white text-sm"
              required
            >
              <option value="">{currentLang === 'pt' ? 'Selecionar Tipo' : currentLang === 'es' ? 'Seleccionar Tipo' : 'Select Type'}</option>
              <option value="Stocks/ETF">Stocks/ETF</option>
              <option value="401k">401k</option>
              <option value="Roth IRA">Roth IRA</option>
              <option value="HSA">HSA</option>
              <option value="HYSA">HYSA</option>
              <option value="CD">CD</option>
            </select>
          </div>
...
          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
             <input 
              type="checkbox" 
              id="payrollDeduction"
              checked={payrollDeduction}
              onChange={(e) => setPayrollDeduction(e.target.checked)}
              className="w-5 h-5 rounded-lg accent-blue-600"
             />
             <label htmlFor="payrollDeduction" className="text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
               {currentLang === 'pt' ? 'Dedução em Folha? (Direto do salário)' : currentLang === 'es' ? '¿Deducción de Nómina? (Directo del salario)' : 'Payroll Deduction? (Directly from paycheck)'}
             </label>
          </div>

          {!payrollDeduction && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{currentLang === 'pt' ? 'Conta Bancária de Origem' : currentLang === 'es' ? 'Cuenta Bancaria de Origen' : 'Source Bank Account'}</label>
              <select 
                value={fromBank}
                onChange={(e) => setFromBank(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none font-bold text-slate-900 dark:text-white text-sm"
                required={!payrollDeduction}
              >
                <option value="">{currentLang === 'pt' ? 'Selecionar Conta Bancária' : currentLang === 'es' ? 'Seleccionar Cuenta Bancaria' : 'Select Bank Account'}</option>
                {accounts.map(acc => <option key={acc.id} value={acc.institution}>{acc.institution}</option>)}
              </select>
            </div>
          )}

          <div className="pt-2 flex justify-center">
            <button 
              type="submit"
              disabled={saving}
              className="w-full sm:max-w-[280px] py-3.5 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/25 active:scale-95 transition-all text-xs flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : (currentLang === 'pt' ? 'Confirmar Investimento' : currentLang === 'es' ? 'Confirmar Inversión' : 'Confirm Investment')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InvestmentsView;
