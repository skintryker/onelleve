'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { 
  User, 
  Globe, 
  Monitor, 
  Calendar, 
  Trash2, 
  LogOut, 
  ChevronRight,
  Loader2,
  Check
} from 'lucide-react';
import { translations, Language } from '@/utils/translations';
import { supabase } from '@/utils/supabaseClient';
import Modal from '@/components/modals/Modal';

export default function MobileSettingsView() {
  const { user, settings, updateSettings, startNewMonth, factoryReset } = useAppContext();
  const [saving, setSaving] = useState(false);
  const [isStartMonthModalOpen, setIsStartMonthModalOpen] = useState(false);
  const [isFactoryResetModalOpen, setIsFactoryResetModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  
  const currentLang = (settings?.language as Language) || 'en';
  const t = translations[currentLang];

  const handleLanguageSelect = async (lang: Language) => {
    try {
      await updateSettings({ language: lang });
      setIsLanguageModalOpen(false);
    } catch (error) {
      console.error('Error updating language', error);
      alert('Failed to update language.');
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

  const handleStartNewMonth = async () => {
    setSaving(true);
    try {
      await startNewMonth();
      setIsStartMonthModalOpen(false);
    } catch (error) {
      alert('Failed to start new month.');
    } finally {
      setSaving(false);
    }
  };

  const handleFactoryReset = async () => {
    if (resetConfirmText !== 'RESET') return;
    setSaving(true);
    try {
      await factoryReset();
      setIsFactoryResetModalOpen(false);
      setResetConfirmText('');
    } catch (error) {
      alert('Failed to perform factory reset.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleLogout = async () => {
    if (confirm(t.logout + '?')) {
      if (supabase) await supabase.auth.signOut();
    }
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        { id: 'username', label: settings?.full_name || 'User', value: user?.email, icon: User },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { id: 'language', label: t.language, value: settings?.language?.toUpperCase() || 'EN', action: () => setIsLanguageModalOpen(true), icon: Globe },
        { id: 'experience', label: 'Switch to Desktop', action: handleSwitchToDesktop, icon: Monitor },
      ]
    },
    {
      title: 'Data Management',
      items: [
        { id: 'newmonth', label: t.startNewMonth, action: () => setIsStartMonthModalOpen(true), icon: Calendar, color: 'text-blue-500' },
        { id: 'reset', label: t.factoryReset, action: () => setIsFactoryResetModalOpen(true), icon: Trash2, color: 'text-rose-500' },
      ]
    }
  ];

  const renderItem = (item: any, index: number) => {
    const content = (
      <div className={`flex items-center justify-between p-4 ${index > 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''}`}>
        <div className="flex items-center gap-4">
          {item.icon && (
            <div className={`p-2 bg-slate-100 dark:bg-slate-800 rounded-lg ${item.color || 'text-slate-500'}`}>
              <item.icon size={16} strokeWidth={3} />
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{item.label}</p>
            {item.value && <p className="text-xs text-slate-400 font-medium">{item.value}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {item.action && (saving ? <Loader2 size={16} className="text-slate-400 animate-spin" /> : <ChevronRight size={16} className="text-slate-400" />)}
        </div>
      </div>
    );

    if (item.action) {
      return (
        <button key={item.id} onClick={item.action} className="w-full text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors disabled:opacity-50" disabled={saving}>
          {content}
        </button>
      );
    }
    return <div key={item.id}>{content}</div>;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="px-1 mb-2">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t.settings}</h2>
      </div>

      {menuSections.map((section, sIndex) => (
        <div key={sIndex} className="space-y-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">{section.title}</h3>
          <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {section.items.map(renderItem)}
          </div>
        </div>
      ))}
      
      <div className="pt-4">
        <button 
          onClick={handleLogout}
          className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-rose-500 dark:text-rose-400 rounded-xl font-bold text-sm active:scale-95 transition-transform"
        >
          {t.logout}
        </button>
      </div>

      <Modal isOpen={isLanguageModalOpen} onClose={() => setIsLanguageModalOpen(false)} title="Select Language">
        <div className="flex flex-col gap-2">
          {['en', 'pt', 'es'].map(lang => (
            <button key={lang} onClick={() => handleLanguageSelect(lang as Language)} className={`w-full p-4 rounded-xl text-left font-bold text-sm flex justify-between items-center ${currentLang === lang ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50'}`}>
              <span>{lang === 'en' ? 'English' : lang === 'pt' ? 'Português' : 'Español'}</span>
              {currentLang === lang && <Check size={16} />}
            </button>
          ))}
        </div>
      </Modal>

      <Modal isOpen={isStartMonthModalOpen} onClose={() => setIsStartMonthModalOpen(false)} title={t.startNewMonth}>
        <div className="space-y-6">
          <p className="text-sm text-slate-500 leading-relaxed">{t.startNewMonthConfirm}</p>
          <button disabled={saving} onClick={handleStartNewMonth} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : 'Confirm & Start'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={isFactoryResetModalOpen} onClose={() => setIsFactoryResetModalOpen(false)} title={t.factoryReset}>
        <div className="space-y-6">
          <p className="text-sm text-rose-500 bg-rose-50 dark:bg-rose-950/30 p-4 rounded-xl leading-relaxed font-semibold">{t.factoryResetConfirm}</p>
          <input type="text" value={resetConfirmText} onChange={(e) => setResetConfirmText(e.target.value)} placeholder="Type RESET to confirm" className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl outline-none text-center font-bold tracking-widest uppercase focus:border-rose-500" />
          <button disabled={saving || resetConfirmText !== 'RESET'} onClick={handleFactoryReset} className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale">
            {saving ? <Loader2 size={16} className="animate-spin" /> : 'DELETE EVERYTHING'}
          </button>
        </div>
      </Modal>

    </div>
  );
}
