'use client';

import React from 'react';
import ExperienceSelector from '@/components/ExperienceSelector';
import Auth from '@/components/Auth';
import { useAppContext } from '@/context/AppContext';
import { Loader2 } from 'lucide-react';

export default function ChooseExperiencePage() {
  const { user, loading } = useAppContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return <ExperienceSelector />;
}
