'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Check, Search, X, FolderOpen, Loader2, FolderPlus } from 'lucide-react';
import {
  useCollectionLinkStatus,
  useToggleCollectionItem,
  useCreateCollection,
  type CollectionLinkEntry,
} from '@/hooks/queries/use-collections';
import type { CollectionItemType } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: CollectionItemType;
  itemId: string;
}

const COLOR_BG: Record<string, string> = {
  violet: 'bg-violet-500',
  blue:   'bg-blue-500',
  green:  'bg-emerald-500',
  rose:   'bg-rose-500',
  amber:  'bg-amber-500',
  slate:  'bg-slate-500',
  indigo: 'bg-indigo-500',
};

function accentBg(color: string | null): string {
  return COLOR_BG[color ?? ''] ?? COLOR_BG.violet;
}

export function AddToCollectionDialog({ open, onOpenChange, itemType, itemId }: Props) {
  const { data, isLoading, refetch } = useCollectionLinkStatus(itemType, itemId);
  const toggle     = useToggleCollectionItem();
  const createCol  = useCreateCollection();

  const [query, setQuery]       = useState('');
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  // Tracks which collectionIds are currently being toggled (for per-row spinner)
  const [busyIds, setBusyIds]   = useState<Set<string>>(new Set());

  const searchRef      = useRef<HTMLInputElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);

  const collections: CollectionLinkEntry[] = data?.collections ?? [];

  const filtered = useMemo(
    () => collections.filter(c =>
      !query.trim() || c.title.toLowerCase().includes(query.trim().toLowerCase())
    ),
    [collections, query],
  );

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 60);
  }, [open]);

  useEffect(() => {
    if (creating) setTimeout(() => createInputRef.current?.focus(), 40);
  }, [creating]);

  async function handleToggle(col: CollectionLinkEntry) {
    if (busyIds.has(col.id)) return;
    setBusyIds(prev => new Set(prev).add(col.id));
    try {
      await toggle.mutateAsync({ collectionId: col.id, item_type: itemType, item_id: itemId });
    } finally {
      setBusyIds(prev => { const s = new Set(prev); s.delete(col.id); return s; });
    }
  }

  async function handleCreate() {
    const title = newTitle.trim();
    if (!title) return;
    const col = await createCol.mutateAsync({ title, color: 'violet' });
    // Link the item to the newly created collection
    await toggle.mutateAsync({ collectionId: col.id, item_type: itemType, item_id: itemId });
    setNewTitle('');
    setCreating(false);
    // Re-fetch to show the new collection with linked state
    refetch();
  }

  function handleClose() {
    setQuery('');
    setCreating(false);
    setNewTitle('');
    setBusyIds(new Set());
    onOpenChange(false);
  }

  if (!open) return null;

  const linkedCount = collections.filter(c => c.is_linked).length;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[min(90vh,560px)]"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <FolderOpen size={16} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Add to Collection</h2>
            {linkedCount > 0 && (
              <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {linkedCount} linked
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Search ── */}
        <div className="px-4 pt-3 pb-2 shrink-0">
          <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2.5">
            <Search size={14} className="text-muted-foreground shrink-0" />
            <input
              ref={searchRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search collections…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear"
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* ── Collection list ── */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
              <Loader2 size={15} className="animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <FolderOpen size={28} className="text-muted-foreground/25" />
              <p className="text-sm text-muted-foreground text-center">
                {query.trim()
                  ? `No results for "${query}"`
                  : 'No collections yet. Create one below.'}
              </p>
            </div>
          ) : (
            <div className="space-y-0.5 py-1">
              {filtered.map(col => {
                const isBusy = busyIds.has(col.id);
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => handleToggle(col)}
                    disabled={isBusy}
                    className={`group w-full flex items-center gap-3 pl-0 pr-3 py-2.5 rounded-xl text-left transition-all overflow-hidden ${
                      isBusy ? 'opacity-60 cursor-wait' : 'hover:bg-muted/60 cursor-pointer'
                    }`}
                  >
                    {/* Color accent bar */}
                    <div className={`w-1 self-stretch rounded-r-full shrink-0 ml-2 ${accentBg(col.color)}`} />

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">{col.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {col.item_count} {col.item_count === 1 ? 'item' : 'items'}
                        {col.description && (
                          <span className="ml-1 opacity-70">· {col.description}</span>
                        )}
                      </p>
                    </div>

                    {/* State badge */}
                    {isBusy ? (
                      <Loader2 size={14} className="animate-spin text-muted-foreground shrink-0" />
                    ) : col.is_linked ? (
                      <span className="flex items-center gap-1 text-xs font-medium shrink-0 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                        <Check size={11} />
                        Added
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium shrink-0 px-2 py-1 rounded-full bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={11} />
                        Add
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Hint ── */}
        {!isLoading && collections.length > 0 && (
          <p className="px-4 pb-2 shrink-0 text-[11px] text-muted-foreground/60 text-center">
            Click a collection to add or remove this item
          </p>
        )}

        {/* ── Create new ── */}
        <div className="shrink-0 border-t border-border px-3 py-3">
          {creating ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2">
                <input
                  ref={createInputRef}
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreate();
                    if (e.key === 'Escape') { setCreating(false); setNewTitle(''); }
                  }}
                  placeholder="Collection name…"
                  maxLength={80}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newTitle.trim() || createCol.isPending}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0"
              >
                {createCol.isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                Create
              </button>
              <button
                type="button"
                onClick={() => { setCreating(false); setNewTitle(''); }}
                aria-label="Cancel"
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <FolderPlus size={15} className="shrink-0" />
              New collection
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
