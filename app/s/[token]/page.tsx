'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import {
  Lock, Globe, AlertTriangle, Eye, EyeOff, XCircle,
  Clock, FileText, Link as LinkIcon, ArrowLeft,
  Inbox, Table2, FolderOpen, Bell, ExternalLink,
} from 'lucide-react';
import { MarkdownViewer } from '@/components/editor/markdown-viewer';
import { supabase } from '@/lib/supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// ─── Types ────────────────────────────────────────────────────────────────────

type ShareStatus = 'loading' | 'ok' | 'password_required' | 'login_required' | 'denied' | 'expired' | 'revoked' | 'not_found' | 'password_failed';

interface ShareResponse {
  status: ShareStatus;
  share_type?: string;
  item_type?: string;
  allow_download?: boolean;
  content?: Record<string, unknown>;
  suspicious?: boolean;
  viewer_role?: 'owner' | 'recipient' | 'public';
}

// ─── Item type metadata ───────────────────────────────────────────────────────

type ItemType = 'note' | 'inbox' | 'list' | 'collection' | 'reminder';

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

const MODULE_BASE: Record<ItemType, string> = {
  note: '/app/notes',
  inbox: '/app/inbox',
  list: '/app/lists',
  collection: '/app/collections',
  reminder: '/app/reminders',
};

// ─── Content renderers ────────────────────────────────────────────────────────

function NoteContent({ content }: { content: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">{content.title as string}</h1>
      {content.content ? (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <MarkdownViewer content={content.content as string} />
        </div>
      ) : (
        <p className="text-muted-foreground italic">No content.</p>
      )}
      {Array.isArray(content.tags) && content.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
          {(content.tags as string[]).map(t => (
            <span key={t} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">#{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function InboxContent({ content }: { content: Record<string, unknown> }) {
  const url = typeof content.url === 'string' ? content.url : '';
  const body = typeof content.content === 'string' ? content.content : '';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {content.type === 'link' ? (
          <LinkIcon size={16} className="text-blue-500 shrink-0" />
        ) : (
          <FileText size={16} className="text-muted-foreground shrink-0" />
        )}
        <h1 className="text-2xl font-bold text-foreground">{content.title as string}</h1>
      </div>
      {url && (
        <a href={url as string} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline break-all">
          {url as string}
        </a>
      )}
      {body && (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <MarkdownViewer content={body as string} />
        </div>
      )}
    </div>
  );
}

function ListContent({ content }: { content: Record<string, unknown> }) {
    const desc = typeof content.description === 'string' ? content.description : '';
  const columns = (content.columns as Array<{ id: string; name: string; sort_order: number }>) ?? [];
  const rows = (content.rows as Array<{ id: string; sort_order: number }>) ?? [];
  const cells = (content.cells as Array<{ row_id: string; column_id: string; value: string }>) ?? [];

  function cellValue(rowId: string, colId: string) {
    return cells.find(c => c.row_id === rowId && c.column_id === colId)?.value ?? '';
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">{content.title as string}</h1>
      {desc && (
        <p className="text-sm text-muted-foreground">{desc as string}</p>
      )}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map(col => (
                <th key={col.id} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                {columns.map(col => (
                  <td key={col.id} className="px-3 py-2 text-foreground">
                    {cellValue(row.id, col.id)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">No rows.</p>
        )}
      </div>
    </div>
  );
}

function CollectionContent({ content }: { content: Record<string, unknown> }) {
    const desc = typeof content.description === 'string' ? content.description : '';
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{(content.icon as string) ?? '📁'}</span>
        <h1 className="text-2xl font-bold text-foreground">{content.title as string}</h1>
      </div>
      {desc && (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <MarkdownViewer content={desc as string} />
        </div>
      )}
    </div>
  );
}

function ReminderContent({ content }: { content: Record<string, unknown> }) {
   const dueAt = typeof content.due_at === 'string' ? content.due_at : '';
   const desc = typeof content.description === 'string' ? content.description : '';

  const priorityColors: Record<string, string> = {
    high: 'bg-red-100 dark:bg-red-950/50 text-red-600',
    medium: 'bg-amber-100 dark:bg-amber-950/50 text-amber-600',
    low: 'bg-blue-100 dark:bg-blue-950/50 text-blue-600',
  };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">{content.title as string}</h1>
      <div className="flex flex-wrap gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[content.priority as string] ?? 'bg-muted text-muted-foreground'}`}>
          {content.priority as string} priority
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
          {content.status as string}
        </span>
      </div>
      {dueAt && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock size={13} />
          Due {new Date(dueAt as string).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
        </div>
      )}
      {desc && (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <MarkdownViewer content={desc as string} />
        </div>
      )}
    </div>
  );
}

function ContentRenderer({ itemType, content }: { itemType: string; content: Record<string, unknown> }) {
  switch (itemType) {
    case 'note':       return <NoteContent content={content} />;
    case 'inbox':      return <InboxContent content={content} />;
    case 'list':       return <ListContent content={content} />;
    case 'collection': return <CollectionContent content={content} />;
    case 'reminder':   return <ReminderContent content={content} />;
    default:           return <pre className="text-xs text-muted-foreground">{JSON.stringify(content, null, 2)}</pre>;
  }
}

// ─── Password form ────────────────────────────────────────────────────────────

function PasswordForm({
  token,
  onSuccess,
  onError,
}: {
  token: string;
  onSuccess: (data: ShareResponse) => void;
  onError: (msg: string) => void;
}) {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      const res = await fetch(`${API_URL}/api/public/share/${token}/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json() as ShareResponse;
      if (data.status === 'ok') {
        onSuccess(data);
      } else if (data.status === 'password_failed') {
        setErr('Incorrect password. Please try again.');
      } else {
        onError('This link is no longer accessible.');
      }
    } catch {
      setErr('Unable to verify password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Lock size={16} className="text-amber-500" />
        <p className="text-sm font-medium text-foreground">This link is password protected</p>
      </div>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter password"
          autoFocus
          className="w-full rounded-lg border border-border bg-muted px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {err && <p className="text-xs text-red-500">{err}</p>}
      <button
        type="submit"
        disabled={loading || !password}
        className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Verifying…' : 'Access content'}
      </button>
    </form>
  );
}

// ─── Status screens ───────────────────────────────────────────────────────────

function StatusScreen({ status, returnTo }: { status: ShareStatus; returnTo?: string }) {
  const configs: Record<string, { title: string; message: string; icon: React.ElementType; color: string }> = {
    not_found:      { title: 'Link not found',   message: 'This share link does not exist or has been removed.', icon: XCircle,       color: 'text-red-500' },
    revoked:        { title: 'Link revoked',      message: 'The owner has revoked access to this link.',          icon: XCircle,       color: 'text-red-500' },
    expired:        { title: 'Link expired',      message: 'This share link has expired or reached its view limit.', icon: Clock,     color: 'text-amber-500' },
    denied:         { title: 'Access denied',     message: 'You do not have access to this private shared item.', icon: AlertTriangle, color: 'text-red-500' },
    login_required: { title: 'Sign in required',  message: 'This shared item is private. Please sign in with the invited email address to continue.', icon: Lock, color: 'text-blue-500' },
  };
  const cfg = configs[status] ?? configs.not_found;
  const Icon = cfg.icon;
  const loginHref = returnTo
    ? `/login?returnTo=${encodeURIComponent(returnTo)}`
    : '/login';

  return (
    <div className="text-center py-16 px-4">
      <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon size={24} className={cfg.color} />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-1">{cfg.title}</h2>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">{cfg.message}</p>
      {status === 'login_required' && (
        <Link
          href={loginHref}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Sign In
        </Link>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicSharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [shareData, setShareData] = useState<ShareResponse | null>(null);
  const [status, setStatus] = useState<ShareStatus>('loading');
  const [currentUrl, setCurrentUrl] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const headers: HeadersInit = {};
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
          setIsLoggedIn(true);
        }

        const res = await fetch(`${API_URL}/api/public/share/${token}`, { headers });
        const data = await res.json() as ShareResponse;
        setShareData(data);
        setStatus(data.status as ShareStatus);
      } catch {
        setStatus('not_found');
      }
    }
    load();
  }, [token]);

  const itemType = (shareData?.item_type ?? null) as ItemType | null;
  const ItemIcon = itemType ? ITEM_ICONS[itemType] : Globe;
  const itemLabel = itemType ? ITEM_LABELS[itemType] : 'content';
  const itemId = shareData?.content?.id as string | undefined;
  const openInDashboardUrl = itemType && itemId ? `${MODULE_BASE[itemType]}?detail=${itemId}` : '/app/shared';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ArrowLeft size={14} />
            Zikron
          </Link>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ItemIcon size={12} />
              Shared {itemLabel}
            </div>
            {shareData?.viewer_role === 'owner' && (
              <span className="text-xs font-medium text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                Owner Preview
              </span>
            )}
            {isLoggedIn && status === 'ok' && (
              <Link
                href={openInDashboardUrl}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                <ExternalLink size={11} />
                Open in Dashboard
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {status === 'loading' && (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-2/3 bg-muted rounded-lg" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-5/6 bg-muted rounded" />
            <div className="h-4 w-4/6 bg-muted rounded" />
          </div>
        )}

        {status === 'password_required' && shareData && (
          <div className="max-w-sm mx-auto bg-card border border-border rounded-2xl p-6 shadow-sm">
            {itemType && (
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                <ItemIcon size={14} className="text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">{ITEM_LABELS[itemType]}</span>
              </div>
            )}
            <PasswordForm
              token={token}
              onSuccess={data => { setShareData(data); setStatus('ok'); }}
              onError={() => setStatus('not_found')}
            />
          </div>
        )}

        {status === 'ok' && shareData?.content && shareData.item_type && (
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            {/* Item type badge bar */}
            <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-muted/30">
              <ItemIcon size={13} className="text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {shareData.viewer_role === 'owner' ? `${itemLabel} · Owner Preview` : `Shared ${itemLabel}`}
              </span>
            </div>
            <div className="p-6">
              <ContentRenderer itemType={shareData.item_type} content={shareData.content} />
            </div>
          </div>
        )}

        {['not_found', 'revoked', 'expired', 'denied', 'login_required'].includes(status) && (
          <StatusScreen status={status} returnTo={currentUrl} />
        )}
      </main>

      <footer className="text-center py-6 text-xs text-muted-foreground border-t border-border mt-8">
        Shared via{' '}
        <Link href="/" className="hover:text-foreground transition-colors">Zikron</Link>
      </footer>
    </div>
  );
}
