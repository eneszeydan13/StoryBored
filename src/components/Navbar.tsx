'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/lib/i18n/context';
import { ThemeToggle } from '@/components/UI/ThemeToggle';
import { LanguageToggle } from '@/components/UI/LanguageToggle';
import { UserColorPicker } from '@/components/UI/ColorPicker';
import { BoardDetail } from '@/types';
import {
  StickyNote,
  Share2,
  LogOut,
  User as UserIcon,
  ChevronDown,
  LayoutDashboard,
  Layers,
} from 'lucide-react';

interface NavbarProps {
  board?: BoardDetail | null;
  onOpenShareModal?: () => void;
}

export function Navbar({ board, onOpenShareModal }: NavbarProps) {
  const { user, logout, updateUserColor } = useAuth();
  const { t } = useI18n();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 dark:bg-stone-900/80 border-b border-stone-200 dark:border-stone-800 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Left Section: Logo & Project Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-transform active:scale-95 flex-shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-400 dark:bg-amber-500 flex items-center justify-center shadow-md transform -rotate-3 group-hover:rotate-0 transition-transform">
              <StickyNote className="w-5 h-5 text-stone-900 stroke-[2.2]" />
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-stone-900 dark:text-stone-100 hidden sm:inline">
              Story<span className="text-amber-500 dark:text-amber-400">Board</span>
            </span>
          </Link>

          {board && (
            <div className="flex items-center gap-2 min-w-0 ml-1 sm:ml-3 pl-2 sm:pl-3 border-l border-stone-300 dark:border-stone-700">
              <Link
                href="/"
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors hidden md:flex items-center gap-1 text-xs font-medium"
                title={t('back_to_boards')}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
              </Link>
              <span className="text-stone-300 dark:text-stone-700 hidden md:inline">/</span>
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-bold text-sm sm:text-base text-stone-800 dark:text-stone-200 truncate max-w-[130px] sm:max-w-[240px]">
                  {board.title}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hidden lg:inline">
                  {board.inviteCode}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Center/Right Section: Active Board Members (if board is active) */}
        {board && (
          <div className="hidden md:flex items-center gap-1.5 overflow-x-auto max-w-[200px] lg:max-w-[320px] py-1">
            <div className="flex -space-x-2 overflow-hidden items-center">
              {board.members.map((member) => (
                <div
                  key={member.id}
                  style={{ backgroundColor: member.user.color }}
                  className="w-7 h-7 rounded-full border-2 border-white dark:border-stone-900 flex items-center justify-center text-white text-[11px] font-bold shadow-sm flex-shrink-0 cursor-default"
                  title={`${member.user.username} (${member.role === 'OWNER' ? t('owner') : t('member')})`}
                >
                  {member.user.username.slice(0, 2).toUpperCase()}
                </div>
              ))}
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium pl-1 hidden xl:inline">
              {board.members.length} {t('members')}
            </span>
          </div>
        )}

        {/* Right Section: Share, Theme, Lang, User Menu */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {board && onOpenShareModal && (
            <button
              onClick={onOpenShareModal}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-900 text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('share_board')}</span>
            </button>
          )}

          <ThemeToggle />
          <LanguageToggle />

          {/* User Profile / Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-xl bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200/70 dark:hover:bg-stone-700/80 transition-all border border-stone-200 dark:border-stone-700/60"
              >
                <div
                  style={{ backgroundColor: user.color }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-sm"
                >
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-200 max-w-[80px] truncate hidden sm:inline">
                  {user.username}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowColorPicker(false);
                    }}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl z-50 p-3 flex flex-col gap-2">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100 dark:border-stone-800">
                      <div
                        style={{ backgroundColor: user.color }}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
                      >
                        {user.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                          {user.username}
                        </div>
                        <div className="text-xs text-stone-500 dark:text-stone-400 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    {/* Change Color */}
                    <div className="py-2 border-b border-stone-100 dark:border-stone-800">
                      <div className="text-xs font-semibold text-stone-600 dark:text-stone-300 mb-2">
                        {t('your_color')}
                      </div>
                      <UserColorPicker
                        selectedColor={user.color}
                        onChange={async (newColor) => {
                          await updateUserColor(newColor);
                        }}
                      />
                    </div>

                    <Link
                      href="/"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    >
                      <Layers className="w-4 h-4 text-stone-500" />
                      {t('my_boards')}
                    </Link>

                    <button
                      onClick={() => logout()}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('logout')}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>{t('login')}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
