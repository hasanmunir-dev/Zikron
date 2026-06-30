import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { ItemVersion, VersionableItemType } from '@/types';

export const historyKeys = {
  forItem: (type: VersionableItemType, id: string) => ['history', type, id] as const,
  version: (type: VersionableItemType, id: string, versionId: string) =>
    ['history', type, id, versionId] as const,
  recent: () => ['history', 'recent'] as const,
};

interface VersionsResponse {
  versions: ItemVersion[];
  total: number;
}

export function useItemVersions(itemType: VersionableItemType, itemId: string | undefined) {
  return useQuery({
    queryKey: historyKeys.forItem(itemType, itemId ?? ''),
    queryFn: () => api.get<VersionsResponse>(`/api/history/${itemType}/${itemId}`),
    enabled: !!itemId,
    staleTime: 1000 * 60,
  });
}

export function useItemVersion(
  itemType: VersionableItemType,
  itemId: string | undefined,
  versionId: string | undefined,
) {
  return useQuery({
    queryKey: historyKeys.version(itemType, itemId ?? '', versionId ?? ''),
    queryFn: () => api.get<ItemVersion>(`/api/history/${itemType}/${itemId}/${versionId}`),
    enabled: !!itemId && !!versionId,
    staleTime: Infinity,
  });
}

export function useRecentVersions(limit = 8) {
  return useQuery({
    queryKey: [...historyKeys.recent(), limit],
    queryFn: () => api.get<ItemVersion[]>(`/api/history/recent?limit=${limit}`),
    staleTime: 1000 * 60,
  });
}

export function useRestoreVersion(itemType: VersionableItemType, itemId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) =>
      api.post<{ item: unknown; restoredFromVersion: number }>(
        `/api/history/${itemType}/${itemId}/${versionId}/restore`,
        {},
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: historyKeys.forItem(itemType, itemId) });
      queryClient.invalidateQueries({ queryKey: historyKeys.recent() });
      // Invalidate the item itself so the editor refreshes
      queryClient.invalidateQueries({ queryKey: [itemType === 'inbox' ? 'inbox' : `${itemType}s`, itemId] });
      toast.success('Version restored');
    },
    onError: () => toast.error('Failed to restore version'),
  });
}
