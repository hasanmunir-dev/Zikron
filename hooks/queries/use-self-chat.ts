import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { selfChatService } from '@/lib/services/self-chat';
import type { SelfChatMessage } from '@/types';

export const selfChatKeys = {
  all: () => ['self-chat'] as const,
};

export function useSelfChat() {
  return useQuery({
    queryKey: selfChatKeys.all(),
    queryFn: () => api.get<SelfChatMessage[]>('/api/self-chat'),
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => selfChatService.create(content),
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: selfChatKeys.all() });
      const prev = queryClient.getQueryData<SelfChatMessage[]>(selfChatKeys.all());
      const tempMsg: SelfChatMessage = {
        id: `temp-${Date.now()}`,
        user_id: '',
        content,
        is_favorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      queryClient.setQueryData<SelfChatMessage[]>(selfChatKeys.all(), old => [...(old ?? []), tempMsg]);
      return { prev };
    },
    onError: (_err, _content, context) => {
      if (context?.prev) queryClient.setQueryData(selfChatKeys.all(), context.prev);
      toast.error('Failed to send message');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: selfChatKeys.all() });
    },
  });
}

export function useToggleFavoriteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, current }: { id: string; current: boolean }) =>
      selfChatService.toggleFavorite(id, current),
    onMutate: async ({ id, current }) => {
      await queryClient.cancelQueries({ queryKey: selfChatKeys.all() });
      const prev = queryClient.getQueryData<SelfChatMessage[]>(selfChatKeys.all());
      queryClient.setQueryData<SelfChatMessage[]>(selfChatKeys.all(), old =>
        (old ?? []).map(m => m.id === id ? { ...m, is_favorite: !current } : m),
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(selfChatKeys.all(), context.prev);
      toast.error('Failed to update favorite');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: selfChatKeys.all() });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => selfChatService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: selfChatKeys.all() });
      const prev = queryClient.getQueryData<SelfChatMessage[]>(selfChatKeys.all());
      queryClient.setQueryData<SelfChatMessage[]>(selfChatKeys.all(), old =>
        (old ?? []).filter(m => m.id !== id),
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(selfChatKeys.all(), context.prev);
      toast.error('Failed to delete message');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: selfChatKeys.all() });
    },
  });
}
