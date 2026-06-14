'use client';

import { useRouter } from 'next/navigation';
import { notesService } from '@/lib/services/notes';
import { NoteEditor } from '@/components/features/notes/NoteEditor';
import type { Note } from '@/types';

export default function NewNoteModalPage() {
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
    router.push('/app/notes');
  }

  return (
    <NoteEditor
      note={null}
      onSave={handleSave}
      onClose={() => router.back()}
    />
  );
}
