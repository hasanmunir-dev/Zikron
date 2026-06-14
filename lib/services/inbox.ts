import { api } from '@/lib/api';
import type { InboxItem } from '@/types';

type InboxInput = Pick<InboxItem, 'title' | 'content' | 'url' | 'type' | 'tags' | 'category_id'>;

export const inboxService = {
  async list(tab: 'inbox' | 'favorite' | 'archived' = 'inbox'): Promise<InboxItem[]> {
    const all = await api.get<InboxItem[]>('/api/inbox');
    return all
      .filter(i => i.status === tab)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async listAll(): Promise<InboxItem[]> {
    return api.get<InboxItem[]>('/api/inbox');
  },

  async get(id: string): Promise<InboxItem | undefined> {
    try {
      return await api.get<InboxItem>(`/api/inbox/${id}`);
    } catch {
      return undefined;
    }
  },

  async create(input: InboxInput): Promise<InboxItem> {
    return api.post<InboxItem>('/api/inbox', input);
  },

  async update(id: string, changes: Partial<Pick<InboxItem, 'status' | 'title' | 'content' | 'url' | 'tags'>>): Promise<InboxItem> {
    return api.put<InboxItem>(`/api/inbox/${id}`, changes);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/api/inbox/${id}`);
  },
};
