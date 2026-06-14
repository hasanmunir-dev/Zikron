'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getCachedItem } from '@/lib/page-state';
import { NoteViewer } from '@/components/features/notes/NoteViewer';
import type { AdminNote } from '@/types';

export default function AdminNoteViewModalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // The system notes list caches the row before navigating — instant open.
  const [note, setNote] = useState<AdminNote | null>(() => getCachedItem<AdminNote>(id));
  const [ready, setReady] = useState(() => getCachedItem<AdminNote>(id) !== null);

  useEffect(() => {
    if (ready) return;
    api.get<AdminNote>(`/api/admin/notes/${id}`)
      .then(data => { setNote(data); setReady(true); })
      .catch(() => { router.replace('/admin/notes'); });
  }, [id, ready, router]);

  if (!ready) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-card w-full sm:rounded-2xl sm:max-w-xl h-80 animate-pulse" />
      </div>
    );
  }

  if (!note) return null;

  return <NoteViewer note={note} onClose={() => router.back()} />;
}
