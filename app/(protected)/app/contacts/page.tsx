'use client';

import { useState, useRef, Suspense } from 'react';
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
  StickyNote,
  Users,
  ExternalLink,
  Plus,
  Globe,
  MapPin,
  Upload,
  FileText,
  Calendar,
  Check,
} from 'lucide-react';
import {
  useContacts,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
  useImportCsvContacts,
  useBulkUpdateContacts,
  useBulkDeleteContacts,
} from '@/hooks/queries/use-contacts';
import { useBulkSelection } from '@/hooks/use-bulk-selection';
import { BulkActionToolbar } from '@/components/shared/bulk-action-toolbar';
import type { BulkAction } from '@/components/shared/bulk-action-toolbar';
import { MarkdownViewer } from '@/components/editor/markdown-viewer';
import { MarkdownEditor } from '@/components/editor/markdown-editor';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Contact, ContactEmail, ContactPhone, ContactAddress, ContactWebsite } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function primaryEmail(c: Contact): string | null {
  if (c.emails?.length > 0) return (c.emails.find(e => e.primary) ?? c.emails[0]).value;
  return c.email;
}

function primaryPhone(c: Contact): string | null {
  if (c.phones?.length > 0) return (c.phones.find(p => p.primary) ?? c.phones[0]).value;
  return c.phone;
}

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

// ─── Multi-value field row ─────────────────────────────────────────────────────

function MultiEmailField({
  items,
  onChange,
}: {
  items: ContactEmail[];
  onChange: (items: ContactEmail[]) => void;
}) {
  const emailLabels = ['main', 'work', 'personal', 'other'];

  function add() {
    onChange([...items, { value: '', label: 'work', primary: false }]);
  }

  function remove(i: number) {
    const next = items.filter((_, idx) => idx !== i);
    if (next.length > 0 && !next.some(e => e.primary)) next[0].primary = true;
    onChange(next);
  }

  function update(i: number, key: keyof ContactEmail, val: string | boolean) {
    const next = items.map((e, idx) => idx === i ? { ...e, [key]: val } : e);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="email"
            value={item.value}
            onChange={e => update(i, 'value', e.target.value)}
            placeholder="email@example.com"
            className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Select value={item.label} onValueChange={val => update(i, 'label', val ?? item.label)}>
            <SelectTrigger aria-label="Email label" className="shrink-0 w-auto capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {emailLabels.map(l => <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <button
            type="button"
            aria-label="Remove email"
            onClick={() => remove(i)}
            className="rounded-md p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      {items.length < 5 && (
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus size={13} />
          Add email
        </button>
      )}
    </div>
  );
}

function MultiPhoneField({
  items,
  onChange,
}: {
  items: ContactPhone[];
  onChange: (items: ContactPhone[]) => void;
}) {
  const phoneLabels = ['mobile', 'home', 'work', 'other'];

  function add() {
    onChange([...items, { value: '', label: 'mobile', primary: false }]);
  }

  function remove(i: number) {
    const next = items.filter((_, idx) => idx !== i);
    if (next.length > 0 && !next.some(p => p.primary)) next[0].primary = true;
    onChange(next);
  }

  function update(i: number, key: keyof ContactPhone, val: string | boolean) {
    const next = items.map((p, idx) => idx === i ? { ...p, [key]: val } : p);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="tel"
            value={item.value}
            onChange={e => update(i, 'value', e.target.value)}
            placeholder="+1 555 000 0000"
            className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Select value={item.label} onValueChange={val => update(i, 'label', val ?? item.label)}>
            <SelectTrigger aria-label="Phone label" className="shrink-0 w-auto capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {phoneLabels.map(l => <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <button
            type="button"
            aria-label="Remove phone"
            onClick={() => remove(i)}
            className="rounded-md p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      {items.length < 5 && (
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus size={13} />
          Add phone
        </button>
      )}
    </div>
  );
}

function MultiWebsiteField({
  items,
  onChange,
}: {
  items: ContactWebsite[];
  onChange: (items: ContactWebsite[]) => void;
}) {
  const websiteLabels = ['website', 'linkedin', 'github', 'twitter', 'other'];

  function add() {
    onChange([...items, { value: '', label: 'website' }]);
  }

  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  function update(i: number, key: keyof ContactWebsite, val: string) {
    onChange(items.map((w, idx) => idx === i ? { ...w, [key]: val } : w));
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="url"
            value={item.value}
            onChange={e => update(i, 'value', e.target.value)}
            placeholder="https://..."
            className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Select value={item.label} onValueChange={val => update(i, 'label', val ?? item.label)}>
            <SelectTrigger aria-label="Website label" className="shrink-0 w-auto capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {websiteLabels.map(l => <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <button
            type="button"
            aria-label="Remove website"
            onClick={() => remove(i)}
            className="rounded-md p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      {items.length < 4 && (
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus size={13} />
          Add website
        </button>
      )}
    </div>
  );
}

function AddressFields({
  addresses,
  onChange,
}: {
  addresses: ContactAddress[];
  onChange: (items: ContactAddress[]) => void;
}) {
  const addressLabels = ['home', 'work', 'other'];

  function add() {
    onChange([...addresses, { street: '', city: '', state: '', zip: '', country: '', label: 'home' }]);
  }

  function remove(i: number) {
    onChange(addresses.filter((_, idx) => idx !== i));
  }

  function update(i: number, key: keyof ContactAddress, val: string) {
    onChange(addresses.map((a, idx) => idx === i ? { ...a, [key]: val } : a));
  }

  const fieldClass = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <div className="space-y-3">
      {addresses.map((addr, i) => (
        <div key={i} className="rounded-xl border border-border p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Select value={addr.label} onValueChange={val => update(i, 'label', val ?? addr.label)}>
              <SelectTrigger aria-label="Address type" size="sm" className="w-auto capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {addressLabels.map(l => <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <button
              type="button"
              aria-label="Remove address"
              onClick={() => remove(i)}
              className="rounded-md p-1 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
          <input value={addr.street} onChange={e => update(i, 'street', e.target.value)} placeholder="Street address" className={fieldClass} />
          <div className="grid grid-cols-2 gap-2">
            <input value={addr.city} onChange={e => update(i, 'city', e.target.value)} placeholder="City" className={fieldClass} />
            <input value={addr.state} onChange={e => update(i, 'state', e.target.value)} placeholder="State / Province" className={fieldClass} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={addr.zip} onChange={e => update(i, 'zip', e.target.value)} placeholder="ZIP / Postal code" className={fieldClass} />
            <input value={addr.country} onChange={e => update(i, 'country', e.target.value)} placeholder="Country" className={fieldClass} />
          </div>
        </div>
      ))}
      {addresses.length < 3 && (
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus size={13} />
          Add address
        </button>
      )}
    </div>
  );
}

// ─── Contact Form ─────────────────────────────────────────────────────────────

interface ContactFormData {
  name: string;
  prefix: string;
  middle_name: string;
  nickname: string;
  birthday: string;
  emails: ContactEmail[];
  phones: ContactPhone[];
  addresses: ContactAddress[];
  websites: ContactWebsite[];
  company: string;
  job_title: string;
  notes: string;
  avatar_url: string;
}

function contactToFormData(c: Contact): ContactFormData {
  return {
    name: c.name,
    prefix: c.prefix ?? '',
    middle_name: c.middle_name ?? '',
    nickname: c.nickname ?? '',
    birthday: c.birthday ?? '',
    emails: c.emails?.length > 0 ? c.emails : (c.email ? [{ value: c.email, label: 'main', primary: true }] : []),
    phones: c.phones?.length > 0 ? c.phones : (c.phone ? [{ value: c.phone, label: 'mobile', primary: true }] : []),
    addresses: c.addresses ?? [],
    websites: c.websites ?? [],
    company: c.company ?? '',
    job_title: c.job_title ?? '',
    notes: c.notes ?? '',
    avatar_url: c.avatar_url ?? '',
  };
}

const emptyFormData = (): ContactFormData => ({
  name: '', prefix: '', middle_name: '', nickname: '', birthday: '',
  emails: [{ value: '', label: 'main', primary: true }],
  phones: [{ value: '', label: 'mobile', primary: true }],
  addresses: [], websites: [],
  company: '', job_title: '', notes: '', avatar_url: '',
});

function ContactForm({
  initial,
  onSubmit,
  onCancel,
  isLoading,
  mode,
}: {
  initial?: ContactFormData;
  onSubmit: (data: ContactFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
  mode: 'create' | 'edit';
}) {
  const [form, setForm] = useState<ContactFormData>(initial ?? emptyFormData());

  function set<K extends keyof ContactFormData>(key: K, val: ContactFormData[K]) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    // Strip empty entries from arrays
    const cleaned: ContactFormData = {
      ...form,
      emails: form.emails.filter(e => e.value.trim()),
      phones: form.phones.filter(p => p.value.trim()),
      websites: form.websites.filter(w => w.value.trim()),
    };
    // Ensure first item is primary
    if (cleaned.emails.length > 0 && !cleaned.emails.some(e => e.primary)) cleaned.emails[0].primary = true;
    if (cleaned.phones.length > 0 && !cleaned.phones.some(p => p.primary)) cleaned.phones[0].primary = true;
    onSubmit(cleaned);
  }

  const inputClass = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Prefix</label>
          <input value={form.prefix} onChange={e => set('prefix', e.target.value)} placeholder="Dr. / Mr. / Ms." className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Full Name *</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jane Smith" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Middle Name</label>
          <input value={form.middle_name} onChange={e => set('middle_name', e.target.value)} placeholder="Marie" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Nickname</label>
          <input value={form.nickname} onChange={e => set('nickname', e.target.value)} placeholder="Jay" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Birthday</label>
          <DateTimePicker dateOnly value={form.birthday ?? ''} onChange={v => set('birthday', v || '')} placeholder="Pick birthday" />
        </div>
      </div>

      {/* Work */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Company</label>
          <input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Acme Inc." className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Job Title</label>
          <input value={form.job_title} onChange={e => set('job_title', e.target.value)} placeholder="Software Engineer" className={inputClass} />
        </div>
      </div>

      {/* Emails */}
      <div>
        <label className={labelClass}>Emails</label>
        <MultiEmailField items={form.emails} onChange={v => set('emails', v)} />
      </div>

      {/* Phones */}
      <div>
        <label className={labelClass}>Phone Numbers</label>
        <MultiPhoneField items={form.phones} onChange={v => set('phones', v)} />
      </div>

      {/* Addresses */}
      <div>
        <label className={labelClass}>Addresses</label>
        <AddressFields addresses={form.addresses} onChange={v => set('addresses', v)} />
      </div>

      {/* Websites */}
      <div>
        <label className={labelClass}>Websites</label>
        <MultiWebsiteField items={form.websites} onChange={v => set('websites', v)} />
      </div>

      {/* Avatar */}
      <div>
        <label className={labelClass}>Avatar URL</label>
        <input type="url" value={form.avatar_url} onChange={e => set('avatar_url', e.target.value)} placeholder="https://..." className={inputClass} />
      </div>

      {/* Notes */}
      <div>
        <label className={labelClass}>Notes (Markdown)</label>
        <MarkdownEditor value={form.notes} onChange={val => set('notes', val)} placeholder="Add notes, context..." minHeight="120px" />
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
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

function InfoRow({ icon: Icon, color, children }: { icon: React.ElementType; color: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={14} />
      </div>
      <div className="min-w-0 pt-1">{children}</div>
    </div>
  );
}

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

  const emails = contact.emails?.length > 0 ? contact.emails : (contact.email ? [{ value: contact.email, label: 'main', primary: true }] : []);
  const phones = contact.phones?.length > 0 ? contact.phones : (contact.phone ? [{ value: contact.phone, label: 'mobile', primary: true }] : []);
  const addresses = contact.addresses ?? [];
  const websites = contact.websites ?? [];

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
                {contact.prefix && (
                  <p className="text-xs text-muted-foreground font-medium">{contact.prefix}</p>
                )}
                <p className="font-bold text-lg text-foreground truncate">{contact.name}</p>
                {contact.middle_name && (
                  <p className="text-xs text-muted-foreground">Middle: {contact.middle_name}</p>
                )}
                {contact.nickname && (
                  <p className="text-xs text-muted-foreground">"{contact.nickname}"</p>
                )}
                {(contact.job_title || contact.company) && (
                  <p className="text-sm text-muted-foreground truncate">
                    {[contact.job_title, contact.company].filter(Boolean).join(' · ')}
                  </p>
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
            {(emails.length > 0 || phones.length > 0 || addresses.length > 0 || websites.length > 0 || contact.company || contact.birthday) && (
              <div className="space-y-3">
                {emails.map((e, i) => (
                  <InfoRow key={i} icon={Mail} color="bg-blue-100 dark:bg-blue-950/60 text-blue-600">
                    <a href={`mailto:${e.value}`} className="text-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                      <span className="truncate">{e.value}</span>
                      <ExternalLink size={11} className="text-muted-foreground/50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <p className="text-xs text-muted-foreground capitalize">{e.label}</p>
                  </InfoRow>
                ))}

                {phones.map((p, i) => (
                  <InfoRow key={i} icon={Phone} color="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
                    <a href={`tel:${p.value}`} className="text-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                      <span>{p.value}</span>
                      <ExternalLink size={11} className="text-muted-foreground/50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <p className="text-xs text-muted-foreground capitalize">{p.label}</p>
                  </InfoRow>
                ))}

                {contact.company && (
                  <InfoRow icon={Building2} color="bg-violet-100 dark:bg-violet-950/60 text-violet-600">
                    <span className="text-foreground">{contact.company}</span>
                  </InfoRow>
                )}

                {contact.job_title && (
                  <InfoRow icon={BriefcaseIcon} color="bg-amber-100 dark:bg-amber-950/60 text-amber-600">
                    <span className="text-foreground">{contact.job_title}</span>
                  </InfoRow>
                )}

                {contact.birthday && (
                  <InfoRow icon={Calendar} color="bg-pink-100 dark:bg-pink-950/60 text-pink-600">
                    <span className="text-foreground">{contact.birthday}</span>
                  </InfoRow>
                )}

                {addresses.map((addr, i) => (
                  <InfoRow key={i} icon={MapPin} color="bg-orange-100 dark:bg-orange-950/60 text-orange-600">
                    <div className="text-foreground text-sm">
                      {addr.street && <div>{addr.street}</div>}
                      {(addr.city || addr.state || addr.zip) && (
                        <div>{[addr.city, addr.state, addr.zip].filter(Boolean).join(', ')}</div>
                      )}
                      {addr.country && <div>{addr.country}</div>}
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{addr.label}</p>
                  </InfoRow>
                ))}

                {websites.map((w, i) => (
                  <InfoRow key={i} icon={Globe} color="bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600">
                    <a href={w.value} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors flex items-center gap-2 group truncate">
                      <span className="truncate">{w.value.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink size={11} className="text-muted-foreground/50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <p className="text-xs text-muted-foreground capitalize">{w.label}</p>
                  </InfoRow>
                ))}
              </div>
            )}

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
  const email = primaryEmail(contact);
  const phone = primaryPhone(contact);

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
            {email && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail size={11} />
                <span className="truncate max-w-30">{email}</span>
              </span>
            )}
            {phone && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone size={11} />
                {phone}
              </span>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="relative z-10 flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity shrink-0">
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
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

// ─── CSV Import Dialog ────────────────────────────────────────────────────────

function CsvImportDialog({ onClose }: { onClose: () => void }) {
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const importCsv = useImportCsvContacts();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => setCsvText(ev.target?.result as string ?? '');
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!csvText.trim()) return;
    const result = await importCsv.mutateAsync(csvText);
    if (result.errors?.length) {
      console.warn('[csv-import] partial errors:', result.errors);
    }
    onClose();
  }

  const lineCount = csvText.split('\n').filter(Boolean).length;
  const rowCount = Math.max(0, lineCount - 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="font-semibold text-foreground">Import from CSV</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Supports Google Contacts, Apple Contacts, and phone exports</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* File picker */}
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              aria-label="Upload CSV file"
              onChange={handleFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-6 hover:border-primary/40 hover:bg-muted/50 transition-colors"
            >
              <Upload size={24} className="text-muted-foreground" />
              {fileName ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">{fileName}</p>
                  {rowCount > 0 && <p className="text-xs text-muted-foreground">{rowCount} row{rowCount !== 1 ? 's' : ''} detected</p>}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Choose a CSV file</p>
                  <p className="text-xs text-muted-foreground">or paste CSV text below</p>
                </div>
              )}
            </button>
          </div>

          {/* Paste area */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Or paste CSV content
            </label>
            <textarea
              value={csvText}
              onChange={e => { setCsvText(e.target.value); setFileName(''); }}
              placeholder={"Name,Email,Phone\nJane Smith,jane@example.com,+1 555 000 0001"}
              rows={5}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Column hints */}
          <div className="rounded-xl bg-muted/50 border border-border p-3">
            <p className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
              <FileText size={12} className="text-muted-foreground" />
              Supported columns
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              {[
                ['Name', 'name, first name, last name'],
                ['Email', 'email, email address'],
                ['Phone', 'phone, mobile, cell'],
                ['Company', 'company, organization'],
                ['Job Title', 'job title, title'],
                ['Birthday', 'birthday, birth date'],
                ['Address', 'street, city, state, zip'],
                ['Website', 'website, url'],
              ].map(([field, cols]) => (
                <div key={field} className="flex gap-1.5 text-xs">
                  <span className="font-medium text-foreground shrink-0">{field}:</span>
                  <span className="text-muted-foreground truncate">{cols}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={!csvText.trim() || importCsv.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {importCsv.isPending ? 'Importing…' : `Import${rowCount > 0 ? ` ${rowCount} contacts` : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'all' | 'favorites' | 'archived';

function ContactsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createParam = searchParams.get('create');
  const detailId = searchParams.get('detail');
  const editId = searchParams.get('edit');
  const deleteId = searchParams.get('delete');

  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [showCsvImport, setShowCsvImport] = useState(false);

  const { data: contacts = [], isLoading } = useContacts();
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();
  const bulk = useBulkSelection();
  const bulkUpdate = useBulkUpdateContacts();
  const bulkDelete = useBulkDeleteContacts();

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
      (c.nickname ?? '').toLowerCase().includes(q) ||
      (c.emails ?? []).some(e => e.value.toLowerCase().includes(q)) ||
      (c.phones ?? []).some(p => p.value.toLowerCase().includes(q)) ||
      (c.email ?? '').toLowerCase().includes(q) ||
      (c.phone ?? '').toLowerCase().includes(q) ||
      (c.company ?? '').toLowerCase().includes(q) ||
      (c.notes ?? '').toLowerCase().includes(q)
    );
  });

  async function handleCreate(data: ContactFormData) {
    await createContact.mutateAsync({
      name: data.name,
      prefix: data.prefix || null,
      middle_name: data.middle_name || null,
      nickname: data.nickname || null,
      birthday: data.birthday || null,
      emails: data.emails,
      phones: data.phones,
      addresses: data.addresses,
      websites: data.websites,
      social_links: [],
      email: data.emails[0]?.value ?? null,
      phone: data.phones[0]?.value ?? null,
      company: data.company || null,
      job_title: data.job_title || null,
      notes: data.notes || null,
      avatar_url: data.avatar_url || null,
    });
    close();
  }

  async function handleEdit(data: ContactFormData) {
    if (!editId) return;
    await updateContact.mutateAsync({
      id: editId,
      name: data.name,
      prefix: data.prefix || null,
      middle_name: data.middle_name || null,
      nickname: data.nickname || null,
      birthday: data.birthday || null,
      emails: data.emails,
      phones: data.phones,
      addresses: data.addresses,
      websites: data.websites,
      company: data.company || null,
      job_title: data.job_title || null,
      notes: data.notes || null,
      avatar_url: data.avatar_url || null,
    });
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
            <button
              type="button"
              onClick={() => setShowCsvImport(true)}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Import from CSV"
            >
              <Upload size={15} />
              <span className="hidden sm:inline">Import CSV</span>
            </button>
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

          <div className="relative flex-1 min-w-40 max-w-xs">
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
                aria-label="Clear search"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contact grid */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {(() => {
          const bulkActions: BulkAction[] = [
            {
              label: 'Favorite',
              icon: Star,
              onClick: () => {
                bulkUpdate.mutate({ ids: bulk.getArray(), updates: { favorite: true } });
                bulk.clear();
              },
              disabled: bulkUpdate.isPending,
            },
            {
              label: 'Archive',
              icon: Archive,
              onClick: () => {
                bulkUpdate.mutate({ ids: bulk.getArray(), updates: { archived: true } });
                bulk.clear();
              },
              disabled: bulkUpdate.isPending,
            },
            {
              label: 'Delete',
              icon: Trash2,
              variant: 'destructive' as const,
              onClick: () => {
                if (confirm(`Delete ${bulk.selectedCount} contact${bulk.selectedCount !== 1 ? 's' : ''}? This cannot be undone.`)) {
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
              onSelectAll={() => bulk.toggleAll(filtered.map(c => c.id), true)}
            />
          );
        })()}
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
              {!search && tab === 'all' && 'Add contacts manually or import from a CSV file.'}
            </p>
            {!search && tab === 'all' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCsvImport(true)}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Upload size={15} />
                  Import CSV
                </button>
                <Link
                  href="?create=true"
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <UserPlus size={15} />
                  New Contact
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(contact => (
              <div key={contact.id} className="relative group/sel">
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); bulk.toggle(contact.id); }}
                  aria-label={`${bulk.isSelected(contact.id) ? 'Deselect' : 'Select'}`}
                  className={`absolute top-2 left-2 z-30 flex items-center justify-center w-5 h-5 rounded border-2 transition-all ${
                    bulk.isSelected(contact.id)
                      ? 'bg-primary border-primary opacity-100'
                      : `bg-card border-border ${bulk.selectedCount > 0 ? 'opacity-100' : 'opacity-0 group-hover/sel:opacity-100'}`
                  }`}
                >
                  {bulk.isSelected(contact.id) && <Check size={11} className="text-primary-foreground" />}
                </button>
                {bulk.selectedCount > 0 && (
                  <div className="absolute inset-0 z-20 cursor-pointer rounded-xl" onClick={() => bulk.toggle(contact.id)} aria-hidden="true" />
                )}
                <ContactCard
                  contact={contact}
                  onAction={(action) => {
                    if (action === 'detail') router.push(`?detail=${contact.id}`);
                    else if (action === 'edit') router.push(`?edit=${contact.id}`);
                    else if (action === 'delete') setDeleteTarget(contact);
                    else if (action === 'favorite') toggleFavorite(contact);
                    else if (action === 'archive') toggleArchive(contact);
                  }}
                />
              </div>
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
            initial={contactToFormData(editContact)}
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

      {/* CSV import dialog */}
      {showCsvImport && (
        <CsvImportDialog onClose={() => setShowCsvImport(false)} />
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
