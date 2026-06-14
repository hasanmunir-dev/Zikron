'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notesService } from '@/lib/services/notes';
import { NoteEditor } from './NoteEditor';
import type { Note } from '@/types';

interface Props {
  id: string;
  listRoute: string;
}

export function NotePageFallback({ id, listRoute }: Props) {
  const router = useRouter();
  const [note, setNote] = useState<Note | undefined>(undefined);

  useEffect(() => {
    notesService.get(id).then(found => {
      if (found) setNote(found);
      else router.replace(listRoute);
    });
  }, [id, listRoute, router]);

  async function handleSave(data: Partial<Note>) {
    if (data.id) await notesService.update(data.id, data);
    router.push(listRoute);
  }

  async function handleDelete(noteId: string) {
    await notesService.delete(noteId);
    router.push(listRoute);
  }

  if (!note) {
    return (
      <div className="p-6 flex justify-center">
        <div className="w-full max-w-xl rounded-2xl bg-card border border-border h-80 animate-pulse" />
      </div>
    );
  }

  return (
    <NoteEditor
      note={note}
      onSave={handleSave}
      onDelete={handleDelete}
      onClose={() => router.push(listRoute)}
      fullPage
    />
  );
}
