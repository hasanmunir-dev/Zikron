'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
const pageTitles: Record<string, string> = {
  '/app/dashboard': 'Dashboard',
  '/app/inbox': 'Inbox',
  '/app/notes': 'Notes',
  '/app/self-chat': 'Self Chat',
  '/app/reminders': 'Reminders',
  '/app/collections': 'Collections',
  '/app/settings': 'Settings',
  '/app/search': 'Search',
};

export default function AppLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  // Strip dynamic segments for title lookup (e.g. /app/notes/123 → /app/notes)
  const basePathname = '/' + pathname.split('/').slice(1, 3).join('/');
  const title = pageTitles[basePathname] ?? 'Zikron';

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Portal target for URL-based modals (parallel route slot).
          Rendered outside <main> so fixed-position modals overlay the full screen. */}
      {modal}
    </div>
  );
}
