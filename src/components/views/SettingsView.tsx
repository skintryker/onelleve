'use client';

import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Globe, Save, Mail, Loader2, Key, LogOut, Check, Trash2 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/utils/supabaseClient';
import { translations, Language } from '@/utils/translations';

const SettingsView = () => {
  const { user, settings, updateSettings, loading: appLoading } = useAppContext();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'region'>('profile');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // Local form states
  const [fullName, setFullName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState<Language>('en');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');

  const currentLang = (settings?.language as Language) || 'en';
  const t = translations[currentLang];

  // Sync local state with settings from context
  useEffect(() => {
    if (settings) {
      setFullName(settings.full_name || '');
      setCurrency(settings.preferred_currency || 'USD');
      setLanguage((settings.language as Language) || 'en');
      setDateFormat(settings.date_format || 'MM/DD/YYYY');
    }
  }, [settings]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      await updateSettings({
        full_name: fullName,
        preferred_currency: currency
      });
      setSaveStatus({ type: 'success', message: t.saveChanges + '!' });
    } catch (error: any) {
      console.error('Supabase Save Error:', error);
      setSaveStatus({ 
        type: 'error', 
        message: error.message || 'Failed to save settings.' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRegion = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      await updateSettings({
        language,
        date_format: dateFormat
      });
      setSaveStatus({ type: 'success', message: t.region + ' updated!' });
    } catch (error: any) {
      console.error('Supabase Save Error:', error);
      setSaveStatus({ 
        type: 'error', 
        message: error.message || 'Failed to save region settings.' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (user?.email && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) alert(error.message);
      else alert('Password reset email sent!');
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      if (supabase) await supabase.auth.signOut();
    }
  };

  if (appLoading && !settings) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">{t.profileSettings}</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.fullName}</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold text-slate-900 dark:text-white"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.emailAddress} (Read-only)</label>
                  <div className="relative">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input 
                      type="email" 
                      value={user?.email || ''} 
                      disabled
                      className="w-full px-12 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-sm font-bold cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.preferredCurrency}</label>
                  <div className="relative">
                    <select 
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none appearance-none text-sm font-bold text-slate-900 dark:text-white"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="BRL">BRL - Brazilian Real</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-black">↓</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                   <button 
                    disabled={saving}
                    onClick={handleSaveProfile} 
                    className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/25 active:scale-95 hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {t.saveChanges}
                  </button>
                </div>
              </div>

              {saveStatus && (
                <p className={`text-sm font-bold px-1 ${saveStatus.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {saveStatus.message}
                </p>
              )}
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">{t.notifications}</h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Email notifications', desc: 'Monthly summaries and important alerts' },
                { label: 'Payment reminders', desc: 'Reminders for upcoming manual payments' },
                { label: 'Due day reminders', desc: 'Alerts when your card due day is approaching' },
                { label: 'Monthly summary', desc: 'Detailed report of your financial performance' },
                { label: 'Investment reminders', desc: 'Notifications for manual investment contributions' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-bold">{item.label}</p>
                    <p className="text-[10px] text-slate-400">{item.desc}</p>
                  </div>
                  <div className="w-10 h-5 bg-slate-200 dark:bg-slate-800 rounded-full relative cursor-not-allowed opacity-50">
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">{t.security}</h3>
            
            <div className="space-y-4">
               {/* Password Card */}
               <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Key size={16} /></div>
                     <div>
                        <p className="text-xs font-bold uppercase tracking-tight">Password Management</p>
                        <p className="text-[10px] text-slate-400">Request a secure link to change your password</p>
                     </div>
                  </div>
                  <button onClick={handleResetPassword} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all text-slate-900 dark:text-white active:scale-95 shadow-sm">
                    {t.resetPassword}
                  </button>
               </div>

               {/* Session Card */}
               <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-lg"><LogOut size={16} /></div>
                     <div>
                        <p className="text-xs font-bold uppercase tracking-tight">Session Control</p>
                        <p className="text-[10px] text-slate-400">Log out from this device</p>
                     </div>
                  </div>
                  <button onClick={handleLogout} className="px-4 py-2 bg-rose-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all active:scale-95 shadow-sm">
                     {t.logout}
                  </button>
               </div>

               {/* Danger Zone */}
               <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-4 text-rose-500">
                     <Trash2 size={16} />
                     <p className="text-[10px] font-black uppercase tracking-[0.2em]">Danger Zone</p>
                  </div>
                  <div className="p-4 bg-rose-50/30 dark:bg-rose-950/20 rounded-xl border border-rose-100/50 dark:border-rose-900/30 flex items-center justify-between">
                     <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Delete Account</p>
                        <p className="text-[10px] text-slate-400 italic">Delete Account coming soon</p>
                     </div>
                     <button disabled className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-not-allowed opacity-50">
                        Delete
                     </button>
                  </div>
               </div>
            </div>
          </div>
        );
      case 'region':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 text-center">{t.region}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.language}</label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold appearance-none outline-none dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                  <option value="es">Español</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.dateFormat}</label>
                <select 
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold appearance-none outline-none dark:text-white"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                </select>
              </div>
            </div>

            <div className="flex justify-center pt-4">
               <button 
                disabled={saving}
                onClick={handleSaveRegion} 
                className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/25 active:scale-95 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {t.saveChanges}
              </button>
            </div>

            {saveStatus && (
              <p className={`text-center text-sm font-bold ${saveStatus.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {saveStatus.message}
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 custom-scrollbar shrink-0">
          {[
            { id: 'profile', label: t.profileSettings, icon: User },
            { id: 'notifications', label: t.notifications, icon: Bell },
            { id: 'security', label: t.security, icon: Shield },
            { id: 'region', label: t.region, icon: Globe },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center justify-between px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all group whitespace-nowrap min-w-fit lg:w-full ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:border-blue-200'}`}
            >
              <div className="flex items-center gap-3">
                 <item.icon size={20} />
                 {item.label}
              </div>
              <Check size={16} className={`hidden lg:block ${activeTab === item.id ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm min-h-[400px]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
