import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { Contact, AdminContact } from '@/types';

export const contactKeys = {
  all: () => ['contacts'] as const,
  detail: (id: string) => ['contact', id] as const,
  admin: () => ['admin', 'contacts'] as const,
  adminDetail: (id: string) => ['admin', 'contact', id] as const,
};

// ─── User hooks ───────────────────────────────────────────────────────────────

export function useContacts() {
  return useQuery({
    queryKey: contactKeys.all(),
    queryFn: () => api.get<Contact[]>('/api/contacts'),
  });
}

export function useContact(id: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: contactKeys.detail(id!),
    queryFn: () => api.get<Contact>(`/api/contacts/${id}`),
    enabled: !!id,
    initialData: () => {
      const all = queryClient.getQueryData<Contact[]>(contactKeys.all());
      return all?.find(c => c.id === id);
    },
    initialDataUpdatedAt: () => queryClient.getQueryState(contactKeys.all())?.dataUpdatedAt,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<Contact, 'id' | 'user_id' | 'source' | 'google_resource_name' | 'favorite' | 'archived' | 'created_at' | 'updated_at'>) =>
      api.post<Contact>('/api/contacts', body),
    onSuccess: () => {
      toast.success('Contact created');
      queryClient.invalidateQueries({ queryKey: contactKeys.all() });
    },
    onError: () => toast.error('Failed to create contact'),
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Contact> & { id: string }) =>
      api.put<Contact>(`/api/contacts/${id}`, body),
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: contactKeys.all() });
      const prev = queryClient.getQueryData<Contact[]>(contactKeys.all());
      queryClient.setQueryData<Contact[]>(contactKeys.all(), old =>
        (old ?? []).map(c => c.id === id ? { ...c, ...updates } : c),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(contactKeys.all(), ctx.prev);
      toast.error('Failed to update contact');
    },
    onSuccess: (_data, { id }) => {
      toast.success('Contact updated');
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(id) });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/contacts/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: contactKeys.all() });
      const prev = queryClient.getQueryData<Contact[]>(contactKeys.all());
      queryClient.setQueryData<Contact[]>(contactKeys.all(), old =>
        (old ?? []).filter(c => c.id !== id),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(contactKeys.all(), ctx.prev);
      toast.error('Failed to delete contact');
    },
    onSuccess: () => toast.success('Contact deleted'),
  });
}

// ─── Google Contacts hooks ────────────────────────────────────────────────────

export const googleContactsKeys = {
  status: () => ['contacts', 'google', 'status'] as const,
};

export function useGoogleConnectionStatus() {
  return useQuery({
    queryKey: googleContactsKeys.status(),
    queryFn: () => api.get<{ connected: boolean; connectedAt: string | null }>('/api/contacts/google/status'),
  });
}

export function useImportGoogleContacts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ imported: number; updated: number; skipped: number; errors?: string[] }>('/api/contacts/google/import', {}),
    onSuccess: (data) => {
      const { imported, updated, skipped } = data;
      toast.success(`Import complete: ${imported} new, ${updated} updated, ${skipped} skipped`);
      queryClient.invalidateQueries({ queryKey: contactKeys.all() });
    },
    onError: () => toast.error('Google Contacts import failed'),
  });
}

export function useDisconnectGoogleContacts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete('/api/contacts/google/disconnect'),
    onSuccess: () => {
      toast.success('Google account disconnected');
      queryClient.invalidateQueries({ queryKey: googleContactsKeys.status() });
    },
    onError: () => toast.error('Failed to disconnect Google account'),
  });
}

// ─── Admin hooks ──────────────────────────────────────────────────────────────

export function useAdminContacts() {
  return useQuery({
    queryKey: contactKeys.admin(),
    queryFn: () => api.get<AdminContact[]>('/api/admin/contacts'),
  });
}

export function useAdminDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/contacts/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: contactKeys.admin() });
      const prev = queryClient.getQueryData<AdminContact[]>(contactKeys.admin());
      queryClient.setQueryData<AdminContact[]>(contactKeys.admin(), old =>
        (old ?? []).filter(c => c.id !== id),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(contactKeys.admin(), ctx.prev);
      toast.error('Failed to delete contact');
    },
    onSuccess: () => toast.success('Contact deleted'),
  });
}
