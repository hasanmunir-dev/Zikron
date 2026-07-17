import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ActivityLog, ActivityItemType } from '@/types';

interface ActivityPage {
  activity: ActivityLog[];
  total: number;
}

export const activityKeys = {
  all: () => ['activity'] as const,
  list: (itemType?: ActivityItemType) => ['activity', 'list', itemType ?? 'all'] as const,
};

export function useActivity(itemType?: ActivityItemType, limit = 40) {
  return useInfiniteQuery<ActivityPage>({
    queryKey: activityKeys.list(itemType),
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({ limit: String(limit), offset: String(pageParam as number) });
      if (itemType) params.set('item_type', itemType);
      return api.get<ActivityPage>(`/activity?${params}`);
    },
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((n, p) => n + p.activity.length, 0);
      return loaded < lastPage.total ? loaded : undefined;
    },
    initialPageParam: 0,
  });
}

export function useRecentActivity(limit = 10) {
  return useQuery<ActivityLog[]>({
    queryKey: ['activity', 'recent', limit],
    queryFn: () =>
      api.get<ActivityPage>(`/activity?limit=${limit}`).then(r => r.activity),
    staleTime: 30_000,
  });
}
