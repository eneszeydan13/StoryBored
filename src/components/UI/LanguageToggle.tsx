'use client';

import React from 'react';
import { useI18n, Language } from '@/lib/i18n/context';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { language, setLanguage } = useI18n();

  const toggleLanguage = () => {
    const nextLang: Language = language === 'en' ? 'tr' : 'en';
    setLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800/80 transition-all border border-stone-200 dark:border-stone-700/60 shadow-sm flex items-center gap-1.5"
      title="Switch Language"
      aria-label="Toggle language"
    >
      <Globe className="w-3.5 h-3.5 text-blue-500" />
      <span>{language === 'en' ? 'TR 🇹🇷' : 'EN 🇬🇧'}</span>
    </button>
  );
}
