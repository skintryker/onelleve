'use client';

import React, { useState } from 'react';
import { useAppContext, Card } from '@/context/AppContext';
import { Plus, Edit2, Trash2, Wifi } from 'lucide-react';
import Modal from '../modals/Modal';

const CardsView = () => {
  const { cards, deleteCard, addCard, editCard } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  // Defensive check to ensure cards is always an array
  const safeCards = Array.isArray(cards) ? cards : [];

  // Form State
  const [cardName, setCardName] = useState('');
  const [lastFour, setLastFour] = useState('');
  const [expiry, setExpiry] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [color, setColor] = useState('bg-slate-900');

  const handleOpenModal = (card: Card | null = null) => {
    if (card) {
      setEditingCard(card);
      setCardName(card.cardName);
      setLastFour(card.lastFour || '');
      setExpiry(card.expiry || '');
      setCreditLimit(card.creditLimit.toString());
      setColor(card.color || 'bg-slate-900');
    } else {
      setEditingCard(null);
      setCardName('');
      setLastFour('');
      setExpiry('');
      setCreditLimit('');
      setColor('bg-blue-600');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cardData = {
      cardName,
      type: 'Credit' as const,
      lastFour,
      expiry,
      creditLimit: parseFloat(creditLimit),
      currentBalance: editingCard ? editingCard.currentBalance : 0,
      totalCharges: editingCard ? editingCard.totalCharges : 0,
      totalPayments: editingCard ? editingCard.totalPayments : 0,
      availableCredit: editingCard ? (parseFloat(creditLimit) - editingCard.currentBalance) : parseFloat(creditLimit),
      utilization: editingCard ? (editingCard.currentBalance / parseFloat(creditLimit)) * 100 : 0,
      color
    };

    if (editingCard) {
      editCard(editingCard.id, cardData);
    } else {
      addCard(cardData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      deleteCard(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-slate-900 dark:text-white">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Your Cards</h2>
          <p className="text-sm text-slate-500 font-medium">Manage your physical and virtual cards</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus size={20} />
          Add Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {safeCards.map((card) => (
          <div key={card.id} className="group relative">
            <div className="absolute -top-3 -right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
              <button 
                onClick={() => handleOpenModal(card)}
                className="p-2 bg-white dark:bg-slate-800 shadow-xl rounded-full text-blue-600 border border-slate-100 dark:border-slate-700 hover:scale-110 transition-all"
              >
                <Edit2 size={14} />
              </button>
              <button 
                onClick={() => handleDelete(card.id)}
                className="p-2 bg-white dark:bg-slate-800 shadow-xl rounded-full text-rose-600 border border-slate-100 dark:border-slate-700 hover:scale-110 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className={`w-full aspect-[1.6/1] ${card.color} rounded-[32px] p-8 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group-hover:-translate-y-2 transition-transform duration-500`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Platinum</p>
                  <p className="text-sm font-bold">{card.type} Card</p>
                </div>
                <Wifi size={24} className="opacity-60 rotate-90" />
              </div>

              <div className="space-y-4 relative z-10">
                <p className="text-2xl font-mono tracking-[0.2em] font-medium">•••• •••• •••• {card.lastFour || '0000'}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Card Holder</p>
                    <p className="text-sm font-bold uppercase tracking-wider">{card.cardName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Expires</p>
                    <p className="text-sm font-bold">{card.expiry || 'MM/YY'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 px-4 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Usage</p>
                <p className="text-lg font-black">
                  ${card.currentBalance.toLocaleString()} 
                  <span className="text-slate-400 font-medium text-sm ml-1">/ ${card.creditLimit.toLocaleString()}</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-blue-600/20 border-t-blue-600 flex items-center justify-center">
                <span className="text-[10px] font-black">{card.creditLimit > 0 ? Math.round((card.currentBalance / card.creditLimit) * 100) : 0}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCard ? 'Edit Card' : 'Add New Card'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Card Name (e.g. Amex Platinum)</label>
            <input 
              type="text" 
              required
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Last 4 Digits</label>
              <input 
                type="text" 
                maxLength={4}
                required
                value={lastFour}
                onChange={(e) => setLastFour(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Expiry (MM/YY)</label>
              <input 
                type="text" 
                placeholder="12/25"
                required
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Credit Limit ($)</label>
            <input 
              type="number" 
              required
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Card Theme</label>
            <div className="flex gap-3">
              {['bg-slate-900', 'bg-blue-600', 'bg-emerald-600', 'bg-indigo-600'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full ${c} border-4 ${color === c ? 'border-blue-200 dark:border-blue-900' : 'border-transparent'}`}
                />
              ))}
            </div>
          </div>
          <button 
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25"
          >
            {editingCard ? 'Update Card' : 'Create Card'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default CardsView;
