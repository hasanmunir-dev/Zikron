'use client';

import { useState } from 'react';
import { FolderOpen, Plus, Check, Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  useCollections,
  useAddCollectionItem,
  useCreateCollection,
} from '@/hooks/queries/use-collections';
import type { CollectionItemType } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: CollectionItemType;
  itemId: string;
}

const COLLECTION_COLORS = [
  { label: 'Violet', value: 'violet', cls: 'bg-violet-500' },
  { label: 'Blue',   value: 'blue',   cls: 'bg-blue-500' },
  { label: 'Green',  value: 'green',  cls: 'bg-emerald-500' },
  { label: 'Rose',   value: 'rose',   cls: 'bg-rose-500' },
  { label: 'Amber',  value: 'amber',  cls: 'bg-amber-500' },
];

function colorDot(color: string | null) {
  const found = COLLECTION_COLORS.find(c => c.value === color);
  return found?.cls ?? 'bg-violet-500';
}

export function AddToCollectionDialog({ open, onOpenChange, itemType, itemId }: Props) {
  const { data: collections = [], isLoading } = useCollections();
  const addItem = useAddCollectionItem();
  const createCollection = useCreateCollection();

  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const filtered = collections.filter(c =>
    !c.is_archived && (!query || c.title.toLowerCase().includes(query.toLowerCase()))
  );

  async function handleAdd(collectionId: string) {
    await addItem.mutateAsync({ collectionId, item_type: itemType, item_id: itemId });
    setAddedIds(prev => new Set(prev).add(collectionId));
  }

  async function handleCreate() {
    if (!newTitle.trim()) return;
    const col = await createCollection.mutateAsync({ title: newTitle.trim(), color: 'violet', icon: '📁' });
    await addItem.mutateAsync({ collectionId: col.id, item_type: itemType, item_id: itemId });
    setAddedIds(prev => new Set(prev).add(col.id));
    setNewTitle('');
    setShowCreate(false);
  }

  function handleClose() {
    setQuery('');
    setShowCreate(false);
    setNewTitle('');
    setAddedIds(new Set());
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm w-[95vw]" onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search collections…"
            className="w-full pl-8 pr-3 py-2 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all text-foreground placeholder:text-muted-foreground"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={12} />
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-60 overflow-y-auto space-y-1 -mx-1 px-1">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>
          ) : filtered.length === 0 && !query ? (
            <p className="text-sm text-muted-foreground text-center py-4">No collections yet.</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No results for "{query}"</p>
          ) : (
            filtered.map(col => {
              const added = addedIds.has(col.id);
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => !added && handleAdd(col.id)}
                  disabled={added || addItem.isPending}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    added
                      ? 'bg-primary/10 text-primary cursor-default'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <div className={`h-6 w-6 rounded-md flex items-center justify-center text-sm ${colorDot(col.color)} text-white shrink-0`}>
                    {col.icon ?? '📁'}
                  </div>
                  <span className="flex-1 text-sm font-medium truncate">{col.title}</span>
                  {added && <Check size={14} className="text-primary shrink-0" />}
                </button>
              );
            })
          )}
        </div>

        {/* Create new */}
        <div className="border-t border-border pt-3">
          {showCreate ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setShowCreate(false); setNewTitle(''); } }}
                placeholder="Collection name…"
                className="flex-1 px-3 py-2 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all text-foreground placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newTitle.trim() || createCollection.isPending}
                className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setNewTitle(''); }}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <Plus size={14} />
              Create new collection
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
