'use client';

import React, { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { Mail, Lock, Loader2 } from 'lucide-react';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setMessage({ type: 'error', text: 'Supabase client not initialized.' });
      return;
    }
    
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Sign up successful! Please check your email for verification.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    // Forced Light Mode for Login Screen
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-blue-100 selection:text-blue-900">
      <div className="w-full max-w-md bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-500">
        
        {/* BRANDING BLOCK: Logo, Tagline, Byline */}
        <div className="flex flex-col items-center mb-8">
          {/* Logo with mix-blend-multiply to remove white background surgically */}
          <div className="w-full max-w-[280px] -mb-2">
            <img 
              src="/logo-onelleve.jpg" 
              alt="onelleve" 
              className="w-full h-auto object-contain mix-blend-multiply"
            />
          </div>
          <p className="text-slate-500 font-medium italic text-sm mb-1 tracking-tight">
            Premium Financial Intelligence
          </p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
            by Reggie Martins
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {message && (
            <div className={`p-4 rounded-2xl text-sm font-bold ${message.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold text-slate-900"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold text-slate-900"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <button 
              type="submit"
              disabled={loading}
              className="w-full sm:max-w-[240px] py-3.5 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95 flex items-center justify-center gap-2 text-xs"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </div>
        </form>

        <div className="mt-10 text-center">
          <button 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-xs font-black text-blue-600 hover:underline uppercase tracking-widest"
          >
            {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
