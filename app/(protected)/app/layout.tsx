'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { CommandPalette } from '@/components/features/command-palette/CommandPalette';

const pageTitles: Record<string, string> = {
  '/app/dashboard': 'Dashboard',
  '/app/inbox': 'Inbox',
  '/app/notes': 'Notes',
  '/app/lists': 'Lists',
  '/app/self-chat': 'Self Chat',
  '/app/reminders': 'Reminders',
  '/app/collections': 'Collections',
  '/app/contacts': 'Contacts',
  '/app/shared': 'Shared',
  '/app/feedback': 'Feedback',
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
  const [paletteOpen, setPaletteOpen] = useState(false);
  const pathname = usePathname();
  const basePathname = '/' + pathname.split('/').slice(1, 3).join('/');
  const title = pageTitles[basePathname] ?? 'Zikron';

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setPaletteOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
          onPaletteOpen={() => setPaletteOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {modal}

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
