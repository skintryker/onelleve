'use client';

import React, { useState } from 'react';
import { useAppContext, Account } from '@/context/AppContext';
import { Building2, Plus, Edit2, Trash2 } from 'lucide-react';
import AccountModal from '../modals/AccountModal';

const AccountsView = () => {
  const { accounts, deleteAccount } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      deleteAccount(id);
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bank Accounts</h2>
          <p className="text-sm text-slate-500 font-medium">Manage your connected financial institutions</p>
        </div>
        <button 
          onClick={() => { setEditingAccount(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus size={20} />
          Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all group relative">
            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleEdit(account)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => handleDelete(account.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
              <Building2 size={28} />
            </div>
            
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">{account.institution}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{account.type} Account</p>
            
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Balance</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <AccountModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingAccount(null); }} 
        editingAccount={editingAccount}
      />
    </div>
  );
};

export default AccountsView;
