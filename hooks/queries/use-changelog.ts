import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { Changelog } from '@/types';

export const changelogKeys = {
  published: () => ['changelogs', 'published'] as const,
  adminAll: () => ['admin', 'changelogs'] as const,
  adminDetail: (id: string) => ['admin', 'changelog', id] as const,
};

// Public hook — fetches published changelogs (no auth required)
export function usePublishedChangelogs() {
  return useQuery({
    queryKey: changelogKeys.published(),
    queryFn: () => api.get<Changelog[]>('/api/changelog'),
  });
}

// Admin hooks
export function useAdminChangelogs() {
  return useQuery({
    queryKey: changelogKeys.adminAll(),
    queryFn: () => api.get<Changelog[]>('/api/changelog/admin/all'),
  });
}

export function useAdminChangelog(id: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: changelogKeys.adminDetail(id!),
    queryFn: () => api.get<Changelog>(`/api/changelog/admin/${id}`),
    enabled: !!id,
    initialData: () => {
      const all = queryClient.getQueryData<Changelog[]>(changelogKeys.adminAll());
      return all?.find(c => c.id === id);
    },
    initialDataUpdatedAt: () => queryClient.getQueryState(changelogKeys.adminAll())?.dataUpdatedAt,
  });
}

export function useAdminCreateChangelog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Changelog>) => api.post<Changelog>('/api/changelog/admin', body),
    onSuccess: () => {
      toast.success('Changelog created');
      queryClient.invalidateQueries({ queryKey: changelogKeys.adminAll() });
      queryClient.invalidateQueries({ queryKey: changelogKeys.published() });
    },
    onError: () => {
      toast.error('Failed to create changelog');
    },
  });
}

export function useAdminUpdateChangelog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Changelog> & { id: string }) =>
      api.put<Changelog>(`/api/changelog/admin/${id}`, body),
    onSuccess: () => {
      toast.success('Changelog updated');
      queryClient.invalidateQueries({ queryKey: changelogKeys.adminAll() });
      queryClient.invalidateQueries({ queryKey: changelogKeys.published() });
    },
    onError: () => {
      toast.error('Failed to update changelog');
    },
  });
}

export function useAdminDeleteChangelog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/changelog/admin/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: changelogKeys.adminAll() });
      const prev = queryClient.getQueryData<Changelog[]>(changelogKeys.adminAll());
      queryClient.setQueryData<Changelog[]>(changelogKeys.adminAll(), old => (old ?? []).filter(c => c.id !== id));
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(changelogKeys.adminAll(), context.prev);
      toast.error('Failed to delete changelog');
    },
    onSuccess: () => {
      toast.success('Changelog deleted');
      queryClient.invalidateQueries({ queryKey: changelogKeys.published() });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: changelogKeys.adminAll() });
    },
  });
}

export function useAdminTogglePublish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      api.patch<Changelog>(`/api/changelog/admin/${id}/publish`, { published }),
    onSuccess: (_data, { published }) => {
      toast.success(published ? 'Changelog published' : 'Changelog unpublished');
      queryClient.invalidateQueries({ queryKey: changelogKeys.adminAll() });
      queryClient.invalidateQueries({ queryKey: changelogKeys.published() });
    },
    onError: () => {
      toast.error('Failed to update publish status');
    },
  });
}
