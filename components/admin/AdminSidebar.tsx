'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, BookOpen, Inbox,
  MessageSquare, Settings, LogOut, X, ShieldCheck, Bell, FolderOpen, Table2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const mySpaceItems = [
  {href: '/admin/my-dashboard', icon: LayoutDashboard, label: 'My Dashboard' },
  { href: '/admin/my-notes', icon: BookOpen, label: 'My Notes' },
  {href: '/admin/my-lists', icon: Table2, label: 'My Lists' },
  { href: '/admin/my-inbox', icon: Inbox, label: 'My Inbox' },
  { href: '/admin/my-chat', icon: MessageSquare, label: 'My Chat' },
  { href: '/admin/my-reminders', icon: Bell, label: 'My Reminders' },
  { href: '/admin/my-collections', icon: FolderOpen, label: 'My Collections' },
];

const systemItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/notes', icon: BookOpen, label: 'All Notes' },
  { href: '/admin/inbox', icon: Inbox, label: 'All Inbox' },
  { href: '/admin/lists', icon: Table2, label: 'All Lists' },
  { href: '/admin/self-chat', icon: MessageSquare, label: 'All Messages' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'A';

  function navLink(href: string, icon: React.ElementType, label: string) {
    const Icon = icon;
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        onClick={onClose}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${active
            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
        `}
      >
        <Icon size={17} className={active ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'} />
        {label}
      </Link>
    );
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-60 bg-card border-r border-border z-30 flex flex-col
          transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-blue-600" />
            <span className="text-lg font-bold text-foreground">Admin</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
          {/* My Space */}
          <div>
            <p className="px-3 mb-1 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">My Space</p>
            <div className="space-y-0.5">
              {mySpaceItems.map(({ href, icon, label }) => navLink(href, icon, label))}
            </div>
          </div>

          {/* System */}
          <div>
            <p className="px-3 mb-1 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">System</p>
            <div className="space-y-0.5">
              {systemItems.map(({ href, icon, label }) => navLink(href, icon, label))}
            </div>
          </div>
        </nav>

        {/* Bottom */}
        <div className="border-t border-border px-3 py-3 space-y-0.5">
          <Link
            href="/admin/settings"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${pathname === '/admin/settings'
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <Settings size={17} className="text-muted-foreground" />
            Settings
          </Link>

          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {user?.user_metadata?.full_name ?? 'Admin'}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="text-muted-foreground hover:text-red-500 transition-colors"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
