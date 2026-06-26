'use client';

import { useState } from 'react';
import {
  Link as LinkIcon, Eye, Trash2, Ban, Globe, Lock, Users,
  Clock, X, Shield, CheckCircle, AlertCircle, Search, Filter,
} from 'lucide-react';
import {
  useAdminSharedLinks,
  useAdminShareLogs,
  useAdminRevokeSharedLink,
  useAdminDeleteSharedLink,
} from '@/hooks/queries/use-shared-links';
import { formatRelativeTime } from '@/utils/date';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import type { AdminSharedLink, ShareAccessLog } from '@/types';

// ─── Logs Modal ───────────────────────────────────────────────────────────────

function LogsModal({ link, onClose }: { link: AdminSharedLink; onClose: () => void }) {
  const { data: logs = [], isLoading } = useAdminShareLogs(link.id);

  const statusColor: Record<string, string> = {
    allowed:           'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400',
    denied:            'bg-red-100 dark:bg-red-950/50 text-red-600',
    revoked:           'bg-red-100 dark:bg-red-950/50 text-red-600',
    expired:           'bg-amber-100 dark:bg-amber-950/50 text-amber-600',
    password_required: 'bg-blue-100 dark:bg-blue-950/50 text-blue-600',
    password_failed:   'bg-orange-100 dark:bg-orange-950/50 text-orange-600',
    not_found:         'bg-muted text-muted-foreground',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-base font-semibold text-foreground">Access Logs</h2>
            <p className="text-xs text-muted-foreground truncate max-w-sm">{link.token}</p>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading logs…</div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center">
              <Eye size={26} className="text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No access logs yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">IP</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Country</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log: ShareAccessLog) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[log.access_status] ?? 'bg-muted text-muted-foreground'}`}>
                        {log.access_status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground font-mono">{log.ip_address ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">{log.country ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(log.created_at)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Status helpers ───────────────────────────────────────────────────────────

function getLinkStatus(link: AdminSharedLink): 'active' | 'revoked' | 'expired' {
  if (link.is_revoked) return 'revoked';
  if (link.expires_at && new Date(link.expires_at) < new Date()) return 'expired';
  return 'active';
}

const statusBadge: Record<string, string> = {
  active:  'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400',
  revoked: 'bg-red-100 dark:bg-red-950/50 text-red-600',
  expired: 'bg-amber-100 dark:bg-amber-950/50 text-amber-600',
};

const typeBadge: Record<string, string> = {
  public:      'bg-blue-100 dark:bg-blue-950/50 text-blue-600',
  private:     'bg-violet-100 dark:bg-violet-950/50 text-violet-600',
  password:    'bg-amber-100 dark:bg-amber-950/50 text-amber-600',
  token_only:  'bg-muted text-muted-foreground',
};

const typeIcon: Record<string, React.ElementType> = {
  public:     Globe,
  private:    Users,
  password:   Lock,
  token_only: Shield,
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminSharedPage() {
  const { data: links = [], isLoading } = useAdminSharedLinks();
  const revoke = useAdminRevokeSharedLink();
  const del = useAdminDeleteSharedLink();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked' | 'expired'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'public' | 'private' | 'password' | 'token_only'>('all');
  const [logsLink, setLogsLink] = useState<AdminSharedLink | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = links.filter(link => {
    const status = getLinkStatus(link);
    if (statusFilter !== 'all' && status !== statusFilter) return false;
    if (typeFilter !== 'all' && link.share_type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const ownerMatch = (link.owner?.full_name ?? link.owner?.email ?? '').toLowerCase().includes(q);
      const tokenMatch = link.token.toLowerCase().includes(q);
      const typeMatch = link.item_type.toLowerCase().includes(q);
      if (!ownerMatch && !tokenMatch && !typeMatch) return false;
    }
    return true;
  });

  const counts = {
    all:     links.length,
    active:  links.filter(l => getLinkStatus(l) === 'active').length,
    revoked: links.filter(l => getLinkStatus(l) === 'revoked').length,
    expired: links.filter(l => getLinkStatus(l) === 'expired').length,
  };

  const deleteLink = deleteId ? links.find(l => l.id === deleteId) : null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Shared Links</h2>
        <p className="text-sm text-muted-foreground mt-0.5">All shared content across the platform. Revoke or delete links as needed.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(['all', 'active', 'revoked', 'expired'] as const).map(key => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            className={`flex flex-col items-start p-3 rounded-xl border transition-all text-left ${
              statusFilter === key
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:bg-muted/50'
            }`}
          >
            <span className="text-2xl font-bold text-foreground">{counts[key]}</span>
            <span className="text-xs text-muted-foreground capitalize">{key === 'all' ? 'Total links' : `${key} links`}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by owner, type, token…"
            className="w-full pl-9 pr-8 py-2 text-sm border border-border rounded-lg bg-muted text-foreground placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-muted-foreground" />
          {(['all', 'public', 'private', 'password', 'token_only'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                typeFilter === t
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'token_only' ? 'Token' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading shared links…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <LinkIcon size={28} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {search || statusFilter !== 'all' || typeFilter !== 'all' ? 'No links match your filters.' : 'No shared links yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Owner</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Item type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Share type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Views</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Expires</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Created</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(link => {
                  const status = getLinkStatus(link);
                  const ShareTypeIcon = typeIcon[link.share_type] ?? Globe;
                  return (
                    <tr key={link.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                            {(link.owner?.full_name?.[0] ?? link.owner?.email?.[0] ?? '?').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground truncate max-w-32">{link.owner?.full_name ?? '—'}</p>
                            <p className="text-[10px] text-muted-foreground truncate max-w-32">{link.owner?.email ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground capitalize">{link.item_type}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <ShareTypeIcon size={11} className="text-muted-foreground" />
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${typeBadge[link.share_type] ?? 'bg-muted text-muted-foreground'}`}>
                            {link.share_type.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusBadge[status]}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye size={11} />
                          {link.view_count}
                          {link.view_limit && <span className="text-muted-foreground/60">/{link.view_limit}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock size={11} />
                          {link.expires_at ? formatRelativeTime(link.expires_at) : <span className="text-muted-foreground/50">Never</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(link.created_at)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setLogsLink(link)}
                            title="View access logs"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Eye size={13} />
                          </button>
                          {status === 'active' && (
                            <button
                              type="button"
                              onClick={() => revoke.mutate(link.id)}
                              disabled={revoke.isPending}
                              title="Revoke link"
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-600 hover:bg-muted transition-colors disabled:opacity-50"
                            >
                              <Ban size={13} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setDeleteId(link.id)}
                            title="Delete link"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-muted transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {logsLink && <LogsModal link={logsLink} onClose={() => setLogsLink(null)} />}
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={open => { if (!open) setDeleteId(null); }}
        title="Delete shared link?"
        description="This permanently removes the link and all its access logs. Recipients will lose access immediately."
        itemName={deleteLink ? `${deleteLink.item_type} link (${deleteLink.token.slice(0, 8)}…)` : undefined}
        onConfirm={() => {
          if (deleteId) del.mutate(deleteId, { onSettled: () => setDeleteId(null) });
        }}
        isLoading={del.isPending}
      />
    </div>
  );
}
