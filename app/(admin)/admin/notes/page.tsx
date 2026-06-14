'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BookOpen, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { cacheItem } from '@/lib/page-state';
import { parseDialogState, closeDialogUrl } from '@/lib/dialog-url';
import { formatRelativeTime } from '@/utils/date';
import { AdminNoteDialog } from '@/components/features/notes/AdminNoteDialog';
import type { AdminNote } from '@/types';

const BASE = '/admin/notes';

export default function AdminNotesPage() {
  const searchParams = useSearchParams();
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [loading, setLoading] = useState(true);

  const dialog = parseDialogState(searchParams);
  const closeUrl = closeDialogUrl(BASE, searchParams);

  useEffect(() => {
    api.get<AdminNote[]>('/api/admin/notes')
      .then(setNotes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Notes</h2>
        <p className="text-sm text-muted-foreground mt-0.5">All notes across all users (most recent 100).</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : notes.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpen size={28} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No notes found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Tags</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {notes.map(note => (
                // Stretched-link: Link covers the row, cells use relative z-10 so
                // tag spans are still selectable without blocking the row link.
                <tr key={note.id} className="relative hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    {/* Row link — covers the entire row via position:fixed simulation */}
                    <Link
                      href={`${BASE}?detail=${note.id}`}
                      scroll={false}
                      onClick={() => cacheItem(note)}
                      className="absolute inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                      aria-label={`View note: ${note.title}`}
                    />
                    <p className="relative z-10 text-foreground font-medium truncate max-w-xs">{note.title}</p>
                    {note.content && (
                      <p className="relative z-10 text-xs text-muted-foreground truncate max-w-xs mt-0.5">{note.content}</p>
                    )}
                    <div className="relative z-10 flex gap-1 mt-1">
                      {note.is_favorite && <span className="text-xs bg-amber-100 dark:bg-amber-950/50 text-amber-600 px-1.5 py-0.5 rounded">Fav</span>}
                      {note.is_archived && <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">Archived</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="relative z-10 text-foreground text-xs truncate">{note.profiles?.full_name ?? '—'}</p>
                    <p className="relative z-10 text-muted-foreground text-xs truncate">{note.profiles?.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="relative z-10 flex flex-wrap gap-1">
                      {note.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">#{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="relative z-10 text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={11} />
                      {formatRelativeTime(note.created_at)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {dialog?.action === 'detail' && dialog.id && (
        <AdminNoteDialog id={dialog.id} closeUrl={closeUrl} />
      )}
    </div>
  );
}
