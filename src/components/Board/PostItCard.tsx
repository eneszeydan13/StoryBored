'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TicketItem, WorkflowState } from '@/types';
import { POSTIT_COLORS, PRIORITIES, WORKFLOW_STATES } from '@/lib/constants';
import { useI18n } from '@/lib/i18n/context';
import {
  MoreVertical,
  Edit2,
  Trash2,
  MoveRight,
  GripVertical,
  User,
  Hash,
} from 'lucide-react';

interface PostItCardProps {
  ticket: TicketItem;
  onEdit: (ticket: TicketItem) => void;
  onDelete: (ticketId: string) => void;
  onMoveState: (ticketId: string, newState: WorkflowState) => void;
  isDragOverlay?: boolean;
}

export function PostItCard({
  ticket,
  onEdit,
  onDelete,
  onMoveState,
  isDragOverlay = false,
}: PostItCardProps) {
  const { t, language } = useI18n();
  const [showMenu, setShowMenu] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: ticket.id,
    data: {
      type: 'Ticket',
      ticket,
    },
    disabled: isDragOverlay,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const colorConfig = POSTIT_COLORS[ticket.color] || POSTIT_COLORS.yellow;
  const priorityConfig = PRIORITIES[ticket.priority] || PRIORITIES.MEDIUM;

  // Split tags if any
  const tagsList = ticket.tags
    ? ticket.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  // Deterministic tilt angle based on ticket ID characters for natural feel (-1.2deg to +1.2deg)
  const tiltDegrees = ((ticket.id.charCodeAt(0) % 5) - 2) * 0.55;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        transform: transform
          ? CSS.Translate.toString(transform)
          : isDragOverlay
          ? 'rotate(2deg) scale(1.03)'
          : `rotate(${tiltDegrees}deg)`,
      }}
      className={`postit-card relative rounded-xl p-4 border transition-all select-none flex flex-col justify-between min-h-[170px] ${
        colorConfig.bgClass
      } ${colorConfig.darkBgClass} ${colorConfig.borderClass} ${colorConfig.textClass} ${
        colorConfig.shadow
      } ${isDragging ? 'opacity-35 scale-95 shadow-none' : 'opacity-100'} ${
        isDragOverlay ? 'shadow-2xl ring-2 ring-amber-400 z-50' : ''
      }`}
    >
      {/* Decorative Masking Tape on top */}
      <div className="masking-tape rounded-xs" />

      {/* Decorative folded dog-ear at bottom-right */}
      <div className="dog-ear" />

      {/* Card Header: Drag Handle, Priority, Story Points, Actions */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Drag Grip Handle */}
          <div
            {...attributes}
            {...listeners}
            className="p-1 -ml-1 text-stone-700/60 dark:text-stone-300/60 hover:text-stone-900 dark:hover:text-stone-100 cursor-grab active:cursor-grabbing rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title={t('drag_tooltip')}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          {/* Priority Pill */}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-xs flex items-center gap-1 ${priorityConfig.bg} ${priorityConfig.color}`}
          >
            {t(priorityConfig.key)}
          </span>

          {/* Story Points */}
          {ticket.storyPoints !== null && ticket.storyPoints !== undefined && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-stone-900/10 dark:bg-white/10 text-stone-800 dark:text-stone-200 flex items-center gap-0.5">
              <Hash className="w-2.5 h-2.5" />
              {ticket.storyPoints}
            </span>
          )}
        </div>

        {/* Action Menu (Edit, Delete, Move) */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded-lg text-stone-700/70 dark:text-stone-300/70 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  setShowMoveMenu(false);
                }}
              />
              <div className="absolute right-0 top-6 w-44 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl z-40 p-1.5 text-xs text-stone-800 dark:text-stone-200">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onEdit(ticket);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-left"
                >
                  <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                  <span>{t('edit_ticket')}</span>
                </button>

                {/* Quick Move Submenu Toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMoveMenu(!showMoveMenu);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <MoveRight className="w-3.5 h-3.5 text-stone-500" />
                    <span>{t('quick_move')}</span>
                  </div>
                </button>

                {showMoveMenu && (
                  <div className="my-1 pl-4 border-l border-stone-200 dark:border-stone-800 space-y-1">
                    {WORKFLOW_STATES.filter((s) => s.id !== ticket.state).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(false);
                          setShowMoveMenu(false);
                          onMoveState(ticket.id, s.id);
                        }}
                        className="w-full text-left px-2 py-1 rounded hover:bg-amber-50 dark:hover:bg-amber-950/40 text-[11px] font-medium text-stone-700 dark:text-stone-300"
                      >
                        → {t(s.key)}
                      </button>
                    ))}
                  </div>
                )}

                <div className="my-1 border-t border-stone-100 dark:border-stone-800" />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onDelete(ticket.id);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('delete_ticket')}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <h3
        onClick={() => onEdit(ticket)}
        className="font-bold text-sm sm:text-base leading-snug cursor-pointer hover:underline decoration-stone-500/40 underline-offset-2 break-words mb-1.5 text-stone-950 dark:text-stone-50 font-sans"
      >
        {ticket.title}
      </h3>

      {/* Description Preview */}
      {ticket.description && (
        <p className="text-xs opacity-85 line-clamp-3 mb-3 leading-relaxed whitespace-pre-wrap font-sans text-stone-800 dark:text-stone-200">
          {ticket.description}
        </p>
      )}

      {/* Tags Chips */}
      {tagsList.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tagsList.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10 text-stone-800 dark:text-stone-200 border border-black/5 dark:border-white/10"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Card Footer: Left is Date, Right (Bottom-Right) is Assignee with User Color */}
      <div className="pt-2 mt-auto border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium opacity-65">
          {new Date(ticket.createdAt).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>

        {/* BOTTOM RIGHT CORNER: Assigned User Badge with User Color */}
        {ticket.assignee ? (
          <div
            className="flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded-full bg-white/80 dark:bg-stone-900/80 border border-black/10 dark:border-white/10 shadow-xs group"
            title={`${t('ticket_assigned_to')}: ${ticket.assignee.username} (${ticket.assignee.email})`}
          >
            <div
              style={{ backgroundColor: ticket.assignee.color }}
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-xs ring-1 ring-white/50"
            >
              {ticket.assignee.username.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-[11px] font-bold text-stone-900 dark:text-stone-100 max-w-[70px] truncate">
              {ticket.assignee.username}
            </span>
          </div>
        ) : (
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-[10px] font-medium opacity-60"
            title={t('ticket_unassigned')}
          >
            <User className="w-3 h-3" />
            <span className="hidden sm:inline">{t('ticket_unassigned')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
