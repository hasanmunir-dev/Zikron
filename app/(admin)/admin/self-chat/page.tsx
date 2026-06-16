'use client';

import { useState } from 'react';
import { MessageSquare, Clock, Star, Search, X, Trash2 } from 'lucide-react';
import { useAdminSelfChat, useAdminDeleteMessage } from '@/hooks/queries/use-admin';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { formatRelativeTime } from '@/utils/date';

export default function AdminSelfChatPage() {
  const { data: messages = [], isLoading } = useAdminSelfChat();
  const deleteMessage = useAdminDeleteMessage();
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{ id: string; preview: string } | null>(null);

  const filtered = search
    ? messages.filter(m =>
        m.content.toLowerCase().includes(search.toLowerCase()) ||
        (m.profiles?.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (m.profiles?.full_name ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : messages;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Self Chat Messages</h2>
          <p className="text-sm text-muted-foreground mt-0.5">All self-chat messages across all users.</p>
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} message{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by message content or user..."
          className="w-full pl-9 pr-8 py-2 text-sm border border-border rounded-lg bg-muted text-foreground placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {search && (
          <button type="button" aria-label="Clear search" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare size={28} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{search ? 'No messages match your search.' : 'No messages found.'}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Preview</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Owner</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Sent</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(msg => (
                <tr key={msg.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      {msg.is_favorite && (
                        <Star size={12} className="text-amber-400 fill-amber-400 mt-0.5 shrink-0" />
                      )}
                      <p className="text-foreground text-sm leading-relaxed line-clamp-2">{msg.content}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-foreground text-xs truncate">{msg.profiles?.full_name ?? '—'}</p>
                    <p className="text-muted-foreground text-xs truncate">{msg.profiles?.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={11} />
                      {formatRelativeTime(msg.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setPendingDelete({ id: msg.id, preview: msg.content.slice(0, 60) })}
                        className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 text-muted-foreground hover:text-red-500 transition-colors"
                        title="Delete message"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <DeleteConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={open => { if (!open) setPendingDelete(null); }}
        title="Delete Message?"
        description="This action cannot be undone."
        itemName={pendingDelete?.preview}
        onConfirm={() => {
          if (pendingDelete) deleteMessage.mutate(pendingDelete.id, { onSettled: () => setPendingDelete(null) });
        }}
        isLoading={deleteMessage.isPending}
      />
    </div>
  );
}
