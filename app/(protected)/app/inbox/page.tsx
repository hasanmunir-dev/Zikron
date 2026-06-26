'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Inbox, Archive, Star, Search, X } from 'lucide-react';
import { savePageState, getPageState } from '@/lib/page-state';
import { dialogUrl, closeDialogUrl, parseDialogState } from '@/lib/dialog-url';
import { useInbox, useUpdateInboxItem, useDeleteInboxItem } from '@/hooks/queries/use-inbox';
import { InboxItemCard } from '@/components/features/inbox/InboxItem';
import { InboxDialog } from '@/components/features/inbox/InboxDialog';
import { ShareDialog } from '@/components/features/sharing/ShareDialog';
import type { InboxItem } from '@/types';

const BASE_PATH = '/app/inbox';

type Tab = 'inbox' | 'favorite' | 'archived';
type SavedState = { tab: Tab; search: string };

export default function InboxPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const saved = getPageState<SavedState>('inbox');

  const [tab, setTab] = useState<Tab>(saved?.tab ?? 'inbox');
  const { data: items = [], isLoading, isFetching } = useInbox(tab);

  // const saved = getPageState<SavedState>('inbox');
  // const [tab, setTab] = useState<Tab>(saved?.tab ?? 'inbox');
  const [search, setSearch] = useState(saved?.search ?? '');

  const dialog = parseDialogState(searchParams);
  const closeUrl = closeDialogUrl(BASE_PATH, searchParams);
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

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      router.replace(dialogUrl(BASE_PATH, 'create'));
    }
  }, [searchParams, router]);

  useEffect(() => {
    savePageState<SavedState>('inbox', { tab, search });
  }, [tab, search]);

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

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'favorite', label: 'Favorites', icon: Star },
    { id: 'archived', label: 'Archived', icon: Archive },
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

      <div className="flex gap-1 bg-muted rounded-lg p-1 mb-5">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-colors
              ${tab === id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Icon size={14} />
            {label}
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

      {isLoading && items.length === 0 ? (
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
          {filtered.map(item => (
            <InboxItemCard
              key={item.id}
              item={item}
              detailUrl={dialogUrl(BASE_PATH, 'detail', item.id)}
              onToggleFavorite={handleToggleFavorite}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onShare={() => router.push(`${BASE_PATH}?share=${item.id}`)}
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
    </div>
  );
}
