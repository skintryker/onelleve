'use client';

import React, { useState } from 'react';
import { useAppContext, Card } from '@/context/AppContext';
import { Plus, Edit2, Trash2, Wifi, Calendar } from 'lucide-react';
import Modal from '../modals/Modal';

// EXACT 8 options as requested
const colorOptions = [
  { name: 'Platinum / Silver', hex: '#C0C0C0' },
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Reserve / Navy', hex: '#0B1220' },
  { name: 'Apple / White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#000000' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Green', hex: '#059669' },
  { name: 'Purple', hex: '#4F46E5' },
];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Refined gradients for better vibrancy and "Metallic" feel
const getCardGradient = (hex: string) => {
  switch (hex) {
    case '#C0C0C0': return 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)';
    case '#D4AF37': return 'linear-gradient(135deg, #fbbf24 0%, #d4af37 50%, #92400e 100%)';
    case '#0B1220': return 'linear-gradient(135deg, #1e293b 0%, #0b1220 100%)';
    case '#FFFFFF': return 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)';
    case '#000000': return 'linear-gradient(135deg, #475569 0%, #000000 100%)';
    case '#2563EB': return 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)';
    case '#059669': return 'linear-gradient(135deg, #10b981 0%, #065f46 100%)';
    case '#4F46E5': return 'linear-gradient(135deg, #6366f1 0%, #3730a3 100%)';
    default: return hex;
  }
};

const getThemeForCard = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('platinum')) return '#C0C0C0';
  if (n.includes('gold')) return '#D4AF37';
  if (n.includes('reserve') || n.includes('sapphire')) return '#0B1220';
  if (n.includes('apple')) return '#FFFFFF';
  return '#0B1220';
};

const CardsView = () => {
  const { cards, deleteCard, addCard, editCard } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  const safeCards = Array.isArray(cards) ? cards : [];

  // Form State
  const [cardName, setCardName] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [expiry, setExpiry] = useState('');
  const [selectedColor, setSelectedColor] = useState('#0B1220');
  const [annualFee, setAnnualFee] = useState('');
  const [renewalMonth, setRenewalMonth] = useState('');

  const handleOpenModal = (card: Card | null = null) => {
    if (card) {
      setEditingCard(card);
      setCardName(card.cardName);
      setDueDay(card.dueDay || '');
      setExpiry(card.expiry || '');
      setSelectedColor(card.color || getThemeForCard(card.cardName));
      setAnnualFee(card.annualFee?.toString() || '');
      setRenewalMonth(card.renewalMonth || '');
    } else {
      setEditingCard(null);
      setCardName('');
      setDueDay('');
      setExpiry('');
      setSelectedColor('#0B1220');
      setAnnualFee('');
      setRenewalMonth('');
    }
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setCardName(val);
    if (!editingCard) {
      setSelectedColor(getThemeForCard(val));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cardData = {
      cardName,
      type: 'Credit' as const,
      expiry,
      creditLimit: 0,
      currentBalance: editingCard ? editingCard.currentBalance : 0,
      totalCharges: editingCard ? editingCard.totalCharges : 0,
      totalPayments: editingCard ? editingCard.totalPayments : 0,
      availableCredit: 0,
      utilization: 0,
      color: selectedColor,
      dueDay,
      annualFee: annualFee ? parseFloat(annualFee) : 0,
      renewalMonth
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
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 text-slate-900 dark:text-white px-4">
      {/* SECTION HEADER: FIXED ALIGNMENT */}
      <div className="flex flex-row justify-between items-center">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight">Credit Cards</h2>
          <p className="text-xs text-slate-500 font-medium tracking-tight italic">Manage your statements and expiration dates</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-[10px] uppercase tracking-widest whitespace-nowrap"
        >
          <Plus size={14} />
          Add Card
        </button>
      </div>

      {/* COMPACT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {safeCards.map((card) => {
          const isLight = card.color === '#FFFFFF' || card.color === '#C0C0C0' || card.color === '#D4AF37';
          
          return (
            <div key={card.id} className="bg-white dark:bg-slate-900 p-5 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all relative group flex flex-col gap-5">
              
              <div className="flex justify-end gap-1.5">
                <button 
                  onClick={() => handleOpenModal(card)}
                  className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-slate-100 dark:border-slate-700"
                  title="Edit Card"
                >
                  <Edit2 size={11} />
                </button>
                <button 
                  onClick={() => handleDelete(card.id)}
                  className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-slate-100 dark:border-slate-700"
                  title="Delete Card"
                >
                  <Trash2 size={11} />
                </button>
              </div>

              <div 
                className={`w-full relative overflow-hidden rounded-[18px] shadow-2xl ${isLight ? 'text-slate-900 border border-slate-200' : 'text-white'}`}
                style={{ 
                  aspectRatio: '1.586 / 1',
                  background: getCardGradient(card.color || '#0B1220') 
                }}
              >
                <div className={`absolute top-0 right-0 w-40 h-40 ${isLight ? 'bg-black/5' : 'bg-white/10'} rounded-full -mr-20 -mt-20 blur-3xl`} />
                
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                    <p className={`text-[8px] font-bold uppercase tracking-tight ${isLight ? 'text-slate-500' : 'text-white/60'}`}>Credit Card</p>
                    <Wifi size={16} className={`${isLight ? 'text-slate-400' : 'text-white/50'} rotate-90`} />
                  </div>

                  <div className="py-1 flex justify-center">
                    <p className="text-lg sm:text-xl font-mono tracking-normal font-medium whitespace-nowrap overflow-hidden text-center">**** **** **** ****</p>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="max-w-[65%] space-y-0.5">
                      <p className={`text-[7px] font-medium ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Card Name</p>
                      <p className="text-xs font-semibold truncate tracking-tight uppercase">{card.cardName}</p>
                    </div>
                    <div className="text-right shrink-0 space-y-0.5">
                      <p className={`text-[7px] font-medium ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Expires</p>
                      <p className="text-xs font-semibold tracking-tight">{card.expiry || '12/28'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end px-1">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide leading-none">Outstanding</p>
                  <p className="text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                    ${card.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide leading-none">Due Day</p>
                  <p className="text-xs font-black text-blue-600 dark:text-blue-400 flex items-center gap-1.5 leading-none justify-end uppercase">
                    <Calendar size={12} strokeWidth={2.5} />
                    Day {card.dueDay || '--'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCard ? 'Edit Card Details' : 'Add New Credit Card'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-slate-900 dark:text-white">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-slate-400">Card Identification</label>
            <input 
              type="text" 
              required
              placeholder="e.g. AMEX Platinum"
              value={cardName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-slate-900 dark:text-white">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-slate-400">Due Day (1-31)</label>
              <input 
                type="number" 
                min="1" 
                max="31"
                required
                placeholder="e.g. 15"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-slate-400">Expiry (MM/YY)</label>
              <input 
                type="text" 
                required
                placeholder="e.g. 12/28"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-slate-900 dark:text-white">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-slate-400">Annual Fee ($)</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="e.g. 695.00"
                value={annualFee}
                onChange={(e) => setAnnualFee(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-slate-400">Renewal Month</label>
              <select 
                value={renewalMonth}
                onChange={(e) => setRenewalMonth(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white font-bold appearance-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">e.g. January</option>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2 text-slate-900 dark:text-white">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-slate-400">Card Theme</label>
            <div className="flex flex-wrap gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              {colorOptions.map((opt) => (
                <button
                  key={opt.hex}
                  type="button"
                  title={opt.name}
                  onClick={() => setSelectedColor(opt.hex)}
                  style={{ backgroundColor: opt.hex }}
                  className={`w-10 h-10 rounded-full border-2 ${selectedColor === opt.hex ? 'ring-4 ring-blue-500/30 border-blue-500 scale-110 shadow-lg' : 'border-slate-200 dark:border-slate-800'} transition-all relative overflow-hidden`}
                >
                   {selectedColor === opt.hex && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                     </div>
                   )}
                </button>
              ))}
            </div>
          </div>
          <button 
            type="submit"
            className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
          >
            {editingCard ? 'Update Card' : 'Add Card'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default CardsView;
