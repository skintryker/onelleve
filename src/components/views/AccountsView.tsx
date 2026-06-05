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
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Bank Accounts</h2>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Manage your connected financial institutions</p>
        </div>
        <button 
          onClick={() => { setEditingAccount(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-sm"
        >
          <Plus size={18} />
          Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group relative text-slate-900 dark:text-white">
            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleEdit(account)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
              >
                <Edit2 size={14} />
              </button>
              <button 
                onClick={() => handleDelete(account.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex justify-between items-start mb-6">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-all">
                <Building2 size={28} strokeWidth={2.5} />
              </div>
            </div>
            
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{account.institution}</p>
              <h3 className="text-3xl font-black tracking-tighter mb-1">
                ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 mt-2 italic uppercase tracking-widest leading-none border-t border-slate-100 dark:border-slate-800 pt-3 inline-block w-full">{account.type} Account</p>
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
