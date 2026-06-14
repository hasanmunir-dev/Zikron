'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notesService } from '@/lib/services/notes';
import { getCachedItem } from '@/lib/page-state';
import { useAuth } from '@/hooks/useAuth';
import { NoteEditor } from './NoteEditor';
import type { Note } from '@/types';

interface Props {
  mode: 'create' | 'edit';
  id?: string;
  closeUrl: string;
  defaultTab?: 'write' | 'preview';
}

export function NoteDialog({ mode, id, closeUrl, defaultTab = 'write' }: Props) {
  const router = useRouter();
  const { user } = useAuth();

  const [note, setNote] = useState<Partial<Note> | null>(
    () => (mode === 'edit' && id ? getCachedItem<Note>(id) : null),
  );
  const [ready, setReady] = useState(
    () => mode === 'create' || (mode === 'edit' && id ? getCachedItem<Note>(id) !== null : false),
  );

  useEffect(() => {
    if (mode === 'create' || !id) {
      setReady(true);
      return;
    }
    notesService.get(id).then(data => {
      if (data) setNote(data);
      setReady(true);
    });
  }, [id, mode]);

  async function handleSave(data: Partial<Note>) {
    if (mode === 'create') {
      if (!user) return;
      await notesService.create({
        title: data.title!,
        content: data.content ?? null,
        category_id: null,
        tags: data.tags ?? [],
        is_favorite: data.is_favorite ?? false,
        is_archived: false,
      });
    } else if (id) {
      await notesService.update(id, data);
    }
  }

  async function handleDelete(noteId: string) {
    await notesService.delete(noteId);
    router.replace(closeUrl);
  }

  function handleClose() {
    router.replace(closeUrl);
  }

  if (!ready) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-card w-full sm:rounded-2xl sm:max-w-xl h-80 animate-pulse" />
      </div>
    );
  }

  if (mode === 'edit' && !note) {
    router.replace(closeUrl);
    return null;
  }

  return (
    <NoteEditor
      note={mode === 'create' ? null : note}
      onSave={handleSave}
      onDelete={mode === 'edit' ? handleDelete : undefined}
      onClose={handleClose}
      defaultTab={defaultTab}
    />
  );
}
