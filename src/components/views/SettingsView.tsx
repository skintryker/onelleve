'use client';

import React, { useState } from 'react';
import { User, Bell, Shield, Moon, Globe, Save } from 'lucide-react';

const SettingsView = () => {
  const [name, setName] = useState('Reggie Martins');
  const [email, setEmail] = useState('reggie@example.com');
  const [currency, setCurrency] = useState('USD');
  const [theme, setTheme] = useState('dark');

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Sections */}
        <div className="lg:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all">
            <User size={20} />
            Profile Settings
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 rounded-xl font-semibold transition-all">
            <Bell size={20} />
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 rounded-xl font-semibold transition-all">
            <Shield size={20} />
            Security & Privacy
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 rounded-xl font-semibold transition-all">
            <Globe size={20} />
            Language & Region
          </button>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Preferred Currency</label>
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white transition-all appearance-none"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="BRL">BRL - Brazilian Real</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Interface Theme</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setTheme('light')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${theme === 'light' ? 'bg-white border-blue-600 text-blue-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-950 border-transparent text-slate-500'}`}
                >
                  Light
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${theme === 'dark' ? 'bg-white dark:bg-slate-800 border-blue-600 text-blue-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-950 border-transparent text-slate-500'}`}
                >
                  <Moon size={16} />
                  Dark
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              <Save size={20} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
