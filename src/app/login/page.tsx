'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/lib/i18n/context';
import { ThemeToggle } from '@/components/UI/ThemeToggle';
import { LanguageToggle } from '@/components/UI/LanguageToggle';
import { StickyNote, ArrowRight, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { login } = useAuth();
  const { t } = useI18n();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError(t('msg_fill_required'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    const res = await login({ identifier, password });
    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.error || t('msg_invalid_credentials'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-8">
      {/* Post-it Tape header */}
      <div className="masking-tape" />

      <div className="text-center mb-6">
        <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100 mb-1">
          {t('login')}
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {t('guest_note')}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email or Username */}
        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
            {t('email')} / {t('username')}
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={t('email_placeholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
            {t('password')}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('password_placeholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60 transition-all"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
        >
          <span>{t('login')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Switch to Register */}
      <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800 text-center">
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {t('no_account')}{' '}
          <Link
            href={`/register${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            {t('register')}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-400 dark:bg-amber-500 flex items-center justify-center shadow-md transform -rotate-3">
            <StickyNote className="w-5 h-5 text-stone-900 stroke-[2.2]" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-stone-900 dark:text-stone-100">
            Story<span className="text-amber-500 dark:text-amber-400">Board</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-8">
        <Suspense
          fallback={
            <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-3xl">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-stone-400 py-2">
        StoryBoard • Agile post-it sprint development workspace
      </footer>
    </div>
  );
}
