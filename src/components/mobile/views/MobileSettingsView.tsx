'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Monitor, LogOut, Loader2, Globe, FileText, ChevronRight } from 'lucide-react';
import { translations, Language } from '@/utils/translations';
import { supabase } from '@/utils/supabaseClient';

export default function MobileSettingsView() {
  const { user, settings, updateSettings } = useAppContext();
  const [saving, setSaving] = React.useState(false);
  const currentLang = (settings?.language as Language) || 'en';
  const t = translations[currentLang];

  const handleLogout = async () => {
    if (confirm(t.logout + '?')) {
      if (supabase) await supabase.auth.signOut();
    }
  };

  const handleSwitchToDesktop = async () => {
    setSaving(true);
    try {
      await updateSettings({ preferred_experience: 'desktop' });
      window.location.href = '/';
    } catch (error) {
      console.error(error);
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t.settings}</h2>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        
        <div className="p-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.fullName}</p>
          <p className="font-bold text-slate-900 dark:text-white">{settings?.full_name || 'User'}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 mb-1">{t.emailAddress}</p>
          <p className="font-bold text-slate-900 dark:text-white">{user?.email}</p>
        </div>

        <button 
          onClick={handleSwitchToDesktop}
          disabled={saving}
          className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
        >
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
              <Monitor size={18} />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">Switch to Desktop Version</p>
              <p className="text-[10px] text-slate-500 font-medium">Full dashboard experience</p>
            </div>
          </div>
          {saving ? <Loader2 size={16} className="text-slate-400 animate-spin" /> : <ChevronRight size={16} className="text-slate-300" />}
        </button>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-5 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl group-hover:scale-110 transition-transform">
              <LogOut size={18} />
            </div>
            <p className="font-bold text-rose-600 text-sm">{t.logout}</p>
          </div>
        </button>

      </div>
      
      <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-8">Onelleve Premium</p>
    </div>
  );
}
