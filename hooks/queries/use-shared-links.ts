import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { SharedLink, AdminSharedLink, ShareAccessLog, ShareType, ItemType } from '@/types';

export const shareKeys = {
  all: () => ['shared-links'] as const,
  detail: (id: string) => ['shared-link', id] as const,
  logs: (id: string) => ['shared-link-logs', id] as const,
  admin: () => ['admin', 'shared-links'] as const,
  adminDetail: (id: string) => ['admin', 'shared-link', id] as const,
  adminLogs: (id: string) => ['admin', 'shared-link-logs', id] as const,
};

// ─── User hooks ───────────────────────────────────────────────────────────────

export function useSharedLinks() {
  return useQuery({
    queryKey: shareKeys.all(),
    queryFn: () => api.get<SharedLink[]>('/api/shared-links'),
  });
}

export function useSharedLink(id: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: shareKeys.detail(id!),
    queryFn: () => api.get<SharedLink>(`/api/shared-links/${id}`),
    enabled: !!id,
    initialData: () => {
      const all = queryClient.getQueryData<SharedLink[]>(shareKeys.all());
      return all?.find(l => l.id === id);
    },
    initialDataUpdatedAt: () => queryClient.getQueryState(shareKeys.all())?.dataUpdatedAt,
  });
}

export function useShareLogs(id: string | undefined) {
  return useQuery({
    queryKey: shareKeys.logs(id!),
    queryFn: () => api.get<ShareAccessLog[]>(`/api/shared-links/${id}/logs`),
    enabled: !!id,
  });
}

export interface CreateShareLinkInput {
  item_type: ItemType;
  item_id: string;
  share_type: ShareType;
  password?: string;
  expires_at?: string;
  view_limit?: number;
  allow_download?: boolean;
  recipients?: RecipientInput[];
}

interface RecipientInput {
  contact_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  required_login_user_id?: string;
}

export function useCreateSharedLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateShareLinkInput) => api.post<SharedLink>('/api/shared-links', body),
    onSuccess: () => {
      toast.success('Share link created');
      queryClient.invalidateQueries({ queryKey: shareKeys.all() });
    },
    onError: () => toast.error('Failed to create share link'),
  });
}

export function useRevokeSharedLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/api/shared-links/${id}/revoke`, {}),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: shareKeys.all() });
      const prev = queryClient.getQueryData<SharedLink[]>(shareKeys.all());
      queryClient.setQueryData<SharedLink[]>(shareKeys.all(), old =>
        (old ?? []).map(l => l.id === id ? { ...l, is_revoked: true } : l),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(shareKeys.all(), ctx.prev);
      toast.error('Failed to revoke link');
    },
    onSuccess: () => toast.success('Link revoked'),
  });
}

export function useDeleteSharedLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/shared-links/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: shareKeys.all() });
      const prev = queryClient.getQueryData<SharedLink[]>(shareKeys.all());
      queryClient.setQueryData<SharedLink[]>(shareKeys.all(), old =>
        (old ?? []).filter(l => l.id !== id),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(shareKeys.all(), ctx.prev);
      toast.error('Failed to delete link');
    },
    onSuccess: () => toast.success('Share link deleted'),
  });
}

// ─── Admin hooks ──────────────────────────────────────────────────────────────

export function useAdminSharedLinks() {
  return useQuery({
    queryKey: shareKeys.admin(),
    queryFn: () => api.get<AdminSharedLink[]>('/api/admin/shared'),
  });
}

export function useAdminSharedLink(id: string | undefined) {
  return useQuery({
    queryKey: shareKeys.adminDetail(id!),
    queryFn: () => api.get<AdminSharedLink>(`/api/admin/shared/${id}`),
    enabled: !!id,
  });
}

export function useAdminShareLogs(id: string | undefined) {
  return useQuery({
    queryKey: shareKeys.adminLogs(id!),
    queryFn: () => api.get<ShareAccessLog[]>(`/api/admin/shared/${id}/logs`),
    enabled: !!id,
  });
}

export function useAdminRevokeSharedLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/api/admin/shared/${id}/revoke`, {}),
    onSuccess: () => {
      toast.success('Link revoked');
      queryClient.invalidateQueries({ queryKey: shareKeys.admin() });
    },
    onError: () => toast.error('Failed to revoke link'),
  });
}

export function useAdminDeleteSharedLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/shared/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: shareKeys.admin() });
      const prev = queryClient.getQueryData<AdminSharedLink[]>(shareKeys.admin());
      queryClient.setQueryData<AdminSharedLink[]>(shareKeys.admin(), old =>
        (old ?? []).filter(l => l.id !== id),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(shareKeys.admin(), ctx.prev);
      toast.error('Failed to delete link');
    },
    onSuccess: () => toast.success('Share link deleted'),
  });
}
