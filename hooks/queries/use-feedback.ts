import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { Feedback, AdminFeedback } from '@/types';

export const feedbackKeys = {
  all: () => ['feedback'] as const,
  detail: (id: string) => ['feedback-item', id] as const,
  admin: () => ['admin', 'feedback'] as const,
  adminDetail: (id: string) => ['admin', 'feedback', id] as const,
};

// ─── User hooks ───────────────────────────────────────────────────────────────

export function useFeedback() {
  return useQuery({
    queryKey: feedbackKeys.all(),
    queryFn: () => api.get<Feedback[]>('/api/feedback'),
  });
}

export function useFeedbackItem(id: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: feedbackKeys.detail(id!),
    queryFn: () => api.get<Feedback>(`/api/feedback/${id}`),
    enabled: !!id,
    initialData: () => {
      const all = queryClient.getQueryData<Feedback[]>(feedbackKeys.all());
      return all?.find(f => f.id === id);
    },
    initialDataUpdatedAt: () => queryClient.getQueryState(feedbackKeys.all())?.dataUpdatedAt,
  });
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Feedback>) => api.post<Feedback>('/api/feedback', body),
    onSuccess: () => {
      toast.success('Feedback submitted — thank you!');
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all() });
    },
    onError: () => {
      toast.error('Failed to submit feedback');
    },
  });
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/feedback/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: feedbackKeys.all() });
      const prev = queryClient.getQueryData<Feedback[]>(feedbackKeys.all());
      queryClient.setQueryData<Feedback[]>(feedbackKeys.all(), old => (old ?? []).filter(f => f.id !== id));
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(feedbackKeys.all(), context.prev);
      toast.error('Failed to delete feedback');
    },
    onSuccess: () => {
      toast.success('Feedback deleted');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all() });
    },
  });
}

// ─── Admin hooks ──────────────────────────────────────────────────────────────

export function useAdminFeedback() {
  return useQuery({
    queryKey: feedbackKeys.admin(),
    queryFn: () => api.get<AdminFeedback[]>('/api/admin/feedback'),
  });
}

export function useAdminFeedbackItem(id: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: feedbackKeys.adminDetail(id!),
    queryFn: () => api.get<AdminFeedback>(`/api/admin/feedback/${id}`),
    enabled: !!id,
    initialData: () => {
      const all = queryClient.getQueryData<AdminFeedback[]>(feedbackKeys.admin());
      return all?.find(f => f.id === id);
    },
    initialDataUpdatedAt: () => queryClient.getQueryState(feedbackKeys.admin())?.dataUpdatedAt,
  });
}

export function useAdminUpdateFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; status?: string; admin_response?: string; priority?: string }) =>
      api.patch<AdminFeedback>(`/api/admin/feedback/${id}`, body),
    onSuccess: () => {
      toast.success('Feedback updated');
      queryClient.invalidateQueries({ queryKey: feedbackKeys.admin() });
    },
    onError: () => {
      toast.error('Failed to update feedback');
    },
  });
}

export function useAdminDeleteFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/feedback/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: feedbackKeys.admin() });
      const prev = queryClient.getQueryData<AdminFeedback[]>(feedbackKeys.admin());
      queryClient.setQueryData<AdminFeedback[]>(feedbackKeys.admin(), old => (old ?? []).filter(f => f.id !== id));
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(feedbackKeys.admin(), context.prev);
      toast.error('Failed to delete feedback');
    },
    onSuccess: () => {
      toast.success('Feedback deleted');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.admin() });
    },
  });
}
