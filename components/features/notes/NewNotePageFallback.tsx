'use client';

import { useRouter } from 'next/navigation';
import { notesService } from '@/lib/services/notes';
import { NoteEditor } from './NoteEditor';
import type { Note } from '@/types';

interface Props {
  listRoute: string;
}

export function NewNotePageFallback({ listRoute }: Props) {
  const router = useRouter();

  async function handleSave(data: Partial<Note>) {
    await notesService.create({
      title: data.title!,
      content: data.content ?? null,
      category_id: null,
      tags: data.tags ?? [],
      is_favorite: data.is_favorite ?? false,
      is_archived: false,
    });
    router.push(listRoute);
  }

  return (
    <NoteEditor
      note={null}
      onSave={handleSave}
      onClose={() => router.push(listRoute)}
      fullPage
    />
  );
}
