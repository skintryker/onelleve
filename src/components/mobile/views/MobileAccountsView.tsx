'use client';

import React from 'react';
import { useAppContext, Account } from '@/context/AppContext';
import { Building2, Plus, Edit2, Trash2 } from 'lucide-react';
import { translations, Language } from '@/utils/translations';

interface MobileAccountsViewProps {
  autoOpenModal?: boolean;
  onModalClose?: () => void;
  onEditAccount: (account: Account) => void;
  onAddAccount: () => void;
}

const MobileAccountsView = ({ autoOpenModal, onModalClose, onEditAccount, onAddAccount }: MobileAccountsViewProps) => {
  const { accounts, deleteAccount, settings, maskValue } = useAppContext();
  const currentLang = (settings?.language as Language) || 'en';
  const t = translations[currentLang];

  // Handle auto-open from Quick Add
  React.useEffect(() => {
    if (autoOpenModal) {
      onAddAccount();
      if (onModalClose) onModalClose();
    }
  }, [autoOpenModal]);

  const handleDelete = (id: string) => {
    if (confirm(t.areYouSureDeleteAccount)) {
      deleteAccount(id);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-2 px-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t.accounts}</h2>
        <button 
          onClick={onAddAccount}
          className="p-2 bg-blue-600 text-white rounded-xl active:scale-95 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
                  <Building2 size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{account.institution}</h3>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEditAccount(account)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 rounded-xl transition-colors">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(account.id)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-600 rounded-xl transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Current Balance</p>
              <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                ${maskValue(account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
              </p>
            </div>
          </div>
        ))}

        {accounts.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
            <Building2 size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-500">No accounts found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAccountsView;
