'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FolderOpen, Plus, Search, X, Star, Archive, Pencil, Trash2,
  BookOpen, Inbox, Table2, MessageSquare, Bell, Hash, Share2, Users, Check,
} from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { ShareDialog } from '@/components/features/sharing/ShareDialog';
import { SharedItemDetailDialog } from '@/components/features/sharing/SharedItemDetailDialog';
import { MarkdownEditor } from '@/components/editor/markdown-editor';
import { MarkdownViewer } from '@/components/editor/markdown-viewer';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useCollections, useCollection, useCreateCollection,
  useUpdateCollection, useDeleteCollection, useRemoveCollectionItem,
  useBulkUpdateCollections, useBulkDeleteCollections,
} from '@/hooks/queries/use-collections';
import { useBulkSelection } from '@/hooks/use-bulk-selection';
import { BulkActionToolbar } from '@/components/shared/bulk-action-toolbar';
import { useSharedWithMe } from '@/hooks/queries/use-shared-links';
import { formatRelativeTime } from '@/utils/date';
import type { Collection, CollectionWithItems, CollectionItem, CollectionItemType, SharedWithMeItem } from '@/types';

const BASE = '/app/collections';

const COLLECTION_COLORS = [
  { label: 'Blue',   value: 'blue',   cls: 'bg-blue-500' },
  { label: 'Violet', value: 'violet', cls: 'bg-violet-500' },
  { label: 'Green',  value: 'green',  cls: 'bg-emerald-500' },
  { label: 'Rose',   value: 'rose',   cls: 'bg-rose-500' },
  { label: 'Amber',  value: 'amber',  cls: 'bg-amber-500' },
  { label: 'Cyan',   value: 'cyan',   cls: 'bg-cyan-500' },
  { label: 'Slate',  value: 'slate',  cls: 'bg-slate-500' },
];

const COLLECTION_ICONS = ['📁', '📚', '🎯', '💡', '🔖', '🧠', '🗂️', '⭐', '🚀', '🔬', '💼', '🎨'];

function colorClass(color: string | null) {
  const found = COLLECTION_COLORS.find(c => c.value === color);
  return found?.cls ?? 'bg-violet-500';
}

function itemTypeIcon(type: CollectionItemType) {
  switch (type) {
    case 'note': return <BookOpen size={14} className="text-violet-500" />;
    case 'inbox': return <Inbox size={14} className="text-blue-500" />;
    case 'list': return <Table2 size={14} className="text-indigo-500" />;
    case 'self_chat': return <MessageSquare size={14} className="text-emerald-500" />;
    case 'reminder': return <Bell size={14} className="text-amber-500" />;
  }
}

function itemTypeLabel(type: CollectionItemType) {
  switch (type) {
    case 'note': return 'Note';
    case 'inbox': return 'Inbox';
    case 'list': return 'List';
    case 'self_chat': return 'Chat';
    case 'reminder': return 'Reminder';
  }
}

function itemHref(type: CollectionItemType, id: string) {
  switch (type) {
    case 'note': return `/app/notes?detail=${id}`;
    case 'inbox': return `/app/inbox?detail=${id}`;
    case 'list': return `/app/lists/${id}`;
    case 'self_chat': return `/app/self-chat`;
    case 'reminder': return `/app/reminders?detail=${id}`;
  }
}

// ─── Form ──────────────────────────────────────────────────────────────────────

interface CollectionFormData {
  title: string;
  description: string;
  color: string;
  icon: string;
}

const defaultForm: CollectionFormData = { title: '', description: '', color: 'violet', icon: '📁' };

function CollectionForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: CollectionFormData;
  onSave: (data: CollectionFormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<CollectionFormData>(initial ?? defaultForm);

  return (
    <div className="space-y-4 py-2">
      {/* Icon + color row */}
      <div className="flex items-start gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Icon</p>
          <div className="grid grid-cols-6 gap-1.5">
            {COLLECTION_ICONS.map(ic => (
              <button
                key={ic}
                type="button"
                onClick={() => setForm(f => ({ ...f, icon: ic }))}
                className={`h-8 w-8 rounded-lg flex items-center justify-center text-base transition-all border ${
                  form.icon === ic
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-muted'
                }`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Color</p>
          <div className="flex flex-wrap gap-2">
            {COLLECTION_COLORS.map(({ value, cls }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm(f => ({ ...f, color: value }))}
                className={`h-7 w-7 rounded-full ${cls} transition-all ${
                  form.color === value ? 'ring-2 ring-offset-2 ring-primary' : ''
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Title *</label>
        <input
          autoFocus
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="My Collection"
          className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Description (Markdown)</label>
        <MarkdownEditor
          value={form.description}
          onChange={v => setForm(f => ({ ...f, description: v }))}
          minHeight="120px"
          placeholder="Describe this collection..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors text-foreground"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={!form.title.trim() || saving}
          className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// ─── Collection card ───────────────────────────────────────────────────────────

function CollectionCard({ col, onDelete, onShare }: { col: Collection; onDelete: () => void; onShare: () => void }) {
  const update = useUpdateCollection();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="relative group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all hover:shadow-sm">
      {/* Color bar */}
      <div className={`h-1 w-full ${colorClass(col.color)}`} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl shrink-0">{col.icon ?? '📁'}</span>
            <div className="min-w-0">
              <Link
                href={`${BASE}?detail=${col.id}`}
                className="block text-sm font-semibold text-foreground truncate hover:text-primary transition-colors"
              >
                {col.title}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => update.mutate({ id: col.id, is_favorite: !col.is_favorite })}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-400 hover:bg-muted transition-colors"
              title={col.is_favorite ? 'Unfavorite' : 'Favorite'}
            >
              <Star size={13} className={col.is_favorite ? 'text-amber-400 fill-amber-400' : ''} />
            </button>
            <Link
              href={`${BASE}?edit=${col.id}`}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Edit"
            >
              <Pencil size={13} />
            </Link>
            <button
              type="button"
              onClick={onShare}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Share"
            >
              <Share2 size={13} />
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {col.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {col.description.replace(/[#*`_[\]]/g, '').trim()}
          </p>
        )}

        {col.is_archived && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            <Archive size={10} /> Archived
          </span>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{formatRelativeTime(col.updated_at)}</span>
          <Link
            href={`${BASE}?detail=${col.id}`}
            className="text-xs text-primary hover:underline font-medium"
          >
            Open →
          </Link>
        </div>
      </div>

      <DeleteConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete collection?"
        description="This removes the collection and all its item links. Items themselves are not deleted."
        itemName={col.title}
        onConfirm={() => { setConfirmDelete(false); onDelete(); }}
      />
    </div>
  );
}

// ─── Modal (same instant pattern as reminders) ────────────────────────────────

function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className={`bg-card flex flex-col shadow-xl border border-border w-full sm:rounded-2xl sm:w-[95vw] ${wide ? 'sm:max-w-2xl' : 'sm:max-w-xl'} max-h-[90vh]`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Detail view ───────────────────────────────────────────────────────────────

type ItemsByType = Partial<Record<CollectionItemType, CollectionItem[]>>;

function CollectionDetailDialog({ id }: { id: string }) {
  const router = useRouter();
  const { data: col, isLoading } = useCollection(id);
  const removeItem = useRemoveCollectionItem();
  const update = useUpdateCollection();

  function close() { router.replace(BASE); }

  if (isLoading || !col) {
    return (
      <Modal title="Collection" onClose={close} wide>
        <div className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </Modal>
    );
  }

  const byType: ItemsByType = {};
  for (const item of col.items) {
    if (!byType[item.item_type]) byType[item.item_type] = [];
    byType[item.item_type]!.push(item);
  }

  const types: CollectionItemType[] = ['note', 'inbox', 'list', 'self_chat', 'reminder'];

  return (
    <Modal title={col.title} onClose={close} wide>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl ${colorClass(col.color)} text-white shrink-0`}>
            {col.icon ?? '📁'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-foreground text-base">{col.title}</p>
            <p className="text-xs text-muted-foreground">{col.items.length} item{col.items.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => update.mutate({ id: col.id, is_favorite: !col.is_favorite })}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-400 hover:bg-muted transition-colors"
              title={col.is_favorite ? 'Unfavorite' : 'Favorite'}
            >
              <Star size={14} className={col.is_favorite ? 'text-amber-400 fill-amber-400' : ''} />
            </button>
            <Link
              href={`${BASE}?edit=${col.id}`}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Edit"
            >
              <Pencil size={14} />
            </Link>
          </div>
        </div>

        {col.description && (
          <div className="bg-muted/40 rounded-xl p-4">
            <MarkdownViewer content={col.description} />
          </div>
        )}

        {/* Stats */}
        <div className="flex flex-wrap gap-2">
          {types.map(type => {
            const count = (byType[type] ?? []).length;
            if (count === 0) return null;
            return (
              <div key={type} className="flex items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground">
                {itemTypeIcon(type)}
                <span>{count} {itemTypeLabel(type)}{count !== 1 ? 's' : ''}</span>
              </div>
            );
          })}
          {col.items.length === 0 && (
            <p className="text-sm text-muted-foreground">No items in this collection yet.</p>
          )}
        </div>

        {/* Grouped sections */}
        {types.map(type => {
          const items = byType[type] ?? [];
          if (items.length === 0) return null;
          return (
            <div key={type}>
              <div className="flex items-center gap-2 mb-2">
                {itemTypeIcon(type)}
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {itemTypeLabel(type)}s
                </p>
              </div>
              <div className="space-y-1.5">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg group/item border border-border/50">
                    <Hash size={12} className="text-muted-foreground shrink-0" />
                    <Link
                      href={itemHref(item.item_type, item.item_id)}
                      className="flex-1 text-sm text-foreground hover:text-primary transition-colors truncate"
                    >
                      {item.item_id.slice(0, 8)}…
                    </Link>
                    <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <Link
                        href={itemHref(item.item_type, item.item_id)}
                        className="p-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Open item"
                      >
                        Open
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem.mutate({ collectionId: col.id, itemId: item.id })}
                        className="p-1 rounded text-xs text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                        title="Remove from collection"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

// ─── Create / edit dialog ──────────────────────────────────────────────────────

function CollectionCreateDialog() {
  const router = useRouter();
  const create = useCreateCollection();
  function close() { router.replace(BASE); }

  async function handleSave(data: CollectionFormData) {
    if (!data.title.trim()) return;
    await create.mutateAsync({ title: data.title.trim(), description: data.description || undefined, color: data.color, icon: data.icon });
    close();
  }

  return (
    <Modal title="New Collection" onClose={close}>
      <CollectionForm onSave={handleSave} onCancel={close} saving={create.isPending} />
    </Modal>
  );
}

function CollectionEditDialog({ id }: { id: string }) {
  const router = useRouter();
  const { data: col } = useCollection(id);
  const update = useUpdateCollection();
  function close() { router.replace(BASE); }

  if (!col) return null;

  async function handleSave(data: CollectionFormData) {
    await update.mutateAsync({ id: col!.id, title: data.title.trim(), description: data.description || undefined, color: data.color, icon: data.icon });
    close();
  }

  return (
    <Modal title="Edit Collection" onClose={close}>
      <CollectionForm
        initial={{ title: col.title, description: col.description ?? '', color: col.color ?? 'violet', icon: col.icon ?? '📁' }}
        onSave={handleSave}
        onCancel={close}
        saving={update.isPending}
      />
    </Modal>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

function CollectionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'favorites' | 'archived' | 'shared'>('all');

  const create = searchParams.get('create');
  const detail = searchParams.get('detail');
  const edit = searchParams.get('edit');
  const shareId = searchParams.get('share');
  const sharedViewId = searchParams.get('shared_view');

  const { data: collections = [], isLoading } = useCollections();
  const { data: sharedItems = [] } = useSharedWithMe();
  const sharedCollections = sharedItems.filter(i => i.item_type === 'collection');
  const deleteCollection = useDeleteCollection();
  const update = useUpdateCollection();
  const bulkUpdate = useBulkUpdateCollections();
  const bulkDelete = useBulkDeleteCollections();
  const bulk = useBulkSelection();

  useEffect(() => {
    bulk.clear();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const shareCollection = shareId ? collections.find(c => c.id === shareId) : null;
  const closeShareUrl = (() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete('share');
    const qs = p.toString();
    return qs ? `${BASE}?${qs}` : BASE;
  })();

  const sharedViewItem = sharedViewId ? sharedCollections.find(i => i.share_id === sharedViewId) : null;
  const closeSharedViewUrl = (() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete('shared_view');
    const qs = p.toString();
    return qs ? `${BASE}?${qs}` : BASE;
  })();

  const filtered = collections
    .filter(c => {
      if (tab === 'favorites') return c.is_favorite;
      if (tab === 'archived') return c.is_archived;
      return !c.is_archived;
    })
    .filter(c => {
      if (!query) return true;
      const q = query.toLowerCase();
      return c.title.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q);
    });

  const filteredShared = query
    ? sharedCollections.filter(i => i.title.toLowerCase().includes(query.toLowerCase()))
    : sharedCollections;

  const tabs = [
    { key: 'all' as const, label: 'All', count: collections.filter(c => !c.is_archived).length },
    { key: 'favorites' as const, label: 'Favorites', count: collections.filter(c => c.is_favorite).length },
    { key: 'archived' as const, label: 'Archived', count: collections.filter(c => c.is_archived).length },
    { key: 'shared' as const, label: 'Shared with me', count: sharedCollections.length },
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Collections</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Organize your knowledge into smart workspaces</p>
          </div>
          <Link
            href={`${BASE}?create=true`}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} />
            New
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-4">
          {tabs.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                tab === t.key
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search collections…"
            className="w-full pl-9 pr-8 py-2 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all text-foreground placeholder:text-muted-foreground"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {bulk.selectedCount > 0 && tab !== 'shared' && (
          <BulkActionToolbar
            count={bulk.selectedCount}
            total={filtered.length}
            onClear={bulk.clear}
            onSelectAll={() => bulk.toggleAll(filtered.map(c => c.id), true)}
            actions={[
              {
                label: 'Favorite',
                icon: Star,
                onClick: () => { bulkUpdate.mutate({ ids: bulk.getArray(), updates: { is_favorite: true } }); bulk.clear(); },
              },
              {
                label: 'Delete',
                icon: Trash2,
                variant: 'destructive' as const,
                onClick: () => { bulkDelete.mutate(bulk.getArray()); bulk.clear(); },
              },
            ]}
          />
        )}

        {tab === 'shared' ? (
          filteredShared.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/40 rounded-2xl flex items-center justify-center mb-4">
                <FolderOpen size={24} className="text-violet-500" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">
                {query ? 'No shared collections match your search' : 'No collections shared with you yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredShared.map(item => (
                <SharedCollectionCard
                  key={item.share_id}
                  item={item}
                  onClick={() => router.push(`${BASE}?shared_view=${item.share_id}`)}
                />
              ))}
            </div>
          )
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                <Skeleton className="h-1 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 && (tab !== 'all' || filteredShared.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/40 rounded-2xl flex items-center justify-center mb-4">
              <FolderOpen size={24} className="text-violet-500" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              {query ? 'No collections match your search' : 'No collections yet'}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {query ? 'Try a different search term' : 'Create your first collection to organize your knowledge'}
            </p>
            {!query && (
              <Link
                href={`${BASE}?create=true`}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={15} />
                New Collection
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tab !== 'shared' && filtered.length > 0 && (
              <div className="col-span-full flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  id="collections-select-all"
                  checked={bulk.selectedCount === filtered.length && filtered.length > 0}
                  onChange={e => bulk.toggleAll(filtered.map(c => c.id), e.target.checked)}
                  className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                />
                <label htmlFor="collections-select-all" className="text-xs text-muted-foreground cursor-pointer select-none">
                  {bulk.selectedCount > 0 ? `${bulk.selectedCount} selected` : `Select all ${filtered.length}`}
                </label>
                {bulk.selectedCount > 0 && (
                  <button type="button" onClick={bulk.clear} className="text-xs text-muted-foreground hover:text-foreground ml-1">Clear</button>
                )}
              </div>
            )}
            {filtered.map(col => (
              <div key={col.id} className="relative group/sel">
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); bulk.toggle(col.id); }}
                  aria-label={`${bulk.isSelected(col.id) ? 'Deselect' : 'Select'} item`}
                  className={`absolute top-2 left-2 z-30 flex items-center justify-center w-5 h-5 rounded border-2 transition-all ${
                    bulk.isSelected(col.id) ? 'bg-primary border-primary opacity-100' : `bg-card border-border ${bulk.selectedCount > 0 ? 'opacity-100' : 'opacity-0 group-hover/sel:opacity-100'}`
                  }`}
                >
                  {bulk.isSelected(col.id) && <Check size={11} className="text-primary-foreground" />}
                </button>
                {bulk.selectedCount > 0 && (
                  <div className="absolute inset-0 z-20 cursor-pointer rounded-xl" onClick={() => bulk.toggle(col.id)} aria-hidden="true" />
                )}
                <CollectionCard
                  col={col}
                  onDelete={() => deleteCollection.mutate(col.id)}
                  onShare={() => router.push(`${BASE}?share=${col.id}`)}
                />
              </div>
            ))}
            {tab === 'all' && filteredShared.map(item => (
              <SharedCollectionCard
                key={item.share_id}
                item={item}
                onClick={() => router.push(`${BASE}?shared_view=${item.share_id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      {create === 'true' && <CollectionCreateDialog />}
      {detail && <CollectionDetailDialog id={detail} />}
      {edit && <CollectionEditDialog id={edit} />}
      {shareId && shareCollection && (
        <ShareDialog
          itemType="collection"
          itemId={shareId}
          itemTitle={shareCollection.title}
          onClose={() => router.replace(closeShareUrl)}
        />
      )}
      {sharedViewItem && (
        <SharedItemDetailDialog
          item={sharedViewItem}
          onClose={() => router.push(closeSharedViewUrl)}
        />
      )}
    </div>
  );
}

function SharedCollectionCard({ item, onClick }: { item: SharedWithMeItem; onClick: () => void }) {
  const ownerLabel = item.owner?.full_name ?? item.owner?.email ?? 'Unknown';
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative group bg-card border border-blue-200 dark:border-blue-900/50 rounded-xl overflow-hidden hover:shadow-sm transition-all text-left w-full"
    >
      <div className="h-1 w-full bg-blue-400" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl shrink-0">📁</span>
            <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
          </div>
          <span className="shrink-0 text-[10px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded-full">Shared</span>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <Users size={11} className="text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate">By {ownerLabel}</span>
        </div>
      </div>
    </button>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense>
      <CollectionsContent />
    </Suspense>
  );
}
