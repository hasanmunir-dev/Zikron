import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { ItemLink, LinkableItem, LinkableItemType, RelationshipType } from '@/types';

export const itemLinkKeys = {
  forItem: (type: string, id: string) => ['item-links', type, id] as const,
  recent: () => ['item-links', 'recent'] as const,
  search: (q: string) => ['item-links', 'search', q] as const,
};

interface LinksResponse {
  outgoing: ItemLink[];
  incoming: ItemLink[];
}

export function useItemLinks(itemType: LinkableItemType, itemId: string | undefined) {
  return useQuery({
    queryKey: itemLinkKeys.forItem(itemType, itemId ?? ''),
    queryFn: () => api.get<LinksResponse>(`/api/item-links/${itemType}/${itemId}`),
    enabled: !!itemId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useRecentLinks(limit = 8) {
  return useQuery({
    queryKey: [...itemLinkKeys.recent(), limit],
    queryFn: () => api.get<ItemLink[]>(`/api/item-links/recent?limit=${limit}`),
    staleTime: 1000 * 60 * 2,
  });
}

export function useSearchLinkable(query: string) {
  const debouncedQ = useDebounce(query, 250);
  return useQuery({
    queryKey: itemLinkKeys.search(debouncedQ),
    queryFn: () => api.get<LinkableItem[]>(`/api/item-links/search?q=${encodeURIComponent(debouncedQ)}`),
    enabled: debouncedQ.trim().length >= 1,
    staleTime: 1000 * 30,
    placeholderData: [],
  });
}

export function useCreateItemLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      source_type: LinkableItemType;
      source_id: string;
      target_type: LinkableItemType;
      target_id: string;
      relationship_type?: RelationshipType;
    }) => api.post<ItemLink>('/api/item-links', input),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: itemLinkKeys.forItem(vars.source_type, vars.source_id) });
      queryClient.invalidateQueries({ queryKey: itemLinkKeys.forItem(vars.target_type, vars.target_id) });
      queryClient.invalidateQueries({ queryKey: itemLinkKeys.recent() });
    },
    onError: () => toast.error('Failed to create link'),
  });
}

export function useDeleteItemLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; sourceType: LinkableItemType; sourceId: string; targetType: LinkableItemType; targetId: string }) =>
      api.delete(`/api/item-links/${id}`),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: itemLinkKeys.forItem(vars.sourceType, vars.sourceId) });
      queryClient.invalidateQueries({ queryKey: itemLinkKeys.forItem(vars.targetType, vars.targetId) });
      queryClient.invalidateQueries({ queryKey: itemLinkKeys.recent() });
    },
    onError: () => toast.error('Failed to remove link'),
  });
}

export function useSyncWikiLinks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      source_type: LinkableItemType;
      source_id: string;
      targets: Array<{ target_type: LinkableItemType; target_id: string }>;
    }) => api.post<{ synced: number }>('/api/item-links/sync-wiki', input),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: itemLinkKeys.forItem(vars.source_type, vars.source_id) });
      queryClient.invalidateQueries({ queryKey: itemLinkKeys.recent() });
    },
  });
}
