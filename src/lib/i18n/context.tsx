'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { en, TranslationKey } from './en';
import { tr } from './tr';

export type Language = 'en' | 'tr';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const dictionaries = {
  en,
  tr,
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('storyboard_lang') as Language | null;
    if (saved === 'en' || saved === 'tr') {
      setLanguageState(saved);
    } else {
      // detect browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('tr')) {
        setLanguageState('tr');
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('storyboard_lang', lang);
  };

  const t = (key: TranslationKey): string => {
    return dictionaries[language][key] || dictionaries.en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
