'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Link2, Globe, Lock, Users, Target, Copy, Check, Eye,
  Trash2, AlertTriangle, Search, X, RotateCcw, Clock,
} from 'lucide-react';
import { useSharedLinks, useRevokeSharedLink, useDeleteSharedLink, useShareLogs } from '@/hooks/queries/use-shared-links';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { formatRelativeTime } from '@/utils/date';
import type { SharedLink, ShareType, ItemType, ShareAccessLog } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const SHARE_TYPE_LABELS: Record<ShareType, string> = {
  public: 'Public',
  protected: 'Protected',
  private: 'Private',
  tracked_protected: 'Tracked',
};

const SHARE_TYPE_ICONS: Record<ShareType, React.ElementType> = {
  public: Globe,
  protected: Lock,
  private: Users,
  tracked_protected: Target,
};

const SHARE_TYPE_COLORS: Record<ShareType, string> = {
  public: 'text-emerald-600',
  protected: 'text-amber-600',
  private: 'text-blue-600',
  tracked_protected: 'text-violet-600',
};

const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  note: 'Note',
  inbox: 'Inbox',
  list: 'List',
  collection: 'Collection',
  reminder: 'Reminder',
};

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted transition-colors shrink-0"
    >
      {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ─── Access logs modal ────────────────────────────────────────────────────────

function LogsModal({ linkId, onClose }: { linkId: string; onClose: () => void }) {
  const { data: logs = [], isLoading } = useShareLogs(linkId);

  const statusBadge: Record<string, string> = {
    allowed:          'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700',
    denied:           'bg-red-100 dark:bg-red-950/50 text-red-600',
    suspicious:       'bg-amber-100 dark:bg-amber-950/50 text-amber-700',
    expired:          'bg-muted text-muted-foreground',
    revoked:          'bg-muted text-muted-foreground',
    password_required: 'bg-blue-100 dark:bg-blue-950/50 text-blue-600',
    password_failed:  'bg-red-100 dark:bg-red-950/50 text-red-600',
    login_required:   'bg-blue-100 dark:bg-blue-950/50 text-blue-600',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Eye size={15} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Access Logs</h2>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}</div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No access logs yet.</p>
          ) : (
            <div className="space-y-2">
              {(logs as ShareAccessLog[]).map(log => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-muted/30 border border-border rounded-xl">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusBadge[log.access_status] ?? 'bg-muted text-muted-foreground'}`}>
                        {log.access_status === 'suspicious' ? 'Suspicious access' : log.access_status.replace(/_/g, ' ')}
                      </span>
                      {log.reason && <span className="text-xs text-muted-foreground">{log.reason}</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      {log.ip_address && <span>{log.ip_address}</span>}
                      {log.country && <span>{log.country}{log.city ? `, ${log.city}` : ''}</span>}
                      {log.device_label && <span>{log.device_label}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{formatRelativeTime(log.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Link row ─────────────────────────────────────────────────────────────────

function LinkRow({ link, baseUrl }: { link: SharedLink; baseUrl: string }) {
  const revokeLink = useRevokeSharedLink();
  const deleteLink = useDeleteSharedLink();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const Icon = SHARE_TYPE_ICONS[link.share_type];
  const shareUrl = link.share_type === 'tracked_protected' ? null : `${baseUrl}/s/${link.token}`;

  const isExpired = !!link.expires_at && new Date(link.expires_at) < new Date();
  const isLimitReached = link.view_limit !== null && link.view_count >= link.view_limit;
  const isActive = !link.is_revoked && !isExpired && !isLimitReached;

  const statusLabel = link.is_revoked ? 'Revoked' : isExpired ? 'Expired' : isLimitReached ? 'Limit reached' : 'Active';
  const statusCls = isActive
    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700'
    : 'bg-red-100 dark:bg-red-950/50 text-red-600';

  const suspiciousCount = link.shared_link_recipients?.reduce((sum, r) => sum + r.suspicious_access_count, 0) ?? 0;

  return (
    <>
      <div className="flex flex-col gap-2.5 bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Icon size={13} className={SHARE_TYPE_COLORS[link.share_type]} />
          <span className="text-xs font-semibold text-foreground">{SHARE_TYPE_LABELS[link.share_type]}</span>
          <span className="text-xs text-muted-foreground">&middot; {ITEM_TYPE_LABELS[link.item_type]}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusCls}`}>{statusLabel}</span>
          {suspiciousCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 font-medium">
              <AlertTriangle size={9} />
              {suspiciousCount} suspicious
            </span>
          )}
          <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
            <Eye size={11} />
            {link.view_count}{link.view_limit ? `/${link.view_limit}` : ''}
          </span>
        </div>

        {shareUrl && (
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 rounded-lg bg-muted/50 border border-border px-2.5 py-1.5 text-xs text-muted-foreground font-mono truncate">
              {shareUrl}
            </div>
            <CopyButton text={shareUrl} />
          </div>
        )}

        {link.share_type === 'tracked_protected' && link.shared_link_recipients && link.shared_link_recipients.length > 0 && (
          <div className="space-y-1.5 pl-2 border-l border-border">
            {link.shared_link_recipients.map(r => {
              const rUrl = r.individual_token ? `${baseUrl}/s/r/${r.individual_token}` : null;
              return (
                <div key={r.id} className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground min-w-[80px] truncate">
                    {r.recipient_name ?? r.recipient_email ?? 'Recipient'}
                  </span>
                  {r.suspicious_access_count > 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-100 dark:bg-amber-950/40 rounded-full px-1.5 py-0.5 font-medium">
                      <AlertTriangle size={9} /> Suspicious access
                    </span>
                  )}
                  {rUrl && !r.is_revoked && (
                    <div className="flex items-center gap-1.5 ml-auto">
                      <span className="text-xs font-mono text-muted-foreground truncate max-w-[160px]">{rUrl}</span>
                      <CopyButton text={rUrl} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock size={11} />
            {formatRelativeTime(link.created_at)}
          </span>
          {link.expires_at && (
            <span className="text-xs text-muted-foreground">
              · Expires {new Date(link.expires_at).toLocaleDateString()}
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLogs(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Eye size={12} /> Logs
            </button>
            {isActive && (
              <button
                type="button"
                onClick={() => revokeLink.mutate(link.id)}
                disabled={revokeLink.isPending}
                className="text-xs text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <RotateCcw size={12} /> Revoke
              </button>
            )}
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete shared link?"
        description="Access logs will also be removed."
        onConfirm={() => { setConfirmDelete(false); deleteLink.mutate(link.id); }}
      />
      {showLogs && <LogsModal linkId={link.id} onClose={() => setShowLogs(false)} />}
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'active' | 'revoked' | 'expired';

function SharedContent() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<ItemType | 'all'>('all');

  const { data: links = [], isLoading } = useSharedLinks();

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const filtered = links.filter((l: SharedLink) => {
    const isExpired = !!l.expires_at && new Date(l.expires_at) < new Date();
    const isActive = !l.is_revoked && !isExpired;

    if (statusFilter === 'active' && !isActive) return false;
    if (statusFilter === 'revoked' && !l.is_revoked) return false;
    if (statusFilter === 'expired' && !isExpired) return false;
    if (typeFilter !== 'all' && l.item_type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!l.token.includes(q) && !l.item_type.includes(q) && !l.share_type.includes(q)) return false;
    }
    return true;
  });

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'revoked', label: 'Revoked' },
    { key: 'expired', label: 'Expired' },
  ];

  const typeTabs: { key: ItemType | 'all'; label: string }[] = [
    { key: 'all', label: 'All types' },
    { key: 'note', label: 'Notes' },
    { key: 'inbox', label: 'Inbox' },
    { key: 'list', label: 'Lists' },
    { key: 'collection', label: 'Collections' },
    { key: 'reminder', label: 'Reminders' },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Shared Links</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and monitor all your share links.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-lg">
          <Link2 size={13} />
          {links.length} link{links.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search links…"
          className="w-full pl-9 pr-8 py-2 text-sm border border-border rounded-lg bg-muted text-foreground placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent transition-all"
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-3">
        {statusTabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === key
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Type filter pills */}
      <div className="flex gap-1 flex-wrap mb-5">
        {typeTabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTypeFilter(key)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-full border transition-colors ${
              typeFilter === key
                ? 'border-primary text-primary bg-primary/5'
                : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Links */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
            <Link2 size={22} className="text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {links.length === 0 ? 'No shared links yet' : 'No links match your filters'}
          </p>
          {links.length === 0 && (
            <p className="text-xs text-muted-foreground mt-1">Use the Share option on any note, inbox item, list, collection, or reminder.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((link: SharedLink) => (
            <LinkRow key={link.id} link={link} baseUrl={baseUrl} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SharedPage() {
  return (
    <Suspense>
      <SharedContent />
    </Suspense>
  );
}
