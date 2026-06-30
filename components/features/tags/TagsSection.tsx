'use client';

import { useState, useRef, useEffect } from 'react';
import { Hash, Plus } from 'lucide-react';
import { TagChip, TAG_COLORS } from './TagChip';
import { useItemTags, useAddTagToItem, useRemoveTagFromItem, useTags } from '@/hooks/queries/use-tags';
import type { Tag, TagColor, TagItemType } from '@/types';

interface Props {
  itemType: TagItemType;
  itemId: string | undefined;
  /** Override container class. Defaults to 'mt-4 pt-4 border-t border-border'. */
  className?: string;
}

export function TagsSection({ itemType, itemId, className }: Props) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: tags = [], isLoading } = useItemTags(itemType, itemId);
  const { data: allTags = [] } = useTags();
  const addTag = useAddTagToItem(itemType, itemId ?? '');
  const removeTag = useRemoveTagFromItem(itemType, itemId ?? '');

  if (!itemId) return null;

  const q = input.trim().toLowerCase().replace(/^#/, '');

  const suggestions = allTags
    .filter(t => !tags.some(cur => cur.id === t.id))
    .filter(t => !q || t.name.startsWith(q))
    .slice(0, 8);

  const canCreate = q.length > 0 && !suggestions.some(t => t.name === q) && !tags.some(t => t.name === q);
  const options: Array<Tag | { id: string; name: string; isNew: true }> = canCreate
    ? [...suggestions, { id: '__new__', name: q, isNew: true as const }]
    : suggestions;

  function commit(name: string) {
    const n = name.trim().toLowerCase().replace(/^#/, '');
    if (!n || tags.some(t => t.name === n)) return;
    addTag.mutate(n);
    setInput('');
    setOpen(false);
    setIdx(0);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIdx(i => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (open && options[idx]) {
        commit(options[idx].name);
      } else if (q) {
        commit(q);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setInput('');
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag.mutate(tags[tags.length - 1].id);
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setIdx(0); }, [input]);

  return (
    <div className={className ?? 'mt-4 pt-4 border-t border-border'}>
      {/* Label row */}
      <div className="flex items-center gap-1.5 mb-2">
        <Hash className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tags</span>
        {tags.length > 0 && (
          <span className="text-[10px] bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 leading-none">
            {tags.length}
          </span>
        )}
      </div>

      {/* Input container — chips + inline text field */}
      <div ref={containerRef} className="relative">
        <div
          className="flex flex-wrap gap-1.5 items-center min-h-9 px-2.5 py-1.5 rounded-lg border border-border bg-background hover:border-primary/40 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/10 transition-all cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          {isLoading ? (
            <span className="text-xs text-muted-foreground animate-pulse">Loading…</span>
          ) : (
            <>
              {tags.map(tag => (
                <TagChip
                  key={tag.id}
                  tag={tag}
                  linkable={false}
                  onRemove={id => removeTag.mutate(id)}
                />
              ))}
              <input
                ref={inputRef}
                value={input}
                onChange={e => { setInput(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder={tags.length === 0 ? 'Add tags…' : '+'}
                className="flex-1 min-w-16 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground/50 py-0.5"
              />
            </>
          )}
        </div>

        {/* Autocomplete dropdown — opens ABOVE to avoid dialog clipping */}
        {open && options.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-1.5 z-60 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden">
            <div className="py-1 max-h-52 overflow-y-auto">
              {options.map((opt, i) => {
                const isNew = 'isNew' in opt;
                const colors = !isNew ? TAG_COLORS[(opt as Tag).color as TagColor] ?? TAG_COLORS.slate : null;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onMouseDown={e => { e.preventDefault(); commit(opt.name); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                      i === idx ? 'bg-primary/8 text-foreground' : 'hover:bg-muted/60'
                    }`}
                  >
                    {isNew ? (
                      <>
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 shrink-0">
                          <Plus className="w-3 h-3 text-primary" />
                        </span>
                        <span className="text-sm text-foreground">
                          Create <span className="font-semibold text-primary">#{opt.name}</span>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className={`w-2 h-2 rounded-full shrink-0 ${colors!.bg.split(' ')[0]}`} />
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${colors!.bg} ${colors!.text} ${colors!.ring}`}>
                          #{opt.name}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Hint — only when empty and not loading */}
      {!isLoading && tags.length === 0 && (
        <p className="text-[10px] text-muted-foreground/40 mt-1.5 pl-0.5">
          Type a tag name · Enter to add · Backspace to remove
        </p>
      )}
    </div>
  );
}
