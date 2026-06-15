import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { AdminNote, AdminList, UserProfile } from '@/types';

interface AdminStats {
  totalUsers: number;
  totalNotes: number;
  totalInbox: number;
  totalMessages: number;
  totalLists: number;
  totalRows: number;
  activeUsers: number;
  disabledUsers: number;
}

interface AdminInboxItem {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  url: string | null;
  type: 'text' | 'link';
  status: string;
  tags: string[];
  created_at: string;
  profiles: { email: string | null; full_name: string | null } | null;
}

interface AdminMessage {
  id: string;
  user_id: string;
  content: string;
  is_favorite: boolean;
  created_at: string;
  profiles: { email: string | null; full_name: string | null } | null;
}

export const adminKeys = {
  stats: () => ['admin', 'stats'] as const,
  users: () => ['admin', 'users'] as const,
  notes: () => ['admin', 'notes'] as const,
  inbox: () => ['admin', 'inbox'] as const,
  selfChat: () => ['admin', 'self-chat'] as const,
  lists: () => ['admin', 'lists'] as const,
  list: (id: string) => ['admin', 'list', id] as const,
};

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: () => api.get<AdminStats>('/api/admin/stats'),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: () => api.get<UserProfile[]>('/api/admin/users'),
  });
}

export function useAdminNotes() {
  return useQuery({
    queryKey: adminKeys.notes(),
    queryFn: () => api.get<AdminNote[]>('/api/admin/notes'),
  });
}

export function useAdminInbox() {
  return useQuery({
    queryKey: adminKeys.inbox(),
    queryFn: () => api.get<AdminInboxItem[]>('/api/admin/inbox'),
  });
}

export function useAdminSelfChat() {
  return useQuery({
    queryKey: adminKeys.selfChat(),
    queryFn: () => api.get<AdminMessage[]>('/api/admin/self-chat'),
  });
}

export function useAdminLists() {
  return useQuery({
    queryKey: adminKeys.lists(),
    queryFn: () => api.get<AdminList[]>('/api/admin/lists'),
  });
}

export function useAdminList(id: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: adminKeys.list(id!),
    queryFn: () => api.get<AdminList>(`/api/admin/lists/${id}`),
    enabled: !!id,
    initialData: () => {
      const lists = queryClient.getQueryData<AdminList[]>(adminKeys.lists());
      return lists?.find(l => l.id === id);
    },
    initialDataUpdatedAt: () => queryClient.getQueryState(adminKeys.lists())?.dataUpdatedAt,
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'active' | 'disabled' }) =>
      api.patch(`/api/admin/users/${userId}/status`, { status }),
    onMutate: async ({ userId, status }) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.users() });
      const prev = queryClient.getQueryData<UserProfile[]>(adminKeys.users());
      queryClient.setQueryData<UserProfile[]>(adminKeys.users(), old =>
        (old ?? []).map(u => u.user_id === userId ? { ...u, status } : u),
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(adminKeys.users(), context.prev);
      toast.error('Failed to update user status');
    },
    onSuccess: () => {
      toast.success('User status updated');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}

export function useAdminDeleteList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/lists/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.lists() });
      const prev = queryClient.getQueryData<AdminList[]>(adminKeys.lists());
      queryClient.setQueryData<AdminList[]>(adminKeys.lists(), old =>
        (old ?? []).filter(l => l.id !== id),
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(adminKeys.lists(), context.prev);
      toast.error('Failed to delete list');
    },
    onSuccess: () => {
      toast.success('List deleted');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}
