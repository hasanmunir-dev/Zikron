'use client';

import Link from 'next/link';
import {
  Users, BookOpen, Inbox, MessageSquare, UserCheck, UserX, Clock, Table2,
  Bell, AlertCircle, MessageSquarePlus, GitCommit, Link2, AlertTriangle,
  FolderOpen, Users2, BellRing, Share2,
} from 'lucide-react';
import { useAdminStats, useAdminUsers, useAdminLists, useAdminReminders } from '@/hooks/queries/use-admin';
import { useAdminSharedLinks } from '@/hooks/queries/use-shared-links';
import { formatRelativeTime } from '@/utils/date';
import type { AdminList, AdminReminder, AdminSharedLink } from '@/types';

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-muted rounded animate-pulse ${className}`} />;
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: users = [], isLoading: usersLoading } = useAdminUsers();
  const { data: lists = [], isLoading: listsLoading } = useAdminLists();
  const { data: reminders = [], isLoading: remindersLoading } = useAdminReminders();
  const { data: sharedLinks = [], isLoading: sharedLoading } = useAdminSharedLinks();

  const recentUsers = users.slice(0, 5);
  const recentLists = (lists as AdminList[]).slice(0, 4);
  const recentReminders = (reminders as AdminReminder[]).slice(0, 4);
  const recentShared = (sharedLinks as AdminSharedLink[]).slice(0, 4);

  const statCards = [
    { label: 'Total Users',    value: stats?.totalUsers          ?? '—', icon: Users,             color: 'text-blue-600 bg-blue-100 dark:bg-blue-950/60',         href: '/admin/users' },
    { label: 'Active Users',   value: stats?.activeUsers         ?? '—', icon: UserCheck,          color: 'text-green-600 bg-green-100 dark:bg-green-950/60',      href: '/admin/users' },
    { label: 'Disabled',       value: stats?.disabledUsers       ?? '—', icon: UserX,              color: 'text-red-500 bg-red-100 dark:bg-red-950/60',            href: '/admin/users' },
    { label: 'Total Notes',    value: stats?.totalNotes          ?? '—', icon: BookOpen,           color: 'text-violet-600 bg-violet-100 dark:bg-violet-950/60',   href: '/admin/notes' },
    { label: 'Inbox Items',    value: stats?.totalInbox          ?? '—', icon: Inbox,              color: 'text-blue-600 bg-blue-100 dark:bg-blue-950/60',         href: '/admin/inbox' },
    { label: 'Messages',       value: stats?.totalMessages       ?? '—', icon: MessageSquare,      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60', href: '/admin/self-chat' },
    { label: 'Total Lists',    value: stats?.totalLists          ?? '—', icon: Table2,             color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950/60',   href: '/admin/lists' },
    { label: 'Reminders',      value: stats?.totalReminders      ?? '—', icon: Bell,               color: 'text-amber-600 bg-amber-100 dark:bg-amber-950/60',      href: '/admin/reminders' },
    { label: 'Overdue',        value: stats?.overdueReminders    ?? '—', icon: AlertCircle,        color: 'text-red-500 bg-red-100 dark:bg-red-950/60',            href: '/admin/reminders' },
    { label: 'Collections',    value: stats?.totalCollections    ?? '—', icon: FolderOpen,         color: 'text-fuchsia-600 bg-fuchsia-100 dark:bg-fuchsia-950/60', href: '/admin/collections' },
    { label: 'Contacts',       value: stats?.totalContacts       ?? '—', icon: Users2,             color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-950/60',         href: '/admin/contacts' },
    { label: 'Shared Links',   value: stats?.totalSharedLinks    ?? '—', icon: Link2,              color: 'text-violet-600 bg-violet-100 dark:bg-violet-950/60',   href: '/admin/shared' },
    { label: 'Suspicious',     value: stats?.suspiciousAccesses  ?? '—', icon: AlertTriangle,      color: 'text-amber-600 bg-amber-100 dark:bg-amber-950/60',      href: '/admin/shared' },
    { label: 'Feedback',       value: stats?.totalFeedback       ?? '—', icon: MessageSquarePlus,  color: 'text-purple-600 bg-purple-100 dark:bg-purple-950/60',   href: '/admin/feedback' },
    { label: 'Open Feedback',  value: stats?.openFeedback        ?? '—', icon: MessageSquare,      color: 'text-blue-600 bg-blue-100 dark:bg-blue-950/60',         href: '/admin/feedback' },
    { label: 'Changelogs',     value: stats?.publishedChangelogs ?? '—', icon: GitCommit,          color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60', href: '/admin/changelog' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
        <p className="text-muted-foreground mt-1 text-sm">System overview and recent activity.</p>
      </div>

      {/* ── Stats grid ── */}
      <section>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">System Statistics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {statCards.map(({ label, value, icon: Icon, color, href }) => (
            <Link key={label} href={href} className="bg-card border border-border rounded-xl p-3 hover:shadow-sm transition-all">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
                <Icon size={15} />
              </div>
              <p className="text-xl font-bold text-foreground">
                {statsLoading ? <Skeleton className="inline-block w-6 h-5" /> : value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Alert: suspicious accesses ── */}
      {!statsLoading && (stats?.suspiciousAccesses ?? 0) > 0 && (
        <Link
          href="/admin/shared"
          className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
        >
          <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              {stats?.suspiciousAccesses} suspicious access{(stats?.suspiciousAccesses ?? 0) !== 1 ? 'es' : ''} detected across platform
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Review shared links for potential link leaks.</p>
          </div>
        </Link>
      )}

      {/* ── Main grid: recent tables ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Users */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Users</h3>
            <Link href="/admin/users" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {usersLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No users yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">User</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Role</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden md:table-cell">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentUsers.map(u => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {(u.full_name?.[0] ?? u.email?.[0] ?? '?').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-foreground font-medium truncate text-xs">{u.full_name ?? '—'}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 hidden sm:table-cell">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${u.role === 'admin' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400' : 'bg-muted text-muted-foreground'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 hidden md:table-cell">
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(u.created_at)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Recent Reminders */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Reminders</h3>
            <Link href="/admin/reminders" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {remindersLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : recentReminders.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No reminders yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Reminder</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Owner</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden md:table-cell">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentReminders.map(r => {
                    const now = new Date();
                    const isOverdue = r.status === 'pending' && r.due_at && new Date(r.due_at) < now;
                    return (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <Bell size={12} className={isOverdue ? 'text-red-500' : 'text-amber-500'} />
                            <span className="text-xs font-medium text-foreground truncate max-w-[150px]">{r.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 hidden sm:table-cell">
                          <span className="text-xs text-muted-foreground">{r.owner?.email ?? '—'}</span>
                        </td>
                        <td className="px-4 py-2.5 hidden md:table-cell">
                          {r.due_at ? (
                            <span className={`text-xs ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                              {new Date(r.due_at).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/50">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Recent Shared Links */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Shared Links</h3>
            <Link href="/admin/shared" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {sharedLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : recentShared.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No shared links yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Item</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Type</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden md:table-cell">Status</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentShared.map((link) => {
                    const isExpired = link.expires_at && new Date(link.expires_at) < new Date();
                    const status = link.is_revoked ? 'revoked' : isExpired ? 'expired' : 'active';
                    return (
                      <tr key={link.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <Share2 size={12} className="text-muted-foreground shrink-0" />
                            <span className="text-xs font-medium text-foreground capitalize">{link.item_type}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 hidden sm:table-cell">
                          <span className="text-xs text-muted-foreground capitalize">{link.share_type}</span>
                        </td>
                        <td className="px-4 py-2.5 hidden md:table-cell">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            status === 'active' ? 'bg-green-100 dark:bg-green-950/60 text-green-700' :
                            status === 'revoked' ? 'bg-red-100 dark:bg-red-950/60 text-red-600' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground">{link.view_count ?? 0}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Recent Lists */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Lists</h3>
            <Link href="/admin/lists" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {listsLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : recentLists.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No lists yet.</div>
            ) : (
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
                          <div className="w-5 h-5 rounded bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
                            <Table2 size={11} className="text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <Link href={`/admin/lists/${list.id}`} className="text-xs font-medium text-foreground hover:text-blue-600 truncate max-w-[160px]">
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
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
