import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { Collection, CollectionWithItems, AdminCollection, CollectionItemType } from '@/types';

export const collectionKeys = {
  all: () => ['collections'] as const,
  detail: (id: string) => ['collection', id] as const,
  admin: () => ['admin', 'collections'] as const,
  adminDetail: (id: string) => ['admin', 'collection', id] as const,
};

// ─── User hooks ───────────────────────────────────────────────────────────────

export function useCollections() {
  return useQuery({
    queryKey: collectionKeys.all(),
    queryFn: () => api.get<Collection[]>('/api/collections'),
  });
}

export function useCollection(id: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: collectionKeys.detail(id!),
    queryFn: () => api.get<CollectionWithItems>(`/api/collections/${id}`),
    enabled: !!id,
    initialData: () => {
      const all = queryClient.getQueryData<Collection[]>(collectionKeys.all());
      const found = all?.find(c => c.id === id);
      if (!found) return undefined;
      return { ...found, items: [] } as CollectionWithItems;
    },
    initialDataUpdatedAt: () => queryClient.getQueryState(collectionKeys.all())?.dataUpdatedAt,
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; description?: string; color?: string; icon?: string }) =>
      api.post<Collection>('/api/collections', body),
    onSuccess: () => {
      toast.success('Collection created');
      queryClient.invalidateQueries({ queryKey: collectionKeys.all() });
    },
    onError: () => toast.error('Failed to create collection'),
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Collection> & { id: string }) =>
      api.put<Collection>(`/api/collections/${id}`, body),
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: collectionKeys.all() });
      const prev = queryClient.getQueryData<Collection[]>(collectionKeys.all());
      queryClient.setQueryData<Collection[]>(collectionKeys.all(), old =>
        (old ?? []).map(c => c.id === id ? { ...c, ...updates } : c),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(collectionKeys.all(), ctx.prev);
      toast.error('Failed to update collection');
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(id) });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/collections/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: collectionKeys.all() });
      const prev = queryClient.getQueryData<Collection[]>(collectionKeys.all());
      queryClient.setQueryData<Collection[]>(collectionKeys.all(), old =>
        (old ?? []).filter(c => c.id !== id),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(collectionKeys.all(), ctx.prev);
      toast.error('Failed to delete collection');
    },
    onSuccess: () => toast.success('Collection deleted'),
  });
}

export function useAddCollectionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      collectionId,
      item_type,
      item_id,
    }: {
      collectionId: string;
      item_type: CollectionItemType;
      item_id: string;
    }) => api.post(`/api/collections/${collectionId}/items`, { item_type, item_id }),
    onSuccess: (_data, { collectionId }) => {
      toast.success('Added to collection');
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(collectionId) });
    },
    onError: () => toast.error('Failed to add to collection'),
  });
}

export function useRemoveCollectionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, itemId }: { collectionId: string; itemId: string }) =>
      api.delete(`/api/collections/${collectionId}/items/${itemId}`),
    onSuccess: (_data, { collectionId }) => {
      toast.success('Removed from collection');
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(collectionId) });
    },
    onError: () => toast.error('Failed to remove from collection'),
  });
}

// ─── Bulk operations ──────────────────────────────────────────────────────────

export function useBulkUpdateCollections() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, updates }: { ids: string[]; updates: Record<string, unknown> }) =>
      api.patch<{ affected: number }>('/api/collections/bulk', { ids, updates }),
    onMutate: async ({ ids, updates }) => {
      await queryClient.cancelQueries({ queryKey: collectionKeys.all() });
      const prev = queryClient.getQueryData<Collection[]>(collectionKeys.all());
      queryClient.setQueryData<Collection[]>(collectionKeys.all(), old =>
        (old ?? []).map(c => ids.includes(c.id) ? { ...c, ...updates } as Collection : c),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(collectionKeys.all(), ctx.prev);
      toast.error('Bulk update failed');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: collectionKeys.all() }),
  });
}

export function useBulkDeleteCollections() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      api.deleteWithBody<{ affected: number }>('/api/collections/bulk', { ids }),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: collectionKeys.all() });
      const prev = queryClient.getQueryData<Collection[]>(collectionKeys.all());
      queryClient.setQueryData<Collection[]>(collectionKeys.all(), old => (old ?? []).filter(c => !ids.includes(c.id)));
      return { prev };
    },
    onError: (_err, _ids, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(collectionKeys.all(), ctx.prev);
      toast.error('Failed to delete collections');
    },
    onSuccess: (data) => toast.success(`Deleted ${data.affected} collection${data.affected !== 1 ? 's' : ''}`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: collectionKeys.all() }),
  });
}

// ─── Admin hooks ──────────────────────────────────────────────────────────────

export function useAdminCollections() {
  return useQuery({
    queryKey: collectionKeys.admin(),
    queryFn: () => api.get<AdminCollection[]>('/api/admin/collections'),
  });
}

export function useAdminDeleteCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/collections/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: collectionKeys.admin() });
      const prev = queryClient.getQueryData<AdminCollection[]>(collectionKeys.admin());
      queryClient.setQueryData<AdminCollection[]>(collectionKeys.admin(), old =>
        (old ?? []).filter(c => c.id !== id),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(collectionKeys.admin(), ctx.prev);
      toast.error('Failed to delete collection');
    },
    onSuccess: () => toast.success('Collection deleted'),
  });
}
