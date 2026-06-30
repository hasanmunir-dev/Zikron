'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, LogOut, Shield, Palette, Bell, BellOff, BellRing, History } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { VersionHistoryLimit } from '@/types';
import { useProfile } from '@/hooks/queries/use-profile';
import { ProfilePictureUploader } from '@/components/features/profile/ProfilePictureUploader';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const name = profile?.full_name ?? user?.user_metadata?.full_name ?? '';
  const push = usePushNotifications();

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
          <div className="p-4 border-b border-border">
            <ProfilePictureUploader
              avatarUrl={profile?.avatar_url}
              name={name || null}
              email={user?.email}
            />
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
      </section>

      {/* Notifications */}
      <section className="mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Notifications</h3>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-4 flex items-start gap-3">
            <div className="mt-0.5">
              {push.isSubscribed
                ? <BellRing size={16} className="text-amber-500 shrink-0" />
                : push.permission === 'denied'
                  ? <BellOff size={16} className="text-muted-foreground/40 shrink-0" />
                  : <Bell size={16} className="text-muted-foreground/40 shrink-0" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Reminder push notifications</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {push.permission === 'unsupported'
                  ? 'Your browser does not support push notifications.'
                  : push.permission === 'denied'
                    ? 'Notifications are blocked. Allow them in your browser settings, then return here.'
                    : push.isSubscribed
                      ? 'You will receive browser notifications when reminders are due.'
                      : 'Enable to receive browser notifications when reminders are due.'}
              </p>
              {push.error && (
                <p className="text-xs text-red-500 mt-1">{push.error}</p>
              )}
            </div>
            {push.permission !== 'unsupported' && push.permission !== 'denied' && (
              <button
                type="button"
                disabled={push.isLoading}
                onClick={push.isSubscribed ? push.disable : push.enable}
                className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                  push.isSubscribed
                    ? 'bg-muted text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400'
                    : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50'
                }`}
              >
                {push.isLoading ? 'Working…' : push.isSubscribed ? 'Disable' : 'Enable'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Version History */}
      <VersionHistorySettings />

      {/* Account */}
      <section className="mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Account</h3>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            <div className="px-4 py-3 flex items-center gap-3">
              <Shield size={16} className="text-muted-foreground/40 shrink-0" />
              <span className="text-sm text-foreground flex-1">Data storage</span>
              <span className="text-xs text-muted-foreground">Supabase cloud</span>
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

function VersionHistorySettings() {
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<{ version_history_limit: number }>('/api/me'),
    staleTime: 1000 * 60 * 5,
  });

  const currentLimit = (profile?.version_history_limit ?? 100) as VersionHistoryLimit;
  const [pending, setPending] = useState<VersionHistoryLimit | null>(null);

  const mutation = useMutation({
    mutationFn: (limit: VersionHistoryLimit) =>
      api.patch('/api/me', { version_history_limit: limit }),
    onSuccess: (_, limit) => {
      qc.invalidateQueries({ queryKey: ['me'] });
      setPending(null);
      toast.success('Version history limit updated');
    },
    onError: () => { setPending(null); toast.error('Failed to update setting'); },
  });

  const OPTIONS: { value: VersionHistoryLimit; label: string }[] = [
    { value: 100, label: 'Last 100' },
    { value: 50, label: 'Last 50' },
    { value: 0, label: 'Unlimited' },
  ];

  return (
    <section className="mb-6">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Version History</h3>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-3">
          <History size={16} className="text-muted-foreground/40 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">Keep version history</p>
            <p className="text-xs text-muted-foreground mt-0.5">Per item. Older versions are automatically removed.</p>
          </div>
          <div className="flex gap-1.5">
            {OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                disabled={mutation.isPending}
                onClick={() => {
                  if (opt.value !== currentLimit) {
                    setPending(opt.value);
                    mutation.mutate(opt.value);
                  }
                }}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                  opt.value === currentLimit
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-accent text-foreground'
                }`}
              >
                {pending === opt.value && mutation.isPending ? '…' : opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
