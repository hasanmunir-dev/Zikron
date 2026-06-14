'use client';

import { useAuth } from '@/hooks/useAuth';
import { User, Mail, LogOut, Shield, Palette } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const name = user?.user_metadata?.full_name ?? '';

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <section className="mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Profile</h3>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 flex items-center gap-4 border-b border-border">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0">
              {(name[0] ?? user?.email?.[0] ?? 'Z').toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-foreground">{name || 'My Account'}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="divide-y divide-border">
            <SettingRow icon={User} label="Full name" value={name || '—'} />
            <SettingRow icon={Mail} label="Email" value={user?.email ?? '—'} />
          </div>
        </div>
      </section>

      {/* Preferences */}
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
        <p className="text-xs text-muted-foreground mt-2 px-1">More preferences coming in Phase 2.</p>
      </section>

      {/* Account */}
      <section className="mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Account</h3>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            <div className="px-4 py-3 flex items-center gap-3">
              <Shield size={16} className="text-muted-foreground/40 shrink-0" />
              <span className="text-sm text-foreground flex-1">Data storage</span>
              <span className="text-xs text-muted-foreground">Local + Supabase</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sign out */}
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

function SettingRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <Icon size={16} className="text-muted-foreground/40 shrink-0" />
      <span className="text-sm text-muted-foreground w-28 shrink-0">{label}</span>
      <span className="text-sm text-foreground flex-1">{value}</span>
    </div>
  );
}
