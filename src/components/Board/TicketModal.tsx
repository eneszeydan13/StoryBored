'use client';

import React, { useState, useEffect } from 'react';
import { TicketItem, WorkflowState, Priority, PostItColor, UserSummary } from '@/types';
import { WORKFLOW_STATES, PRIORITIES, DEFAULT_TAGS } from '@/lib/constants';
import { PostItColorPicker } from '@/components/UI/ColorPicker';
import { useI18n } from '@/lib/i18n/context';
import { X, Trash2, Check, User } from 'lucide-react';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<TicketItem>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  initialData?: TicketItem | null;
  defaultState?: WorkflowState;
  members: { user: UserSummary }[];
}

export function TicketModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  defaultState = 'STORY',
  members,
}: TicketModalProps) {
  const { t } = useI18n();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [state, setState] = useState<WorkflowState>(defaultState);
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [color, setColor] = useState<PostItColor>('yellow');
  const [tags, setTags] = useState('');
  const [storyPoints, setStoryPoints] = useState<string>('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setState(initialData.state);
      setPriority(initialData.priority);
      setColor(initialData.color);
      setTags(initialData.tags || '');
      setStoryPoints(initialData.storyPoints ? String(initialData.storyPoints) : '');
      setAssigneeId(initialData.assigneeId || '');
    } else {
      setTitle('');
      setDescription('');
      setState(defaultState);
      setPriority('MEDIUM');
      setColor('yellow');
      setTags('');
      setStoryPoints('');
      setAssigneeId('');
    }
    setError('');
  }, [initialData, defaultState, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(t('msg_fill_required'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        state,
        priority,
        color,
        tags: tags.trim(),
        storyPoints: storyPoints ? parseInt(storyPoints, 10) : null,
        assigneeId: assigneeId || null,
      });
      onClose();
    } catch {
      setError(t('msg_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = (tag: string) => {
    const existing = tags
      ? tags.split(',').map((x) => x.trim())
      : [];
    if (!existing.includes(tag)) {
      setTags(existing.length > 0 ? `${tags}, ${tag}` : tag);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30">
          <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
            {initialData ? t('edit_ticket') : t('create_ticket')}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              {t('ticket_title')} *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('ticket_title_placeholder')}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              {t('ticket_description')}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('ticket_description_placeholder')}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
            />
          </div>

          {/* Color & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Post-it Color */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                {t('ticket_color')}
              </label>
              <PostItColorPicker selectedColor={color} onChange={setColor} />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                {t('ticket_priority')}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
              >
                {(Object.keys(PRIORITIES) as Priority[]).map((pk) => (
                  <option key={pk} value={pk}>
                    {t(PRIORITIES[pk].key)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Workflow State & Story Points Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Column / State */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                {t('ticket_state')}
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value as WorkflowState)}
                className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
              >
                {WORKFLOW_STATES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {t(s.key)}
                  </option>
                ))}
              </select>
            </div>

            {/* Story Points */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                {t('ticket_story_points')}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
                placeholder={t('ticket_story_points_placeholder')}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
              />
            </div>
          </div>

          {/* Assignee Selection */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center justify-between">
              <span>{t('ticket_assignee')}</span>
              <span className="text-[11px] text-stone-400 font-normal">
                {t('ticket_assignee_hint')}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
              >
                <option value="">{t('ticket_unassigned')}</option>
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.username} ({m.user.email})
                  </option>
                ))}
              </select>

              {/* Show selected user preview */}
              {assigneeId && (
                <div
                  style={{
                    backgroundColor:
                      members.find((m) => m.user.id === assigneeId)?.user.color || '#3B82F6',
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0"
                >
                  {members
                    .find((m) => m.user.id === assigneeId)
                    ?.user.username.slice(0, 2)
                    .toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              {t('ticket_tags')}
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={t('ticket_tags_placeholder')}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60 mb-2"
            />
            {/* Tag suggestions */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] text-stone-400 mr-1">{t('quick_suggestions')}</span>
              {DEFAULT_TAGS.map((tTag) => (
                <button
                  key={tTag}
                  type="button"
                  onClick={() => handleAddTag(tTag)}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-colors border border-stone-200 dark:border-stone-700"
                >
                  +{tTag}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800 mt-6">
            {initialData && onDelete ? (
              <button
                type="button"
                onClick={async () => {
                  if (confirm(t('confirm'))) {
                    await onDelete(initialData.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('delete')}</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-950 text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{initialData ? t('save_changes') : t('create_ticket')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
