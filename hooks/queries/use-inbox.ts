import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { inboxService } from '@/lib/services/inbox';
import type { InboxItem } from '@/types';

type Tab = 'inbox' | 'favorite' | 'archived';
type InboxInput = Pick<InboxItem, 'title' | 'content' | 'url' | 'type' | 'tags' | 'category_id'>;

export const inboxKeys = {
  all: () => ['inbox'] as const,
  detail: (id: string) => ['inbox-item', id] as const,
};

function filterItems(items: InboxItem[], tab: Tab): InboxItem[] {
  return items
    .filter(i => i.status === tab)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function useInbox(tab: Tab = 'inbox') {
  return useQuery({
    queryKey: inboxKeys.all(),
    queryFn: () => api.get<InboxItem[]>('/api/inbox'),
    select: (data) => filterItems(data, tab),
    placeholderData: keepPreviousData,
  });
}

export function useInboxItem(id: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: inboxKeys.detail(id!),
    queryFn: () => inboxService.get(id!),
    enabled: !!id,
    initialData: () => {
      const items = queryClient.getQueryData<InboxItem[]>(inboxKeys.all());
      return items?.find(i => i.id === id);
    },
    initialDataUpdatedAt: () => queryClient.getQueryState(inboxKeys.all())?.dataUpdatedAt,
  });
}

export function useCreateInboxItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InboxInput) => inboxService.create(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: inboxKeys.all() });
      const prev = queryClient.getQueryData<InboxItem[]>(inboxKeys.all());
      const tempItem: InboxItem = {
        id: `temp-${Date.now()}`,
        user_id: '',
        title: input.title,
        content: input.content ?? null,
        url: input.url ?? null,
        type: input.type ?? 'text',
        status: 'inbox',
        tags: input.tags ?? [],
        category_id: input.category_id ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      queryClient.setQueryData<InboxItem[]>(inboxKeys.all(), old => [tempItem, ...(old ?? [])]);
      return { prev };
    },
    onError: (_err, _input, context) => {
      if (context?.prev) queryClient.setQueryData(inboxKeys.all(), context.prev);
      toast.error('Failed to capture item');
    },
    onSuccess: () => {
      toast.success('Item captured');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: inboxKeys.all() });
    },
  });
}

export function useUpdateInboxItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InboxItem> }) =>
      inboxService.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: inboxKeys.all() });
      await queryClient.cancelQueries({ queryKey: inboxKeys.detail(id) });
      const prevItems = queryClient.getQueryData<InboxItem[]>(inboxKeys.all());
      const prevItem = queryClient.getQueryData<InboxItem>(inboxKeys.detail(id));
      const now = new Date().toISOString();
      queryClient.setQueryData<InboxItem[]>(inboxKeys.all(), old =>
        (old ?? []).map(i => i.id === id ? { ...i, ...data, updated_at: now } : i),
      );
      queryClient.setQueryData<InboxItem | undefined>(inboxKeys.detail(id), old =>
        old ? { ...old, ...data, updated_at: now } : old,
      );
      return { prevItems, prevItem };
    },
    onError: (_err, { id }, context) => {
      if (context?.prevItems) queryClient.setQueryData(inboxKeys.all(), context.prevItems);
      if (context?.prevItem) queryClient.setQueryData(inboxKeys.detail(id), context.prevItem);
      toast.error('Failed to update item');
    },
    onSuccess: () => {
      toast.success('Item saved');
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: inboxKeys.all() });
      queryClient.invalidateQueries({ queryKey: inboxKeys.detail(id) });
    },
  });
}

export function useDeleteInboxItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inboxService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: inboxKeys.all() });
      const prev = queryClient.getQueryData<InboxItem[]>(inboxKeys.all());
      queryClient.setQueryData<InboxItem[]>(inboxKeys.all(), old => (old ?? []).filter(i => i.id !== id));
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(inboxKeys.all(), context.prev);
      toast.error('Failed to delete item');
    },
    onSuccess: () => {
      toast.success('Item deleted');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: inboxKeys.all() });
    },
  });
}

// ─── Bulk operations ──────────────────────────────────────────────────────────

export function useBulkUpdateInboxItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: 'inbox' | 'favorite' | 'archived' }) =>
      api.patch<{ affected: number }>('/api/inbox/bulk', { ids, updates: { status } }),
    onMutate: async ({ ids, status }) => {
      await queryClient.cancelQueries({ queryKey: inboxKeys.all() });
      const prev = queryClient.getQueryData<InboxItem[]>(inboxKeys.all());
      queryClient.setQueryData<InboxItem[]>(inboxKeys.all(), old =>
        (old ?? []).map(i => ids.includes(i.id) ? { ...i, status } : i),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(inboxKeys.all(), ctx.prev);
      toast.error('Bulk update failed');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: inboxKeys.all() }),
  });
}

export function useBulkDeleteInboxItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      api.deleteWithBody<{ affected: number }>('/api/inbox/bulk', { ids }),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: inboxKeys.all() });
      const prev = queryClient.getQueryData<InboxItem[]>(inboxKeys.all());
      queryClient.setQueryData<InboxItem[]>(inboxKeys.all(), old => (old ?? []).filter(i => !ids.includes(i.id)));
      return { prev };
    },
    onError: (_err, _ids, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(inboxKeys.all(), ctx.prev);
      toast.error('Failed to delete items');
    },
    onSuccess: (data) => toast.success(`Deleted ${data.affected} item${data.affected !== 1 ? 's' : ''}`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: inboxKeys.all() }),
  });
}
