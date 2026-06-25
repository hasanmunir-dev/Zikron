'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FolderOpen, Search, X, Trash2, User, Hash } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminCollections, useAdminDeleteCollection } from '@/hooks/queries/use-collections';
import { formatRelativeTime } from '@/utils/date';
import type { AdminCollection } from '@/types';

const COLLECTION_COLORS = [
  { value: 'blue',   cls: 'bg-blue-500' },
  { value: 'violet', cls: 'bg-violet-500' },
  { value: 'green',  cls: 'bg-emerald-500' },
  { value: 'rose',   cls: 'bg-rose-500' },
  { value: 'amber',  cls: 'bg-amber-500' },
  { value: 'cyan',   cls: 'bg-cyan-500' },
  { value: 'slate',  cls: 'bg-slate-500' },
];

function colorDot(color: string | null) {
  return COLLECTION_COLORS.find(c => c.value === color)?.cls ?? 'bg-violet-500';
}

function CollectionDetailDialog({ col, onClose }: { col: AdminCollection; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-[95vw]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl ${colorDot(col.color)} text-white shrink-0`}>
              {col.icon ?? '📁'}
            </div>
            <div>
              <DialogTitle>{col.title}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{col.item_count} item{col.item_count !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {col.description && (
            <div className="bg-muted/40 rounded-lg p-3 text-sm text-foreground whitespace-pre-wrap">{col.description}</div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Owner</p>
              <p className="font-medium text-foreground truncate">{col.owner?.full_name ?? col.owner?.email ?? 'Unknown'}</p>
              {col.owner?.email && col.owner.full_name && (
                <p className="text-xs text-muted-foreground truncate">{col.owner.email}</p>
              )}
            </div>
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <div className="flex flex-wrap gap-1">
                {col.is_favorite && <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">Favorite</span>}
                {col.is_archived && <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">Archived</span>}
                {!col.is_favorite && !col.is_archived && <span className="text-xs text-muted-foreground">Active</span>}
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Created {formatRelativeTime(col.created_at)} · Updated {formatRelativeTime(col.updated_at)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AdminCollectionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AdminCollection | null>(null);
  const detail = searchParams.get('detail');

  const { data: collections = [], isLoading } = useAdminCollections();
  const deleteCol = useAdminDeleteCollection();

  const filtered = collections.filter(c => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      (c.description ?? '').toLowerCase().includes(q) ||
      (c.owner?.email ?? '').toLowerCase().includes(q) ||
      (c.owner?.full_name ?? '').toLowerCase().includes(q)
    );
  });

  const detailCol = detail ? collections.find(c => c.id === detail) : null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Collections</h2>
          <p className="text-sm text-muted-foreground mt-0.5">All user collections across the platform.</p>
        </div>
        {!isLoading && (
          <span className="text-sm text-muted-foreground">{collections.length} total</span>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by title, description, or owner…"
          className="w-full pl-9 pr-8 py-2 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all text-foreground placeholder:text-muted-foreground"
        />
        {query && (
          <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={13} />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FolderOpen size={32} className="text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold text-foreground">{query ? 'No results' : 'No collections yet'}</p>
          <p className="text-xs text-muted-foreground mt-1">{query ? `No collections match "${query}"` : 'Collections will appear here once users create them'}</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Collection</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Owner</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Items</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden lg:table-cell">Updated</th>
                <th className="px-4 py-3 sr-only">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(col => (
                <tr key={col.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/collections?detail=${col.id}`)}
                      className="flex items-center gap-2.5 text-left w-full"
                    >
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-base ${colorDot(col.color)} text-white shrink-0`}>
                        {col.icon ?? '📁'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate max-w-[200px]">{col.title}</p>
                        {col.is_archived && <span className="text-[10px] text-muted-foreground">Archived</span>}
                        {col.is_favorite && <span className="text-[10px] text-amber-500">★ Favorite</span>}
                      </div>
                    </button>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <User size={12} className="text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground truncate max-w-[160px]">
                        {col.owner?.full_name ?? col.owner?.email ?? '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Hash size={12} />
                      {col.item_count}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                    {formatRelativeTime(col.updated_at)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(col)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detailCol && (
        <CollectionDetailDialog col={detailCol} onClose={() => router.replace('/admin/collections')} />
      )}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={open => { if (!open) setDeleteTarget(null); }}
        title="Delete collection?"
        description="This permanently deletes the collection and all item links. Items are not deleted."
        itemName={deleteTarget?.title}
        onConfirm={() => {
          if (deleteTarget) deleteCol.mutate(deleteTarget.id);
          setDeleteTarget(null);
        }}
        isLoading={deleteCol.isPending}
      />
    </div>
  );
}

export default function AdminCollectionsPage() {
  return (
    <Suspense>
      <AdminCollectionsContent />
    </Suspense>
  );
}
