import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { ContactMessage } from '@/types';

export const contactMessageKeys = {
  admin: () => ['admin', 'contact-messages'] as const,
};

export function useAdminContactMessages() {
  return useQuery({
    queryKey: contactMessageKeys.admin(),
    queryFn: () => api.get<ContactMessage[]>('/api/admin/contact-messages'),
  });
}

// Keep old names as aliases so existing admin contacts page doesn't break
export const useAdminContacts = useAdminContactMessages;
export const contactKeys = contactMessageKeys;

export function useMarkContactRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch<ContactMessage>(`/api/admin/contact-messages/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactMessageKeys.admin() });
    },
  });
}

export function useDeleteContactMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/contact-messages/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: contactMessageKeys.admin() });
      const prev = queryClient.getQueryData<ContactMessage[]>(contactMessageKeys.admin());
      queryClient.setQueryData<ContactMessage[]>(contactMessageKeys.admin(), old => (old ?? []).filter(c => c.id !== id));
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(contactMessageKeys.admin(), context.prev);
      toast.error('Failed to delete message');
    },
    onSuccess: () => {
      toast.success('Message deleted');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: contactMessageKeys.admin() });
    },
  });
}

// Keep old name as alias
export const useDeleteContact = useDeleteContactMessage;

export function useSubmitContact() {
  return useMutation({
    mutationFn: (body: { name: string; email: string; subject?: string; message: string }) =>
      api.post<ContactMessage>('/api/contact', body),
    onError: () => {
      toast.error('Failed to send message. Please try again.');
    },
  });
}
