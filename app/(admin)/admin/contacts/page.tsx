'use client';

import { useState } from 'react';
import { Mail, Trash2, MailOpen, Search, X } from 'lucide-react';
import { useAdminContacts, useDeleteContact, useMarkContactRead } from '@/hooks/queries/use-contact';
import type { ContactMessage } from '@/types';
import { formatDistanceToNow } from 'date-fns';

function ContactDetail({ msg, onClose, onDelete }: { msg: ContactMessage; onClose: () => void; onDelete: () => void }) {
  const markRead = useMarkContactRead();

  function handleOpen() {
    if (!msg.read) markRead.mutate(msg.id);
  }

  // Mark as read when opened
  useState(() => { handleOpen(); });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 p-5 border-b border-border">
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{msg.name}</p>
            <p className="text-xs text-blue-600">{msg.email}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground shrink-0">
            <X size={18} />
          </button>
        </div>
        {msg.subject && (
          <div className="px-5 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Subject</p>
            <p className="text-sm text-foreground">{msg.subject}</p>
          </div>
        )}
        <div className="px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Message</p>
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{msg.message}</p>
        </div>
        <div className="flex items-center justify-between px-5 pb-5">
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
          </p>
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-600/10 transition-colors"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminContactsPage() {
  const { data: messages, isLoading } = useAdminContacts();
  const deleteContact = useDeleteContact();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const selected = messages?.find(m => m.id === selectedId) ?? null;

  const filtered = (messages ?? []).filter(m => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.subject ?? '').toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q)
    );
  });

  const unreadCount = (messages ?? []).filter(m => !m.read).length;

  function handleDelete(id: string) {
    deleteContact.mutate(id);
    if (selectedId === id) setSelectedId(null);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Contact Messages</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread · ` : ''}{(messages ?? []).length} total
          </p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600/30 w-56"
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
            <Mail size={30} className="text-muted-foreground/40" />
          </div>
          <p className="text-base font-semibold text-foreground mb-2">
            {search ? 'No messages match your search' : 'No messages yet'}
          </p>
          <p className="text-sm text-muted-foreground max-w-xs">
            {search ? 'Try a different search term.' : 'When someone submits the contact form, messages will appear here.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {filtered.map(msg => (
            <div
              key={msg.id}
              onClick={() => setSelectedId(msg.id)}
              className="group flex items-start gap-4 rounded-xl border border-border bg-card px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600/10">
                {msg.read
                  ? <MailOpen size={15} className="text-blue-600/60" />
                  : <Mail size={15} className="text-blue-600" />
                }
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className={`text-sm truncate ${msg.read ? 'font-medium text-foreground' : 'font-semibold text-foreground'}`}>
                    {msg.name}
                  </p>
                  {!msg.read && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                  )}
                  <p className="text-xs text-muted-foreground ml-auto shrink-0">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground truncate">{msg.email}</p>
                {msg.subject && (
                  <p className="text-xs text-foreground/70 truncate mt-0.5">{msg.subject}</p>
                )}
                <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.message}</p>
              </div>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); handleDelete(msg.id); }}
                className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all mt-0.5"
                aria-label="Delete message"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <ContactDetail
          msg={selected}
          onClose={() => setSelectedId(null)}
          onDelete={() => handleDelete(selected.id)}
        />
      )}
    </div>
  );
}
