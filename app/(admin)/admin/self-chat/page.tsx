'use client';

import { MessageSquare, Clock, Star } from 'lucide-react';
import { useAdminSelfChat } from '@/hooks/queries/use-admin';
import { formatRelativeTime } from '@/utils/date';

export default function AdminSelfChatPage() {
  const { data: messages = [], isLoading } = useAdminSelfChat();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Self Chat Messages</h2>
        <p className="text-sm text-muted-foreground mt-0.5">All self-chat messages across all users (most recent 100).</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare size={28} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No messages found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Message</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Sent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {messages.map(msg => (
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
