'use client';

import React, { useState } from 'react';
import { Monitor, Smartphone, Check, Loader2 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export default function ExperienceSelector() {
  const { updateSettings } = useAppContext();
  const [saving, setSaving] = useState<'desktop' | 'mobile' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (choice: 'desktop' | 'mobile') => {
    setSaving(choice);
    setError(null);
    try {
      await updateSettings({ preferred_experience: choice });
      if (choice === 'mobile') {
        window.location.href = '/mobile';
      } else {
        window.location.href = '/';
      }
    } catch (err: any) {
      console.error('Error saving experience preference:', err);
      setError(err.message || 'Failed to save your preference. Please try again.');
      setSaving(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Logo Placeholder - Matches branding */}
      <div className="mb-12">
        <img 
          src="/logo-onelleve.jpg" 
          alt="onelleve" 
          className="h-16 w-auto mix-blend-multiply"
        />
      </div>

      <div className="w-full max-w-2xl text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-4">Choose your experience</h1>
        <p className="text-slate-500 font-medium">Select how you want to use Onelleve today. You can always change this in settings.</p>
        
        {error && (
          <div className="mt-4 p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 text-sm font-bold animate-in fade-in zoom-in">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        {/* Desktop Option */}
        <button 
          onClick={() => handleSelect('desktop')}
          disabled={saving !== null}
          className={`group relative bg-white p-10 rounded-[40px] border-2 transition-all shadow-xl flex flex-col items-center text-center ${
            saving === 'desktop' ? 'border-blue-600 scale-[0.98] shadow-md opacity-90' : 
            saving !== null ? 'border-transparent opacity-50 grayscale' : 'border-transparent hover:border-blue-600 hover:shadow-2xl'
          }`}
        >
          <div className={`p-6 rounded-[32px] mb-6 transition-transform duration-300 ${
            saving === 'desktop' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 group-hover:scale-110'
          }`}>
            {saving === 'desktop' ? <Loader2 size={48} strokeWidth={2.5} className="animate-spin" /> : <Monitor size={48} strokeWidth={2.5} />}
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Desktop Version</h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">Full dashboard experience for larger screens and detailed analysis.</p>
          <div className={`mt-8 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 ${
            saving === 'desktop' ? 'bg-blue-600 text-white opacity-100' : 'bg-slate-900 text-white opacity-0 group-hover:opacity-100'
          }`}>
            {saving === 'desktop' ? 'Saving...' : 'Select Desktop'}
          </div>
        </button>

        {/* Mobile Option */}
        <button 
          onClick={() => handleSelect('mobile')}
          disabled={saving !== null}
          className={`group relative bg-white p-10 rounded-[40px] border-2 transition-all shadow-xl flex flex-col items-center text-center ${
            saving === 'mobile' ? 'border-emerald-600 scale-[0.98] shadow-md opacity-90' : 
            saving !== null ? 'border-transparent opacity-50 grayscale' : 'border-transparent hover:border-emerald-600 hover:shadow-2xl'
          }`}
        >
          <div className={`p-6 rounded-[32px] mb-6 transition-transform duration-300 ${
            saving === 'mobile' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600 group-hover:scale-110'
          }`}>
            {saving === 'mobile' ? <Loader2 size={48} strokeWidth={2.5} className="animate-spin" /> : <Smartphone size={48} strokeWidth={2.5} />}
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Mobile App Version</h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">Simplified app-style experience optimized for phone use and quick adds.</p>
          <div className={`mt-8 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 ${
            saving === 'mobile' ? 'bg-emerald-600 text-white opacity-100' : 'bg-emerald-600 text-white opacity-0 group-hover:opacity-100'
          }`}>
            {saving === 'mobile' ? 'Saving...' : 'Select Mobile'}
          </div>
        </button>
      </div>

      <p className="mt-16 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Premium Personal Finance</p>
    </div>
  );
}
