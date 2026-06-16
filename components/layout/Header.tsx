'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Search, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/app/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

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

      <h1 className="font-semibold text-foreground text-sm hidden sm:block">{title}</h1>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex-1  ml-auto lg:ml-0">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search everything..."
            className="w-full pl-9 pr-8 py-1.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-background focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </form>

      <ThemeToggle />
    </header>
  );
}
