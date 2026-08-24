'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { BoardDetail } from '@/types';
import { Navbar } from '@/components/Navbar';
import { KanbanBoard } from '@/components/Board/KanbanBoard';
import { ShareModal } from '@/components/Board/ShareModal';
import { useI18n } from '@/lib/i18n/context';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { clientStore } from '@/lib/clientStore';

export default function BoardClient({ id }: { id: string }) {
  const boardId = id;
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { t } = useI18n();

  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push(`/login?redirect=/board?id=${boardId}`);
      return;
    }

    if (user) {
      fetchBoard();
    }
  }, [user, isAuthLoading, boardId]);

  const fetchBoard = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/boards/${boardId}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.board) {
          setBoard(data.board);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      //
    }
    const localBoard = await clientStore.getBoard(boardId);
    if (localBoard) {
      setBoard(localBoard);
      setError('');
    } else {
      setError(t('msg_board_not_found'));
    }
    setIsLoading(false);
  };

  if (isAuthLoading || (isLoading && !board)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-sm font-semibold text-stone-600 dark:text-stone-400">
          {t('loading_board')}
        </p>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="min-h-screen flex flex-col justify-between p-6">
        <Navbar />
        <div className="max-w-md mx-auto my-auto text-center p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
            {error || t('msg_board_not_found')}
          </h2>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-stone-900 font-bold text-xs mt-4 hover:bg-amber-500 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back_to_boards')}</span>
          </Link>
        </div>
        <footer className="text-center text-xs text-stone-400 py-2">
          StoryBoard
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar board={board} onOpenShareModal={() => setShareModalOpen(true)} />

      <main className="flex-1 w-full max-w-[1800px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <KanbanBoard initialBoard={board} />
      </main>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        inviteCode={board.inviteCode}
        boardTitle={board.title}
      />
    </div>
  );
}
