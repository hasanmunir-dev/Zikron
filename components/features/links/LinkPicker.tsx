'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, BookOpen, Inbox, Table2, Bell, FolderOpen, User2, X } from 'lucide-react';
import { useSearchLinkable } from '@/hooks/queries/use-item-links';
import type { LinkableItem, LinkableItemType } from '@/types';

const TYPE_CONFIG: Record<LinkableItemType, { label: string; Icon: React.ElementType; color: string }> = {
  note:       { label: 'Note',       Icon: BookOpen,   color: 'text-blue-500'   },
  inbox:      { label: 'Inbox',      Icon: Inbox,      color: 'text-purple-500' },
  list:       { label: 'List',       Icon: Table2,     color: 'text-green-500'  },
  reminder:   { label: 'Reminder',   Icon: Bell,       color: 'text-amber-500'  },
  collection: { label: 'Collection', Icon: FolderOpen, color: 'text-orange-500' },
  contact:    { label: 'Contact',    Icon: User2,      color: 'text-pink-500'   },
};

interface Props {
  /** Called when user selects an item */
  onSelect: (item: LinkableItem) => void;
  /** Items to exclude from results (already linked) */
  excludeIds?: string[];
  placeholder?: string;
  autoFocus?: boolean;
}

export function LinkPicker({ onSelect, excludeIds = [], placeholder = 'Search notes, lists, reminders…', autoFocus = true }: Props) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: results = [], isFetching } = useSearchLinkable(query);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const filtered = results.filter(r => !excludeIds.includes(r.id));

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-8 pr-7 py-1.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background text-foreground placeholder:text-muted-foreground"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={12} />
          </button>
        )}
      </div>

      {query.trim().length > 0 && (
        <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm max-h-52 overflow-y-auto">
          {isFetching && filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-3">Searching…</p>
          )}
          {!isFetching && filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-3">No items found</p>
          )}
          {filtered.map(item => {
            const cfg = TYPE_CONFIG[item.type];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => { onSelect(item); setQuery(''); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted transition-colors text-left"
              >
                <cfg.Icon size={13} className={`shrink-0 ${cfg.color}`} />
                <span className="flex-1 text-sm text-foreground truncate">{item.title}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">{cfg.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { TYPE_CONFIG };
export type { LinkableItemType };
