'use client';

import React from 'react';
import { Priority, UserSummary } from '@/types';
import { PRIORITIES } from '@/lib/constants';
import { useI18n } from '@/lib/i18n/context';
import { Search, X, User } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedPriority: string;
  onPriorityChange: (p: string) => void;
  selectedAssignee: string;
  onAssigneeChange: (a: string) => void;
  members: { user: UserSummary }[];
  onClearFilters: () => void;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  selectedAssignee,
  onAssigneeChange,
  members,
  onClearFilters,
}: FilterBarProps) {
  const { t } = useI18n();
  const priorityKeys = Object.keys(PRIORITIES) as Priority[];
  const hasActiveFilters = searchQuery || selectedPriority || selectedAssignee;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white/70 dark:bg-stone-900/70 backdrop-blur-md p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('search_placeholder')}
          className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter dropdowns & quick tags */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Priority Filter */}
        <select
          value={selectedPriority}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60 text-xs font-semibold text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        >
          <option value="">{t('filter_all')}</option>
          {priorityKeys.map((pk) => (
            <option key={pk} value={pk}>
              {t(PRIORITIES[pk].key as any)}
            </option>
          ))}
        </select>

        {/* Assignee Filter */}
        <div className="flex items-center gap-1.5">
          <select
            value={selectedAssignee}
            onChange={(e) => onAssigneeChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60 text-xs font-semibold text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          >
            <option value="">{t('filter_by_assignee')}</option>
            <option value="unassigned">{t('ticket_unassigned')}</option>
            {members.map((m) => (
              <option key={m.user.id} value={m.user.id}>
                {m.user.username}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>{t('clear_filters')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
