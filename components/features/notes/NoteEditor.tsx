'use client';

import { useState, useEffect } from 'react';
import { X, Star, Trash2 } from 'lucide-react';
import { MarkdownEditor } from '@/components/editor/markdown-editor';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { ItemLinksSection } from '@/components/features/links/ItemLinksSection';
import { VersionHistoryPanel } from '@/components/features/history/VersionHistoryPanel';
import { TagsSection } from '@/components/features/tags/TagsSection';
import { useWikiLinkMap } from '@/hooks/use-wiki-link-map';
import type { Note } from '@/types';

interface Props {
  note: Partial<Note> | null;
  onSave: (data: Partial<Note>) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  /** Render as an inline page form instead of a fixed modal overlay. */
  fullPage?: boolean;
  /** Which editor tab opens by default. Defaults to 'write'. */
  defaultTab?: 'write' | 'preview';
}

export function NoteEditor({ note, onSave, onDelete, onClose, fullPage = false, defaultTab = 'write' }: Props) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [isFavorite, setIsFavorite] = useState(note?.is_favorite ?? false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const wikiLinks = useWikiLinkMap();

  useEffect(() => {
    setTitle(note?.title ?? '');
    setContent(note?.content ?? '');
    setIsFavorite(note?.is_favorite ?? false);
  }, [note]);

  function handleSave() {
    if (!title.trim()) return;
    onSave({
      ...note,
      title: title.trim(),
      content: content.trim() || null,
      is_favorite: isFavorite,
    });
    onClose();
  }

  const card = (
    <div className={`bg-card flex flex-col shadow-xl border border-border ${
      fullPage
        ? 'w-full max-w-5xl rounded-2xl'
        : 'w-full sm:rounded-2xl sm:w-[95vw] sm:max-w-5xl max-h-[90vh]'
    }`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFavorite(v => !v)}
            className={`p-1.5 rounded-lg transition-colors ${isFavorite ? 'text-amber-400 bg-amber-50 dark:bg-amber-950/40' : 'text-muted-foreground/40 hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'}`}
            title="Favorite"
          >
            <Star size={16} className={isFavorite ? 'fill-amber-400' : ''} />
          </button>
          {note?.id && onDelete && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {note?.id ? 'Save' : 'Create'}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Note title..."
          className="w-full text-xl font-semibold text-foreground placeholder:text-muted-foreground/40 border-none outline-none bg-transparent"
        />
        <MarkdownEditor
          value={content}
          onChange={setContent}
          placeholder="Write your note in Markdown..."
          minHeight="400px"
          defaultTab={defaultTab}
          wikiLinks={wikiLinks}
        />

        {/* Knowledge links — only shown for existing notes */}
        {note?.id && (
          <ItemLinksSection itemType="note" itemId={note.id} />
        )}
        {note?.id && (
          <div className="px-1">
            <VersionHistoryPanel
              itemType="note"
              itemId={note.id}
              currentTitle={title}
              currentContent={content}
            />
          </div>
        )}
      </div>

      {/* Tags */}
      {note?.id && (
        <div className="border-t border-border px-5 py-3">
          <TagsSection itemType="note" itemId={note.id} className="" />
        </div>
      )}
    </div>
  );

  const deleteDialog = note?.id && onDelete ? (
    <DeleteConfirmDialog
      open={confirmDelete}
      onOpenChange={setConfirmDelete}
      title="Delete Note?"
      description="This action cannot be undone."
      itemName={note.title}
      onConfirm={() => { setConfirmDelete(false); onDelete(note.id!); onClose(); }}
    />
  ) : null;

  if (fullPage) {
    return (
      <>
        <div className="p-6 flex justify-center">
          {card}
        </div>
        {deleteDialog}
      </>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <div onClick={e => e.stopPropagation()}>
          {card}
        </div>
      </div>
      {deleteDialog}
    </>
  );
}
