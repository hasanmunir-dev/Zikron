'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { inboxService } from '@/lib/services/inbox';
import { getCachedItem } from '@/lib/page-state';
import { emitDataRefresh } from '@/lib/sync/events';
import { useAuth } from '@/hooks/useAuth';
import { dialogUrl } from '@/lib/dialog-url';
import { InboxEditor } from './InboxEditor';
import type { InboxItem } from '@/types';

interface Props {
  mode: 'create' | 'edit' | 'detail';
  id?: string;
  closeUrl: string;
  basePath: string;
}

export function InboxDialog({ mode, id, closeUrl, basePath }: Props) {
  const router = useRouter();
  const { user } = useAuth();

  const [item, setItem] = useState<Partial<InboxItem> | null>(
    () => (mode !== 'create' && id ? getCachedItem<InboxItem>(id) : null),
  );
  const [ready, setReady] = useState(
    () => mode === 'create' || (id ? getCachedItem<InboxItem>(id) !== null : false),
  );

  useEffect(() => {
    if (mode === 'create' || !id) {
      setReady(true);
      return;
    }
    inboxService.get(id).then(data => {
      if (data) setItem(data);
      setReady(true);
    });
  }, [id, mode]);

  async function handleSave(data: Pick<InboxItem, 'title' | 'content' | 'url' | 'type' | 'tags' | 'category_id'>) {
    if (mode === 'create') {
      if (!user) return;
      await inboxService.create(data);
    } else if (id) {
      await inboxService.update(id, {
        title: data.title,
        content: data.content,
        url: data.url,
        tags: data.tags,
      });
    }
    emitDataRefresh('inbox');
  }

  async function handleDelete(itemId: string) {
    await inboxService.delete(itemId);
    emitDataRefresh('inbox');
    router.replace(closeUrl);
  }

  async function handleToggleFavorite(itemId: string, isFav: boolean) {
    const updated = await inboxService.update(itemId, { status: isFav ? 'inbox' : 'favorite' });
    emitDataRefresh('inbox');
    setItem(updated);
  }

  async function handleArchive(itemId: string) {
    const current = item as InboxItem | null;
    const newStatus = current?.status === 'archived' ? 'inbox' : 'archived';
    await inboxService.update(itemId, { status: newStatus });
    emitDataRefresh('inbox');
    router.replace(closeUrl);
  }

  function handleClose() {
    router.replace(closeUrl);
  }

  if (!ready) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-card w-full sm:rounded-2xl sm:w-[95vw] sm:max-w-5xl h-80 animate-pulse" />
      </div>
    );
  }

  if (mode !== 'create' && !item) {
    router.replace(closeUrl);
    return null;
  }

  const editUrl = id ? dialogUrl(basePath, 'edit', id) : undefined;

  return (
    <InboxEditor
      mode={mode}
      item={mode === 'create' ? null : item}
      onSave={handleSave}
      onDelete={mode !== 'create' ? handleDelete : undefined}
      onToggleFavorite={mode !== 'create' ? handleToggleFavorite : undefined}
      onArchive={mode !== 'create' ? handleArchive : undefined}
      onClose={handleClose}
      editUrl={mode === 'detail' ? editUrl : undefined}
    />
  );
}
