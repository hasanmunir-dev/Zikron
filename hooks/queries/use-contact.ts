import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { ContactMessage } from '@/types';

export const contactKeys = {
  admin: () => ['admin', 'contacts'] as const,
};

export function useAdminContacts() {
  return useQuery({
    queryKey: contactKeys.admin(),
    queryFn: () => api.get<ContactMessage[]>('/api/admin/contacts'),
  });
}

export function useMarkContactRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch<ContactMessage>(`/api/admin/contacts/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.admin() });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/contacts/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: contactKeys.admin() });
      const prev = queryClient.getQueryData<ContactMessage[]>(contactKeys.admin());
      queryClient.setQueryData<ContactMessage[]>(contactKeys.admin(), old => (old ?? []).filter(c => c.id !== id));
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(contactKeys.admin(), context.prev);
      toast.error('Failed to delete message');
    },
    onSuccess: () => {
      toast.success('Message deleted');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.admin() });
    },
  });
}

export function useSubmitContact() {
  return useMutation({
    mutationFn: (body: { name: string; email: string; subject?: string; message: string }) =>
      api.post<ContactMessage>('/api/contact', body),
    onError: () => {
      toast.error('Failed to send message. Please try again.');
    },
  });
}
