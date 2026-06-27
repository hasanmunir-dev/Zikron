'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MessageSquarePlus, Search, X, Bug, Zap, Layout, Gauge,
  Lightbulb, HelpCircle, Eye, Trash2, Plus, CheckCircle2, Check,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useFeedback, useCreateFeedback, useDeleteFeedback, useBulkDeleteFeedback } from '@/hooks/queries/use-feedback';
import { useBulkSelection } from '@/hooks/use-bulk-selection';
import { BulkActionToolbar } from '@/components/shared/bulk-action-toolbar';
import type { BulkAction } from '@/components/shared/bulk-action-toolbar';
import { MarkdownEditor } from '@/components/editor/markdown-editor';
import { MarkdownViewer } from '@/components/editor/markdown-viewer';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { formatRelativeTime } from '@/utils/date';
import type { Feedback, FeedbackType, FeedbackStatus, FeedbackLinkedType } from '@/types';
import { MasonryGrid } from '@/components/shared/masonry-grid';

const BASE = '/app/feedback';

// ─── Type metadata ─────────────────────────────────────────────────────────────

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

function typeIcon(type: FeedbackType) {
  const t = FEEDBACK_TYPES.find(t => t.value === type);
  if (!t) return null;
  const Icon = t.icon;
  return <Icon size={14} className={t.color} />;
}

// ─── Create dialog ─────────────────────────────────────────────────────────────

function CreateFeedbackDialog({ onClose }: { onClose: () => void }) {
  const createFeedback = useCreateFeedback();
  const [form, setForm] = useState<{
    type: FeedbackType;
    title: string;
    message: string;
    linked_type: FeedbackLinkedType;
    priority: 'low' | 'medium' | 'high';
  }>({
    type: 'suggestion',
    title: '',
    message: '',
    linked_type: 'general',
    priority: 'medium',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    await createFeedback.mutateAsync({
      type: form.type,
      title: form.title.trim(),
      message: form.message.trim(),
      linked_type: form.linked_type,
      priority: form.priority,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center">
              <MessageSquarePlus size={17} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Send Feedback</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Feedback type</label>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_TYPES.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: value }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    form.type === value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-border text-muted-foreground hover:border-blue-400 hover:text-foreground'
                  }`}
                >
                  <Icon size={13} className={form.type === value ? 'text-white' : color} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Short summary of your feedback"
              maxLength={160}
              required
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Message <span className="text-red-500">*</span>
            </label>
            <MarkdownEditor
              value={form.message}
              onChange={v => setForm(f => ({ ...f, message: v }))}
              placeholder="Describe in detail — steps to reproduce, what you expected, what happened…"
              minHeight="140px"
            />
          </div>

          {/* Linked to + Priority row */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-40">
              <label className="block text-sm font-medium text-foreground mb-1.5">Related to</label>
              <Select
                value={form.linked_type}
                onValueChange={v => setForm(f => ({ ...f, linked_type: v as FeedbackLinkedType }))}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General app</SelectItem>
                  <SelectItem value="note">Notes</SelectItem>
                  <SelectItem value="inbox">Inbox</SelectItem>
                  <SelectItem value="list">Lists</SelectItem>
                  <SelectItem value="self_chat">Self Chat</SelectItem>
                  <SelectItem value="reminder">Reminders</SelectItem>
                  <SelectItem value="none">None / Not sure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-40">
              <label className="block text-sm font-medium text-foreground mb-1.5">Priority</label>
              <Select
                value={form.priority}
                onValueChange={v => setForm(f => ({ ...f, priority: v as 'low' | 'medium' | 'high' }))}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createFeedback.isPending || !form.title.trim() || !form.message.trim()}
              className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {createFeedback.isPending ? 'Sending…' : 'Send Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Detail dialog ─────────────────────────────────────────────────────────────

function DetailDialog({ item, onClose }: { item: Feedback; onClose: () => void }) {
  const deleteFeedback = useDeleteFeedback();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const typeData = FEEDBACK_TYPES.find(t => t.value === item.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-6 border-b border-border gap-4">
          <div className="flex items-start gap-3 min-w-0">
            {typeData && (
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <typeData.icon size={16} className={typeData.color} />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-base font-bold text-foreground">{item.title}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[item.status]}`}>
                  {STATUS_LABELS[item.status]}
                </span>
                <span className="text-xs text-muted-foreground capitalize">{typeData?.label}</span>
                <span className="text-xs text-muted-foreground/50">·</span>
                <span className="text-xs text-muted-foreground">{formatRelativeTime(item.created_at)}</span>
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="text-muted-foreground hover:text-foreground shrink-0 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Message</p>
            <div className="text-sm text-foreground">
              <MarkdownViewer content={item.message} />
            </div>
          </div>

          {item.admin_response && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                <CheckCircle2 size={13} /> Admin Response
              </p>
              <p className="text-sm text-emerald-900 dark:text-emerald-100 leading-relaxed whitespace-pre-wrap">{item.admin_response}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              disabled={deleteFeedback.isPending}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 size={14} /> Delete
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete Feedback?"
        description="This will permanently remove your feedback submission."
        itemName={item.title}
        onConfirm={() => {
          deleteFeedback.mutate(item.id, {
            onSuccess: () => {
              onClose();
            },
          });
        }}
        isLoading={deleteFeedback.isPending}
      />
    </div>
  );
}


// ─── Main page ─────────────────────────────────────────────────────────────────

function FeedbackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: items = [], isFetching } = useFeedback();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FeedbackType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | 'all'>('all');

  // URL params drive opening; local state drives closing (instant, no router wait)
  const urlShowCreate = searchParams.get('create') === 'true';
  const urlDetailId = searchParams.get('detail');
  const [showCreate, setShowCreate] = useState(urlShowCreate);
  const [detailId, setDetailId] = useState<string | null>(urlDetailId);
  const [prevUrlShowCreate, setPrevUrlShowCreate] = useState(urlShowCreate);
  const [prevUrlDetailId, setPrevUrlDetailId] = useState(urlDetailId);
  if (prevUrlShowCreate !== urlShowCreate) {
    setPrevUrlShowCreate(urlShowCreate);
    setShowCreate(urlShowCreate);
  }
  if (prevUrlDetailId !== urlDetailId) {
    setPrevUrlDetailId(urlDetailId);
    setDetailId(urlDetailId);
  }

  const bulk = useBulkSelection();
  const bulkDelete = useBulkDeleteFeedback();

  const detailItem = detailId ? items.find(f => f.id === detailId) : null;

  const filtered = items.filter(f => {
    if (filterType !== 'all' && f.type !== filterType) return false;
    if (filterStatus !== 'all' && f.status !== filterStatus) return false;
    if (search && !f.title.toLowerCase().includes(search.toLowerCase()) && !f.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function closeDialog() {
    setShowCreate(false);
    setDetailId(null);
    router.replace(BASE, { scroll: false });
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Feedback</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Report bugs, suggest improvements, or share your thoughts about Zikron.
          </p>
        </div>
        <Link
          href="?create=true"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shrink-0"
        >
          <Plus size={16} /> New Feedback
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search feedback…"
            className="w-full pl-9 pr-8 py-2 text-sm border border-border rounded-lg bg-muted text-foreground placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Type filter */}
        <Select value={filterType} onValueChange={v => setFilterType(v as FeedbackType | 'all')}>
          <SelectTrigger className="min-w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {FEEDBACK_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Status filter */}
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

      {/* Bulk actions */}
      {(() => {
        const bulkActions: BulkAction[] = [
          {
            label: 'Delete',
            icon: Trash2,
            variant: 'destructive' as const,
            onClick: () => {
              if (confirm(`Delete ${bulk.selectedCount} item${bulk.selectedCount !== 1 ? 's' : ''}? This cannot be undone.`)) {
                bulkDelete.mutate(bulk.getArray());
                bulk.clear();
              }
            },
            disabled: bulkDelete.isPending,
          },
        ];
        return (
          <BulkActionToolbar
            count={bulk.selectedCount}
            total={filtered.length}
            actions={bulkActions}
            onClear={bulk.clear}
            onSelectAll={() => bulk.toggleAll(filtered.map(f => f.id), true)}
          />
        );
      })()}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquarePlus size={26} className="text-muted-foreground/30" />
          </div>
          <p className="text-base font-semibold text-foreground mb-1">
            {search || filterType !== 'all' || filterStatus !== 'all' ? 'No feedback matches your filters' : 'No feedback yet'}
          </p>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-5">
            {!search && filterType === 'all' && filterStatus === 'all' && 'Help improve Zikron by sharing what\'s working and what isn\'t.'}
          </p>
          {!search && filterType === 'all' && filterStatus === 'all' && (
            <Link href="?create=true" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              <Plus size={15} /> Send Feedback
            </Link>
          )}
        </div>
      ) : (
        <MasonryGrid>
          {filtered.map(item => {
            const typeData = FEEDBACK_TYPES.find(t => t.value === item.type);
            return (
              <div key={item.id} className="relative group/sel">
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); bulk.toggle(item.id); }}
                  aria-label={`${bulk.isSelected(item.id) ? 'Deselect' : 'Select'}`}
                  className={`absolute top-2 left-2 z-30 flex items-center justify-center w-5 h-5 rounded border-2 transition-all ${
                    bulk.isSelected(item.id)
                      ? 'bg-primary border-primary opacity-100'
                      : `bg-card border-border ${bulk.selectedCount > 0 ? 'opacity-100' : 'opacity-0 group-hover/sel:opacity-100'}`
                  }`}
                >
                  {bulk.isSelected(item.id) && <Check size={11} className="text-primary-foreground" />}
                </button>
                {bulk.selectedCount > 0 && (
                  <div className="absolute inset-0 z-20 cursor-pointer rounded-xl" onClick={() => bulk.toggle(item.id)} aria-hidden="true" />
                )}
                <Link
                  href={`?detail=${item.id}`}
                  className="group relative bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-all flex items-start gap-4"
                >
                  {typeData && (
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      <typeData.icon size={16} className={typeData.color} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{item.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLORS[item.status]}`}>
                        {STATUS_LABELS[item.status]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.message.replace(/[#*`_>]/g, '')}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground/60">
                      <span className="capitalize">{typeData?.label}</span>
                      <span>·</span>
                      <span>{formatRelativeTime(item.created_at)}</span>
                      {item.admin_response && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 size={11} /> Response received
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </MasonryGrid>
      )}

      {/* Dialogs */}
      {showCreate && <CreateFeedbackDialog onClose={closeDialog} />}
      {detailItem && <DetailDialog item={detailItem} onClose={closeDialog} />}
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense>
      <FeedbackPageContent />
    </Suspense>
  );
}
