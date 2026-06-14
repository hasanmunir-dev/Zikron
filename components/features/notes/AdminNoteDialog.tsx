'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getCachedItem } from '@/lib/page-state';
import { NoteViewer } from './NoteViewer';
import type { AdminNote } from '@/types';

interface Props {
  id: string;
  closeUrl: string;
}

/**
 * Read-only admin note overlay driven by ?detail=id in the URL.
 * Initializes synchronously from the in-memory cache; falls back to API.
 * NoteViewer provides its own modal overlay.
 */
export function AdminNoteDialog({ id, closeUrl }: Props) {
  const router = useRouter();

  const [note, setNote] = useState<AdminNote | null>(() => getCachedItem<AdminNote>(id));
  const [ready, setReady] = useState(() => getCachedItem<AdminNote>(id) !== null);

  useEffect(() => {
    if (ready) return;
    api
      .get<AdminNote>(`/api/admin/notes/${id}`)
      .then(data => { setNote(data); setReady(true); })
      .catch(() => router.replace(closeUrl));
  }, [id, closeUrl, ready, router]);

  if (!ready || !note) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-card w-full sm:rounded-2xl sm:max-w-xl h-80 animate-pulse" />
      </div>
    );
  }

  return <NoteViewer note={note} onClose={() => router.replace(closeUrl)} />;
}
