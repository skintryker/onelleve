'use client';

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAppContext, ExpenseLog, TransactionType, PaymentChannel, ExpenseCategory } from '@/context/AppContext';
import { DollarSign, Tag, AlertCircle } from 'lucide-react';
import { Language, translations } from '@/utils/translations';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: ExpenseLog | null;
}

const categories: ExpenseCategory[] = [
  'Housing', 'Groceries', 'Dining', 'Leisure', 'Gifts', 'Travel', 'Memberships', 'Autopay', 'Utility', 'Credit Card', 'Health', 'Transport', 'Other'
];

const transactionTypes: TransactionType[] = [
  'Purchase', 'Payment', 'Autopay', 'Other'
];

const paymentChannels: PaymentChannel[] = [
  'Bank', 'Credit Card', 'Autopay', 'Venmo', 'Zelle', 'Cash', 'PayPal'
];

const TransactionModal = ({ isOpen, onClose, editingTransaction }: TransactionModalProps) => {
  const { addExpense, updateExpense, accounts, cards, settings } = useAppContext();
  const currentLang = (settings?.language as Language) || 'en';
  const t = translations[currentLang];
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory | ''>('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<TransactionType | ''>('');
  const [channel, setChannel] = useState<PaymentChannel | ''>('');
  const [bank, setBank] = useState('');
  const [card, setCard] = useState('');
  const [paymentPlan, setPaymentPlan] = useState<'One-time' | 'Installment'>('One-time');
  const [currentInstallment, setCurrentInstallment] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Sync state with editing item safely
  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (editingTransaction) {
        setName(editingTransaction.description);
        setAmount(Math.abs(editingTransaction.amount).toString());
        setCategory(editingTransaction.category);
        setDate(editingTransaction.date);
        setType(editingTransaction.transactionType);
        setChannel(editingTransaction.paymentChannel);
        setBank(editingTransaction.bank || '');
        setCard(editingTransaction.creditCard || '');
        setPaymentPlan(editingTransaction.paymentPlan || 'One-time');
        setCurrentInstallment(editingTransaction.currentInstallment?.toString() || '');
        setTotalInstallments(editingTransaction.totalInstallments?.toString() || '');
      } else {
        setName('');
        setAmount('');
        setCategory('');
        setDate(new Date().toISOString().split('T')[0]);
        setType('');
        setChannel('');
        setBank(''); 
        setCard(''); 
        setPaymentPlan('One-time');
        setCurrentInstallment('');
        setTotalInstallments('');
      }
    }
  }, [isOpen, editingTransaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validations
    if (!type) { setError('Please select transaction type.'); return; }
    if (!category) { setError('Please select a category.'); return; }
    if (!channel) { setError('Please select payment channel.'); return; }
    
    // Payment Type Specific Validations
    if (type === 'Payment' || channel === 'Bank' || channel === 'Autopay') {
      if (!bank) { setError('Please select source bank.'); return; }
    }
    
    if (type === 'Payment' || channel === 'Credit Card') {
      if (!card) { setError('Please select target card.'); return; }
    }

    if (paymentPlan === 'Installment') {
      if (!currentInstallment || !totalInstallments) {
        setError('Please enter installment details.');
        return;
      }
      if (parseInt(currentInstallment) > parseInt(totalInstallments)) {
        setError('Current installment cannot exceed total installments.');
        return;
      }
      if (parseInt(totalInstallments) <= 1) {
        setError('Total installments must be greater than 1.');
        return;
      }
    }

    const monthKey = date.slice(0, 7);
    const data = {
      date,
      description: name,
      amount: parseFloat(amount),
      category: category as ExpenseCategory,
      transactionType: type as TransactionType,
      paymentChannel: channel as PaymentChannel,
      bank: (channel === 'Bank' || channel === 'Autopay' || type === 'Payment') ? bank : undefined,
      creditCard: (channel === 'Credit Card' || type === 'Payment') ? card : undefined,
      paymentPlan,
      currentInstallment: paymentPlan === 'Installment' ? parseInt(currentInstallment) : undefined,
      totalInstallments: paymentPlan === 'Installment' ? parseInt(totalInstallments) : undefined,
      status: 'Paid' as const,
      amountPaid: parseFloat(amount),
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
      title={editingTransaction ? t.editCard.replace('Card', 'Log') : t.addTransaction}
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-slate-900 dark:text-white">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100 animate-in shake duration-300">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.type}</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {transactionTypes.map(trType => (
              <button
                key={trType}
                type="button"
                onClick={() => setType(trType)}
                className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${type === trType ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-950 text-slate-500'}`}
              >
                {trType}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{currentLang === 'pt' ? 'Descrição' : currentLang === 'es' ? 'Descripción' : 'Description'}</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                required
                placeholder={currentLang === 'pt' ? 'Ex: Compras Semanais' : currentLang === 'es' ? 'Ej: Compras Semanales' : 'Ex: Weekly Groceries'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold pl-12 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.amount} ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="number" 
                  required
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-black pl-12 text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.category}</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none font-bold text-slate-900 dark:text-white text-sm"
                required
              >
                <option value="" disabled>{currentLang === 'pt' ? 'Selecionar Categoria' : currentLang === 'es' ? 'Seleccionar Categoría' : 'Select Category'}</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{currentLang === 'pt' ? 'Canal de Pagamento' : currentLang === 'es' ? 'Canal de Pago' : 'Payment Channel'}</label>
              <select 
                value={channel}
                onChange={(e) => setChannel(e.target.value as PaymentChannel)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none font-bold text-slate-900 dark:text-white text-sm"
                required
              >
                <option value="" disabled>{currentLang === 'pt' ? 'Selecionar Canal' : currentLang === 'es' ? 'Seleccionar Canal' : 'Select Channel'}</option>
                {paymentChannels.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.date}</label>
              <input 
                type="date" 
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{currentLang === 'pt' ? 'Plano de Pagamento' : currentLang === 'es' ? 'Plan de Pago' : 'Payment Plan'}</label>
               <div className="grid grid-cols-2 gap-2">
                 {['One-time', 'Installment'].map(plan => (
                   <button
                    key={plan}
                    type="button"
                    onClick={() => setPaymentPlan(plan as 'One-time' | 'Installment')}
                    className={`py-3 rounded-xl text-xs font-bold transition-all ${paymentPlan === plan ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'bg-slate-50 dark:bg-slate-950 text-slate-500'}`}
                   >
                     {plan}
                   </button>
                 ))}
               </div>
            </div>

            {paymentPlan === 'Installment' && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{currentLang === 'pt' ? 'Parcela Atual' : currentLang === 'es' ? 'Cuota Actual' : 'Current Installment'}</label>
                  <input 
                    type="number" 
                    min="1"
                    placeholder="1"
                    value={currentInstallment}
                    onChange={(e) => setCurrentInstallment(e.target.value)}
                    className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{currentLang === 'pt' ? 'Total de Parcelas' : currentLang === 'es' ? 'Total de Cuotas' : 'Total Installments'}</label>
                  <input 
                    type="number" 
                    min="2"
                    placeholder="6"
                    value={totalInstallments}
                    onChange={(e) => setTotalInstallments(e.target.value)}
                    className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(channel === 'Bank' || channel === 'Autopay' || type === 'Payment') && (
               <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.sourceBankAccount}</label>
                <select 
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none font-bold border-l-4 border-l-blue-500 text-slate-900 dark:text-white text-sm"
                >
                  <option value="">{t.selectBankAccount}</option>
                  {accounts.map(b => <option key={b.id} value={b.institution}>{b.institution}</option>)}
                  {accounts.length === 0 && <option disabled>No banks added yet</option>}
                </select>
              </div>
            )}
            {(channel === 'Credit Card' || type === 'Payment') && (
               <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Card</label>
                <select 
                  value={card}
                  onChange={(e) => setCard(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none font-bold border-l-4 border-l-emerald-500 text-slate-900 dark:text-white text-sm"
                >
                  <option value="">Select Card</option>
                  {cards.map(c => <option key={c.id} value={c.cardName}>{c.cardName}</option>)}
                  {cards.length === 0 && <option disabled>No cards added yet</option>}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 flex justify-center">
          <button 
            type="submit"
            className={`w-full sm:max-w-[280px] py-3.5 rounded-xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all text-xs flex items-center justify-center gap-2 ${
              type === 'Payment' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
            } text-white`}
          >
            {editingTransaction ? t.updateCard.replace('Card', 'Log') : t.addTransaction}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionModal;
