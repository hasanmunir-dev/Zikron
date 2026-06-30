'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Hash } from 'lucide-react';
import { useTags } from '@/hooks/queries/use-tags';
import { TAG_COLORS } from './TagChip';
import type { Tag, TagColor } from '@/types';

interface Props {
  excludeIds?: string[];
  onSelect: (tag: Tag | { name: string; isNew: true }) => void;
  placeholder?: string;
}

export function TagPicker({ excludeIds = [], onSelect, placeholder = 'Add tag…' }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  const { data: allTags = [] } = useTags();

  // Normalize query for matching
  const q = query.trim().toLowerCase().replace(/^#/, '');

  const filtered = allTags
    .filter(t => !excludeIds.includes(t.id))
    .filter(t => !q || t.name.includes(q));

  const canCreate = q.length > 0 && !filtered.some(t => t.name === q);
  const options = canCreate ? [...filtered, { id: '__new__', name: q, isNew: true as const }] : filtered;

  useEffect(() => { setIdx(0); }, [query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [close]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, options.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = options[idx];
      if (opt) {
        if ('isNew' in opt) onSelect({ name: opt.name, isNew: true });
        else onSelect(opt as Tag);
        close();
      }
    } else if (e.key === 'Escape') {
      close();
    }
  }

  function handleSelect(opt: (typeof options)[number]) {
    if ('isNew' in opt) onSelect({ name: opt.name, isNew: true });
    else onSelect(opt as Tag);
    close();
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => { setOpen(v => !v); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border rounded-full px-2 py-0.5 hover:bg-accent transition-colors"
      >
        <Plus className="w-3 h-3" />
        Add tag
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute left-0 top-full mt-1 z-50 w-52 bg-popover border border-border rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted">
              <Hash className="w-3 h-3 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="flex-1 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="max-h-44 overflow-y-auto py-1">
            {options.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">No tags found</p>
            )}
            {options.map((opt, i) => {
              const isNew = 'isNew' in opt;
              const colors = !isNew ? TAG_COLORS[(opt as Tag).color as TagColor] ?? TAG_COLORS.slate : TAG_COLORS.slate;
              return (
                <button
                  key={opt.id ?? opt.name}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
                    i === idx ? 'bg-accent' : 'hover:bg-accent/50'
                  }`}
                >
                  {isNew ? (
                    <>
                      <Plus className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-foreground">Create <strong>#{opt.name}</strong></span>
                    </>
                  ) : (
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ring-1 ring-inset ${colors.bg} ${colors.text} ${colors.ring}`}>
                      #{opt.name}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
