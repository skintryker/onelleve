'use client';

import React from 'react';
import { Monitor, Smartphone, Check } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export default function ExperienceSelector() {
  const { updateSettings } = useAppContext();

  const handleSelect = async (choice: 'desktop' | 'mobile') => {
    try {
      await updateSettings({ preferred_experience: choice });
      if (choice === 'mobile') {
        window.location.href = '/mobile';
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error saving experience preference:', error);
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        {/* Desktop Option */}
        <button 
          onClick={() => handleSelect('desktop')}
          className="group relative bg-white p-10 rounded-[40px] border-2 border-transparent hover:border-blue-600 transition-all shadow-xl hover:shadow-2xl flex flex-col items-center text-center"
        >
          <div className="p-6 bg-blue-50 text-blue-600 rounded-[32px] mb-6 group-hover:scale-110 transition-transform duration-300">
            <Monitor size={48} strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Desktop Version</h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">Full dashboard experience for larger screens and detailed analysis.</p>
          <div className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs opacity-0 group-hover:opacity-100 transition-all duration-300">
            Select Desktop
          </div>
        </button>

        {/* Mobile Option */}
        <button 
          onClick={() => handleSelect('mobile')}
          className="group relative bg-white p-10 rounded-[40px] border-2 border-transparent hover:border-blue-600 transition-all shadow-xl hover:shadow-2xl flex flex-col items-center text-center"
        >
          <div className="p-6 bg-emerald-50 text-emerald-600 rounded-[32px] mb-6 group-hover:scale-110 transition-transform duration-300">
            <Smartphone size={48} strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Mobile App Version</h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">Simplified app-style experience optimized for phone use and quick adds.</p>
          <div className="mt-8 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs opacity-0 group-hover:opacity-100 transition-all duration-300">
            Select Mobile
          </div>
        </button>
      </div>

      <p className="mt-16 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Premium Personal Finance</p>
    </div>
  );
}
