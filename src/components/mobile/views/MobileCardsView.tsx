'use client';

import React from 'react';
import { useAppContext, Card } from '@/context/AppContext';
import { CreditCard, Edit2, Trash2 } from 'lucide-react';
import { translations, Language } from '@/utils/translations';

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

interface MobileCardsViewProps {
  onEditCard: (card: Card) => void;
}

export default function MobileCardsView({ onEditCard }: MobileCardsViewProps) {
  const { cards, deleteCard, settings, maskValue } = useAppContext();
  const currentLang = (settings?.language as Language) || 'en';
  const t = translations[currentLang];
  const safeCards = Array.isArray(cards) ? cards : [];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-2 px-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t.creditCards}</h2>
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
                    <button onClick={() => onEditCard(card)} className={`p-2 rounded-xl backdrop-blur-md transition-colors ${isLight ? 'bg-black/5 hover:bg-black/10' : 'bg-white/10 hover:bg-white/20'}`}>
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
    </div>
  );
}
