'use client';

import { useRouter } from 'next/navigation';
import { useNote, useCreateNote, useUpdateNote, useDeleteNote } from '@/hooks/queries/use-notes';
import { useTemplate } from '@/hooks/queries/use-templates';
import { resolveTemplateVariables } from '@/utils/template-variables';
import { useAuth } from '@/hooks/useAuth';
import { NoteEditor } from './NoteEditor';
import type { Note } from '@/types';

interface Props {
  mode: 'create' | 'edit';
  id?: string;
  closeUrl: string;
  defaultTab?: 'write' | 'preview';
  templateId?: string;
}

export function NoteDialog({ mode, id, closeUrl, defaultTab = 'write', templateId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const { data: note, isLoading } = useNote(mode === 'edit' ? id : undefined);
  const { data: template } = useTemplate(mode === 'create' ? templateId : undefined);

  function handleSave(data: Partial<Note>) {
    if (mode === 'create') {
      if (!user) return;
      createNote.mutate({
        title: data.title!,
        content: data.content ?? null,
        category_id: null,
        tags: data.tags ?? [],
        is_favorite: data.is_favorite ?? false,
        is_archived: false,
      });
    } else if (id) {
      updateNote.mutate({ id, data });
    }
  }

  function handleDelete(noteId: string) {
    deleteNote.mutate(noteId);
    router.replace(closeUrl);
  }

  function handleClose() {
    router.replace(closeUrl);
  }

  if (mode === 'edit' && isLoading && !note) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-card w-full sm:rounded-2xl sm:max-w-xl h-80 animate-pulse" />
      </div>
    );
  }

  if (mode === 'edit' && !note && !isLoading) {
    router.replace(closeUrl);
    return null;
  }

  // Wait for template to load before rendering the form so useState initializes correctly
  if (mode === 'create' && templateId && !template) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-card w-full sm:rounded-2xl sm:max-w-xl h-80 animate-pulse" />
      </div>
    );
  }

  // Build initial note data from template when creating
  let initialNote: Partial<Note> | null = null;
  if (mode === 'create' && template) {
    const resolved = resolveTemplateVariables(template, { userName: user?.email ?? undefined });
    initialNote = {
      title: resolved.title_template ?? '',
      content: resolved.content_template ?? '',
    };
  }

  return (
    <NoteEditor
      note={mode === 'create' ? initialNote : note ?? null}
      onSave={handleSave}
      onDelete={mode === 'edit' ? handleDelete : undefined}
      onClose={handleClose}
      defaultTab={defaultTab}
    />
  );
}
