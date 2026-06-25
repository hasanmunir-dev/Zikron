'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bell, Clock, Search, X, AlertCircle, CheckCircle2, XCircle, Circle, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminReminders, useAdminDeleteReminder } from '@/hooks/queries/use-admin';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { MarkdownViewer } from '@/components/editor/markdown-viewer';
import { closeDialogUrl } from '@/lib/dialog-url';
import { formatRelativeTime } from '@/utils/date';
import type { AdminReminder, ReminderStatus, ReminderPriority } from '@/types';

const BASE = '/admin/reminders';

type ComputedStatus = 'overdue' | 'today' | 'upcoming' | 'pending' | 'completed' | 'cancelled';
type StatusFilter = ReminderStatus | 'all' | 'overdue';

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

function getComputedStatus(r: AdminReminder): ComputedStatus {
  if (r.status === 'completed') return 'completed';
  if (r.status === 'cancelled') return 'cancelled';
  if (!r.due_at) return 'pending';
  const d = new Date(r.due_at);
  if (d < new Date()) return 'overdue';
  if (isToday(r.due_at)) return 'today';
  return 'upcoming';
}

type StatusConfig = { label: string; badgeClass: string; Icon: React.ElementType; iconClass: string };
const statusConfig: Record<ComputedStatus, StatusConfig> = {
  overdue:   { label: 'Overdue',   badgeClass: 'bg-red-100 dark:bg-red-950/50 text-red-600',       Icon: AlertCircle,  iconClass: 'text-red-500'             },
  today:     { label: 'Due Today', badgeClass: 'bg-amber-100 dark:bg-amber-950/50 text-amber-600', Icon: Clock,        iconClass: 'text-amber-500'           },
  upcoming:  { label: 'Upcoming',  badgeClass: 'bg-blue-100 dark:bg-blue-950/50 text-blue-600',    Icon: Clock,        iconClass: 'text-blue-500'            },
  pending:   { label: 'Pending',   badgeClass: 'bg-muted text-muted-foreground',                    Icon: Circle,       iconClass: 'text-muted-foreground'    },
  completed: { label: 'Completed', badgeClass: 'bg-green-100 dark:bg-green-950/50 text-green-600', Icon: CheckCircle2, iconClass: 'text-green-500'           },
  cancelled: { label: 'Cancelled', badgeClass: 'bg-muted text-muted-foreground/60',                 Icon: XCircle,      iconClass: 'text-muted-foreground/50' },
};

const priorityColor: Record<ReminderPriority, string> = {
  high: 'bg-red-100 dark:bg-red-950/50 text-red-600',
  medium: 'bg-amber-100 dark:bg-amber-950/50 text-amber-600',
  low: 'bg-blue-100 dark:bg-blue-950/50 text-blue-600',
};

function AdminRemindersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: reminders = [], isLoading } = useAdminReminders();
  const deleteReminder = useAdminDeleteReminder();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);

  const detailId = searchParams.get('detail');
  const detailItem = detailId ? reminders.find(r => r.id === detailId) ?? null : null;
  const closeUrl = closeDialogUrl(BASE, searchParams);

  const filtered = reminders.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      r.title.toLowerCase().includes(q) ||
      (r.description ?? '').toLowerCase().includes(q) ||
      (r.owner?.email ?? '').toLowerCase().includes(q) ||
      (r.owner?.full_name ?? '').toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q));
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'overdue' ? getComputedStatus(r) === 'overdue' : r.status === statusFilter);
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Reminders</h2>
          <p className="text-sm text-muted-foreground mt-0.5">All user reminders across the platform.</p>
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} reminder{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, description, or user…"
            className="w-full pl-9 pr-8 py-2 text-sm border border-border rounded-lg bg-muted text-foreground placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {search && (
            <button type="button" aria-label="Clear search" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X size={14} />
            </button>
          )}
        </div>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="min-w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Bell size={28} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{search ? 'No reminders match your search.' : 'No reminders found.'}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Owner</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Due Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Created</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(r => {
                const cs = getComputedStatus(r);
                const cfg = statusConfig[cs];
                const { Icon } = cfg;
                return (
                  <tr
                    key={r.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => router.push(`${BASE}?detail=${r.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className={cfg.iconClass} />
                        <p className={`text-sm font-medium truncate max-w-xs ${r.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {r.title}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-xs text-foreground truncate">{r.owner?.full_name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.owner?.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {r.due_at ? (
                        <span className={`flex items-center gap-1 text-xs ${cs === 'overdue' ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                          {cs === 'overdue' && <AlertCircle size={11} />}
                          <Clock size={11} />
                          {new Date(r.due_at).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badgeClass}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[r.priority]}`}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={11} />
                        {formatRelativeTime(r.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={e => { e.preventDefault(); e.stopPropagation(); setPendingDelete({ id: r.id, title: r.title }); }}
                          className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 text-muted-foreground hover:text-red-500 transition-colors"
                          title="Delete reminder"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail dialog */}
      {detailId && detailItem && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => router.replace(closeUrl)}
        >
          <div
            className="bg-card flex flex-col shadow-xl border border-border w-full sm:rounded-2xl sm:w-[95vw] sm:max-w-2xl max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground">
                  {detailItem.owner?.full_name ?? detailItem.owner?.email ?? 'Unknown user'}
                </span>
                {(() => {
                  const cs = getComputedStatus(detailItem);
                  const cfg = statusConfig[cs];
                  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badgeClass}`}>{cfg.label}</span>;
                })()}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[detailItem.priority]}`}>
                  {detailItem.priority}
                </span>
              </div>
              <button type="button" onClick={() => router.replace(closeUrl)} aria-label="Close" className="p-1.5 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">{detailItem.title}</h2>

              {detailItem.due_at && (() => {
                const cs = getComputedStatus(detailItem);
                const overdue = cs === 'overdue';
                return (
                  <div className={`flex items-center gap-1.5 text-sm ${overdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                    {overdue ? <AlertCircle size={14} /> : <Clock size={14} />}
                    Due: {new Date(detailItem.due_at).toLocaleString()}
                    {overdue && ' — Overdue'}
                  </div>
                );
              })()}

              {detailItem.description ? (
                <div className="border border-border rounded-lg p-4 bg-muted/30">
                  <MarkdownViewer content={detailItem.description} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No description.</p>
              )}

              {detailItem.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {detailItem.tags.map(t => (
                    <span key={t} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">#{t}</span>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground/60">Created {formatRelativeTime(detailItem.created_at)}</p>
            </div>
          </div>
        </div>
      )}

      {detailId && !detailItem && !isLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => router.replace(closeUrl)}>
          <div className="bg-card rounded-2xl p-8 text-center shadow-xl border border-border" onClick={e => e.stopPropagation()}>
            <p className="text-sm text-muted-foreground mb-4">Reminder not found.</p>
            <button type="button" onClick={() => router.replace(closeUrl)} className="text-sm text-blue-600 hover:underline">Go back</button>
          </div>
        </div>
      )}

      <DeleteConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={open => { if (!open) setPendingDelete(null); }}
        title="Delete Reminder?"
        description="This action cannot be undone."
        itemName={pendingDelete?.title}
        onConfirm={() => {
          if (pendingDelete) deleteReminder.mutate(pendingDelete.id, { onSettled: () => setPendingDelete(null) });
        }}
        isLoading={deleteReminder.isPending}
      />
    </div>
  );
}

export default function AdminRemindersPage() {
  return (
    <Suspense>
      <AdminRemindersContent />
    </Suspense>
  );
}
