'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Search,
  LayoutDashboard,
  Inbox,
  BookOpen,
  Table2,
  MessageSquare,
  Bell,
  FolderOpen,
  Users,
  Link2,
  Settings,
  Plus,
  ArrowRight,
  FileText,
  X,
  LayoutTemplate,
  Calendar,
  GitBranch,
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { label: 'Go to Dashboard', icon: LayoutDashboard, href: '/app/dashboard', group: 'Navigate' },
  { label: 'Go to Inbox', icon: Inbox, href: '/app/inbox', group: 'Navigate' },
  { label: 'Go to Notes', icon: BookOpen, href: '/app/notes', group: 'Navigate' },
  { label: 'Go to Lists', icon: Table2, href: '/app/lists', group: 'Navigate' },
  { label: 'Go to Self Chat', icon: MessageSquare, href: '/app/self-chat', group: 'Navigate' },
  { label: 'Go to Reminders', icon: Bell, href: '/app/reminders', group: 'Navigate' },
  { label: 'Go to Collections', icon: FolderOpen, href: '/app/collections', group: 'Navigate' },
  { label: 'Go to Contacts', icon: Users, href: '/app/contacts', group: 'Navigate' },
  { label: 'Go to Shared', icon: Link2, href: '/app/shared', group: 'Navigate' },
  { label: 'Go to Settings', icon: Settings, href: '/app/settings', group: 'Navigate' },
  { label: 'Go to Templates', icon: LayoutTemplate, href: '/app/templates', group: 'Navigate' },
  { label: 'Go to Calendar', icon: Calendar, href: '/app/calendar', group: 'Navigate' },
  { label: 'Go to Timeline', icon: GitBranch, href: '/app/timeline', group: 'Navigate' },
];

const templateItems = [
  { label: 'Browse Templates', icon: LayoutTemplate, href: '/app/templates' },
  { label: 'New Note Template', icon: BookOpen, href: '/app/templates?create=true&type=note' },
  { label: 'New Reminder Template', icon: Bell, href: '/app/templates?create=true&type=reminder' },
  { label: 'New List Template', icon: Table2, href: '/app/templates?create=true&type=list' },
];

const createItems = [
  { label: 'New Note', icon: BookOpen, href: '/app/notes?create=true', group: 'Create' },
  { label: 'Capture Inbox', icon: Inbox, href: '/app/inbox?create=true', group: 'Create' },
  { label: 'New List', icon: Table2, href: '/app/lists/new', group: 'Create' },
  { label: 'New Reminder', icon: Bell, href: '/app/reminders?create=true', group: 'Create' },
  { label: 'New Collection', icon: FolderOpen, href: '/app/collections?create=true', group: 'Create' },
  { label: 'Add Contact', icon: Users, href: '/app/contacts?create=true', group: 'Create' },
];

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const handleSelect = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router],
  );

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      onClose();
      router.push(`/app/search?q=${encodeURIComponent(query.trim())}`);
    }
  }, [query, onClose, router]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette */}
      <div className="relative w-full max-w-xl mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        <Command className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-separator]]:h-px [&_[cmdk-separator]]:bg-border [&_[cmdk-separator]]:my-1">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search size={16} className="text-muted-foreground shrink-0" />
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Search everything or type a command..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear"
              >
                <X size={14} />
              </button>
            )}
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[360px] overflow-y-auto py-2">
            <Command.Empty className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results found.{' '}
              {query.trim() && (
                <button
                  onClick={handleSearch}
                  className="text-blue-600 hover:underline ml-1"
                >
                  Search &quot;{query}&quot; in all content
                </button>
              )}
            </Command.Empty>

            {/* Search action — shown when user has typed something */}
            {query.trim() && (
              <Command.Group heading="Search">
                <Command.Item
                  value={`search-${query}`}
                  onSelect={handleSearch}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer rounded-lg mx-1 aria-selected:bg-muted hover:bg-muted transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                    <Search size={14} className="text-blue-600" />
                  </div>
                  <span className="flex-1 text-foreground">
                    Search for &quot;<span className="font-medium">{query}</span>&quot;
                  </span>
                  <ArrowRight size={13} className="text-muted-foreground" />
                </Command.Item>
              </Command.Group>
            )}

            {/* Create actions */}
            <Command.Group heading="Create">
              {createItems.map(item => (
                <Command.Item
                  key={item.href}
                  value={`create-${item.label}`}
                  onSelect={() => handleSelect(item.href)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer rounded-lg mx-1 aria-selected:bg-muted hover:bg-muted transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                    <Plus size={14} className="text-emerald-600" />
                  </div>
                  <span className="flex-1 text-foreground">{item.label}</span>
                  <item.icon size={13} className="text-muted-foreground" />
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Separator />

            {/* Templates */}
            <Command.Group heading="Templates">
              {templateItems.map(item => (
                <Command.Item
                  key={item.href}
                  value={`template-${item.label}`}
                  onSelect={() => handleSelect(item.href)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer rounded-lg mx-1 aria-selected:bg-muted hover:bg-muted transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center shrink-0">
                    <LayoutTemplate size={14} className="text-violet-600" />
                  </div>
                  <span className="flex-1 text-foreground">{item.label}</span>
                  <item.icon size={13} className="text-muted-foreground" />
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Separator />

            {/* Navigation */}
            <Command.Group heading="Navigate">
              {navItems.map(item => (
                <Command.Item
                  key={item.href}
                  value={`nav-${item.label}`}
                  onSelect={() => handleSelect(item.href)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer rounded-lg mx-1 aria-selected:bg-muted hover:bg-muted transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <item.icon size={14} className="text-muted-foreground" />
                  </div>
                  <span className="flex-1 text-foreground">{item.label}</span>
                  <ArrowRight size={13} className="text-muted-foreground" />
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          {/* Footer */}
          <div className="flex items-center gap-3 px-4 py-2 border-t border-border bg-muted/40">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <kbd className="inline-flex h-4 items-center rounded border border-border bg-card px-1 text-[10px]">↑↓</kbd>
              navigate
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <kbd className="inline-flex h-4 items-center rounded border border-border bg-card px-1 text-[10px]">↵</kbd>
              open
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <kbd className="inline-flex h-4 items-center rounded border border-border bg-card px-1 text-[10px]">esc</kbd>
              close
            </span>
            <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
              <FileText size={10} />
              Zikron
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}
