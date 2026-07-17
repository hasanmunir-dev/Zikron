import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { Template, TemplateType } from '@/types';

export const templateKeys = {
  all: () => ['templates'] as const,
  list: (type?: TemplateType) => ['templates', 'list', type ?? 'all'] as const,
  detail: (id: string) => ['template', id] as const,
  system: () => ['templates', 'system'] as const,
  favorites: () => ['templates', 'favorites'] as const,
};

export function useTemplates(templateType?: TemplateType, search?: string) {
  return useQuery({
    queryKey: [...templateKeys.list(templateType), search ?? ''],
    queryFn: () => {
      const params = new URLSearchParams();
      if (templateType) params.set('type', templateType);
      if (search) params.set('search', search);
      return api.get<Template[]>(`/api/templates?${params}`);
    },
    staleTime: 60_000,
  });
}

export function useTemplate(id: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: templateKeys.detail(id!),
    queryFn: () => api.get<Template>(`/api/templates/${id}`),
    enabled: !!id,
    initialData: () => {
      // Search all cached template lists (type-filtered or unfiltered)
      const allLists = queryClient.getQueriesData<Template[]>({ queryKey: ['templates', 'list'] });
      for (const [, data] of allLists) {
        const found = data?.find(t => t.id === id);
        if (found) return found;
      }
      return undefined;
    },
    initialDataUpdatedAt: () => {
      const states = queryClient.getQueriesData<Template[]>({ queryKey: ['templates', 'list'] });
      return states.reduce<number | undefined>((min, [key]) => {
        const ts = queryClient.getQueryState(key)?.dataUpdatedAt;
        if (!ts) return min;
        return min === undefined ? ts : Math.min(min, ts);
      }, undefined);
    },
  });
}

export function useSystemTemplates() {
  return useQuery({
    queryKey: templateKeys.system(),
    queryFn: () => api.get<Template[]>('/api/templates?limit=50'),
    select: (data: Template[]) => data.filter(t => t.is_system),
    staleTime: 5 * 60_000,
  });
}

export function useFavoriteTemplates() {
  return useQuery({
    queryKey: templateKeys.favorites(),
    queryFn: () => api.get<Template[]>('/api/templates?favorites=true'),
    staleTime: 60_000,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Template>) => api.post<Template>('/api/templates', body),
    onSuccess: () => {
      toast.success('Template created');
      queryClient.invalidateQueries({ queryKey: templateKeys.all() });
    },
    onError: () => toast.error('Failed to create template'),
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Template> & { id: string }) =>
      api.put<Template>(`/api/templates/${id}`, body),
    onSuccess: (updated) => {
      toast.success('Template updated');
      queryClient.invalidateQueries({ queryKey: templateKeys.all() });
      queryClient.setQueryData(templateKeys.detail(updated.id), updated);
    },
    onError: () => toast.error('Failed to update template'),
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/templates/${id}`),
    onSuccess: () => {
      toast.success('Template deleted');
      queryClient.invalidateQueries({ queryKey: templateKeys.all() });
    },
    onError: () => toast.error('Failed to delete template'),
  });
}

export function useDuplicateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<Template>(`/api/templates/${id}/duplicate`, {}),
    onSuccess: () => {
      toast.success('Template duplicated');
      queryClient.invalidateQueries({ queryKey: templateKeys.all() });
    },
    onError: () => toast.error('Failed to duplicate template'),
  });
}

export function useUseTemplate() {
  return useMutation({
    mutationFn: (id: string) => api.post<Template>(`/api/templates/${id}/use`, {}),
  });
}
