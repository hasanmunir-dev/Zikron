'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Inbox, BookOpen, MessageSquare,
  Bell, FolderOpen, Settings, LogOut, X, ShieldCheck, Table2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/app/inbox', icon: Inbox, label: 'Inbox' },
  { href: '/app/notes', icon: BookOpen, label: 'Notes' },
  { href: '/app/lists', icon: Table2, label: 'Lists' },
  { href: '/app/self-chat', icon: MessageSquare, label: 'Self Chat' },
  { href: '/app/reminders', icon: Bell, label: 'Reminders' },
  { href: '/app/collections', icon: FolderOpen, label: 'Collections' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, role, signOut } = useAuth();

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'Z';

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
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
          <Link href="/app/dashboard" className="text-lg font-bold text-blue-600">
            Zikron
          </Link>
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
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
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
          })}
        </nav>

        {/* Bottom: settings + user */}
        <div className="border-t border-border px-3 py-3 space-y-0.5">
          {role === 'admin' && (
            <Link
              href="/admin/dashboard"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
            >
              <ShieldCheck size={17} />
              Admin Panel
            </Link>
          )}
          <Link
            href="/app/settings"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${pathname === '/app/settings'
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
                {user?.user_metadata?.full_name ?? 'My Account'}
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
