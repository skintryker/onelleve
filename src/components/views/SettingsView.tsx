'use client';

import React, { useState, useEffect } from 'react';
import { Save, Mail, Loader2 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

const SettingsView = () => {
  const { user, settings, updateSettings, loading: appLoading } = useAppContext();
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // Local form states
  const [fullName, setFullName] = useState('');
  const [currency, setCurrency] = useState('USD');

  // Sync local state with settings from context
  useEffect(() => {
    if (settings) {
      setFullName(settings.full_name || '');
      setCurrency(settings.preferred_currency || 'USD');
    }
  }, [settings]);

  const handleSaveAll = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      await updateSettings({
        full_name: fullName,
        preferred_currency: currency
      });
      setSaveStatus({ type: 'success', message: 'Settings saved successfully!' });
    } catch (error) {
      console.error('Supabase Save Error:', error);
      setSaveStatus({ type: 'error', message: 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (appLoading && !settings) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8 px-1">Profile Settings</h3>
        
        <div className="space-y-6">
          {/* ROW 1: Full Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold text-slate-900 dark:text-white"
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address (Read-only)</label>
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

          {/* ROW 2: Preferred Currency and Save Changes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Currency</label>
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
            <div className="flex flex-col gap-2 items-end">
               <button 
                disabled={saving}
                onClick={handleSaveAll} 
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save Changes
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
    </div>
  );
};

export default SettingsView;
