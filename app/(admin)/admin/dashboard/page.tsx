'use client';

import Link from 'next/link';
import { Users, BookOpen, Inbox, MessageSquare, UserCheck, UserX, Clock, Table2, ListChecks, Bell, AlertCircle, MessageSquarePlus, GitCommit, Link2, AlertTriangle } from 'lucide-react';
import { useAdminStats, useAdminUsers, useAdminLists } from '@/hooks/queries/use-admin';
import { formatRelativeTime } from '@/utils/date';
import type { AdminList } from '@/types';

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: users = [], isLoading: usersLoading } = useAdminUsers();
  const { data: lists = [], isLoading: listsLoading } = useAdminLists();

  const loading = statsLoading || usersLoading || listsLoading;
  const recentUsers = users.slice(0, 5);
  const recentLists = (lists as AdminList[]).slice(0, 4);

  const statCards = [
    { label: 'Total Users',    value: stats?.totalUsers      ?? '—', icon: Users,        color: 'text-blue-600 bg-blue-100 dark:bg-blue-950/60' },
    { label: 'Total Notes',    value: stats?.totalNotes      ?? '—', icon: BookOpen,      color: 'text-violet-600 bg-violet-100 dark:bg-violet-950/60' },
    { label: 'Inbox Items',    value: stats?.totalInbox      ?? '—', icon: Inbox,         color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60' },
    { label: 'Total Lists',    value: stats?.totalLists      ?? '—', icon: Table2,        color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950/60' },
    { label: 'Reminders',      value: stats?.totalReminders  ?? '—', icon: Bell,               color: 'text-amber-600 bg-amber-100 dark:bg-amber-950/60' },
    { label: 'Overdue',        value: stats?.overdueReminders ?? '—', icon: AlertCircle,       color: 'text-red-500 bg-red-100 dark:bg-red-950/60' },
    { label: 'Feedback',       value: stats?.totalFeedback   ?? '—', icon: MessageSquarePlus,  color: 'text-purple-600 bg-purple-100 dark:bg-purple-950/60' },
    { label: 'Open Feedback',  value: stats?.openFeedback    ?? '—', icon: MessageSquare,      color: 'text-blue-600 bg-blue-100 dark:bg-blue-950/60' },
    { label: 'Changelogs',     value: stats?.publishedChangelogs ?? '—', icon: GitCommit,      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60' },
    { label: 'Active Users',   value: stats?.activeUsers     ?? '—', icon: UserCheck,          color: 'text-green-600 bg-green-100 dark:bg-green-950/60' },
    { label: 'Disabled',       value: stats?.disabledUsers   ?? '—', icon: UserX,              color: 'text-red-500 bg-red-100 dark:bg-red-950/60' },
    { label: 'Shared Links',   value: stats?.totalSharedLinks ?? '—', icon: Link2,             color: 'text-violet-600 bg-violet-100 dark:bg-violet-950/60' },
    { label: 'Suspicious',     value: stats?.suspiciousAccesses ?? '—', icon: AlertTriangle,   color: 'text-amber-600 bg-amber-100 dark:bg-amber-950/60' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
        <p className="text-muted-foreground mt-1 text-sm">System overview and recent activity.</p>
      </div>

      {/* Stats grid */}
      <section>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">System Statistics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
                <Icon size={15} />
              </div>
              <p className="text-xl font-bold text-foreground">
                {statsLoading ? <span className="inline-block w-6 h-5 bg-muted rounded animate-pulse" /> : value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Lists */}
      {!listsLoading && recentLists.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Lists</h3>
            <Link href="/admin/lists" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">List</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Owner</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden md:table-cell">Rows</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentLists.map(list => (
                  <tr key={list.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
                          <Table2 size={12} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <Link href={`/admin/lists/${list.id}`} className="text-sm font-medium text-foreground hover:text-blue-600 truncate max-w-xs">
                          {list.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground">{list.owner?.email ?? '—'}</span>
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">{list.row_count ?? 0}</span>
                    </td>
                    <td className="px-4 py-2.5 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={11} />
                        {formatRelativeTime(list.created_at)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Recent users */}
      <section>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Users</h3>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {usersLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
          ) : recentUsers.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No users yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentUsers.map(u => (
                  <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                          {(u.full_name?.[0] ?? u.email?.[0] ?? '?').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-foreground font-medium truncate">{u.full_name ?? '—'}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'admin' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400' : 'bg-muted text-muted-foreground'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.status === 'active' ? 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-950/60 text-red-600'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
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
      </section>
    </div>
  );
}
