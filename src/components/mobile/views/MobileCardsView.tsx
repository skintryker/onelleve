'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext, Card } from '@/context/AppContext';
import { CreditCard, Edit2, Trash2, Plus, Wifi, Calendar } from 'lucide-react';
import { translations, Language } from '@/utils/translations';
import Modal from '@/components/modals/Modal';

// Helper for card gradients (reused from CardsView)
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

const monthsEN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthsPT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const monthsES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const getThemeForCard = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('platinum')) return '#C0C0C0';
  if (n.includes('gold')) return '#D4AF37';
  if (n.includes('reserve') || n.includes('sapphire')) return '#0B1220';
  if (n.includes('apple')) return '#FFFFFF';
  return '#0B1220';
};

interface MobileCardsViewProps {
  autoOpenModal?: boolean;
  onModalClose?: () => void;
}

export default function MobileCardsView({ autoOpenModal, onModalClose }: MobileCardsViewProps) {
  const { cards, addCard, editCard, deleteCard, settings, maskValue } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  // Form State
  const [cardName, setCardName] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [expiry, setExpiry] = useState('');
  const [selectedColor, setSelectedColor] = useState('#0B1220');
  const [annualFee, setAnnualFee] = useState('');
  const [renewalMonth, setRenewalMonth] = useState('');
  const [outstandingBalance, setOutstandingBalance] = useState('');

  const currentLang = (settings?.language as Language) || 'en';
  const t = translations[currentLang];
  const months = currentLang === 'pt' ? monthsPT : currentLang === 'es' ? monthsES : monthsEN;

  // Handle auto-open from Quick Add
  useEffect(() => {
    if (autoOpenModal) {
      handleOpenModal();
    }
  }, [autoOpenModal]);

  const handleOpenModal = (card: Card | null = null) => {
    if (card) {
      setEditingCard(card);
      setCardName(card.cardName);
      setDueDay(card.dueDay || '');
      setExpiry(card.expiry || '');
      setSelectedColor(card.color || getThemeForCard(card.cardName));
      setAnnualFee(card.annualFee?.toString() || '');
      setRenewalMonth(card.renewalMonth || '');
      setOutstandingBalance(card.currentBalance.toString());
    } else {
      setEditingCard(null);
      setCardName('');
      setDueDay('');
      setExpiry('');
      setSelectedColor('#0B1220');
      setAnnualFee('');
      setRenewalMonth('');
      setOutstandingBalance('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (onModalClose) onModalClose();
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
      currentBalance: outstandingBalance ? parseFloat(outstandingBalance) : 0,
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
    handleCloseModal();
  };

  const safeCards = Array.isArray(cards) ? cards : [];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-2 px-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t.creditCards}</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="p-2 bg-blue-600 text-white rounded-xl active:scale-95 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {safeCards.map((card) => {
          const isLight = card.color === '#FFFFFF' || card.color === '#C0C0C0';
          const textColor = isLight ? 'text-slate-900' : 'text-white';
          const secondaryTextColor = isLight ? 'text-slate-600' : 'text-slate-300';
          
          return (
            <div key={card.id} className="relative rounded-3xl overflow-hidden shadow-xl" style={{ background: getCardGradient(card.color || '#0B1220') }}>
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
              
              <div className="p-6 relative z-10 flex flex-col h-48 justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-black tracking-tight text-lg ${textColor}`}>{card.cardName}</h3>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${secondaryTextColor}`}>
                      {t.dueDay} {card.dueDay}
                    </p>
                  </div>
                  <CreditCard className={textColor} size={24} />
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${secondaryTextColor}`}>{t.outstanding}</p>
                    <p className={`text-2xl font-black tracking-tighter ${textColor}`}>
                      ${maskValue(card.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(card)} className={`p-2 rounded-xl backdrop-blur-md transition-colors ${isLight ? 'bg-black/5 hover:bg-black/10' : 'bg-white/10 hover:bg-white/20'}`}>
                      <Edit2 size={16} className={textColor} />
                    </button>
                    <button onClick={() => { if(confirm(t.areYouSureDeleteCard)) deleteCard(card.id); }} className={`p-2 rounded-xl backdrop-blur-md transition-colors ${isLight ? 'bg-black/5 hover:bg-black/10 text-rose-600' : 'bg-white/10 hover:bg-white/20 text-rose-300 hover:text-rose-400'}`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {safeCards.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
            <CreditCard size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-500">No cards found.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCard ? t.editCard : t.newCard}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-slate-900 dark:text-white">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.cardIdentification}</label>
            <input 
              type="text" 
              required
              placeholder="e.g. AMEX Platinum"
              value={cardName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-slate-900 dark:text-white">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.dueDay} (1-31)</label>
              <input 
                type="number" 
                min="1" 
                max="31"
                required
                placeholder="e.g. 15"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{currentLang === 'pt' ? 'Validade' : currentLang === 'es' ? 'Vencimiento' : 'Expiry'}</label>
              <input 
                type="text" 
                required
                placeholder={t.expiryPlaceholder}
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-slate-900 dark:text-white">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.outstandingBalance} ($)</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00"
                value={outstandingBalance}
                onChange={(e) => setOutstandingBalance(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.annualFee} ($)</label>
              <input 
                type="text" 
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                placeholder="e.g. 695.00"
                value={annualFee}
                onChange={(e) => setAnnualFee(e.target.value.replace(/[^0-9.]/g, ''))}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="space-y-2 text-slate-900 dark:text-white">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.renewalMonth}</label>
            <select 
              value={renewalMonth}
              onChange={(e) => setRenewalMonth(e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-bold appearance-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">e.g. January</option>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="space-y-2 text-slate-900 dark:text-white">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.cardTheme}</label>
            <div className="flex flex-wrap gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              {colorOptions.map((opt) => (
                <button
                  key={opt.hex}
                  type="button"
                  title={opt.name}
                  onClick={() => setSelectedColor(opt.hex)}
                  style={{ backgroundColor: opt.hex }}
                  className={`w-9 h-9 rounded-full border-2 ${selectedColor === opt.hex ? 'ring-4 ring-blue-500/30 border-blue-500 scale-110 shadow-lg' : 'border-slate-200 dark:border-slate-800'} transition-all relative overflow-hidden`}
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

          <div className="pt-2 flex justify-center">
            <button 
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/25 active:scale-95 transition-all text-xs"
            >
              {editingCard ? t.updateCard : t.addCard}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
