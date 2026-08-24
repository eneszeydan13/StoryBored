'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TicketItem, WorkflowState } from '@/types';
import { PostItCard } from './PostItCard';
import { useI18n } from '@/lib/i18n/context';
import {
  Bookmark,
  ListTodo,
  Clock,
  CheckCircle2,
  Plus,
} from 'lucide-react';

interface KanbanColumnProps {
  id: WorkflowState;
  titleKey: string;
  badgeBg: string;
  badgeText: string;
  iconName: string;
  tickets: TicketItem[];
  onAddTicket: (state: WorkflowState) => void;
  onEditTicket: (ticket: TicketItem) => void;
  onDeleteTicket: (ticketId: string) => void;
  onMoveState: (ticketId: string, newState: WorkflowState) => void;
}

export function KanbanColumn({
  id,
  titleKey,
  badgeBg,
  badgeText,
  iconName,
  tickets,
  onAddTicket,
  onEditTicket,
  onDeleteTicket,
  onMoveState,
}: KanbanColumnProps) {
  const { t } = useI18n();

  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'Column',
      state: id,
    },
  });

  const getIcon = () => {
    switch (iconName) {
      case 'Bookmark':
        return <Bookmark className="w-4 h-4 text-amber-500" />;
      case 'ListTodo':
        return <ListTodo className="w-4 h-4 text-sky-500" />;
      case 'Clock':
        return <Clock className="w-4 h-4 text-purple-500" />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default:
        return <ListTodo className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col w-full min-w-0 rounded-2xl bg-stone-200/50 dark:bg-stone-900/60 backdrop-blur-xs border border-stone-300/60 dark:border-stone-800/80 p-3 h-[calc(100vh-13.5rem)] min-h-[520px] transition-colors shadow-xs">
      {/* Column Header */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-2 border-b border-stone-300/60 dark:border-stone-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-white dark:bg-stone-800 shadow-xs flex-shrink-0">
            {getIcon()}
          </div>
          <h2 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100 tracking-tight truncate">
            {t(titleKey as any)}
          </h2>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full border shadow-xs flex-shrink-0 ${badgeBg} ${badgeText}`}
          >
            {tickets.length}
          </span>
        </div>

        {/* Quick Add Button in header */}
        <button
          type="button"
          onClick={() => onAddTicket(id)}
          className="p-1.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-amber-400 hover:text-stone-900 dark:hover:bg-amber-400 dark:hover:text-stone-900 text-stone-600 dark:text-stone-300 shadow-xs transition-all active:scale-95 border border-stone-200 dark:border-stone-700/60 flex-shrink-0"
          title={t('new_ticket')}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Tickets Scrollable Drop Zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto pr-1 space-y-3.5 rounded-xl transition-colors p-1 ${
          isOver
            ? 'bg-amber-100/30 dark:bg-amber-950/30 ring-2 ring-amber-400/50 ring-dashed'
            : ''
        }`}
      >
        <SortableContext
          items={tickets.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tickets.map((ticket) => (
            <PostItCard
              key={ticket.id}
              ticket={ticket}
              onEdit={onEditTicket}
              onDelete={onDeleteTicket}
              onMoveState={onMoveState}
            />
          ))}
        </SortableContext>

        {/* Empty state when no tickets */}
        {tickets.length === 0 && (
          <div
            onClick={() => onAddTicket(id)}
            className="h-32 rounded-xl border-2 border-dashed border-stone-300/80 dark:border-stone-800 hover:border-amber-400/80 dark:hover:border-amber-500/80 flex flex-col items-center justify-center gap-2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-all cursor-pointer group bg-white/20 dark:bg-stone-800/20"
          >
            <Plus className="w-5 h-5 text-stone-400 group-hover:text-amber-500 group-hover:scale-110 transition-all stroke-[2]" />
            <span className="text-xs font-medium text-center px-4">
              {t('no_tickets_in_col')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
