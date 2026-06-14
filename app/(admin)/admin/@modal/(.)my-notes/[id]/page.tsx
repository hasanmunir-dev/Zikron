'use client';

import { use } from 'react';
import { NoteModalContent } from '@/components/features/notes/NoteModalContent';

export default function AdminMyNoteModalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <NoteModalContent id={id} listRoute="/admin/my-notes" />;
}
