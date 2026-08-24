import { WorkflowState, Priority, PostItColor } from '@/types';
import { TranslationKey } from './i18n/en';

export const WORKFLOW_STATES: {
  id: WorkflowState;
  key: TranslationKey;
  badgeBg: string;
  badgeText: string;
  iconName: string;
}[] = [
  {
    id: 'STORY',
    key: 'state_story',
    badgeBg: 'bg-amber-100/90 dark:bg-amber-950/60 border-amber-300/80 dark:border-amber-700/60',
    badgeText: 'text-amber-800 dark:text-amber-300',
    iconName: 'Bookmark',
  },
  {
    id: 'TODO',
    key: 'state_todo',
    badgeBg: 'bg-sky-100/90 dark:bg-sky-950/60 border-sky-300/80 dark:border-sky-700/60',
    badgeText: 'text-sky-800 dark:text-sky-300',
    iconName: 'ListTodo',
  },
  {
    id: 'IN_PROGRESS',
    key: 'state_in_progress',
    badgeBg: 'bg-purple-100/90 dark:bg-purple-950/60 border-purple-300/80 dark:border-purple-700/60',
    badgeText: 'text-purple-800 dark:text-purple-300',
    iconName: 'Clock',
  },
  {
    id: 'COMPLETED',
    key: 'state_completed',
    badgeBg: 'bg-emerald-100/90 dark:bg-emerald-950/60 border-emerald-300/80 dark:border-emerald-700/60',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    iconName: 'CheckCircle2',
  },
];

export const POSTIT_COLORS: Record<
  PostItColor,
  {
    nameKey: TranslationKey;
    bgClass: string;
    darkBgClass: string;
    textClass: string;
    borderClass: string;
    hex: string;
    shadow: string;
  }
> = {
  yellow: {
    nameKey: 'color_yellow',
    bgClass: 'bg-[#FEF9C3] hover:bg-[#FEF08A]',
    darkBgClass: 'dark:bg-[#1E1B13] dark:hover:bg-[#252115]',
    textClass: 'text-stone-900 dark:text-amber-100',
    borderClass: 'border-amber-200/90 dark:border-amber-500/40',
    hex: '#FEF9C3',
    shadow: 'shadow-[0_4px_12px_rgba(251,191,36,0.12)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)]',
  },
  cyan: {
    nameKey: 'color_cyan',
    bgClass: 'bg-[#E0F2FE] hover:bg-[#BAE6FD]',
    darkBgClass: 'dark:bg-[#101C26] dark:hover:bg-[#142431]',
    textClass: 'text-stone-900 dark:text-sky-100',
    borderClass: 'border-sky-200/90 dark:border-sky-500/40',
    hex: '#E0F2FE',
    shadow: 'shadow-[0_4px_12px_rgba(56,189,248,0.12)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)]',
  },
  green: {
    nameKey: 'color_green',
    bgClass: 'bg-[#DCFCE7] hover:bg-[#BBF7D0]',
    darkBgClass: 'dark:bg-[#10221A] dark:hover:bg-[#142B21]',
    textClass: 'text-stone-900 dark:text-emerald-100',
    borderClass: 'border-emerald-200/90 dark:border-emerald-500/40',
    hex: '#DCFCE7',
    shadow: 'shadow-[0_4px_12px_rgba(74,222,128,0.12)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)]',
  },
  pink: {
    nameKey: 'color_pink',
    bgClass: 'bg-[#FCE7F3] hover:bg-[#FBCFE8]',
    darkBgClass: 'dark:bg-[#25131E] dark:hover:bg-[#2F1826]',
    textClass: 'text-stone-900 dark:text-pink-100',
    borderClass: 'border-pink-200/90 dark:border-pink-500/40',
    hex: '#FCE7F3',
    shadow: 'shadow-[0_4px_12px_rgba(244,114,182,0.12)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)]',
  },
  purple: {
    nameKey: 'color_purple',
    bgClass: 'bg-[#F3E8FF] hover:bg-[#EDE9FE]',
    darkBgClass: 'dark:bg-[#1C152B] dark:hover:bg-[#231B36]',
    textClass: 'text-stone-900 dark:text-purple-100',
    borderClass: 'border-purple-200/90 dark:border-purple-500/40',
    hex: '#F3E8FF',
    shadow: 'shadow-[0_4px_12px_rgba(167,139,250,0.12)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)]',
  },
  orange: {
    nameKey: 'color_orange',
    bgClass: 'bg-[#FFEDD5] hover:bg-[#FED7AA]',
    darkBgClass: 'dark:bg-[#241712] dark:hover:bg-[#2D1D16]',
    textClass: 'text-stone-900 dark:text-orange-100',
    borderClass: 'border-orange-200/90 dark:border-orange-500/40',
    hex: '#FFEDD5',
    shadow: 'shadow-[0_4px_12px_rgba(251,146,60,0.12)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)]',
  },
};

export const USER_COLORS = [
  '#3B82F6', // Royal Blue
  '#10B981', // Emerald Green
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#E11D48', // Rose
];

export const PRIORITIES: Record<
  Priority,
  {
    key: TranslationKey;
    color: string;
    bg: string;
    icon: string;
  }
> = {
  LOW: {
    key: 'priority_low',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-100/90 dark:bg-emerald-950/70 border-emerald-300/80 dark:border-emerald-700/60',
    icon: 'ArrowDown',
  },
  MEDIUM: {
    key: 'priority_medium',
    color: 'text-sky-700 dark:text-sky-300',
    bg: 'bg-sky-100/90 dark:bg-sky-950/70 border-sky-300/80 dark:border-sky-700/60',
    icon: 'Minus',
  },
  HIGH: {
    key: 'priority_high',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-100/90 dark:bg-amber-950/70 border-amber-300/80 dark:border-amber-700/60',
    icon: 'ArrowUp',
  },
  URGENT: {
    key: 'priority_urgent',
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-100/90 dark:bg-rose-950/70 border-rose-300/80 dark:border-rose-700/60',
    icon: 'AlertTriangle',
  },
};

export const DEFAULT_TAGS = ['Feature', 'Bug', 'Enhancement', 'Refactor', 'UI/UX', 'DevOps', 'Docs'];
