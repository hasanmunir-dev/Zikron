import { api } from '@/lib/api';
import type { SelfChatMessage } from '@/types';

export const selfChatService = {
  async list(): Promise<SelfChatMessage[]> {
    return api.get<SelfChatMessage[]>('/api/self-chat');
  },

  async create(content: string): Promise<SelfChatMessage> {
    return api.post<SelfChatMessage>('/api/self-chat', { content });
  },

  async toggleFavorite(id: string, current: boolean): Promise<SelfChatMessage> {
    return api.put<SelfChatMessage>(`/api/self-chat/${id}`, { is_favorite: !current });
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/api/self-chat/${id}`);
  },
};
