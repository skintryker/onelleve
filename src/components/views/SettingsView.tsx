'use client';

import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Moon, Globe, Save, Check, Key, Mail, Trash2, Loader2 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/utils/supabaseClient';

const SettingsView = () => {
  const { user, settings, updateSettings, loading: appLoading } = useAppContext();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'language'>('profile');
  const [saving, setSaving] = useState(false);
  
  // Local form states
  const [fullName, setFullName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>('dark');

  const [notifs, setNotifs] = useState({
    email: true,
    payments: true,
    dueDays: true,
    summary: true,
    investments: true,
  });

  const [langSettings, setLangSettings] = useState({
    language: 'en',
    region: 'United States',
    dateFormat: 'MM/DD/YYYY',
  });

  // Sync local state with settings from context
  useEffect(() => {
    if (settings) {
      setFullName(settings.full_name || '');
      setCurrency(settings.preferred_currency || 'USD');
      setLocalTheme(settings.theme || 'dark');
      setNotifs({
        email: settings.email_notifications,
        payments: settings.payment_reminders,
        dueDays: settings.due_day_reminders,
        summary: settings.monthly_summary,
        investments: settings.investment_reminders,
      });
      setLangSettings({
        language: settings.language || 'en',
        region: settings.region || 'United States',
        dateFormat: settings.date_format || 'MM/DD/YYYY',
      });
    }
  }, [settings]);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await updateSettings({
        full_name: fullName,
        preferred_currency: currency,
        theme: localTheme,
        email_notifications: notifs.email,
        payment_reminders: notifs.payments,
        due_day_reminders: notifs.dueDays,
        monthly_summary: notifs.summary,
        investment_reminders: notifs.investments,
        language: langSettings.language,
        region: langSettings.region,
        date_format: langSettings.dateFormat
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings.');
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
          <div className="space-y-8 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Profile Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold text-slate-900 dark:text-white"
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address (Read-only)</label>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                   <input 
                    type="email" 
                    value={user?.email || ''} 
                    disabled
                    className="w-full px-12 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-sm font-bold cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Preferred Currency</label>
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none appearance-none text-sm font-bold text-slate-900 dark:text-white"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="BRL">BRL - Brazilian Real</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Interface Theme</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setLocalTheme('light')}
                    className={`flex-1 py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${localTheme === 'light' ? 'bg-white text-blue-600 border-blue-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-950 border-transparent text-slate-400'}`}
                  >
                    Light
                  </button>
                  <button 
                    onClick={() => setLocalTheme('dark')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${localTheme === 'dark' ? 'bg-slate-800 text-blue-400 border-blue-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-950 border-transparent text-slate-400'}`}
                  >
                    <Moon size={14} />
                    Dark
                  </button>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                disabled={saving}
                onClick={handleSaveAll} 
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save Changes
              </button>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Receive monthly summaries and alerts via email' },
                { key: 'payments', label: 'Payment Reminders', desc: 'Alerts for upcoming bill payments' },
                { key: 'dueDays', label: 'Due Day Reminders', desc: 'Notifications when a card due day is near' },
                { key: 'summary', label: 'Monthly Summary', desc: 'A detailed breakdown of your monthly performance' },
                { key: 'investments', label: 'Investment Reminders', desc: 'Periodic check-ins for your portfolio' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                   <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                   </div>
                   <button 
                    onClick={() => setNotifs({...notifs, [item.key]: !notifs[item.key as keyof typeof notifs]})}
                    className={`w-12 h-6 rounded-full relative transition-all ${notifs[item.key as keyof typeof notifs] ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                   >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifs[item.key as keyof typeof notifs] ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                disabled={saving}
                onClick={handleSaveAll} 
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save Preferences
              </button>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Security & Privacy</h3>
            <div className="space-y-6">
               <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl"><Key size={20} /></div>
                     <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Password Management</p>
                        <p className="text-xs text-slate-400">Secure your account with a strong password</p>
                     </div>
                  </div>
                  <button onClick={handleResetPassword} className="w-full py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all text-slate-900 dark:text-white">
                    Request Password Reset
                  </button>
               </div>

               <div className="p-6 bg-rose-50/30 dark:bg-rose-900/5 rounded-2xl border border-rose-100 dark:border-rose-900/20">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl"><Trash2 size={20} /></div>
                     <div>
                        <p className="text-sm font-bold text-rose-600">Danger Zone</p>
                        <p className="text-xs text-rose-400">Permanently delete your account and all data</p>
                     </div>
                  </div>
                  <button className="w-full py-3 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all opacity-50 cursor-not-allowed">
                    Delete Account
                  </button>
               </div>
               
               <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                 Your financial data is stored securely and tied to your account.
               </p>
            </div>
          </div>
        );
      case 'language':
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Language & Region</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Language</label>
                <select 
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-sm font-bold cursor-not-allowed"
                >
                  <option value="en">English only for now</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Region</label>
                <select 
                  value={langSettings.region}
                  onChange={(e) => setLangSettings({...langSettings, region: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none appearance-none text-sm font-bold text-slate-900 dark:text-white"
                >
                  <option value="United States">United States</option>
                  <option value="Brazil">Brazil</option>
                  <option value="Europe">Europe</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Date Format</label>
                <select 
                  value={langSettings.dateFormat}
                  onChange={(e) => setLangSettings({...langSettings, dateFormat: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none appearance-none text-sm font-bold text-slate-900 dark:text-white"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                </select>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                disabled={saving}
                onClick={handleSaveAll} 
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save Changes
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        {/* Navigation Sidebar: Horizontal scroll on mobile */}
        <div className="lg:col-span-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 custom-scrollbar shrink-0">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'language', label: 'Region', icon: Globe },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center justify-between px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all group whitespace-nowrap min-w-fit lg:w-full ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:border-blue-200'}`}
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
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm min-h-[400px] md:min-h-[500px]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
