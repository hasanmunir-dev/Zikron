'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  avatar_path: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'disabled';
  version_history_limit: number;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: ['me'],
    queryFn: () => api.get<UserProfile>('/api/me'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ url, path }: { url: string; path: string }) =>
      api.patch('/api/me', { avatar_url: url, avatar_path: path }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success('Profile picture updated');
    },
    onError: () => toast.error('Failed to update profile picture'),
  });
}

export function useDeleteAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch('/api/me', { avatar_url: null, avatar_path: null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success('Profile picture removed');
    },
    onError: () => toast.error('Failed to remove profile picture'),
  });
}

export interface BucketFile {
  path: string;
  size: number;
  createdAt: string;
  publicUrl: string;
  status: 'applied' | 'orphaned';
  owner: { user_id: string; email: string | null; full_name: string | null } | null;
}

export function useAdminBucketFiles() {
  return useQuery<{ files: BucketFile[]; total: number }>({
    queryKey: ['admin', 'profile-pictures'],
    queryFn: () => api.get('/api/admin/profile-pictures'),
    staleTime: 30 * 1000,
  });
}

export function useAdminDeleteBucketFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (path: string) =>
      api.deleteWithBody('/api/admin/profile-pictures', { path }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'profile-pictures'] });
      toast.success('Orphaned file deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete file'),
  });
}
