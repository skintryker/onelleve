'use client';

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAppContext, Account } from '@/context/AppContext';
import { Building2, Wallet } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAccount?: Account | null;
}

const AccountModal = ({ isOpen, onClose, editingAccount }: AccountModalProps) => {
  const { addAccount, editAccount } = useAppContext();
  const [institution, setInstitution] = useState('');
  const [type, setType] = useState('Checking');
  const [balance, setBalance] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingAccount) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setInstitution(editingAccount.institution);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setType(editingAccount.type);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setBalance(editingAccount.balance.toString());
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setInstitution('');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setType('Checking');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setBalance('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingAccount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      institution,
      type,
      balance: parseFloat(balance)
    };

    if (editingAccount) {
      editAccount(editingAccount.id, data);
    } else {
      addAccount(data);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingAccount ? 'Edit Bank Account' : 'Add New Bank Account'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest text-slate-900 dark:text-white">Bank / Institution</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                required
                placeholder="Ex: Chase Bank, PayPal"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest text-slate-900 dark:text-white">Account Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['Checking', 'Savings'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-3 rounded-xl border-2 transition-all font-bold text-xs ${type === t ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-transparent bg-slate-50 dark:bg-slate-950 text-slate-500'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest text-slate-900 dark:text-white">Current Balance ($)</label>
            <div className="relative">
              <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="number" 
                required
                step="0.01"
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
        >
          {editingAccount ? 'Update Account' : 'Connect Account'}
        </button>
      </form>
    </Modal>
  );
};

export default AccountModal;
