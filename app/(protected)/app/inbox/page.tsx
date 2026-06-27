'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Inbox, Archive, Star, Search, X, Users, Check, Trash2 } from 'lucide-react';
import { savePageState, getPageState } from '@/lib/page-state';
import { dialogUrl, closeDialogUrl, parseDialogState } from '@/lib/dialog-url';
import { useInbox, useUpdateInboxItem, useDeleteInboxItem, useBulkUpdateInboxItems, useBulkDeleteInboxItems } from '@/hooks/queries/use-inbox';
import { useSharedWithMe } from '@/hooks/queries/use-shared-links';
import { InboxItemCard } from '@/components/features/inbox/InboxItem';
import { InboxDialog } from '@/components/features/inbox/InboxDialog';
import { ShareDialog } from '@/components/features/sharing/ShareDialog';
import { SharedItemDetailDialog } from '@/components/features/sharing/SharedItemDetailDialog';
import { useBulkSelection } from '@/hooks/use-bulk-selection';
import { BulkActionToolbar } from '@/components/shared/bulk-action-toolbar';
import type { InboxItem, SharedWithMeItem } from '@/types';

const BASE_PATH = '/app/inbox';

type Tab = 'inbox' | 'favorite' | 'archived' | 'shared';
type SavedState = { tab: Tab; search: string };

export default function InboxPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const saved = getPageState<SavedState>('inbox');

  const [tab, setTab] = useState<Tab>(saved?.tab ?? 'inbox');
  const inboxTab = tab === 'shared' ? 'inbox' : tab;
  const { data: items = [], isLoading, isFetching } = useInbox(inboxTab);
  const { data: sharedItems = [] } = useSharedWithMe();
  const sharedInboxItems = sharedItems.filter(i => i.item_type === 'inbox');

  // const saved = getPageState<SavedState>('inbox');
  // const [tab, setTab] = useState<Tab>(saved?.tab ?? 'inbox');
  const [search, setSearch] = useState(saved?.search ?? '');

  const dialog = parseDialogState(searchParams);
  const closeUrl = closeDialogUrl(BASE_PATH, searchParams);
  const sharedViewId = searchParams.get('shared_view');
  const sharedViewItem = sharedViewId ? sharedInboxItems.find(i => i.share_id === sharedViewId) : null;
  const closeSharedViewUrl = (() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete('shared_view');
    const qs = p.toString();
    return qs ? `${BASE_PATH}?${qs}` : BASE_PATH;
  })();
  const shareId = searchParams.get('share');
  const shareItem = shareId ? items.find((i: InboxItem) => i.id === shareId) : null;
  const closeShareUrl = (() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete('share');
    const qs = p.toString();
    return qs ? `${BASE_PATH}?${qs}` : BASE_PATH;
  })();

  // const { data: items = [], isLoading, isFetching } = useInbox(tab);
  const updateItem = useUpdateInboxItem();
  const deleteItem = useDeleteInboxItem();
  const bulkUpdate = useBulkUpdateInboxItems();
  const bulkDelete = useBulkDeleteInboxItems();
  const bulk = useBulkSelection();

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      router.replace(dialogUrl(BASE_PATH, 'create'));
    }
  }, [searchParams, router]);

  useEffect(() => {
    savePageState<SavedState>('inbox', { tab, search });
  }, [tab, search]);

  useEffect(() => {
    bulk.clear();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  function handleToggleFavorite(id: string, isFav: boolean) {
    updateItem.mutate({ id, data: { status: isFav ? 'inbox' : 'favorite' } });
  }

  function handleArchive(id: string) {
    const current = items.find(i => i.id === id);
    const newStatus = current?.status === 'archived' ? 'inbox' : 'archived';
    updateItem.mutate({ id, data: { status: newStatus } });
  }

  function handleDelete(id: string) {
    deleteItem.mutate(id);
  }

  const filtered = search
    ? items.filter((i: InboxItem) =>
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.content?.toLowerCase().includes(search.toLowerCase()) ||
        i.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : items;

  const filteredShared = search
    ? sharedInboxItems.filter(i => i.title.toLowerCase().includes(search.toLowerCase()))
    : sharedInboxItems;

  const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'favorite', label: 'Favorites', icon: Star },
    { id: 'archived', label: 'Archived', icon: Archive },
    { id: 'shared', label: 'Shared with me', icon: Users, count: sharedInboxItems.length },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Inbox</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Everything you capture, in one place.</p>
        </div>
        <Link
          href={dialogUrl(BASE_PATH, 'create')}
          scroll={false}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Capture
        </Link>
      </div>

      <div className="flex gap-1 bg-muted rounded-lg p-1 mb-5 flex-wrap">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            type="button"
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-colors min-w-fit
              ${tab === id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Icon size={14} />
            {label}
            {count !== undefined && count > 0 && (
              <span className="text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-600 px-1 py-0.5 rounded-full font-medium leading-none">
                {count}
              </span>
            )}
          </button>
        ))}
        {isFetching && items.length > 0 && (
          <span className="self-center ml-1 w-3 h-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        )}
      </div>

      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search inbox..."
          className="w-full pl-9 pr-8 py-2 text-sm border border-border rounded-lg bg-muted text-foreground placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {search && (
          <button type="button" aria-label="Clear search" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <X size={14} />
          </button>
        )}
      </div>

      {bulk.selectedCount > 0 && tab !== 'shared' && (
        <BulkActionToolbar
          count={bulk.selectedCount}
          total={filtered.length}
          onClear={bulk.clear}
          onSelectAll={() => bulk.toggleAll(filtered.map((i: InboxItem) => i.id), true)}
          actions={[
            {
              label: 'Favorite',
              icon: Star,
              onClick: () => { bulkUpdate.mutate({ ids: bulk.getArray(), status: 'favorite' }); bulk.clear(); },
            },
            {
              label: 'Archive',
              icon: Archive,
              onClick: () => { bulkUpdate.mutate({ ids: bulk.getArray(), status: 'archived' }); bulk.clear(); },
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
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
              <Inbox size={22} className="text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {search ? 'No shared items match your search' : 'No inbox items shared with you yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredShared.map(item => (
              <SharedInboxCard
                key={item.share_id}
                item={item}
                onClick={() => router.push(`${BASE_PATH}?shared_view=${item.share_id}`)}
              />
            ))}
          </div>
        )
      ) : isLoading && items.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
            <Inbox size={22} className="text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {search ? 'No results found' : tab === 'inbox' ? 'Your inbox is empty' : `No ${tab} items`}
          </p>
          {!search && tab === 'inbox' && (
            <Link
              href={dialogUrl(BASE_PATH, 'create')}
              scroll={false}
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Capture your first item
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {tab !== 'shared' && filtered.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="inbox-select-all"
                checked={bulk.selectedCount === filtered.length && filtered.length > 0}
                onChange={e => bulk.toggleAll(filtered.map((i: InboxItem) => i.id), e.target.checked)}
                className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
              />
              <label htmlFor="inbox-select-all" className="text-xs text-muted-foreground cursor-pointer select-none">
                {bulk.selectedCount > 0 ? `${bulk.selectedCount} selected` : `Select all ${filtered.length}`}
              </label>
              {bulk.selectedCount > 0 && (
                <button type="button" onClick={bulk.clear} className="text-xs text-muted-foreground hover:text-foreground ml-1">Clear</button>
              )}
            </div>
          )}
          {filtered.map((item: InboxItem) => (
            <div key={item.id} className="relative group/sel">
              <button
                type="button"
                onClick={e => { e.stopPropagation(); bulk.toggle(item.id); }}
                aria-label={`${bulk.isSelected(item.id) ? 'Deselect' : 'Select'} item`}
                className={`absolute top-2 left-2 z-30 flex items-center justify-center w-5 h-5 rounded border-2 transition-all ${
                  bulk.isSelected(item.id) ? 'bg-primary border-primary opacity-100' : `bg-card border-border ${bulk.selectedCount > 0 ? 'opacity-100' : 'opacity-0 group-hover/sel:opacity-100'}`
                }`}
              >
                {bulk.isSelected(item.id) && <Check size={11} className="text-primary-foreground" />}
              </button>
              {bulk.selectedCount > 0 && (
                <div className="absolute inset-0 z-20 cursor-pointer rounded-xl" onClick={() => bulk.toggle(item.id)} aria-hidden="true" />
              )}
              <InboxItemCard
                item={item}
                detailUrl={dialogUrl(BASE_PATH, 'detail', item.id)}
                onToggleFavorite={handleToggleFavorite}
                onArchive={handleArchive}
                onDelete={handleDelete}
                onShare={() => router.push(`${BASE_PATH}?share=${item.id}`)}
              />
            </div>
          ))}
          {tab === 'inbox' && filteredShared.map(item => (
            <SharedInboxCard
              key={item.share_id}
              item={item}
              onClick={() => router.push(`${BASE_PATH}?shared_view=${item.share_id}`)}
            />
          ))}
        </div>
      )}

      {dialog?.action === 'create' && (
        <InboxDialog mode="create" closeUrl={closeUrl} basePath={BASE_PATH} />
      )}
      {dialog?.action === 'detail' && dialog.id && (
        <InboxDialog mode="detail" id={dialog.id} closeUrl={closeUrl} basePath={BASE_PATH} />
      )}
      {dialog?.action === 'edit' && dialog.id && (
        <InboxDialog mode="edit" id={dialog.id} closeUrl={closeUrl} basePath={BASE_PATH} />
      )}
      {shareId && shareItem && (
        <ShareDialog
          itemType="inbox"
          itemId={shareId}
          itemTitle={shareItem.title}
          onClose={() => router.push(closeShareUrl)}
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

function SharedInboxCard({ item, onClick }: { item: SharedWithMeItem; onClick: () => void }) {
  const ownerLabel = item.owner?.full_name ?? item.owner?.email ?? 'Unknown';
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 bg-card border border-blue-200 dark:border-blue-900/50 rounded-xl p-4 hover:shadow-sm transition-all"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded-full">Shared</span>
        </div>
        <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <Users size={11} className="text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate">By {ownerLabel}</span>
        </div>
      </div>
    </button>
  );
}
