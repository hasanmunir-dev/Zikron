'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import type { Tag, TagColor } from '@/types';

// ─── Color map ────────────────────────────────────────────────────────────────

export const TAG_COLORS: Record<TagColor, { bg: string; text: string; ring: string }> = {
  slate:  { bg: 'bg-slate-100 dark:bg-slate-800',   text: 'text-slate-700 dark:text-slate-300',   ring: 'ring-slate-300 dark:ring-slate-600' },
  violet: { bg: 'bg-violet-100 dark:bg-violet-900/50', text: 'text-violet-700 dark:text-violet-300', ring: 'ring-violet-300 dark:ring-violet-700' },
  blue:   { bg: 'bg-blue-100 dark:bg-blue-900/50',   text: 'text-blue-700 dark:text-blue-300',    ring: 'ring-blue-300 dark:ring-blue-700' },
  green:  { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-700 dark:text-green-300',   ring: 'ring-green-300 dark:ring-green-700' },
  amber:  { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-700 dark:text-amber-300',   ring: 'ring-amber-300 dark:ring-amber-700' },
  rose:   { bg: 'bg-rose-100 dark:bg-rose-900/50',   text: 'text-rose-700 dark:text-rose-300',    ring: 'ring-rose-300 dark:ring-rose-700' },
  cyan:   { bg: 'bg-cyan-100 dark:bg-cyan-900/50',   text: 'text-cyan-700 dark:text-cyan-300',    ring: 'ring-cyan-300 dark:ring-cyan-700' },
};

interface Props {
  tag: Pick<Tag, 'id' | 'name' | 'color'>;
  onRemove?: (id: string) => void;
  linkable?: boolean;
  size?: 'sm' | 'xs';
}

export function TagChip({ tag, onRemove, linkable = true, size = 'sm' }: Props) {
  const colors = TAG_COLORS[tag.color as TagColor] ?? TAG_COLORS.slate;
  const sizeClass = size === 'xs'
    ? 'text-[10px] px-1.5 py-0.5 gap-1'
    : 'text-xs px-2 py-0.5 gap-1';

  const chip = (
    <span
      className={`inline-flex items-center rounded-full font-medium ring-1 ring-inset transition-colors ${colors.bg} ${colors.text} ${colors.ring} ${sizeClass}`}
    >
      #{tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={e => { e.preventDefault(); e.stopPropagation(); onRemove(tag.id); }}
          className="ml-0.5 hover:opacity-70 transition-opacity"
          aria-label={`Remove #${tag.name}`}
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </span>
  );

  if (linkable && !onRemove) {
    return (
      <Link href={`/app/tags/${encodeURIComponent(tag.name)}`} className="hover:opacity-80 transition-opacity">
        {chip}
      </Link>
    );
  }

  return chip;
}
