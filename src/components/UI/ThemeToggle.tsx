'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useI18n } from '@/lib/i18n/context';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800/80 transition-all border border-stone-200 dark:border-stone-700/60 shadow-sm flex items-center justify-center"
      title={theme === 'dark' ? t('theme_light') : t('theme_dark')}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700" />
      )}
    </button>
  );
}
