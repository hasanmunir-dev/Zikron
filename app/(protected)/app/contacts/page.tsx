'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  UserPlus,
  Search,
  Star,
  Archive,
  Trash2,
  Edit,
  Phone,
  Mail,
  Building2,
  BriefcaseIcon,
  X,
  Download,
  StickyNote,
  Users,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Unplug,
} from 'lucide-react';
import {
  useContacts,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
  useGoogleConnectionStatus,
  useImportGoogleContacts,
  useDisconnectGoogleContacts,
} from '@/hooks/queries/use-contacts';
import { api } from '@/lib/api';
import { MarkdownViewer } from '@/components/editor/markdown-viewer';
import { MarkdownEditor } from '@/components/editor/markdown-editor';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import type { Contact } from '@/types';

// ─── Avatar ───────────────────────────────────────────────────────────────────

function ContactAvatar({ contact, size = 'md' }: { contact: Contact; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'h-9 w-9 text-sm' : size === 'lg' ? 'h-16 w-16 text-2xl' : 'h-11 w-11 text-base';
  const initials = contact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  if (contact.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={contact.avatar_url}
        alt={contact.name}
        className={`${sizeClass} rounded-full object-cover border border-border shrink-0`}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Contact Form ─────────────────────────────────────────────────────────────

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  notes: string;
  avatar_url: string;
}

function ContactForm({
  initial,
  onSubmit,
  onCancel,
  isLoading,
  mode,
}: {
  initial?: Partial<ContactFormData>;
  onSubmit: (data: ContactFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
  mode: 'create' | 'edit';
}) {
  const [form, setForm] = useState<ContactFormData>({
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    company: initial?.company ?? '',
    job_title: initial?.job_title ?? '',
    notes: initial?.notes ?? '',
    avatar_url: initial?.avatar_url ?? '',
  });

  function set(key: keyof ContactFormData, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name *</label>
          <input
            required
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Jane Smith"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="jane@example.com"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            placeholder="+1 555 000 0000"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Company</label>
          <input
            value={form.company}
            onChange={e => set('company', e.target.value)}
            placeholder="Acme Inc."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Job Title</label>
          <input
            value={form.job_title}
            onChange={e => set('job_title', e.target.value)}
            placeholder="Software Engineer"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Avatar URL</label>
          <input
            type="url"
            value={form.avatar_url}
            onChange={e => set('avatar_url', e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notes (Markdown)</label>
          <MarkdownEditor
            value={form.notes}
            onChange={val => set('notes', val)}
            placeholder="Add notes, tags, context..."
            minHeight="140px"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !form.name.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isLoading ? (mode === 'create' ? 'Creating…' : 'Saving…') : (mode === 'create' ? 'Create Contact' : 'Save Changes')}
        </button>
      </div>
    </form>
  );
}

// ─── Contact Detail ───────────────────────────────────────────────────────────

function ContactDetail({
  contact,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleArchive,
}: {
  contact: Contact;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onToggleArchive: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
        <div
          className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 p-5 border-b border-border sticky top-0 bg-card z-10">
            <div className="flex items-center gap-3 min-w-0">
              <ContactAvatar contact={contact} size="lg" />
              <div className="min-w-0">
                <p className="font-bold text-lg text-foreground truncate">{contact.name}</p>
                {contact.job_title && (
                  <p className="text-sm text-muted-foreground truncate">{contact.job_title}{contact.company ? ` · ${contact.company}` : ''}</p>
                )}
                {!contact.job_title && contact.company && (
                  <p className="text-sm text-muted-foreground truncate">{contact.company}</p>
                )}
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground shrink-0 mt-1">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5">
            {/* Contact info */}
            <div className="space-y-2.5">
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-3 text-sm group">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                    <Mail size={14} className="text-blue-600" />
                  </div>
                  <span className="text-foreground group-hover:text-primary transition-colors truncate">{contact.email}</span>
                  <ExternalLink size={12} className="text-muted-foreground/50 shrink-0 ml-auto" />
                </a>
              )}
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-3 text-sm group">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                    <Phone size={14} className="text-emerald-600" />
                  </div>
                  <span className="text-foreground group-hover:text-primary transition-colors">{contact.phone}</span>
                  <ExternalLink size={12} className="text-muted-foreground/50 shrink-0 ml-auto" />
                </a>
              )}
              {contact.company && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center shrink-0">
                    <Building2 size={14} className="text-violet-600" />
                  </div>
                  <span className="text-foreground truncate">{contact.company}</span>
                </div>
              )}
              {contact.job_title && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
                    <BriefcaseIcon size={14} className="text-amber-600" />
                  </div>
                  <span className="text-foreground truncate">{contact.job_title}</span>
                </div>
              )}
            </div>

            {/* Notes */}
            {contact.notes ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <StickyNote size={13} className="text-muted-foreground" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</p>
                </div>
                <div className="rounded-lg bg-muted/50 border border-border p-3">
                  <MarkdownViewer content={contact.notes} />
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-muted/30 border border-dashed border-border p-3 text-center">
                <p className="text-xs text-muted-foreground">No notes yet. <button type="button" onClick={onEdit} className="underline hover:text-foreground">Add notes</button></p>
              </div>
            )}

            {/* Statistics placeholders */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Activity</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Collections', value: '—', note: 'Coming soon' },
                  { label: 'Shared Links', value: '—', note: 'Coming soon' },
                  { label: 'Reminders', value: '—', note: 'Coming soon' },
                ].map(stat => (
                  <div key={stat.label} className="rounded-lg bg-muted/40 border border-border p-2.5 text-center">
                    <p className="text-lg font-bold text-foreground/40">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{stat.label}</p>
                    <p className="text-[9px] text-muted-foreground/50 italic">{stat.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Source badge */}
            {contact.source !== 'manual' && (
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground capitalize">
                  Source: {contact.source.replace('_', ' ')}
                </span>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between gap-2 px-5 pb-5 border-t border-border pt-4">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onToggleFavorite}
                aria-label={contact.favorite ? 'Unfavorite' : 'Favorite'}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  contact.favorite
                    ? 'text-amber-600 bg-amber-600/10 hover:bg-amber-600/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Star size={13} className={contact.favorite ? 'fill-current' : ''} />
                {contact.favorite ? 'Unfavorite' : 'Favorite'}
              </button>
              <button
                type="button"
                onClick={onToggleArchive}
                aria-label={contact.archived ? 'Unarchive' : 'Archive'}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Archive size={13} />
                {contact.archived ? 'Unarchive' : 'Archive'}
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onEdit}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Edit size={13} />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-600/10 transition-colors"
              >
                <Trash2 size={13} />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete Contact"
        description="This contact will be permanently deleted."
        itemName={contact.name}
        onConfirm={() => { setConfirmDelete(false); onDelete(); }}
      />
    </>
  );
}

// ─── Contact Card ─────────────────────────────────────────────────────────────

function ContactCard({ contact, onAction }: {
  contact: Contact;
  onAction: (action: 'detail' | 'edit' | 'delete' | 'favorite' | 'archive') => void;
}) {
  return (
    <div className="relative group bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
      <Link
        href={`?detail=${contact.id}`}
        className="absolute inset-0 rounded-xl z-0"
        aria-label={`View ${contact.name}`}
      />

      <div className="relative z-10 flex items-start gap-3">
        <ContactAvatar contact={contact} size="md" />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">{contact.name}</p>
              {contact.job_title && (
                <p className="text-xs text-muted-foreground truncate">{contact.job_title}</p>
              )}
              {contact.company && (
                <p className="text-xs text-muted-foreground/70 truncate">{contact.company}</p>
              )}
            </div>
            {contact.favorite && (
              <Star size={13} className="text-amber-500 fill-current shrink-0 mt-0.5" />
            )}
          </div>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {contact.email && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail size={11} />
                <span className="truncate max-w-[120px]">{contact.email}</span>
              </span>
            )}
            {contact.phone && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone size={11} />
                {contact.phone}
              </span>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="relative z-10 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            onClick={e => { e.preventDefault(); onAction('favorite'); }}
            aria-label={contact.favorite ? 'Unfavorite' : 'Favorite'}
            className={`rounded-md p-1.5 transition-colors ${contact.favorite ? 'text-amber-500' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
          >
            <Star size={13} className={contact.favorite ? 'fill-current' : ''} />
          </button>
          <button
            type="button"
            onClick={e => { e.preventDefault(); onAction('edit'); }}
            aria-label="Edit"
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Edit size={13} />
          </button>
          <button
            type="button"
            onClick={e => { e.preventDefault(); onAction('delete'); }}
            aria-label="Delete"
            className="rounded-md p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dialog wrapper ───────────────────────────────────────────────────────────

function DialogShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Google Contacts Banner ───────────────────────────────────────────────────

interface GoogleContactsBannerProps {
  connected: boolean;
  isImporting: boolean;
  isDisconnecting: boolean;
  importResult: { imported: number; updated: number; skipped: number; errors?: string[] } | null;
  onConnect: () => void;
  onImport: () => void;
  onDisconnect: () => void;
}

function GoogleContactsBanner({
  connected,
  isImporting,
  isDisconnecting,
  importResult,
  onConnect,
  onImport,
  onDisconnect,
}: GoogleContactsBannerProps) {
  if (importResult) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Import complete</p>
            <p className="text-xs text-muted-foreground">
              {importResult.imported} new · {importResult.updated} updated · {importResult.skipped} skipped
              {importResult.errors && importResult.errors.length > 0 && ` · ${importResult.errors.length} errors`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onImport}
          disabled={isImporting}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0"
        >
          <RefreshCw size={12} />
          Sync again
        </button>
      </div>
    );
  }

  if (isImporting) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">Importing from Google Contacts…</p>
          <p className="text-xs text-muted-foreground">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (connected) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
            <Download size={15} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Google Contacts connected</p>
            <p className="text-xs text-muted-foreground">Import contacts from your Google account</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onDisconnect}
            disabled={isDisconnecting}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-red-600 hover:border-red-300 disabled:opacity-50 transition-colors"
          >
            <Unplug size={12} />
            Disconnect
          </button>
          <button
            type="button"
            onClick={onImport}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Download size={12} />
            Import
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0">
          <Download size={15} className="text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Import from Google Contacts</p>
          <p className="text-xs text-muted-foreground">Connect your Google account to sync contacts</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onConnect}
        className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
      >
        Connect Google
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'all' | 'favorites' | 'archived';

type ImportResult = { imported: number; updated: number; skipped: number; errors?: string[] } | null;

function ContactsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createParam = searchParams.get('create');
  const detailId = searchParams.get('detail');
  const editId = searchParams.get('edit');
  const deleteId = searchParams.get('delete');
  const googleParam = searchParams.get('google');

  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [importResult, setImportResult] = useState<ImportResult>(null);

  const { data: contacts = [], isLoading } = useContacts();
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  const { data: googleStatus } = useGoogleConnectionStatus();
  const importGoogleContacts = useImportGoogleContacts();
  const disconnectGoogle = useDisconnectGoogleContacts();

  // Clear the ?google= param from the URL after OAuth redirect
  useEffect(() => {
    if (googleParam) {
      router.replace('/app/contacts', { scroll: false });
    }
  }, [googleParam, router]);

  async function handleGoogleConnect() {
    try {
      const data = await api.get<{ url: string }>('/api/contacts/google/auth-url');
      if (data.url) window.location.href = data.url;
    } catch {
      // toast already handled by api client on network errors
    }
  }

  function close() {
    router.replace('/app/contacts', { scroll: false });
  }

  const detailContact = contacts.find(c => c.id === detailId) ?? null;
  const editContact = contacts.find(c => c.id === editId) ?? null;
  const deleteContact_ = contacts.find(c => c.id === deleteId) ?? null;

  const filtered = contacts.filter(c => {
    const inTab =
      tab === 'favorites' ? c.favorite :
      tab === 'archived' ? c.archived :
      !c.archived;
    if (!inTab) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q) ||
      (c.phone ?? '').toLowerCase().includes(q) ||
      (c.company ?? '').toLowerCase().includes(q) ||
      (c.notes ?? '').toLowerCase().includes(q)
    );
  });

  async function handleCreate(data: ContactFormData) {
    await createContact.mutateAsync(data);
    close();
  }

  async function handleEdit(data: ContactFormData) {
    if (!editId) return;
    await updateContact.mutateAsync({ id: editId, ...data });
    close();
  }

  async function handleDelete(contact: Contact) {
    await deleteContact.mutateAsync(contact.id);
    if (detailId === contact.id || deleteId === contact.id) close();
    setDeleteTarget(null);
  }

  function toggleFavorite(contact: Contact) {
    updateContact.mutate({ id: contact.id, favorite: !contact.favorite });
  }

  function toggleArchive(contact: Contact) {
    updateContact.mutate({ id: contact.id, archived: !contact.archived });
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'favorites', label: 'Favorites' },
    { key: 'archived', label: 'Archived' },
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border shrink-0">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Contacts</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {contacts.filter(c => !c.archived).length} contacts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="?create=true"
              className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <UserPlus size={15} />
              <span className="hidden sm:inline">New Contact</span>
            </Link>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-0.5 bg-muted/50 rounded-lg p-0.5">
            {tabs.map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  tab === t.key
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Google Contacts integration banner */}
      <div className="px-6 pt-4 shrink-0">
        <GoogleContactsBanner
          connected={googleStatus?.connected ?? false}
          isImporting={importGoogleContacts.isPending}
          isDisconnecting={disconnectGoogle.isPending}
          importResult={importResult}
          onConnect={handleGoogleConnect}
          onImport={async () => {
            setImportResult(null);
            const result = await importGoogleContacts.mutateAsync();
            setImportResult(result);
          }}
          onDisconnect={() => {
            setImportResult(null);
            disconnectGoogle.mutate();
          }}
        />
      </div>

      {/* Contact grid */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-5">
              <Users size={28} className="text-muted-foreground/40" />
            </div>
            <p className="text-base font-semibold text-foreground mb-2">
              {search
                ? 'No contacts match your search'
                : tab === 'favorites'
                  ? 'No favorite contacts yet'
                  : tab === 'archived'
                    ? 'No archived contacts'
                    : 'No contacts yet'}
            </p>
            <p className="text-sm text-muted-foreground max-w-xs mb-5">
              {!search && tab === 'all' && 'Create your first contact to start building your network.'}
            </p>
            {!search && tab === 'all' && (
              <Link
                href="?create=true"
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <UserPlus size={15} />
                New Contact
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onAction={(action) => {
                  if (action === 'detail') router.push(`?detail=${contact.id}`);
                  else if (action === 'edit') router.push(`?edit=${contact.id}`);
                  else if (action === 'delete') setDeleteTarget(contact);
                  else if (action === 'favorite') toggleFavorite(contact);
                  else if (action === 'archive') toggleArchive(contact);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create dialog */}
      {createParam === 'true' && (
        <DialogShell title="New Contact" onClose={close}>
          <ContactForm
            mode="create"
            onSubmit={handleCreate}
            onCancel={close}
            isLoading={createContact.isPending}
          />
        </DialogShell>
      )}

      {/* Edit dialog */}
      {editId && editContact && (
        <DialogShell title="Edit Contact" onClose={close}>
          <ContactForm
            mode="edit"
            initial={{
              name: editContact.name,
              email: editContact.email ?? '',
              phone: editContact.phone ?? '',
              company: editContact.company ?? '',
              job_title: editContact.job_title ?? '',
              notes: editContact.notes ?? '',
              avatar_url: editContact.avatar_url ?? '',
            }}
            onSubmit={handleEdit}
            onCancel={close}
            isLoading={updateContact.isPending}
          />
        </DialogShell>
      )}

      {/* Detail dialog */}
      {detailId && detailContact && (
        <ContactDetail
          contact={detailContact}
          onClose={close}
          onEdit={() => router.replace(`?edit=${detailId}`, { scroll: false })}
          onDelete={() => handleDelete(detailContact)}
          onToggleFavorite={() => toggleFavorite(detailContact)}
          onToggleArchive={() => toggleArchive(detailContact)}
        />
      )}

      {/* Delete from card */}
      {deleteTarget && (
        <DeleteConfirmDialog
          open={!!deleteTarget}
          onOpenChange={open => { if (!open) setDeleteTarget(null); }}
          title="Delete Contact"
          description="This contact will be permanently deleted."
          itemName={deleteTarget.name}
          onConfirm={() => handleDelete(deleteTarget)}
          isLoading={deleteContact.isPending}
        />
      )}

      {/* Delete via URL param */}
      {deleteId && deleteContact_ && (
        <DeleteConfirmDialog
          open={!!deleteId}
          onOpenChange={open => { if (!open) close(); }}
          title="Delete Contact"
          description="This contact will be permanently deleted."
          itemName={deleteContact_.name}
          onConfirm={() => handleDelete(deleteContact_)}
          isLoading={deleteContact.isPending}
        />
      )}
    </div>
  );
}

export default function ContactsPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <ContactsContent />
    </Suspense>
  );
}
