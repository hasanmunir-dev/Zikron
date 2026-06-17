'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Bell, Plus, Search, X, Clock, CheckCircle2, XCircle,
  AlertCircle, ChevronDown, Trash2, Pencil, Circle,
  BookOpen, Inbox, Table2, MessageSquare, Link2, RotateCcw,
} from 'lucide-react';
import {
  useReminders, useReminder, useCreateReminder,
  useUpdateReminder, useDeleteReminder, useUpdateReminderStatus,
} from '@/hooks/queries/use-reminders';
import { useNotes } from '@/hooks/queries/use-notes';
import { useInbox } from '@/hooks/queries/use-inbox';
import { useLists } from '@/hooks/queries/use-lists';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { MarkdownEditor } from '@/components/editor/markdown-editor';
import { MarkdownViewer } from '@/components/editor/markdown-viewer';
import { closeDialogUrl } from '@/lib/dialog-url';
import { formatRelativeTime } from '@/utils/date';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import type { Reminder, ReminderStatus, ReminderPriority, ReminderLinkedType } from '@/types';

const BASE = '/app/reminders';

type FilterTab = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed' | 'cancelled';
type ComputedStatus = 'overdue' | 'today' | 'upcoming' | 'pending' | 'completed' | 'cancelled';

// ─── Date helpers ─────────────────────────────────────────────────────────────

function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

function isTomorrow(dateStr: string): boolean {
  const d = new Date(dateStr);
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

// Convert a stored UTC ISO string to the value expected by <input type="datetime-local">
// (which uses local time, not UTC)
function toLocalDatetimeInput(iso: string): string {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

// ─── Computed status ──────────────────────────────────────────────────────────

function getComputedStatus(r: Reminder): ComputedStatus {
  if (r.status === 'completed') return 'completed';
  if (r.status === 'cancelled') return 'cancelled';
  if (!r.due_at) return 'pending';
  const d = new Date(r.due_at);
  if (d < new Date()) return 'overdue';
  if (isToday(r.due_at)) return 'today';
  return 'upcoming';
}

function formatDueDateRelative(dueAt: string): string {
  const d = new Date(dueAt);
  const diffMs = d.getTime() - Date.now();
  if (diffMs < 0) {
    const abs = Math.abs(diffMs);
    const days = Math.floor(abs / 86400000);
    const hours = Math.floor(abs / 3600000);
    const mins = Math.floor(abs / 60000);
    if (days >= 1) return `Overdue by ${days} day${days > 1 ? 's' : ''}`;
    if (hours >= 1) return `Overdue by ${hours} hour${hours > 1 ? 's' : ''}`;
    return `Overdue by ${mins || 1} min`;
  }
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  if (isToday(dueAt)) return `Due today at ${time}`;
  if (isTomorrow(dueAt)) return `Due tomorrow at ${time}`;
  const days = Math.ceil(diffMs / 86400000);
  if (days < 7) return `Due in ${days} day${days > 1 ? 's' : ''}`;
  const now = new Date();
  return `Due ${d.toLocaleDateString(undefined, {
    month: 'short', day: 'numeric',
    ...(d.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  })}`;
}

// ─── Sort ─────────────────────────────────────────────────────────────────────

function sortReminders(list: Reminder[]): Reminder[] {
  const rank: Record<ComputedStatus, number> = {
    overdue: 0, today: 1, upcoming: 2, pending: 3, completed: 4, cancelled: 5,
  };
  return [...list].sort((a, b) => {
    const ra = rank[getComputedStatus(a)];
    const rb = rank[getComputedStatus(b)];
    if (ra !== rb) return ra - rb;
    if (a.due_at && b.due_at) return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

// ─── Status display config ────────────────────────────────────────────────────

type StatusConfig = { label: string; badgeClass: string; iconClass: string; Icon: React.ElementType };

const statusConfig: Record<ComputedStatus, StatusConfig> = {
  overdue:   { label: 'Overdue',   badgeClass: 'bg-red-100 dark:bg-red-950/50 text-red-600',           iconClass: 'text-red-500',               Icon: AlertCircle  },
  today:     { label: 'Due Today', badgeClass: 'bg-amber-100 dark:bg-amber-950/50 text-amber-600',     iconClass: 'text-amber-500',             Icon: Clock        },
  upcoming:  { label: 'Upcoming',  badgeClass: 'bg-blue-100 dark:bg-blue-950/50 text-blue-600',        iconClass: 'text-blue-500',              Icon: Clock        },
  pending:   { label: 'Pending',   badgeClass: 'bg-muted text-muted-foreground',                        iconClass: 'text-muted-foreground',      Icon: Circle       },
  completed: { label: 'Completed', badgeClass: 'bg-green-100 dark:bg-green-950/50 text-green-600',     iconClass: 'text-green-500',             Icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', badgeClass: 'bg-muted text-muted-foreground/60',                     iconClass: 'text-muted-foreground/50',   Icon: XCircle      },
};

const priorityColor: Record<ReminderPriority, string> = {
  high:   'bg-red-100 dark:bg-red-950/50 text-red-600',
  medium: 'bg-amber-100 dark:bg-amber-950/50 text-amber-600',
  low:    'bg-blue-100 dark:bg-blue-950/50 text-blue-600',
};

const linkedTypeIcon: Record<ReminderLinkedType, React.ElementType> = {
  none: Link2, note: BookOpen, inbox: Inbox, list: Table2, self_chat: MessageSquare,
};
const linkedTypeLabel: Record<ReminderLinkedType, string> = {
  none: 'None', note: 'Note', inbox: 'Inbox item', list: 'List', self_chat: 'Self Chat',
};

// ─── Form ─────────────────────────────────────────────────────────────────────

interface FormData {
  title: string; description: string; due_at: string;
  priority: ReminderPriority; linked_type: ReminderLinkedType; linked_id: string; tags: string;
}
type FormErrors = Partial<Record<keyof FormData, string>>;

function defaultForm(r?: Reminder): FormData {
  return {
    title:       r?.title ?? '',
    description: r?.description ?? '',
    due_at:      r?.due_at ? toLocalDatetimeInput(r.due_at) : '',
    priority:    r?.priority ?? 'medium',
    linked_type: r?.linked_type ?? 'none',
    linked_id:   r?.linked_id ?? '',
    tags:        r?.tags?.join(', ') ?? '',
  };
}

interface ReminderFormProps {
  initial?: Reminder;
  onSubmit: (data: Partial<Reminder>) => void;
  onCancel: () => void;
  isLoading: boolean;
  submitLabel: string;
}

function ReminderForm({ initial, onSubmit, onCancel, isLoading, submitLabel }: ReminderFormProps) {
  const [form, setForm] = useState<FormData>(defaultForm(initial));
  const [errors, setErrors] = useState<FormErrors>({});
  const { data: notes = [] } = useNotes();
  const { data: inbox = [] } = useInbox();
  const { data: lists = [] } = useLists();

  function set<K extends keyof FormData>(k: K, v: FormData[K]) {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: undefined }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (form.due_at && isNaN(new Date(form.due_at).getTime())) e.due_at = 'Invalid date';
    if (form.linked_type !== 'none' && form.linked_type !== 'self_chat' && !form.linked_id) {
      e.linked_id = 'Select an item to link';
    }
    setErrors(e);
    return !Object.keys(e).length;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    const linked_type = form.linked_type;
    const linked_id = linked_type !== 'none' && form.linked_id ? form.linked_id : null;
    onSubmit({
      title: form.title.trim(),
      description: form.description || null,
      due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
      priority: form.priority, linked_type, linked_id, tags,
    } as Partial<Reminder>);
  }

  const linkedOptions =
    form.linked_type === 'note'  ? notes.map(n => ({ id: n.id, label: n.title })) :
    form.linked_type === 'inbox' ? inbox.map(i => ({ id: i.id, label: i.title })) :
    form.linked_type === 'list'  ? lists.map(l => ({ id: l.id, label: l.title })) : [];

  const inputCls = (err?: string) =>
    `w-full px-3 py-2 text-sm border rounded-lg bg-muted text-foreground placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${err ? 'border-red-400' : 'border-border'}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Title *</label>
        <input autoFocus value={form.title} onChange={e => set('title', e.target.value)} placeholder="What do you need to remember?" className={inputCls(errors.title)} />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Description (Markdown)</label>
        <MarkdownEditor value={form.description} onChange={v => set('description', v)} minHeight="140px" defaultTab="write" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Due date & time</label>
          <input type="datetime-local" value={form.due_at} onChange={e => set('due_at', e.target.value)} className={inputCls(errors.due_at)} />
          {errors.due_at && <p className="text-xs text-red-500 mt-1">{errors.due_at}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Priority</label>
          <div className="relative">
            <select value={form.priority} onChange={e => set('priority', e.target.value as ReminderPriority)} className="w-full appearance-none px-3 py-2 text-sm border border-border rounded-lg bg-muted text-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Tags (comma-separated)</label>
        <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="work, urgent, school" className={inputCls()} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Link to</label>
          <div className="relative">
            <select value={form.linked_type} onChange={e => { set('linked_type', e.target.value as ReminderLinkedType); set('linked_id', ''); }} className="w-full appearance-none px-3 py-2 text-sm border border-border rounded-lg bg-muted text-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8">
              <option value="none">None</option>
              <option value="note">Note</option>
              <option value="inbox">Inbox item</option>
              <option value="list">List</option>
              <option value="self_chat">Self Chat</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        {form.linked_type !== 'none' && form.linked_type !== 'self_chat' && (
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Select item</label>
            <div className="relative">
              <select value={form.linked_id} onChange={e => set('linked_id', e.target.value)} className={`w-full appearance-none px-3 py-2 text-sm border rounded-lg bg-muted text-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 ${errors.linked_id ? 'border-red-400' : 'border-border'}`}>
                <option value="">Select…</option>
                {linkedOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            {errors.linked_id && <p className="text-xs text-red-500 mt-1">{errors.linked_id}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {isLoading ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function ReminderCard({ r, onStatus }: { r: Reminder; onStatus: (id: string, s: ReminderStatus) => void }) {
  const cs = getComputedStatus(r);
  const cfg = statusConfig[cs];
  const { Icon } = cfg;

  function toggleStatus() {
    if (r.status === 'cancelled') return;
    onStatus(r.id, r.status === 'completed' ? 'pending' : 'completed');
  }

  return (
    <div className={`bg-card border rounded-xl p-4 transition-all hover:shadow-sm ${cs === 'overdue' ? 'border-red-200 dark:border-red-900/50' : 'border-border'} ${r.status === 'cancelled' ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={toggleStatus}
          disabled={r.status === 'cancelled'}
          title={r.status === 'completed' ? 'Mark as pending' : r.status === 'cancelled' ? 'View details to reactivate' : 'Mark as completed'}
          className={`mt-0.5 shrink-0 transition-all hover:scale-110 disabled:cursor-default ${cfg.iconClass}`}
        >
          <Icon size={18} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Link
              href={`${BASE}?detail=${r.id}`}
              className={`text-sm font-medium hover:text-blue-600 transition-colors leading-snug ${r.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}
            >
              {r.title}
            </Link>
            {r.priority === 'high' && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${priorityColor.high}`}>High</span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${cfg.badgeClass}`}>{cfg.label}</span>
            {r.due_at && (
              <span className={`flex items-center gap-1 text-xs ${cs === 'overdue' ? 'text-red-500 font-medium' : cs === 'today' ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                <Clock size={11} />
                {formatDueDateRelative(r.due_at)}
              </span>
            )}
            {r.linked_type !== 'none' && (() => { const I = linkedTypeIcon[r.linked_type]; return <span className="flex items-center gap-1 text-xs text-muted-foreground"><I size={11} />{linkedTypeLabel[r.linked_type]}</span>; })()}
          </div>

          {r.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {r.tags.map(t => <span key={t} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">#{t}</span>)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Link href={`${BASE}?edit=${r.id}`} title="Edit" className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <Pencil size={14} />
          </Link>
          <Link href={`${BASE}?delete=${r.id}`} title="Delete" className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 text-muted-foreground hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-card flex flex-col shadow-xl border border-border w-full sm:rounded-2xl sm:w-[95vw] sm:max-w-2xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <button type="button" onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Detail dialog ────────────────────────────────────────────────────────────

function DetailDialog({ id, closeUrl }: { id: string; closeUrl: string }) {
  const router = useRouter();
  const { data: reminder, isLoading } = useReminder(id);
  const updateStatus = useUpdateReminderStatus();

  if (isLoading) {
    return (
      <Modal title="Reminder" onClose={() => router.replace(closeUrl)}>
        <div className="animate-pulse space-y-3"><div className="h-5 w-3/4 bg-muted rounded" /><div className="h-20 bg-muted rounded" /></div>
      </Modal>
    );
  }
  if (!reminder) {
    return <Modal title="Reminder" onClose={() => router.replace(closeUrl)}><p className="text-sm text-muted-foreground">Reminder not found.</p></Modal>;
  }

  const cs = getComputedStatus(reminder);
  const cfg = statusConfig[cs];
  const { Icon } = cfg;

  function doStatus(s: ReminderStatus) {
    updateStatus.mutate({ id: reminder!.id, status: s });
  }

  return (
    <Modal title="Reminder" onClose={() => router.replace(closeUrl)}>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Icon size={20} className={`mt-0.5 shrink-0 ${cfg.iconClass}`} />
          <h3 className={`text-lg font-semibold leading-snug ${reminder.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {reminder.title}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badgeClass}`}>{cfg.label}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[reminder.priority]}`}>{reminder.priority} priority</span>
        </div>

        {reminder.due_at && (
          <div className={`flex items-center gap-1.5 text-sm ${cs === 'overdue' ? 'text-red-500 font-medium' : cs === 'today' ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
            {cs === 'overdue' ? <AlertCircle size={14} /> : <Clock size={14} />}
            {formatDueDateRelative(reminder.due_at)}
            <span className="font-normal text-muted-foreground text-xs">
              · {new Date(reminder.due_at).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}

        {reminder.description
          ? <div className="border border-border rounded-lg p-4 bg-muted/30"><MarkdownViewer content={reminder.description} /></div>
          : <p className="text-sm text-muted-foreground italic">No description.</p>
        }

        {reminder.linked_type !== 'none' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {(() => { const I = linkedTypeIcon[reminder.linked_type]; return <I size={14} />; })()}
            Linked to: {linkedTypeLabel[reminder.linked_type]}
            {!reminder.linked_id && <span className="text-xs text-muted-foreground/60">(item unavailable)</span>}
          </div>
        )}

        {reminder.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {reminder.tags.map(t => <span key={t} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">#{t}</span>)}
          </div>
        )}

        <p className="text-xs text-muted-foreground/60">Created {formatRelativeTime(reminder.created_at)}</p>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <Link href={`${BASE}?edit=${reminder.id}`} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors">
            <Pencil size={13} /> Edit
          </Link>

          {reminder.status !== 'completed' && (
            <button type="button" disabled={updateStatus.isPending} onClick={() => doStatus('completed')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors disabled:opacity-50">
              <CheckCircle2 size={13} /> Mark completed
            </button>
          )}
          {reminder.status === 'completed' && (
            <button type="button" disabled={updateStatus.isPending} onClick={() => doStatus('pending')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50">
              <RotateCcw size={13} /> Mark pending
            </button>
          )}
          {reminder.status === 'pending' && (
            <button type="button" disabled={updateStatus.isPending} onClick={() => doStatus('cancelled')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50">
              <XCircle size={13} /> Cancel reminder
            </button>
          )}
          {reminder.status === 'cancelled' && (
            <button type="button" disabled={updateStatus.isPending} onClick={() => doStatus('pending')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50">
              <RotateCcw size={13} /> Reactivate
            </button>
          )}

          <Link href={`${BASE}?delete=${reminder.id}`} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors ml-auto">
            <Trash2 size={13} /> Delete
          </Link>
        </div>
      </div>
    </Modal>
  );
}

// ─── Create / Edit / Delete dialogs ──────────────────────────────────────────

function CreateDialog({ closeUrl }: { closeUrl: string }) {
  const router = useRouter();
  const create = useCreateReminder();
  return (
    <Modal title="New Reminder" onClose={() => router.replace(closeUrl)}>
      <ReminderForm
        onSubmit={data => create.mutate(data, { onSuccess: () => router.replace(closeUrl) })}
        onCancel={() => router.replace(closeUrl)}
        isLoading={create.isPending}
        submitLabel="Create Reminder"
      />
    </Modal>
  );
}

function EditDialog({ id, closeUrl }: { id: string; closeUrl: string }) {
  const router = useRouter();
  const { data: reminder, isLoading } = useReminder(id);
  const update = useUpdateReminder();
  if (isLoading || !reminder) {
    return <Modal title="Edit Reminder" onClose={() => router.replace(closeUrl)}><div className="animate-pulse h-48 bg-muted rounded" /></Modal>;
  }
  return (
    <Modal title="Edit Reminder" onClose={() => router.replace(closeUrl)}>
      <ReminderForm
        initial={reminder}
        onSubmit={data => update.mutate({ id, ...data }, { onSuccess: () => router.replace(closeUrl) })}
        onCancel={() => router.replace(closeUrl)}
        isLoading={update.isPending}
        submitLabel="Save Changes"
      />
    </Modal>
  );
}

function DeleteDialog({ id, closeUrl }: { id: string; closeUrl: string }) {
  const router = useRouter();
  const { data: reminder } = useReminder(id);
  const del = useDeleteReminder();
  return (
    <DeleteConfirmDialog
      open
      onOpenChange={open => { if (!open) router.replace(closeUrl); }}
      title="Delete Reminder?"
      description="This action cannot be undone."
      itemName={reminder?.title}
      onConfirm={() => del.mutate(id, { onSettled: () => router.replace(closeUrl) })}
      isLoading={del.isPending}
    />
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function RemindersContent() {
  const searchParams = useSearchParams();
  const { data: rawReminders = [], isLoading } = useReminders();
  const updateStatus = useUpdateReminderStatus();
  const push = usePushNotifications();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [notificationDismissed, setNotificationDismissed] = useState(false);

  const detailId  = searchParams.get('detail');
  const editId    = searchParams.get('edit');
  const deleteId  = searchParams.get('delete');
  const isCreate  = searchParams.get('create') === 'true';
  const closeUrl  = closeDialogUrl(BASE, searchParams);

  const reminders = sortReminders(rawReminders);

  const filtered = reminders.filter(r => {
    if (search) {
      const q = search.toLowerCase();
      if (!r.title.toLowerCase().includes(q) && !(r.description ?? '').toLowerCase().includes(q) && !r.tags.some(t => t.toLowerCase().includes(q))) return false;
    }
    const cs = getComputedStatus(r);
    if (filter === 'all')       return true;
    if (filter === 'today')     return cs === 'today';
    if (filter === 'upcoming')  return cs === 'upcoming' || cs === 'today';
    if (filter === 'overdue')   return cs === 'overdue';
    if (filter === 'completed') return r.status === 'completed';
    if (filter === 'cancelled') return r.status === 'cancelled';
    return true;
  });

  const counts: Record<FilterTab, number> = {
    all:       reminders.length,
    today:     reminders.filter(r => getComputedStatus(r) === 'today').length,
    upcoming:  reminders.filter(r => { const cs = getComputedStatus(r); return cs === 'upcoming' || cs === 'today'; }).length,
    overdue:   reminders.filter(r => getComputedStatus(r) === 'overdue').length,
    completed: reminders.filter(r => r.status === 'completed').length,
    cancelled: reminders.filter(r => r.status === 'cancelled').length,
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'today', label: 'Today' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Reminders</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Create and manage important reminders.</p>
        </div>
        <Link href={`${BASE}?create=true`} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={15} /> New Reminder
        </Link>
      </div>

      {push.isSupported && !push.isSubscribed && push.permission !== 'denied' && !notificationDismissed && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
          <Bell size={15} className="text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-300 flex-1">Enable browser notifications to get alerts when reminders are due.</p>
          <button type="button" disabled={push.isLoading} onClick={push.enable} className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50">
            {push.isLoading ? 'Enabling…' : 'Enable'}
          </button>
          <button type="button" aria-label="Dismiss" onClick={() => setNotificationDismissed(true)} className="shrink-0 text-amber-500 hover:text-amber-700"><X size={14} /></button>
        </div>
      )}

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reminders…"
          className="w-full pl-9 pr-8 py-2 text-sm border border-border rounded-lg bg-muted text-foreground placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X size={14} /></button>}
      </div>

      <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
        {tabs.map(({ key, label }) => (
          <button
            key={key} type="button" onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              filter === key
                ? key === 'overdue' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                : key === 'overdue' && counts.overdue > 0
                  ? 'bg-red-100 dark:bg-red-950/40 text-red-600 hover:bg-red-200 dark:hover:bg-red-950/60'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
            {counts[key] > 0 && (
              <span className={`text-[10px] rounded-full px-1.5 py-0.5 ${filter === key ? 'bg-white/20 text-white' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/40 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Bell size={22} className="text-amber-500" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            {search ? 'No reminders match your search.' : filter !== 'all' ? `No ${filter} reminders.` : 'No reminders yet.'}
          </p>
          {!search && filter === 'all' && (
            <>
              <p className="text-xs text-muted-foreground mb-4">Create your first reminder so important tasks don&apos;t slip away.</p>
              <Link href={`${BASE}?create=true`} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus size={14} /> New Reminder
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <ReminderCard key={r.id} r={r} onStatus={(id, status) => updateStatus.mutate({ id, status })} />
          ))}
        </div>
      )}

      {isCreate  && <CreateDialog closeUrl={closeUrl} />}
      {detailId  && !editId && !deleteId && !isCreate && <DetailDialog id={detailId} closeUrl={closeUrl} />}
      {editId    && <EditDialog id={editId} closeUrl={closeUrl} />}
      {deleteId  && <DeleteDialog id={deleteId} closeUrl={closeUrl} />}
    </div>
  );
}

export default function RemindersPage() {
  return <Suspense><RemindersContent /></Suspense>;
}
