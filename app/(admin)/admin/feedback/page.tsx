'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MessageSquarePlus, Search, X, Bug, Zap, Layout, Gauge,
  Lightbulb, HelpCircle, Eye, Trash2, CheckCircle2, Save,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAdminFeedback, useAdminUpdateFeedback, useAdminDeleteFeedback } from '@/hooks/queries/use-feedback';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { MarkdownViewer } from '@/components/editor/markdown-viewer';
import { formatRelativeTime } from '@/utils/date';
import type { AdminFeedback, FeedbackType, FeedbackStatus } from '@/types';

const BASE = '/admin/feedback';

const FEEDBACK_TYPES: { value: FeedbackType; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'bug', label: 'Bug', icon: Bug, color: 'text-red-500' },
  { value: 'ui', label: 'UI', icon: Layout, color: 'text-blue-500' },
  { value: 'ux', label: 'UX', icon: Eye, color: 'text-purple-500' },
  { value: 'functionality', label: 'Functionality', icon: Zap, color: 'text-yellow-500' },
  { value: 'performance', label: 'Performance', icon: Gauge, color: 'text-orange-500' },
  { value: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'text-emerald-500' },
  { value: 'other', label: 'Other', icon: HelpCircle, color: 'text-muted-foreground' },
];

const STATUS_COLORS: Record<FeedbackStatus, string> = {
  open: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400',
  reviewed: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400',
  planned: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400',
  resolved: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
  rejected: 'bg-muted text-muted-foreground',
};

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  open: 'Open',
  reviewed: 'Reviewed',
  planned: 'Planned',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

// ─── Detail panel ──────────────────────────────────────────────────────────────

function DetailPanel({ item, onClose }: { item: AdminFeedback; onClose: () => void }) {
  const updateFeedback = useAdminUpdateFeedback();
  const [status, setStatus] = useState<FeedbackStatus>(item.status);
  const [response, setResponse] = useState(item.admin_response ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteFeedback = useAdminDeleteFeedback();
  const router = useRouter();

  const typeData = FEEDBACK_TYPES.find(t => t.value === item.type);
  const dirty = status !== item.status || response !== (item.admin_response ?? '');

  async function handleSave() {
    await updateFeedback.mutateAsync({ id: item.id, status, admin_response: response || null });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border gap-4">
          <div className="flex items-start gap-3 min-w-0">
            {typeData && (
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <typeData.icon size={16} className={typeData.color} />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-base font-bold text-foreground">{item.title}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-muted-foreground">
                <span className="capitalize">{typeData?.label}</span>
                <span>·</span>
                <span>{item.owner?.email ?? 'Unknown user'}</span>
                <span>·</span>
                <span>{formatRelativeTime(item.created_at)}</span>
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground shrink-0 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Message */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Message</p>
            <div className="text-sm bg-muted/50 rounded-xl p-4 border border-border">
              <MarkdownViewer content={item.message} />
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Priority</p>
              <p className="font-medium capitalize text-foreground">{item.priority}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Related to</p>
              <p className="font-medium capitalize text-foreground">{item.linked_type === 'general' ? 'General app' : item.linked_type}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Submitted</p>
              <p className="font-medium text-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Status update */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
            <Select value={status} onValueChange={v => setStatus(v as FeedbackStatus)}>
              <SelectTrigger className="min-w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Admin response */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Admin Response</label>
            <textarea
              value={response}
              onChange={e => setResponse(e.target.value)}
              placeholder="Write a response visible to the user…"
              rows={4}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              disabled={deleteFeedback.isPending}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 size={14} /> Delete
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!dirty || updateFeedback.isPending}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save size={14} /> {updateFeedback.isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete Feedback?"
        description="This will permanently remove this feedback entry."
        itemName={item.title}
        onConfirm={() => {
          deleteFeedback.mutate(item.id, { onSuccess: () => onClose() });
        }}
        isLoading={deleteFeedback.isPending}
      />
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

function AdminFeedbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: items = [], isFetching } = useAdminFeedback();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FeedbackType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | 'all'>('all');

  const urlDetailId = searchParams.get('detail');
  const [detailId, setDetailId] = useState<string | null>(urlDetailId);
  const [prevUrlDetailId, setPrevUrlDetailId] = useState(urlDetailId);
  if (prevUrlDetailId !== urlDetailId) {
    setPrevUrlDetailId(urlDetailId);
    setDetailId(urlDetailId);
  }

  const detailItem = detailId ? items.find(f => f.id === detailId) : null;

  const filtered = items.filter(f => {
    if (filterType !== 'all' && f.type !== filterType) return false;
    if (filterStatus !== 'all' && f.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!f.title.toLowerCase().includes(q) && !f.message.toLowerCase().includes(q) && !(f.owner?.email ?? '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const counts = {
    total: items.length,
    open: items.filter(f => f.status === 'open').length,
    resolved: items.filter(f => f.status === 'resolved').length,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Feedback</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Review and respond to user feedback.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total', value: counts.total, color: 'text-foreground' },
          { label: 'Open', value: counts.open, color: 'text-blue-600' },
          { label: 'Resolved', value: counts.resolved, color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, message, or user email…"
            className="w-full pl-9 pr-8 py-2 text-sm border border-border rounded-lg bg-muted text-foreground placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X size={14} />
            </button>
          )}
        </div>

        <Select value={filterType} onValueChange={v => setFilterType(v as FeedbackType | 'all')}>
          <SelectTrigger className="min-w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {FEEDBACK_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={v => setFilterStatus(v as FeedbackStatus | 'all')}>
          <SelectTrigger className="min-w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>

        {isFetching && <span className="self-center text-xs text-muted-foreground animate-pulse">Refreshing…</span>}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquarePlus size={32} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {search || filterType !== 'all' || filterStatus !== 'all' ? 'No feedback matches your filters.' : 'No feedback submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(item => {
                const typeData = FEEDBACK_TYPES.find(t => t.value === item.type);
                return (
                  <tr
                    key={item.id}
                    onClick={() => router.push(`?detail=${item.id}`)}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground line-clamp-1">{item.title}</p>
                        {item.admin_response && <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.message.replace(/[#*`_>]/g, '').slice(0, 80)}</p>
                    </td>
                    <td className="px-4 py-3">
                      {typeData && (
                        <span className="flex items-center gap-1.5 text-xs">
                          <typeData.icon size={13} className={typeData.color} />
                          {typeData.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{item.owner?.email ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[item.status]}`}>
                        {STATUS_LABELS[item.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatRelativeTime(item.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {detailItem && <DetailPanel item={detailItem} onClose={() => { setDetailId(null); router.replace(BASE, { scroll: false }); }} />}
    </div>
  );
}

export default function AdminFeedbackPage() {
  return (
    <Suspense>
      <AdminFeedbackContent />
    </Suspense>
  );
}
