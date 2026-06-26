'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
  Users,
  Search,
  X,
  Trash2,
  Phone,
  Mail,
  Building2,
  Star,
  User,
} from 'lucide-react';
import { useAdminContacts, useAdminDeleteContact } from '@/hooks/queries/use-contacts';
import { MarkdownViewer } from '@/components/editor/markdown-viewer';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { formatDistanceToNow } from 'date-fns';
import type { AdminContact } from '@/types';

function AdminContactDetail({ contact, onClose, onDelete }: {
  contact: AdminContact;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const initials = contact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
        <div
          className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">{contact.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  Owner: {contact.owner?.email ?? contact.user_id}
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground shrink-0">
              <X size={18} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {contact.email && (
                <div className="flex items-center gap-2 col-span-2">
                  <Mail size={13} className="text-muted-foreground shrink-0" />
                  <span className="text-foreground truncate">{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-muted-foreground shrink-0" />
                  <span className="text-foreground">{contact.phone}</span>
                </div>
              )}
              {contact.company && (
                <div className="flex items-center gap-2">
                  <Building2 size={13} className="text-muted-foreground shrink-0" />
                  <span className="text-foreground truncate">{contact.company}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Source</p>
                <p className="text-sm font-medium text-foreground capitalize">{contact.source.replace('_', ' ')}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Status</p>
                <div className="flex items-center gap-1.5">
                  {contact.favorite && <span className="text-amber-500 text-xs flex items-center gap-1"><Star size={11} className="fill-current" />Favorite</span>}
                  {contact.archived && <span className="text-xs text-muted-foreground">Archived</span>}
                  {!contact.favorite && !contact.archived && <span className="text-xs text-foreground">Active</span>}
                </div>
              </div>
            </div>

            {contact.job_title && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Job Title</p>
                <p className="text-sm text-foreground">{contact.job_title}</p>
              </div>
            )}

            {contact.notes && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Notes</p>
                <div className="rounded-lg bg-muted/50 border border-border p-3">
                  <MarkdownViewer content={contact.notes} />
                </div>
              </div>
            )}

            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Owner Profile</p>
              <div className="rounded-lg border border-border p-3 space-y-1.5">
                <p className="text-xs"><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{contact.owner?.email ?? '—'}</span></p>
                <p className="text-xs"><span className="text-muted-foreground">Name:</span> <span className="text-foreground">{contact.owner?.full_name ?? '—'}</span></p>
                <p className="text-xs"><span className="text-muted-foreground">Role:</span> <span className="text-foreground capitalize">{contact.owner?.role ?? '—'}</span></p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-5 pb-5">
            <p className="text-xs text-muted-foreground">
              Created {formatDistanceToNow(new Date(contact.created_at), { addSuffix: true })}
            </p>
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

      <DeleteConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete Contact"
        description="This contact will be permanently deleted from the user's account."
        itemName={contact.name}
        onConfirm={() => { setConfirmDelete(false); onDelete(); }}
      />
    </>
  );
}

function AdminContactsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const detailId = searchParams.get('detail');

  const [search, setSearch] = useState('');
  const { data: contacts = [], isLoading } = useAdminContacts();
  const deleteContact = useAdminDeleteContact();

  const selected = contacts.find(c => c.id === detailId) ?? null;

  function close() {
    router.replace('/admin/contacts', { scroll: false });
  }

  function handleDelete(id: string) {
    deleteContact.mutate(id);
    if (detailId === id) close();
  }

  const filtered = (contacts as AdminContact[]).filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q) ||
      (c.phone ?? '').toLowerCase().includes(q) ||
      (c.company ?? '').toLowerCase().includes(q) ||
      (c.owner?.email ?? '').toLowerCase().includes(q) ||
      (c.owner?.full_name ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">User Contacts</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{contacts.length} total contacts across all users</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 w-56"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-5">
            <Users size={30} className="text-muted-foreground/40" />
          </div>
          <p className="text-base font-semibold text-foreground mb-2">
            {search ? 'No contacts match your search' : 'No contacts yet'}
          </p>
          <p className="text-sm text-muted-foreground max-w-xs">
            {search ? 'Try a different search term.' : 'Contacts will appear here once users create them.'}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Contact</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden md:table-cell">Owner</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Source</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Created</th>
                <th className="px-4 py-2.5 sr-only">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((contact: AdminContact) => {
                const initials = contact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <tr
                    key={contact.id}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => router.push(`?detail=${contact.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm flex items-center gap-1.5">
                            {contact.name}
                            {contact.favorite && <Star size={11} className="text-amber-500 fill-current" />}
                          </p>
                          {contact.job_title && (
                            <p className="text-xs text-muted-foreground">{contact.job_title}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground">{contact.email ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">{contact.owner?.email ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">
                        {contact.source.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(contact.created_at), { addSuffix: true })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); handleDelete(contact.id); }}
                        className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                        aria-label="Delete contact"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <AdminContactDetail
          contact={selected}
          onClose={close}
          onDelete={() => handleDelete(selected.id)}
        />
      )}
    </div>
  );
}

export default function AdminContactsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <AdminContactsContent />
    </Suspense>
  );
}
