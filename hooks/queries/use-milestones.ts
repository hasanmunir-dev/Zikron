import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { CollectionMilestone } from '@/types';

export const milestoneKeys = {
  all: (collectionId: string) => ['milestones', collectionId] as const,
};

export function useMilestones(collectionId: string) {
  return useQuery({
    queryKey: milestoneKeys.all(collectionId),
    queryFn: () => api.get<CollectionMilestone[]>(`/api/collections/${collectionId}/milestones`),
    enabled: !!collectionId,
    staleTime: 60_000,
  });
}

export function useCreateMilestone(collectionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; description?: string; due_date?: string | null; sort_order?: number }) =>
      api.post<CollectionMilestone>(`/api/collections/${collectionId}/milestones`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: milestoneKeys.all(collectionId) });
      qc.invalidateQueries({ queryKey: ['calendar'] });
    },
    onError: () => toast.error('Failed to create milestone'),
  });
}

export function useUpdateMilestone(collectionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<CollectionMilestone> & { id: string }) =>
      api.patch<CollectionMilestone>(`/api/collections/${collectionId}/milestones/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: milestoneKeys.all(collectionId) });
      qc.invalidateQueries({ queryKey: ['calendar'] });
    },
    onError: () => toast.error('Failed to update milestone'),
  });
}

export function useDeleteMilestone(collectionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/collections/${collectionId}/milestones/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: milestoneKeys.all(collectionId) });
      qc.invalidateQueries({ queryKey: ['calendar'] });
    },
    onError: () => toast.error('Failed to delete milestone'),
  });
}

export function useToggleMilestone(collectionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<CollectionMilestone>(`/api/collections/${collectionId}/milestones/${id}/toggle`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: milestoneKeys.all(collectionId) });
      qc.invalidateQueries({ queryKey: ['calendar'] });
    },
    onError: () => toast.error('Failed to toggle milestone'),
  });
}
