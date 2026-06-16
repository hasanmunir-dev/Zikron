'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Star, Trash2, Archive, Pencil, Link as LinkIcon, FileText, Tag, ExternalLink } from 'lucide-react';
import { MarkdownEditor } from '@/components/editor/markdown-editor';
import { MarkdownViewer } from '@/components/editor/markdown-viewer';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { formatRelativeTime } from '@/utils/date';
import type { InboxItem } from '@/types';

interface Props {
  mode: 'create' | 'edit' | 'detail';
  item: Partial<InboxItem> | null;
  onSave?: (data: Pick<InboxItem, 'title' | 'content' | 'url' | 'type' | 'tags' | 'category_id'>) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string, isFav: boolean) => void;
  onArchive?: (id: string) => void;
  onClose: () => void;
  editUrl?: string;
}

export function InboxEditor({ mode, item, onSave, onDelete, onToggleFavorite, onArchive, onClose, editUrl }: Props) {
  const [type, setType] = useState<'text' | 'link'>(item?.type ?? 'text');
  const [title, setTitle] = useState(item?.title ?? '');
  const [content, setContent] = useState(item?.content ?? '');
  const [url, setUrl] = useState(item?.url ?? '');
  const [tags, setTags] = useState(item?.tags?.join(', ') ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setType(item?.type ?? 'text');
    setTitle(item?.title ?? '');
    setContent(item?.content ?? '');
    setUrl(item?.url ?? '');
    setTags(item?.tags?.join(', ') ?? '');
  }, [item]);

  function handleSave() {
    if (!title.trim() || !onSave) return;
    onSave({
      title: title.trim(),
      content: content.trim() || null,
      url: type === 'link' ? url.trim() || null : null,
      type,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      category_id: item?.category_id ?? null,
    });
    onClose();
  }

  const card = (
    <div className="bg-card flex flex-col shadow-xl border border-border w-full sm:rounded-2xl sm:w-[95vw] sm:max-w-5xl max-h-[90vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
        {mode === 'detail' ? (
          <>
            <div className="flex items-center gap-1">
              {editUrl && (
                <Link
                  href={editUrl}
                  scroll={false}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Edit"
                >
                  <Pencil size={15} />
                </Link>
              )}
              {item?.id && onToggleFavorite && (
                <button
                  type="button"
                  onClick={() => onToggleFavorite(item.id!, item.status === 'favorite')}
                  className={`p-1.5 rounded-lg transition-colors ${item.status === 'favorite' ? 'text-amber-400 bg-amber-50 dark:bg-amber-950/40' : 'text-muted-foreground/40 hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'}`}
                  title={item.status === 'favorite' ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star size={15} className={item.status === 'favorite' ? 'fill-amber-400' : ''} />
                </button>
              )}
              {item?.id && onArchive && (
                <button
                  type="button"
                  onClick={() => { onArchive(item.id!); onClose(); }}
                  className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-muted transition-colors"
                  title={item.status === 'archived' ? 'Unarchive' : 'Archive'}
                >
                  <Archive size={15} />
                </button>
              )}
              {item?.id && onDelete && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>
          </>
        ) : (
          <>
            <span className="text-sm font-semibold text-foreground">{mode === 'create' ? 'Capture' : 'Edit'}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={!title.trim()}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {mode === 'create' ? 'Save' : 'Update'}
              </button>
              <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {mode === 'detail' ? (
          <>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-1">
                {item?.type === 'link'
                  ? <LinkIcon size={15} className="text-blue-500" />
                  : <FileText size={15} className="text-muted-foreground" />}
              </div>
              <h2 className="text-xl font-semibold text-foreground leading-snug flex-1">{item?.title}</h2>
            </div>

            {item?.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-blue-500 hover:underline break-all"
              >
                <ExternalLink size={13} className="shrink-0" />
                {item.url}
              </a>
            )}

            {item?.content ? (
              <MarkdownViewer content={item.content} />
            ) : (
              <p className="text-sm text-muted-foreground italic">No notes added.</p>
            )}

            {(item?.tags?.length || item?.created_at) && (
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border">
                {item.tags?.map(tag => (
                  <span key={tag} className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">#{tag}</span>
                ))}
                {item.created_at && (
                  <span className="text-xs text-muted-foreground/50 ml-auto">{formatRelativeTime(item.created_at)}</span>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Type toggle */}
            <div className="flex bg-muted rounded-lg p-1 gap-1">
              {(['text', 'link'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-colors
                    ${type === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {t === 'text' ? <FileText size={14} /> : <LinkIcon size={14} />}
                  {t === 'text' ? 'Text' : 'Link'}
                </button>
              ))}
            </div>

            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title *"
              className="w-full text-xl font-semibold text-foreground placeholder:text-muted-foreground/40 border-none outline-none bg-transparent"
            />

            {type === 'link' && (
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}

            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="Notes or description (Markdown supported)..."
              minHeight="300px"
            />
          </>
        )}
      </div>

      {/* Tags footer — create/edit only */}
      {mode !== 'detail' && (
        <div className="border-t border-border px-5 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <Tag size={14} className="text-muted-foreground/40 shrink-0" />
            <input
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="Tags: study, important, work  (comma separated)"
              className="flex-1 text-sm text-foreground placeholder:text-muted-foreground/40 border-none outline-none bg-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );

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
      {item?.id && onDelete && (
        <DeleteConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title="Delete Inbox Item?"
          description="This action cannot be undone."
          itemName={item.title}
          onConfirm={() => { setConfirmDelete(false); onDelete(item.id!); onClose(); }}
        />
      )}
    </>
  );
}
