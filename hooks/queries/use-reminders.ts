import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { Reminder, ReminderStatus } from '@/types';

export const reminderKeys = {
  all: () => ['reminders'] as const,
  detail: (id: string) => ['reminder', id] as const,
};

export function useReminders() {
  return useQuery({
    queryKey: reminderKeys.all(),
    queryFn: () => api.get<Reminder[]>('/api/reminders'),
  });
}

export function useReminder(id: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: reminderKeys.detail(id!),
    queryFn: () => api.get<Reminder>(`/api/reminders/${id}`),
    enabled: !!id,
    initialData: () => {
      const all = queryClient.getQueryData<Reminder[]>(reminderKeys.all());
      return all?.find(r => r.id === id);
    },
    initialDataUpdatedAt: () => queryClient.getQueryState(reminderKeys.all())?.dataUpdatedAt,
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Reminder>) => api.post<Reminder>('/api/reminders', body),
    onSuccess: () => {
      toast.success('Reminder created');
      queryClient.invalidateQueries({ queryKey: reminderKeys.all() });
    },
    onError: () => {
      toast.error('Failed to create reminder');
    },
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Reminder> & { id: string }) =>
      api.put<Reminder>(`/api/reminders/${id}`, body),
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: reminderKeys.all() });
      const prev = queryClient.getQueryData<Reminder[]>(reminderKeys.all());
      queryClient.setQueryData<Reminder[]>(reminderKeys.all(), old =>
        (old ?? []).map(r => r.id === id ? { ...r, ...updates } : r),
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(reminderKeys.all(), context.prev);
      toast.error('Failed to update reminder');
    },
    onSuccess: () => {
      toast.success('Reminder updated');
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.all() });
      queryClient.invalidateQueries({ queryKey: reminderKeys.detail(id) });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/reminders/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: reminderKeys.all() });
      const prev = queryClient.getQueryData<Reminder[]>(reminderKeys.all());
      queryClient.setQueryData<Reminder[]>(reminderKeys.all(), old =>
        (old ?? []).filter(r => r.id !== id),
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(reminderKeys.all(), context.prev);
      toast.error('Failed to delete reminder');
    },
    onSuccess: () => {
      toast.success('Reminder deleted');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.all() });
    },
  });
}

export function useUpdateReminderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReminderStatus }) =>
      api.patch<Reminder>(`/api/reminders/${id}/status`, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: reminderKeys.all() });
      const prev = queryClient.getQueryData<Reminder[]>(reminderKeys.all());
      queryClient.setQueryData<Reminder[]>(reminderKeys.all(), old =>
        (old ?? []).map(r => r.id === id ? { ...r, status } : r),
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(reminderKeys.all(), context.prev);
      toast.error('Failed to update reminder status');
    },
    onSuccess: (_data, { status }) => {
      const labels: Record<ReminderStatus, string> = {
        completed: 'Marked as completed',
        pending: 'Marked as pending',
        cancelled: 'Reminder cancelled',
      };
      toast.success(labels[status]);
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.all() });
      queryClient.invalidateQueries({ queryKey: reminderKeys.detail(id) });
    },
  });
}

// ─── Bulk operations ──────────────────────────────────────────────────────────

export function useBulkUpdateReminders() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: ReminderStatus }) =>
      api.patch<{ affected: number }>('/api/reminders/bulk', { ids, updates: { status } }),
    onMutate: async ({ ids, status }) => {
      await queryClient.cancelQueries({ queryKey: reminderKeys.all() });
      const prev = queryClient.getQueryData<Reminder[]>(reminderKeys.all());
      queryClient.setQueryData<Reminder[]>(reminderKeys.all(), old =>
        (old ?? []).map(r => ids.includes(r.id) ? { ...r, status } : r),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(reminderKeys.all(), ctx.prev);
      toast.error('Bulk update failed');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: reminderKeys.all() }),
  });
}

export function useBulkDeleteReminders() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      api.deleteWithBody<{ affected: number }>('/api/reminders/bulk', { ids }),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: reminderKeys.all() });
      const prev = queryClient.getQueryData<Reminder[]>(reminderKeys.all());
      queryClient.setQueryData<Reminder[]>(reminderKeys.all(), old => (old ?? []).filter(r => !ids.includes(r.id)));
      return { prev };
    },
    onError: (_err, _ids, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(reminderKeys.all(), ctx.prev);
      toast.error('Failed to delete reminders');
    },
    onSuccess: (data) => toast.success(`Deleted ${data.affected} reminder${data.affected !== 1 ? 's' : ''}`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: reminderKeys.all() }),
  });
}
