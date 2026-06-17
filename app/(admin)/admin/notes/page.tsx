'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BookOpen, Clock, Search, X, Trash2 } from 'lucide-react';
import { useAdminNotes, useAdminDeleteNote } from '@/hooks/queries/use-admin';
import { cacheItem } from '@/lib/page-state';
import { parseDialogState, closeDialogUrl } from '@/lib/dialog-url';
import { formatRelativeTime } from '@/utils/date';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { AdminNoteDialog } from '@/components/features/notes/AdminNoteDialog';
import type { AdminNote } from '@/types';

const BASE = '/admin/notes';

export default function AdminNotesPage() {
  const searchParams = useSearchParams();
  const { data: notes = [], isLoading } = useAdminNotes();
  const deleteNote = useAdminDeleteNote();
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<AdminNote | null>(null);

  const dialog = parseDialogState(searchParams);
  const closeUrl = closeDialogUrl(BASE, searchParams);

  const filtered = search
    ? notes.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content?.toLowerCase().includes(search.toLowerCase()) ||
        (n.owner?.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (n.owner?.full_name ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : notes;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Notes</h2>
          <p className="text-sm text-muted-foreground mt-0.5">All notes across all users.</p>
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} note{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, content, or user..."
          className="w-full pl-9 pr-8 py-2 text-sm border border-border rounded-lg bg-muted text-foreground placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {search && (
          <button type="button" aria-label="Clear search" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpen size={28} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{search ? 'No notes match your search.' : 'No notes found.'}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Owner</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Tags</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Created</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(note => (
                <tr key={note.id} className="relative hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
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
                    <p className="relative z-10 text-foreground text-xs truncate">{note.owner?.full_name ?? '—'}</p>
                    <p className="relative z-10 text-muted-foreground text-xs truncate">{note.owner?.email}</p>
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
                  <td className="px-4 py-3">
                    <div className="relative z-10 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={e => { e.preventDefault(); e.stopPropagation(); setPendingDelete(note); }}
                        className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 text-muted-foreground hover:text-red-500 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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

      <DeleteConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={open => { if (!open) setPendingDelete(null); }}
        title="Delete Note?"
        description="This action cannot be undone."
        itemName={pendingDelete?.title}
        onConfirm={() => {
          if (pendingDelete) deleteNote.mutate(pendingDelete.id, { onSettled: () => setPendingDelete(null) });
        }}
        isLoading={deleteNote.isPending}
      />
    </div>
  );
}
