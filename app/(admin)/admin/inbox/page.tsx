'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Inbox, Clock, Link as LinkIcon, FileText, X, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { closeDialogUrl } from '@/lib/dialog-url';
import { MarkdownViewer } from '@/components/editor/markdown-viewer';
import { formatRelativeTime } from '@/utils/date';

const BASE_PATH = '/admin/inbox';

interface AdminInboxItem {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  url: string | null;
  type: 'text' | 'link';
  status: string;
  tags: string[];
  created_at: string;
  profiles: { email: string | null; full_name: string | null } | null;
}

export default function AdminInboxPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<AdminInboxItem[]>([]);
  const [loading, setLoading] = useState(true);

  const detailId = searchParams.get('detail');
  const detailItem = detailId ? items.find(i => i.id === detailId) ?? null : null;
  const closeUrl = closeDialogUrl(BASE_PATH, searchParams);

  useEffect(() => {
    api.get<AdminInboxItem[]>('/api/admin/inbox')
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Inbox Items</h2>
        <p className="text-sm text-muted-foreground mt-0.5">All inbox items across all users (most recent 100).</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center">
            <Inbox size={28} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No inbox items found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Item</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map(item => (
                <tr
                  key={item.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => router.push(`${BASE_PATH}?detail=${item.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.type === 'link'
                        ? <LinkIcon size={13} className="text-blue-500 shrink-0" />
                        : <FileText size={13} className="text-muted-foreground shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-foreground font-medium truncate max-w-xs">{item.title}</p>
                        {item.content && (
                          <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">{item.content}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-foreground text-xs truncate">{item.profiles?.full_name ?? '—'}</p>
                    <p className="text-muted-foreground text-xs truncate">{item.profiles?.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.status === 'favorite' ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-600'
                      : item.status === 'archived' ? 'bg-muted text-muted-foreground'
                      : 'bg-blue-100 dark:bg-blue-950/50 text-blue-600'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={11} />
                      {formatRelativeTime(item.created_at)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail dialog — read-only, URL-driven */}
      {detailId && detailItem && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => router.replace(closeUrl)}
        >
          <div
            className="bg-card flex flex-col shadow-xl border border-border w-full sm:rounded-2xl sm:w-[95vw] sm:max-w-5xl max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {detailItem.profiles?.full_name ?? detailItem.profiles?.email ?? 'Unknown user'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  detailItem.status === 'favorite' ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-600'
                  : detailItem.status === 'archived' ? 'bg-muted text-muted-foreground'
                  : 'bg-blue-100 dark:bg-blue-950/50 text-blue-600'
                }`}>
                  {detailItem.status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => router.replace(closeUrl)}
                aria-label="Close"
                className="p-1.5 text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-1">
                  {detailItem.type === 'link'
                    ? <LinkIcon size={15} className="text-blue-500" />
                    : <FileText size={15} className="text-muted-foreground" />}
                </div>
                <h2 className="text-xl font-semibold text-foreground leading-snug flex-1">{detailItem.title}</h2>
              </div>

              {detailItem.url && (
                <a
                  href={detailItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-blue-500 hover:underline break-all"
                >
                  <ExternalLink size={13} className="shrink-0" />
                  {detailItem.url}
                </a>
              )}

              {detailItem.content ? (
                <MarkdownViewer content={detailItem.content} />
              ) : (
                <p className="text-sm text-muted-foreground italic">No notes added.</p>
              )}

              {(detailItem.tags.length > 0 || detailItem.created_at) && (
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border">
                  {detailItem.tags.map(tag => (
                    <span key={tag} className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">#{tag}</span>
                  ))}
                  <span className="text-xs text-muted-foreground/50 ml-auto">{formatRelativeTime(detailItem.created_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading state for deep-linked detail (item not yet in list) */}
      {detailId && !detailItem && !loading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => router.replace(closeUrl)}>
          <div className="bg-card rounded-2xl p-8 text-center shadow-xl border border-border" onClick={e => e.stopPropagation()}>
            <p className="text-sm text-muted-foreground mb-4">Item not found.</p>
            <button type="button" onClick={() => router.replace(closeUrl)} className="text-sm text-blue-600 hover:underline">Go back</button>
          </div>
        </div>
      )}
    </div>
  );
}
