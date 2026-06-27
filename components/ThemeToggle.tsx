'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground/40">
        <Monitor size={16} />
      </div>
    );
  }

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const;

  const current = themes.find(t => t.value === theme) ?? themes[2];
  const CurrentIcon = current.icon;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Toggle theme"
        aria-expanded={open ? 'true' : 'false'}
      >
        <CurrentIcon size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-32 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
          {themes.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => { setTheme(value); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-sm transition-colors
                ${theme === value
                  ? 'text-foreground bg-muted font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
