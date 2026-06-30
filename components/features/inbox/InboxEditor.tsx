'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Star, Trash2, Archive, Pencil, Link as LinkIcon, FileText, ExternalLink } from 'lucide-react';
import { MarkdownEditor } from '@/components/editor/markdown-editor';
import { MarkdownViewer } from '@/components/editor/markdown-viewer';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { ItemLinksSection } from '@/components/features/links/ItemLinksSection';
import { VersionHistoryPanel } from '@/components/features/history/VersionHistoryPanel';
import { TagsSection } from '@/components/features/tags/TagsSection';
import { useWikiLinkMap } from '@/hooks/use-wiki-link-map';
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
  const [confirmDelete, setConfirmDelete] = useState(false);

  const wikiLinks = useWikiLinkMap();

  useEffect(() => {
    setType(item?.type ?? 'text');
    setTitle(item?.title ?? '');
    setContent(item?.content ?? '');
    setUrl(item?.url ?? '');
  }, [item]);

  function handleSave() {
    if (!title.trim() || !onSave) return;
    onSave({
      title: title.trim(),
      content: content.trim() || null,
      url: type === 'link' ? url.trim() || null : null,
      type,
      tags: [],
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
                className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
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
              <MarkdownViewer content={item.content} wikiLinks={wikiLinks} />
            ) : (
              <p className="text-sm text-muted-foreground italic">No notes added.</p>
            )}

            {item?.created_at && (
              <p className="text-xs text-muted-foreground/50">{formatRelativeTime(item.created_at)}</p>
            )}

            {item?.id && (
              <ItemLinksSection itemType="inbox" itemId={item.id} />
            )}
            {item?.id && (
              <VersionHistoryPanel
                itemType="inbox"
                itemId={item.id}
                currentTitle={item.title ?? null}
                currentContent={item.content ?? null}
              />
            )}
            {item?.id && (
              <TagsSection itemType="inbox" itemId={item.id} />
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
              wikiLinks={wikiLinks}
            />
            {item?.id && (
              <TagsSection itemType="inbox" itemId={item.id} />
            )}
          </>
        )}
      </div>

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
