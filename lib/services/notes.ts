import { api } from '@/lib/api';
import type { Note } from '@/types';

type NoteInput = Pick<Note, 'title' | 'content' | 'tags' | 'is_favorite' | 'is_archived' | 'category_id'>;

export const notesService = {
  async list(tab: 'all' | 'favorites' | 'archived' = 'all'): Promise<Note[]> {
    const all = await api.get<Note[]>('/api/notes');
    return filterNotes(all, tab);
  },

  async get(id: string): Promise<Note | undefined> {
    try {
      return await api.get<Note>(`/api/notes/${id}`);
    } catch {
      return undefined;
    }
  },

  async create(input: NoteInput): Promise<Note> {
    return api.post<Note>('/api/notes', input);
  },

  async update(id: string, changes: Partial<NoteInput>): Promise<Note> {
    return api.put<Note>(`/api/notes/${id}`, changes);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/api/notes/${id}`);
  },
};

function filterNotes(notes: Note[], tab: 'all' | 'favorites' | 'archived'): Note[] {
  return notes.filter(n => {
    if (tab === 'favorites') return n.is_favorite && !n.is_archived;
    if (tab === 'archived') return n.is_archived;
    return !n.is_archived;
  });
}
