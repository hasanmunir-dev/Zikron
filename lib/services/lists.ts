import { api } from '@/lib/api';
import type { List, ListColumn, ListRow, ListCell, FullList } from '@/types';

type ListInput = Pick<List, 'title' | 'description' | 'category_id' | 'tags' | 'is_favorite' | 'is_archived'>;

export const listsService = {
  async list(tab: 'all' | 'favorites' | 'archived' = 'all'): Promise<List[]> {
    const all = await api.get<List[]>('/api/lists');
    return filterLists(all, tab);
  },

  async get(id: string): Promise<FullList | null> {
    try {
      return await api.get<FullList>(`/api/lists/${id}`);
    } catch {
      return null;
    }
  },

  async create(
    input: ListInput,
    columnNames: string[] = [],
  ): Promise<{ list: List; columns: ListColumn[] }> {
    return api.post<{ list: List; columns: ListColumn[] }>('/api/lists', {
      ...input,
      columns: columnNames,
    });
  },

  async update(id: string, changes: Partial<ListInput>): Promise<List> {
    return api.put<List>(`/api/lists/${id}`, changes);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/api/lists/${id}`);
  },

  async addColumn(listId: string, name: string): Promise<{ column: ListColumn; cells: ListCell[] }> {
    return api.post<{ column: ListColumn; cells: ListCell[] }>(`/api/lists/${listId}/columns`, { name });
  },

  async updateColumn(listId: string, columnId: string, name: string): Promise<void> {
    await api.put(`/api/lists/${listId}/columns/${columnId}`, { name });
  },

  async deleteColumn(listId: string, columnId: string): Promise<void> {
    await api.delete(`/api/lists/${listId}/columns/${columnId}`);
  },

  async addRow(
    listId: string,
    cellValues: Record<string, string> = {},
  ): Promise<{ row: ListRow; cells: ListCell[] }> {
    return api.post<{ row: ListRow; cells: ListCell[] }>(`/api/lists/${listId}/rows`, { cells: cellValues });
  },

  async deleteRow(listId: string, rowId: string): Promise<void> {
    await api.delete(`/api/lists/${listId}/rows/${rowId}`);
  },

  async updateCell(listId: string, cellId: string, value: string): Promise<void> {
    await api.put(`/api/lists/${listId}/cells/${cellId}`, { value });
  },
};

function filterLists(lists: List[], tab: 'all' | 'favorites' | 'archived'): List[] {
  return lists.filter(l => {
    if (tab === 'favorites') return l.is_favorite && !l.is_archived;
    if (tab === 'archived') return l.is_archived;
    return !l.is_archived;
  });
}
