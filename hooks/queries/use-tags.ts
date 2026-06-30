import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { Tag, TagWithCount, TagItem, TagItemType } from '@/types';

export const tagKeys = {
  all:        ()                            => ['tags'] as const,
  frequent:   ()                            => ['tags', 'frequent'] as const,
  recent:     ()                            => ['tags', 'recent'] as const,
  byName:     (name: string)               => ['tags', 'by-name', name] as const,
  forItem:    (type: TagItemType, id: string) => ['tags', 'for-item', type, id] as const,
  items:      (nameOrId: string)           => ['tags', 'items', nameOrId] as const,
};

// ─── All tags (with counts) ───────────────────────────────────────────────────

export function useTags() {
  return useQuery({
    queryKey: tagKeys.all(),
    queryFn: () => api.get<TagWithCount[]>('/api/tags'),
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Single tag by name or id ─────────────────────────────────────────────────

export function useTag(nameOrId: string | undefined) {
  return useQuery({
    queryKey: tagKeys.byName(nameOrId ?? ''),
    queryFn: () => api.get<TagWithCount>(`/api/tags/${nameOrId}`),
    enabled: !!nameOrId,
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Tags on a specific item ──────────────────────────────────────────────────

export function useItemTags(itemType: TagItemType, itemId: string | undefined) {
  return useQuery({
    queryKey: tagKeys.forItem(itemType, itemId ?? ''),
    queryFn: () => api.get<Tag[]>(`/api/tags/for-item/${itemType}/${itemId}`),
    enabled: !!itemId,
    staleTime: 1000 * 60,
  });
}

// ─── Items for a tag ──────────────────────────────────────────────────────────

export function useTagItems(nameOrId: string | undefined, filterType?: TagItemType) {
  const qs = filterType ? `?item_type=${filterType}` : '';
  return useQuery({
    queryKey: [...tagKeys.items(nameOrId ?? ''), filterType],
    queryFn: () => api.get<TagItem[]>(`/api/tags/${nameOrId}/items${qs}`),
    enabled: !!nameOrId,
    staleTime: 1000 * 60,
  });
}

// ─── Dashboard widgets ────────────────────────────────────────────────────────

export function useFrequentTags(limit = 10) {
  return useQuery({
    queryKey: [...tagKeys.frequent(), limit],
    queryFn: () => api.get<TagWithCount[]>(`/api/tags/frequent?limit=${limit}`),
    staleTime: 1000 * 60 * 3,
  });
}

export function useRecentTags(limit = 8) {
  return useQuery({
    queryKey: [...tagKeys.recent(), limit],
    queryFn: () => api.get<Tag[]>(`/api/tags/recent?limit=${limit}`),
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; color?: string; description?: string }) =>
      api.post<Tag>('/api/tags', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tagKeys.all() });
      qc.invalidateQueries({ queryKey: tagKeys.frequent() });
    },
    onError: () => toast.error('Failed to create tag'),
  });
}

export function useUpdateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; color?: string; description?: string }) =>
      api.put<Tag>(`/api/tags/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tagKeys.all() });
    },
    onError: () => toast.error('Failed to update tag'),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/tags/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tagKeys.all() });
      qc.invalidateQueries({ queryKey: tagKeys.frequent() });
      qc.invalidateQueries({ queryKey: tagKeys.recent() });
    },
    onError: () => toast.error('Failed to delete tag'),
  });
}

export function useAddTagToItem(itemType: TagItemType, itemId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (nameOrId: string) =>
      api.post<TagItem>(`/api/tags/${encodeURIComponent(nameOrId)}/items`, {
        item_type: itemType,
        item_id: itemId,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tagKeys.forItem(itemType, itemId) });
      qc.invalidateQueries({ queryKey: tagKeys.all() });
      qc.invalidateQueries({ queryKey: tagKeys.frequent() });
      qc.invalidateQueries({ queryKey: tagKeys.recent() });
    },
    onError: () => toast.error('Failed to add tag'),
  });
}

export function useRemoveTagFromItem(itemType: TagItemType, itemId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tagId: string) =>
      api.delete(`/api/tags/${tagId}/items/${itemType}/${itemId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tagKeys.forItem(itemType, itemId) });
      qc.invalidateQueries({ queryKey: tagKeys.all() });
      qc.invalidateQueries({ queryKey: tagKeys.frequent() });
    },
    onError: () => toast.error('Failed to remove tag'),
  });
}
