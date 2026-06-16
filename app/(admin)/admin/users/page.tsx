'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Users, Clock } from 'lucide-react';
import { useAdminUsers } from '@/hooks/queries/use-admin';
import { cacheItem } from '@/lib/page-state';
import { parseDialogState, closeDialogUrl } from '@/lib/dialog-url';
import { formatRelativeTime } from '@/utils/date';
import { UserDetailPanel } from '@/components/admin/UserDetailPanel';

const BASE = '/admin/users';

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const { data: users = [], isLoading } = useAdminUsers();

  const dialog = parseDialogState(searchParams);
  const closeUrl = closeDialogUrl(BASE, searchParams);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Users</h2>
        <p className="text-sm text-muted-foreground mt-0.5">View all registered users.</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <Users size={28} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No users yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(u => (
                <tr key={u.id} className="group relative hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`${BASE}?detail=${u.user_id}`}
                      scroll={false}
                      onClick={() => cacheItem({ ...u, id: u.user_id })}
                      className="absolute inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                      aria-label={`View user: ${u.full_name ?? u.email ?? u.user_id}`}
                    />
                    <div className="relative z-10 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                        {(u.full_name?.[0] ?? u.email?.[0] ?? '?').toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground font-medium truncate">{u.full_name ?? '—'}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`relative z-10 text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'admin' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400' : 'bg-muted text-muted-foreground'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`relative z-10 text-xs px-2 py-0.5 rounded-full font-medium ${u.status === 'active' ? 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-950/60 text-red-600'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="relative z-10 text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={11} />
                      {formatRelativeTime(u.created_at)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {dialog?.action === 'detail' && dialog.id && (
        <UserDetailPanel userId={dialog.id} listRoute={BASE} fullPage={false} />
      )}
    </div>
  );
}
