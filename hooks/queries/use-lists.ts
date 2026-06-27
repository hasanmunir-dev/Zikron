import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { listsService } from '@/lib/services/lists';
import type { List, FullList } from '@/types';

type Tab = 'all' | 'favorites' | 'archived';

export const listKeys = {
  all: () => ['lists'] as const,
  detail: (id: string) => ['list', id] as const,
};

function filterLists(lists: List[], tab: Tab): List[] {
  return lists.filter(l => {
    if (tab === 'favorites') return l.is_favorite && !l.is_archived;
    if (tab === 'archived') return l.is_archived;
    return !l.is_archived;
  });
}

export function useLists(tab: Tab = 'all') {
  return useQuery({
    queryKey: listKeys.all(),
    queryFn: () => api.get<List[]>('/api/lists'),
    select: (data) => filterLists(data, tab),
    placeholderData: keepPreviousData,
  });
}

export function useList(id: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: listKeys.detail(id!),
    queryFn: () => listsService.get(id!),
    enabled: !!id,
    initialData: () => {
      const lists = queryClient.getQueryData<List[]>(listKeys.all());
      const match = lists?.find(l => l.id === id);
      return match ? ({ ...match, columns: [], rows: [] } as FullList) : undefined;
    },
    initialDataUpdatedAt: () => queryClient.getQueryState(listKeys.all())?.dataUpdatedAt,
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => listsService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: listKeys.all() });
      const prev = queryClient.getQueryData<List[]>(listKeys.all());
      queryClient.setQueryData<List[]>(listKeys.all(), old => (old ?? []).filter(l => l.id !== id));
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(listKeys.all(), context.prev);
      toast.error('Failed to delete list');
    },
    onSuccess: () => {
      toast.success('List deleted');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listKeys.all() });
    },
  });
}

export function useUpdateList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<List> }) =>
      listsService.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: listKeys.all() });
      const prev = queryClient.getQueryData<List[]>(listKeys.all());
      const now = new Date().toISOString();
      queryClient.setQueryData<List[]>(listKeys.all(), old =>
        (old ?? []).map(l => l.id === id ? { ...l, ...data, updated_at: now } : l),
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(listKeys.all(), context.prev);
      toast.error('Failed to update list');
    },
    onSuccess: () => {
      toast.success('List saved');
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: listKeys.all() });
      queryClient.invalidateQueries({ queryKey: listKeys.detail(id) });
    },
  });
}

// ─── Bulk operations ──────────────────────────────────────────────────────────

export function useBulkUpdateLists() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, updates }: { ids: string[]; updates: Record<string, unknown> }) =>
      api.patch<{ affected: number }>('/api/lists/bulk', { ids, updates }),
    onMutate: async ({ ids, updates }) => {
      await queryClient.cancelQueries({ queryKey: listKeys.all() });
      const prev = queryClient.getQueryData<List[]>(listKeys.all());
      queryClient.setQueryData<List[]>(listKeys.all(), old =>
        (old ?? []).map(l => ids.includes(l.id) ? { ...l, ...updates } as List : l),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(listKeys.all(), ctx.prev);
      toast.error('Bulk update failed');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: listKeys.all() }),
  });
}

export function useBulkDeleteLists() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      api.deleteWithBody<{ affected: number }>('/api/lists/bulk', { ids }),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: listKeys.all() });
      const prev = queryClient.getQueryData<List[]>(listKeys.all());
      queryClient.setQueryData<List[]>(listKeys.all(), old => (old ?? []).filter(l => !ids.includes(l.id)));
      return { prev };
    },
    onError: (_err, _ids, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(listKeys.all(), ctx.prev);
      toast.error('Failed to delete lists');
    },
    onSuccess: (data) => toast.success(`Deleted ${data.affected} list${data.affected !== 1 ? 's' : ''}`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: listKeys.all() }),
  });
}
