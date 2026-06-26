'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, Lock, User, Clock, Eye, FileText, Inbox, Table2, FolderOpen, Bell, ExternalLink } from 'lucide-react';
import { useSharedWithMeItem, useVerifySharedWithMePassword } from '@/hooks/queries/use-shared-links';
import { MarkdownViewer } from '@/components/editor/markdown-viewer';
import { formatRelativeTime } from '@/utils/date';
import type { SharedWithMeItem, SharedWithMeResponse, ItemType } from '@/types';

// ─── Module URL helper ────────────────────────────────────────────────────────

const MODULE_BASE: Record<ItemType, string> = {
  note: '/app/notes',
  inbox: '/app/inbox',
  list: '/app/lists',
  collection: '/app/collections',
  reminder: '/app/reminders',
};

interface NoteContentData {
  content?: string;
  tags?: string[];
}

interface InboxContentData {
  content?: string;
  url?: string;
}

interface CollectionContentData {
  description?: string;
}

interface ReminderContentData {
  description?: string;
  due_at?: string;
}

// ─── Item type icons ──────────────────────────────────────────────────────────

const ITEM_ICONS: Record<ItemType, React.ElementType> = {
  note: FileText,
  inbox: Inbox,
  list: Table2,
  collection: FolderOpen,
  reminder: Bell,
};

const ITEM_LABELS: Record<ItemType, string> = {
  note: 'Note',
  inbox: 'Inbox item',
  list: 'List',
  collection: 'Collection',
  reminder: 'Reminder',
};

// ─── Content renderers ────────────────────────────────────────────────────────

function NoteContent({ content }: { content: NoteContentData }) {
  
  return (
    <div className="space-y-3">
      {content.tags && Array.isArray(content.tags) && content.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {(content.tags as string[]).map(tag => (
            <span key={tag} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      )}
      {content.content ? (
        <MarkdownViewer content={content.content as string} />
      ) : (
        <p className="text-sm text-muted-foreground italic">No content.</p>
      )}
    </div>
  );
}

function InboxContent({ content }: { content: InboxContentData }) {
  return (
    <div className="space-y-3">
      {content.url && (
        <a
          href={content.url as string}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline break-all"
        >
          {content.url as string}
        </a>
      )}
      {content.content ? (
        <MarkdownViewer content={content.content as string} />
      ) : (
        <p className="text-sm text-muted-foreground italic">No content.</p>
      )}
    </div>
  );
}

function ListContent({ content }: { content: Record<string, unknown> }) {
  type Column = { id: string; name: string; sort_order: number };
  type Row = { id: string; sort_order: number };
  type Cell = { row_id: string; column_id: string; value: string };

  const columns = (content.columns as Column[]) ?? [];
  const rows = (content.rows as Row[]) ?? [];
  const cells = (content.cells as Cell[]) ?? [];

  if (!columns.length) return <p className="text-sm text-muted-foreground italic">Empty list.</p>;

  const cellMap = new Map(cells.map(c => [`${c.row_id}:${c.column_id}`, c.value]));

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            {columns.map(col => (
              <th key={col.id} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
                {col.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/20">
              {columns.map(col => (
                <td key={col.id} className="px-3 py-2 text-xs text-foreground">
                  {cellMap.get(`${row.id}:${col.id}`) ?? ''}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-4 text-center text-xs text-muted-foreground">No rows.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function CollectionContent({ content }: { content: CollectionContentData }) {
  return (
    <div className="space-y-2">
      {content.description && (
        <MarkdownViewer content={content.description as string} />
      )}
      {!content.description && (
        <p className="text-sm text-muted-foreground italic">No description.</p>
      )}
    </div>
  );
}

function ReminderContent({ content }: { content: ReminderContentData }) {
  return (
    <div className="space-y-3">
      {content.due_at && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock size={14} />
          Due: {new Date(content.due_at as string).toLocaleString()}
        </div>
      )}
      {content.description && (
        <MarkdownViewer content={content.description as string} />
      )}
    </div>
  );
}

function SharedContentView({ itemType, content }: { itemType: ItemType; content: Record<string, unknown> }) {
  switch (itemType) {
    case 'note':       return <NoteContent content={content} />;
    case 'inbox':      return <InboxContent content={content} />;
    case 'list':       return <ListContent content={content} />;
    case 'collection': return <CollectionContent content={content} />;
    case 'reminder':   return <ReminderContent content={content} />;
    default:           return null;
  }
}

// ─── Password gate ─────────────────────────────────────────────────────────────

function PasswordGate({ shareId, onSuccess }: { shareId: string; onSuccess: (data: SharedWithMeResponse) => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const verify = useVerifySharedWithMePassword();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const result = await verify.mutateAsync({ shareId, password });
      if (result.status === 'ok') {
        onSuccess(result);
      } else {
        setError('Incorrect password. Please try again.');
      }
    } catch {
      setError('Incorrect password. Please try again.');
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/30 rounded-full flex items-center justify-center mb-4">
        <Lock size={20} className="text-amber-600" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">Password required</h3>
      <p className="text-sm text-muted-foreground mb-5 text-center">
        This shared item is password protected. Enter the password to view it.
      </p>
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter password"
          autoFocus
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={!password || verify.isPending}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {verify.isPending ? 'Verifying…' : 'Unlock'}
        </button>
      </form>
    </div>
  );
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

interface Props {
  item: SharedWithMeItem;
  onClose: () => void;
}

export function SharedItemDetailDialog({ item, onClose }: Props) {
  const ItemIcon = ITEM_ICONS[item.item_type];
  const ownerLabel = item.owner?.full_name ?? item.owner?.email ?? 'Unknown';
  const openInModuleUrl = `${MODULE_BASE[item.item_type]}?shared_view=${item.share_id}`;

  // Local content state — overwritten after successful password verify
  const [verifiedContent, setVerifiedContent] = useState<SharedWithMeResponse | null>(null);

  // Auto-fetch content for non-password-protected items
  const { data: fetchedContent, isLoading } = useSharedWithMeItem(
    item.requires_password ? undefined : item.share_id,
  );

  const resolvedContent = verifiedContent ?? fetchedContent ?? null;

  function renderBody() {
    if (item.requires_password && !verifiedContent) {
      return (
        <PasswordGate
          shareId={item.share_id}
          onSuccess={data => setVerifiedContent(data)}
        />
      );
    }
    if (isLoading) {
      return (
        <div className="space-y-3 p-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-5 bg-muted rounded-lg animate-pulse" />)}
        </div>
      );
    }
    if (!resolvedContent) return null;
    if (resolvedContent.status !== 'ok') {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center px-6">
          <p className="text-sm font-medium text-muted-foreground capitalize">{resolvedContent.status.replace(/_/g, ' ')}</p>
        </div>
      );
    }
    return (
      <div className="p-6">
        <SharedContentView
          itemType={resolvedContent.item_type}
          content={resolvedContent.content as Record<string, unknown>}
        />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <ItemIcon size={15} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                {resolvedContent?.status === 'ok' && resolvedContent.viewer_role === 'owner' ? (
                  <span className="text-xs font-medium text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-full">
                    Owner Preview
                  </span>
                ) : (
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded-full">
                    Shared
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                  {ITEM_LABELS[item.item_type]}
                </span>
                {resolvedContent?.status !== 'ok' || resolvedContent.viewer_role !== 'owner' ? (
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                    View only
                  </span>
                ) : null}
              </div>
              <h2 className="text-sm font-semibold text-foreground">{item.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={openInModuleUrl}
              scroll={false}
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              <ExternalLink size={12} />
              Open {ITEM_LABELS[item.item_type]}
            </Link>
            <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Owner / meta strip */}
        <div className="px-5 py-2.5 border-b border-border bg-muted/20 shrink-0 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User size={12} />
            By {ownerLabel}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock size={12} />
            Shared {formatRelativeTime(item.shared_at)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Eye size={12} />
            Permission: Viewer
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {renderBody()}
        </div>
      </div>
    </div>
  );
}
