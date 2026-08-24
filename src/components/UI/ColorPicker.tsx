'use client';

import React from 'react';
import { USER_COLORS, POSTIT_COLORS } from '@/lib/constants';
import { PostItColor } from '@/types';
import { useI18n } from '@/lib/i18n/context';
import { Check } from 'lucide-react';

interface UserColorPickerProps {
  selectedColor: string;
  onChange: (color: string) => void;
}

export function UserColorPicker({ selectedColor, onChange }: UserColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2.5 items-center">
      {USER_COLORS.map((color) => {
        const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
        return (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            style={{ backgroundColor: color }}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm ${
              isSelected ? 'ring-2 ring-offset-2 ring-stone-900 dark:ring-stone-100 scale-105' : ''
            }`}
          >
            {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
          </button>
        );
      })}
    </div>
  );
}

interface PostItColorPickerProps {
  selectedColor: PostItColor;
  onChange: (color: PostItColor) => void;
}

export function PostItColorPicker({ selectedColor, onChange }: PostItColorPickerProps) {
  const { t } = useI18n();
  const keys = Object.keys(POSTIT_COLORS) as PostItColor[];

  return (
    <div className="flex flex-wrap gap-2.5 items-center">
      {keys.map((colorKey) => {
        const col = POSTIT_COLORS[colorKey];
        const isSelected = selectedColor === colorKey;
        return (
          <button
            key={colorKey}
            type="button"
            onClick={() => onChange(colorKey)}
            style={{ backgroundColor: col.hex }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center border border-stone-300/80 shadow-sm transition-all hover:scale-105 ${
              isSelected ? 'ring-2 ring-offset-2 ring-stone-800 dark:ring-stone-200 scale-105' : ''
            }`}
            title={t(col.nameKey)}
          >
            {isSelected && <Check className="w-4 h-4 text-stone-900 stroke-[3]" />}
          </button>
        );
      })}
    </div>
  );
}
