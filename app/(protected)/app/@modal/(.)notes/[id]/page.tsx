'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notesService } from '@/lib/services/notes';
import { getCachedItem } from '@/lib/page-state';
import { NoteEditor } from '@/components/features/notes/NoteEditor';
import type { Note } from '@/types';

export default function NoteModalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [note, setNote] = useState<Partial<Note> | null>(() => getCachedItem<Note>(id));
  const [ready, setReady] = useState(() => getCachedItem<Note>(id) !== null);

  useEffect(() => {
    notesService.get(id).then(data => {
      if (data) setNote(data);
      setReady(true);
    });
  }, [id]);

  function handleClose() {
    router.back();
  }

  async function handleSave(data: Partial<Note>) {
    if (data.id) {
      await notesService.update(data.id, data);
    }
  }

  async function handleDelete(noteId: string) {
    await notesService.delete(noteId);
    router.back();
  }

  if (!ready) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-card w-full sm:rounded-2xl sm:max-w-xl h-80 animate-pulse" />
      </div>
    );
  }

  if (!note) {
    router.replace('/app/notes');
    return null;
  }

  return (
    <NoteEditor
      note={note}
      onSave={handleSave}
      onDelete={handleDelete}
      onClose={handleClose}
    />
  );
}
