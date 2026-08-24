'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/lib/i18n/context';
import { UserColorPicker } from '@/components/UI/ColorPicker';
import { ThemeToggle } from '@/components/UI/ThemeToggle';
import { LanguageToggle } from '@/components/UI/LanguageToggle';
import { USER_COLORS } from '@/lib/constants';
import {
  StickyNote,
  Users,
  ArrowRight,
  User as UserIcon,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const inviteCode = resolvedParams.code;
  const router = useRouter();
  const { user, register, login, isLoading: isAuthLoading } = useAuth();
  const { t } = useI18n();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [color, setColor] = useState(USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]);
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [mode, setMode] = useState<'register' | 'login'>('register');

  // If already logged in, join board directly
  useEffect(() => {
    if (!isAuthLoading && user) {
      handleJoinDirectly();
    }
  }, [user, isAuthLoading, inviteCode]);

  const handleJoinDirectly = async () => {
    setIsJoining(true);
    try {
      const res = await fetch(`/api/boards/join/${inviteCode}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.boardId) {
        router.push(`/board/${data.boardId}`);
      } else {
        setError(data.error || 'Failed to join board with this code');
        setIsJoining(false);
      }
    } catch {
      setError('Connection error');
      setIsJoining(false);
    }
  };

  const handleAuthAndJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    setError('');

    try {
      if (mode === 'register') {
        if (!username.trim() || !email.trim() || !password) {
          setError(t('msg_fill_required'));
          setIsJoining(false);
          return;
        }

        const regRes = await register({
          username: username.trim(),
          email: email.trim(),
          password,
          color,
        });

        if (!regRes.success) {
          setError(regRes.error || t('msg_user_exists'));
          setIsJoining(false);
          return;
        }
      } else {
        if (!username.trim() || !password) {
          setError(t('msg_fill_required'));
          setIsJoining(false);
          return;
        }

        const logRes = await login({ identifier: username.trim(), password });
        if (!logRes.success) {
          setError(logRes.error || t('msg_invalid_credentials'));
          setIsJoining(false);
          return;
        }
      }

      // After auth, join the board
      await handleJoinDirectly();
    } catch {
      setError(t('msg_error'));
      setIsJoining(false);
    }
  };

  if (isAuthLoading || (user && isJoining)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-sm font-semibold text-stone-600 dark:text-stone-400">
          {t('joining_board')}
        </p>
      </div>
    );
  }

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

      {/* Join Box */}
      <main className="max-w-md w-full mx-auto my-8">
        <div className="relative rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-8">
          <div className="masking-tape" />

          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 mb-1">
              {t('join_board')}
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Invite Code:{' '}
              <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                {inviteCode}
              </span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-stone-100 dark:bg-stone-800 p-1 mb-5">
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {t('register')}
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {t('login')}
            </button>
          </div>

          <form onSubmit={handleAuthAndJoin} className="space-y-4">
            {/* Username / Identifier */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                {t('username')} *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('username_placeholder')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                />
              </div>
            </div>

            {/* Email (only in register mode) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  {t('email')} *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('email_placeholder')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                {t('password')} *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('password_placeholder')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                />
              </div>
            </div>

            {/* User Color (only in register mode) */}
            {mode === 'register' && (
              <div className="pt-1">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  {t('your_color')}
                </label>
                <UserColorPicker selectedColor={color} onChange={setColor} />
              </div>
            )}

            {/* Join Submit Button */}
            <button
              type="submit"
              disabled={isJoining}
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              <span>{t('join_board')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-stone-400 py-2">
        StoryBoard • Agile post-it sprint development workspace
      </footer>
    </div>
  );
}
