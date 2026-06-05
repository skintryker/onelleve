'use client';

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAppContext, ExpenseLog, TransactionType, PaymentChannel, ExpenseCategory } from '@/context/AppContext';
import { DollarSign, Tag } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: ExpenseLog | null;
}

const categories: ExpenseCategory[] = [
  'Housing', 'Groceries', 'Dining', 'Leisure', 'Gifts', 'Travel', 'Fixed Memberships', 'Automatic Debit', 'Health', 'Transport', 'Other'
];

const transactionTypes: TransactionType[] = [
  'Purchase', 'Card Payment', 'Auto Debit', 'Manual Investment', 'Other'
];

const paymentChannels: PaymentChannel[] = [
  'Bank', 'Credit Card', 'Auto Debit', 'Other'
];

const TransactionModal = ({ isOpen, onClose, editingTransaction }: TransactionModalProps) => {
  const { addExpense, updateExpense, accounts, cards } = useAppContext();
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Other');
  const [date, setDate] = useState('');
  const [type, setType] = useState<TransactionType>('Purchase');
  const [channel, setChannel] = useState<PaymentChannel>('Bank');
  const [bank, setBank] = useState('');
  const [card, setCard] = useState('');
  const [status, setStatus] = useState<'Paid' | 'Pending' | 'Planned'>('Paid');
  const [carryToNext, setCarryToNext] = useState(false);

  // Sync state with editing item safely
  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setName(editingTransaction.description);
        setAmount(Math.abs(editingTransaction.amount).toString());
        setCategory(editingTransaction.category);
        setDate(editingTransaction.date);
        setType(editingTransaction.transactionType);
        setChannel(editingTransaction.paymentChannel);
        setBank(editingTransaction.bank || '');
        setCard(editingTransaction.creditCard || '');
        setStatus(editingTransaction.status);
        setCarryToNext(editingTransaction.carryToNextPaycheck);
      } else {
        setName('');
        setAmount('');
        setCategory('Other');
        setDate(new Date().toISOString().split('T')[0]);
        setType('Purchase');
        setChannel('Bank');
        setBank(accounts[0]?.institution || '');
        setCard(cards[0]?.cardName || '');
        setStatus('Paid');
        setCarryToNext(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingTransaction, accounts, cards]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const monthKey = date.slice(0, 7);
    const data = {
      date,
      description: name,
      amount: parseFloat(amount),
      category,
      transactionType: type,
      paymentChannel: channel,
      bank: (channel === 'Bank' || channel === 'Auto Debit' || type === 'Card Payment') ? bank : undefined,
      creditCard: (channel === 'Credit Card' || type === 'Card Payment') ? card : undefined,
      status,
      amountPaid: status === 'Paid' ? parseFloat(amount) : 0,
      carryToNextPaycheck: carryToNext,
      monthKey,
    };

    if (editingTransaction) {
      updateExpense(editingTransaction.id, data);
    } else {
      addExpense(data);
    }
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingTransaction ? 'Edit Log' : 'New Expense Log'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {transactionTypes.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${type === t ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-950 text-slate-500'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                required
                placeholder="Ex: Weekly Groceries"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-slate-900 dark:text-white">
            <div className="space-y-2 text-slate-900 dark:text-white">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount ($)</label>
              <div className="relative text-slate-900 dark:text-white">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="number" 
                  required
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-black"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none text-sm font-bold"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Channel</label>
              <select 
                value={channel}
                onChange={(e) => setChannel(e.target.value as PaymentChannel)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none text-sm font-bold"
              >
                {paymentChannels.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
               <select 
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Paid' | 'Pending' | 'Planned')}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none text-sm font-bold"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Planned">Planned</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(channel === 'Bank' || channel === 'Auto Debit' || type === 'Card Payment') && (
               <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Source Bank</label>
                <select 
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none text-sm font-bold border-l-4 border-l-blue-500"
                >
                  {accounts.map(b => <option key={b.id} value={b.institution}>{b.institution}</option>)}
                </select>
              </div>
            )}
            {(channel === 'Credit Card' || type === 'Card Payment') && (
               <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Card</label>
                <select 
                  value={card}
                  onChange={(e) => setCard(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none text-sm font-bold border-l-4 border-l-emerald-500"
                >
                  {cards.map(c => <option key={c.id} value={c.cardName}>{c.cardName}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
           <input 
            type="checkbox" 
            id="carryForward"
            checked={carryToNext}
            onChange={(e) => setCarryToNext(e.target.checked)}
            className="w-5 h-5 rounded-lg accent-blue-600"
           />
           <label htmlFor="carryForward" className="text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
             Carry to next paycheck?
           </label>
        </div>

        <button 
          type="submit"
          className={`w-full py-5 rounded-[24px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
            type === 'Card Payment' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {editingTransaction ? 'Save Log Update' : 'Record Transaction'}
        </button>
      </form>
    </Modal>
  );
};

export default TransactionModal;
