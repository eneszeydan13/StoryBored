'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/lib/i18n/context';
import { BoardSummary } from '@/types';
import { Navbar } from '@/components/Navbar';
import {
  StickyNote,
  Plus,
  ArrowRight,
  Users,
  Trash2,
  Loader2,
} from 'lucide-react';
import { clientStore } from '@/lib/clientStore';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useI18n();

  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [isLoadingBoards, setIsLoadingBoards] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchBoards();
    }
  }, [user]);

  const fetchBoards = async () => {
    setIsLoadingBoards(true);
    try {
      const res = await fetch('/api/boards');
      if (res.ok) {
        const data = await res.json();
        setBoards(data.boards || []);
        setIsLoadingBoards(false);
        return;
      }
    } catch {
      //
    }
    const localBoards = clientStore.getBoards();
    setBoards(localBoards);
    setIsLoadingBoards(false);
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim() || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.board) {
          setCreateModalOpen(false);
          setNewTitle('');
          setNewDescription('');
          router.push(`/board?id=${data.board.id}`);
          return;
        }
      }
    } catch {
      //
    }

    const localBoard = clientStore.createBoard(newTitle, newDescription);
    setCreateModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    router.push(`/board?id=${localBoard.id}`);
    setIsSubmitting(false);
  };

  const handleJoinWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    const cleanCode = joinCode.trim().toUpperCase();
    router.push(`/join?code=${cleanCode}`);
  };

  const handleDeleteBoard = async (e: React.MouseEvent, boardId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(t('confirm'))) return;

    clientStore.deleteBoard(boardId);
    try {
      await fetch(`/api/boards/${boardId}`, { method: 'DELETE' });
    } catch {
      //
    }
    setBoards((prev) => prev.filter((b) => b.id !== boardId));
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex-1">
        {user ? (
          /* Logged In Dashboard */
          <div className="space-y-8">
            {/* Header & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                  {t('my_boards')}
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                  {t('welcome_back')}, <span className="font-semibold text-stone-800 dark:text-stone-200">{user.username}</span>
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Join by Code Form */}
                <form onSubmit={handleJoinWithCode} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder={t('board_code')}
                    className="w-28 sm:w-32 px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-mono font-bold uppercase placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors"
                  >
                    {t('join_board')}
                  </button>
                </form>

                {/* Create Board Button */}
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-950 text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('new_board')}</span>
                </button>
              </div>
            </div>

            {/* Boards Grid */}
            {isLoadingBoards ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
                <p className="text-xs font-medium text-stone-500">{t('loading_projects')}</p>
              </div>
            ) : boards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {boards.map((b) => (
                  <Link
                    key={b.id}
                    href={`/board?id=${b.id}`}
                    className="group relative rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800/80 shadow-xs hover:shadow-md transition-all duration-180 p-5 flex flex-col justify-between min-h-[160px] hover:-translate-y-0.5"
                  >
                    <div className="masking-tape opacity-70" />

                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-200/80 dark:border-amber-800/60">
                          {b.inviteCode}
                        </span>
                        {b.role === 'OWNER' && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteBoard(e, b.id)}
                            className="text-stone-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title={t('delete_board')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-500 transition-colors line-clamp-1">
                        {b.title}
                      </h3>

                      {b.description && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                          {b.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-medium text-stone-600 dark:text-stone-300">
                          <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                          <span>{b._count?.tickets || 0}</span>
                        </span>
                        <span className="flex items-center gap-1 font-medium text-stone-600 dark:text-stone-300">
                          <Users className="w-3.5 h-3.5 text-sky-500" />
                          <span>{b._count?.members || 1}</span>
                        </span>
                      </div>

                      <span className="font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-xs">
                        {t('open_board')} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="text-center py-16 px-4 rounded-2xl bg-white/40 dark:bg-stone-900/40 border-2 border-dashed border-stone-300/80 dark:border-stone-800 max-w-sm mx-auto">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <StickyNote className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-1">
                  {t('no_boards_title')}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-5 max-w-xs mx-auto">
                  {t('no_boards_desc')}
                </p>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-950 text-xs font-bold shadow-xs hover:shadow transition-all"
                >
                  {t('new_board')}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Minimalist, Clean Public Hero Section */
          <div className="py-4 sm:py-8 space-y-12 max-w-4xl mx-auto text-center">
            {/* Clean Hero Header */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl font-black text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
                {t('hero_title_1')}{' '}
                <span className="text-amber-500">
                  {t('hero_title_2')}
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
                {t('app_description')}
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span>{t('register')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-xl bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold text-xs sm:text-sm border border-stone-200 dark:border-stone-800 shadow-xs transition-all active:scale-95"
                >
                  {t('login')}
                </Link>
              </div>
            </div>

            {/* 4 Minimalist Pastel Sticky Notes Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-left">
              {/* Story */}
              <div className="relative rounded-xl p-3.5 bg-[#FEF9C3] dark:bg-[#1E1B13] border border-amber-200/90 dark:border-amber-500/40 text-stone-900 dark:text-amber-100 shadow-[0_4px_12px_rgba(251,191,36,0.08)] transform -rotate-1 min-h-[140px] flex flex-col justify-between">
                <div className="masking-tape opacity-80" />
                <div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100/90 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/80">
                    {t('state_story')}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm mt-2">{t('sample_story_title')}</h4>
                </div>
                <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px]">
                  <span className="text-stone-600 dark:text-stone-400 font-medium">#Feature</span>
                  <div className="flex items-center gap-1 pl-1 pr-1.5 py-0.5 rounded-full bg-white/80 dark:bg-stone-900/80 shadow-xs">
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-[7px]">
                      EZ
                    </div>
                    <span className="font-semibold text-[9px]">enes</span>
                  </div>
                </div>
              </div>

              {/* To Do */}
              <div className="relative rounded-xl p-3.5 bg-[#E0F2FE] dark:bg-[#101C26] border border-sky-200/90 dark:border-sky-500/40 text-stone-900 dark:text-sky-100 shadow-[0_4px_12px_rgba(56,189,248,0.08)] transform rotate-1 min-h-[140px] flex flex-col justify-between">
                <div className="masking-tape opacity-80" />
                <div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100/90 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300/80">
                    {t('state_todo')}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm mt-2">{t('sample_todo_title')}</h4>
                </div>
                <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px]">
                  <span className="text-stone-600 dark:text-stone-400 font-medium">#Mobile</span>
                  <div className="flex items-center gap-1 pl-1 pr-1.5 py-0.5 rounded-full bg-white/80 dark:bg-stone-900/80 shadow-xs">
                    <div className="w-3.5 h-3.5 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-[7px]">
                      AL
                    </div>
                    <span className="font-semibold text-[9px]">alex</span>
                  </div>
                </div>
              </div>

              {/* In Progress */}
              <div className="relative rounded-xl p-3.5 bg-[#F3E8FF] dark:bg-[#1C152B] border border-purple-200/90 dark:border-purple-500/40 text-stone-900 dark:text-purple-100 shadow-[0_4px_12px_rgba(167,139,250,0.08)] transform -rotate-1 min-h-[140px] flex flex-col justify-between">
                <div className="masking-tape opacity-80" />
                <div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100/90 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300/80">
                    {t('state_in_progress')}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm mt-2">{t('sample_inprogress_title')}</h4>
                </div>
                <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px]">
                  <span className="text-stone-600 dark:text-stone-400 font-medium">#UI/UX</span>
                  <div className="flex items-center gap-1 pl-1 pr-1.5 py-0.5 rounded-full bg-white/80 dark:bg-stone-900/80 shadow-xs">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[7px]">
                      SA
                    </div>
                    <span className="font-semibold text-[9px]">sara</span>
                  </div>
                </div>
              </div>

              {/* Completed */}
              <div className="relative rounded-xl p-3.5 bg-[#DCFCE7] dark:bg-[#10221A] border border-emerald-200/90 dark:border-emerald-500/40 text-stone-900 dark:text-emerald-100 shadow-[0_4px_12px_rgba(74,222,128,0.08)] transform rotate-1 min-h-[140px] flex flex-col justify-between">
                <div className="masking-tape opacity-80" />
                <div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80">
                    {t('state_completed')} 🎉
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm mt-2">{t('sample_completed_title')}</h4>
                </div>
                <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px]">
                  <span className="text-stone-600 dark:text-stone-400 font-medium">#Done</span>
                  <div className="flex items-center gap-1 pl-1 pr-1.5 py-0.5 rounded-full bg-white/80 dark:bg-stone-900/80 shadow-xs">
                    <div className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-[7px]">
                      EZ
                    </div>
                    <span className="font-semibold text-[9px]">enes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="relative w-full max-w-md rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="masking-tape opacity-80" />

            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-1">
              {t('new_board')}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
              {t('dashboard_subtitle')}
            </p>

            {error && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateBoard} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {t('board_title')} *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={t('board_title_placeholder')}
                  className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {t('board_description')}
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder={t('board_description_placeholder')}
                  className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-950 text-xs font-bold shadow-xs hover:shadow transition-all active:scale-95 disabled:opacity-50"
                >
                  {t('create_board')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800/80 py-4 text-center text-[11px] text-stone-400">
        StoryBoard • {t('app_footer_note')}
      </footer>
    </div>
  );
}
