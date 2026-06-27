import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { notesService } from '@/lib/services/notes';
import type { Note } from '@/types';

type NoteInput = Pick<Note, 'title' | 'content' | 'tags' | 'is_favorite' | 'is_archived' | 'category_id'>;
type Tab = 'all' | 'favorites' | 'archived';

export const noteKeys = {
  all: () => ['notes'] as const,
  detail: (id: string) => ['note', id] as const,
};

function filterNotes(notes: Note[], tab: Tab): Note[] {
  return notes.filter(n => {
    if (tab === 'favorites') return n.is_favorite && !n.is_archived;
    if (tab === 'archived') return n.is_archived;
    return !n.is_archived;
  });
}

export function useNotes(tab: Tab = 'all') {
  return useQuery({
    queryKey: noteKeys.all(),
    queryFn: () => api.get<Note[]>('/api/notes'),
    select: (data) => filterNotes(data, tab),
    placeholderData: keepPreviousData,
  });
}

export function useNote(id: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: noteKeys.detail(id!),
    queryFn: () => notesService.get(id!),
    enabled: !!id,
    initialData: () => {
      const notes = queryClient.getQueryData<Note[]>(noteKeys.all());
      return notes?.find(n => n.id === id);
    },
    initialDataUpdatedAt: () => queryClient.getQueryState(noteKeys.all())?.dataUpdatedAt,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NoteInput) => notesService.create(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: noteKeys.all() });
      const prev = queryClient.getQueryData<Note[]>(noteKeys.all());
      const tempNote: Note = {
        id: `temp-${Date.now()}`,
        user_id: '',
        title: input.title,
        content: input.content ?? null,
        tags: input.tags ?? [],
        is_favorite: input.is_favorite ?? false,
        is_archived: false,
        category_id: input.category_id ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      queryClient.setQueryData<Note[]>(noteKeys.all(), old => [tempNote, ...(old ?? [])]);
      return { prev };
    },
    onError: (_err, _input, context) => {
      if (context?.prev) queryClient.setQueryData(noteKeys.all(), context.prev);
      toast.error('Failed to create note');
    },
    onSuccess: () => {
      toast.success('Note created');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all() });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NoteInput> }) =>
      notesService.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: noteKeys.all() });
      await queryClient.cancelQueries({ queryKey: noteKeys.detail(id) });
      const prevNotes = queryClient.getQueryData<Note[]>(noteKeys.all());
      const prevNote = queryClient.getQueryData<Note>(noteKeys.detail(id));
      const now = new Date().toISOString();
      queryClient.setQueryData<Note[]>(noteKeys.all(), old =>
        (old ?? []).map(n => n.id === id ? { ...n, ...data, updated_at: now } : n),
      );
      queryClient.setQueryData<Note | undefined>(noteKeys.detail(id), old =>
        old ? { ...old, ...data, updated_at: now } : old,
      );
      return { prevNotes, prevNote };
    },
    onError: (_err, { id }, context) => {
      if (context?.prevNotes) queryClient.setQueryData(noteKeys.all(), context.prevNotes);
      if (context?.prevNote) queryClient.setQueryData(noteKeys.detail(id), context.prevNote);
      toast.error('Failed to update note');
    },
    onSuccess: () => {
      toast.success('Note saved');
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all() });
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(id) });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notesService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: noteKeys.all() });
      const prev = queryClient.getQueryData<Note[]>(noteKeys.all());
      queryClient.setQueryData<Note[]>(noteKeys.all(), old => (old ?? []).filter(n => n.id !== id));
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(noteKeys.all(), context.prev);
      toast.error('Failed to delete note');
    },
    onSuccess: () => {
      toast.success('Note deleted');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all() });
    },
  });
}

// ─── Bulk operations ──────────────────────────────────────────────────────────

export function useBulkUpdateNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, updates }: { ids: string[]; updates: Record<string, unknown> }) =>
      api.patch<{ affected: number }>('/api/notes/bulk', { ids, updates }),
    onMutate: async ({ ids, updates }) => {
      await queryClient.cancelQueries({ queryKey: noteKeys.all() });
      const prev = queryClient.getQueryData<Note[]>(noteKeys.all());
      queryClient.setQueryData<Note[]>(noteKeys.all(), old =>
        (old ?? []).map(n => ids.includes(n.id) ? { ...n, ...updates } as Note : n),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(noteKeys.all(), ctx.prev);
      toast.error('Bulk update failed');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: noteKeys.all() }),
  });
}

export function useBulkDeleteNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      api.deleteWithBody<{ affected: number }>('/api/notes/bulk', { ids }),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: noteKeys.all() });
      const prev = queryClient.getQueryData<Note[]>(noteKeys.all());
      queryClient.setQueryData<Note[]>(noteKeys.all(), old => (old ?? []).filter(n => !ids.includes(n.id)));
      return { prev };
    },
    onError: (_err, _ids, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(noteKeys.all(), ctx.prev);
      toast.error('Failed to delete notes');
    },
    onSuccess: (data) => toast.success(`Deleted ${data.affected} note${data.affected !== 1 ? 's' : ''}`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: noteKeys.all() }),
  });
}
