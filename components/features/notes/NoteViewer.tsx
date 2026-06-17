'use client';

import { X, Star } from 'lucide-react';
import { MarkdownViewer } from '@/components/editor/markdown-viewer';
import type { AdminNote } from '@/types';

interface Props {
  note: AdminNote;
  onClose: () => void;
  /** Render as an inline full-page form instead of a fixed modal overlay. */
  fullPage?: boolean;
}

/**
 * Read-only note viewer for admin system views.
 * Displays note content without edit or delete capabilities.
 */
export function NoteViewer({ note, onClose, fullPage = false }: Props) {
  const author = note.owner?.full_name ?? note.owner?.email ?? 'Unknown user';

  const card = (
    <div className={`bg-card flex flex-col shadow-xl border border-border ${
      fullPage ? 'w-full max-w-xl rounded-2xl' : 'w-full sm:rounded-2xl sm:max-w-xl max-h-[90vh]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          {note.is_favorite && <Star size={14} className="text-amber-400 fill-amber-400 shrink-0" />}
          <span className="text-xs text-muted-foreground truncate max-w-48">by {author}</span>
          {note.is_archived && (
            <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">Archived</span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="p-1.5 text-muted-foreground hover:text-foreground"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        <h2 className="text-xl font-semibold text-foreground">{note.title}</h2>
        {note.content && (
          <MarkdownViewer content={note.content} />
        )}
      </div>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="border-t border-border px-5 py-3 flex flex-wrap gap-1.5">
          {note.tags.map(t => (
            <span key={t} className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">#{t}</span>
          ))}
        </div>
      )}
    </div>
  );

  if (fullPage) {
    return <div className="p-6 flex justify-center">{card}</div>;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()}>{card}</div>
    </div>
  );
}
