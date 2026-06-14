'use client';

import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Shield, LogOut, Palette } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AdminSettingsPage() {
  const { user, signOut } = useAuth();
  const name = user?.user_metadata?.full_name ?? '';

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground">Admin Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage admin account and preferences.</p>
      </div>

      <section className="mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Profile</h3>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 flex items-center gap-4 border-b border-border">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0">
              {(name[0] ?? user?.email?.[0] ?? 'A').toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-foreground">{name || 'Admin'}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <span className="text-xs bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">Admin</span>
            </div>
          </div>
          <div className="divide-y divide-border">
            <div className="px-4 py-3 flex items-center gap-3">
              <User size={16} className="text-muted-foreground/40 shrink-0" />
              <span className="text-sm text-muted-foreground w-28 shrink-0">Full name</span>
              <span className="text-sm text-foreground">{name || '—'}</span>
            </div>
            <div className="px-4 py-3 flex items-center gap-3">
              <Mail size={16} className="text-muted-foreground/40 shrink-0" />
              <span className="text-sm text-muted-foreground w-28 shrink-0">Email</span>
              <span className="text-sm text-foreground">{user?.email ?? '—'}</span>
            </div>
            <div className="px-4 py-3 flex items-center gap-3">
              <Shield size={16} className="text-muted-foreground/40 shrink-0" />
              <span className="text-sm text-muted-foreground w-28 shrink-0">Role</span>
              <span className="text-sm text-foreground">Admin</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Preferences</h3>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            <div className="px-4 py-3 flex items-center gap-3">
              <Palette size={16} className="text-muted-foreground/40 shrink-0" />
              <span className="text-sm text-foreground flex-1">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={signOut}
        className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium transition-colors px-1"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </div>
  );
}
