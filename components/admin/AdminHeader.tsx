'use client';

import { Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Props {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: Props) {
  return (
    <header className="h-14 border-b border-border bg-card px-4 flex items-center gap-4 shrink-0">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
      >
        <Menu size={20} />
      </button>

      <span className="text-sm font-semibold text-muted-foreground hidden sm:block">Admin Panel</span>

      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}
