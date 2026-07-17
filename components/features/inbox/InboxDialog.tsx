'use client';

import { useRouter } from 'next/navigation';
import { useInboxItem, useCreateInboxItem, useUpdateInboxItem, useDeleteInboxItem } from '@/hooks/queries/use-inbox';
import { useTemplate } from '@/hooks/queries/use-templates';
import { resolveTemplateVariables } from '@/utils/template-variables';
import { useAuth } from '@/hooks/useAuth';
import { dialogUrl } from '@/lib/dialog-url';
import { InboxEditor } from './InboxEditor';
import type { InboxItem } from '@/types';

interface Props {
  mode: 'create' | 'edit' | 'detail';
  id?: string;
  closeUrl: string;
  basePath: string;
  templateId?: string;
}

export function InboxDialog({ mode, id, closeUrl, basePath, templateId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const createItem = useCreateInboxItem();
  const updateItem = useUpdateInboxItem();
  const deleteItem = useDeleteInboxItem();

  const { data: item, isLoading } = useInboxItem(mode !== 'create' ? id : undefined);
  const { data: template } = useTemplate(mode === 'create' ? templateId : undefined);

  async function handleSave(data: Pick<InboxItem, 'title' | 'content' | 'url' | 'type' | 'tags' | 'category_id'>) {
    if (mode === 'create') {
      if (!user) return;
      createItem.mutate(data);
    } else if (id) {
      updateItem.mutate({
        id,
        data: {
          title: data.title,
          content: data.content,
          url: data.url,
          tags: data.tags,
        },
      });
    }
  }

  function handleDelete(itemId: string) {
    deleteItem.mutate(itemId);
    router.replace(closeUrl);
  }

  function handleToggleFavorite(itemId: string, isFav: boolean) {
    updateItem.mutate({ id: itemId, data: { status: isFav ? 'inbox' : 'favorite' } });
  }

  function handleArchive(itemId: string) {
    const newStatus = (item as InboxItem | undefined)?.status === 'archived' ? 'inbox' : 'archived';
    updateItem.mutate({ id: itemId, data: { status: newStatus } });
    router.replace(closeUrl);
  }

  function handleClose() {
    router.replace(closeUrl);
  }

  if (mode !== 'create' && isLoading && !item) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-card w-full sm:rounded-2xl sm:w-[95vw] sm:max-w-5xl h-80 animate-pulse" />
      </div>
    );
  }

  if (mode !== 'create' && !item && !isLoading) {
    router.replace(closeUrl);
    return null;
  }

  // Wait for template to load before rendering the form so useState initializes correctly
  if (mode === 'create' && templateId && !template) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-card w-full sm:rounded-2xl sm:w-[95vw] sm:max-w-5xl h-80 animate-pulse" />
      </div>
    );
  }

  const editUrl = id ? dialogUrl(basePath, 'edit', id) : undefined;

  let initialItem: Partial<InboxItem> | null = null;
  if (mode === 'create' && template) {
    const resolved = resolveTemplateVariables(template, { userName: user?.email ?? undefined });
    initialItem = {
      title: resolved.title_template ?? '',
      content: resolved.content_template ?? '',
      type: 'text',
    };
  }

  return (
    <InboxEditor
      mode={mode}
      item={mode === 'create' ? initialItem : item ?? null}
      onSave={handleSave}
      onDelete={mode !== 'create' ? handleDelete : undefined}
      onToggleFavorite={mode !== 'create' ? handleToggleFavorite : undefined}
      onArchive={mode !== 'create' ? handleArchive : undefined}
      onClose={handleClose}
      editUrl={mode === 'detail' ? editUrl : undefined}
    />
  );
}
