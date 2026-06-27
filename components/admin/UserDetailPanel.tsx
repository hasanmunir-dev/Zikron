'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Mail, Calendar, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { getCachedItem } from '@/lib/page-state';
import { formatRelativeTime } from '@/utils/date';
import type { UserProfile } from '@/types';

interface Props {
  userId: string;
  /** Where to go when the panel closes (back for modal, push for full-page). */
  listRoute: string;
  fullPage?: boolean;
}

/**
 * Read-only admin user detail.
 * Used as both a modal (intercepting route) and a full-page fallback.
 */
export function UserDetailPanel({ userId, listRoute, fullPage = false }: Props) {
  const router = useRouter();

  // Cache-first: the users list caches the row before navigating so this
  // panel opens synchronously with zero latency.
  const [profile, setProfile] = useState<UserProfile | null>(() => getCachedItem<UserProfile>(userId));
  const [ready, setReady] = useState(() => getCachedItem<UserProfile>(userId) !== null);

  useEffect(() => {
    if (ready) return; // Already have cached data
    api.get<UserProfile>(`/api/admin/users/${userId}`)
      .then(data => { setProfile(data); setReady(true); })
      .catch(() => { router.replace(listRoute); });
  }, [userId, listRoute, router, ready]);

  function handleClose() {
    if (fullPage) router.push(listRoute);
    else router.back();
  }

  const card = (
    <div className={`bg-card flex flex-col shadow-xl border border-border ${
      fullPage ? 'w-full max-w-lg rounded-2xl' : 'w-full sm:rounded-2xl sm:max-w-lg max-h-[90vh]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
        <h3 className="text-sm font-semibold text-foreground">User Profile</h3>
        <button type="button" onClick={handleClose} aria-label="Close" className="p-1.5 text-muted-foreground hover:text-foreground">
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {!ready ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-16 w-16 rounded-full bg-muted mx-auto" />
            <div className="h-4 bg-muted rounded w-40 mx-auto" />
            <div className="h-3 bg-muted rounded w-28 mx-auto" />
          </div>
        ) : profile ? (
          <div className="space-y-5">
            {/* Avatar + name + badges */}
            <div className="flex flex-col items-center gap-2 pb-4 border-b border-border">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
                {(profile.full_name?.[0] ?? profile.email?.[0] ?? '?').toUpperCase()}
              </div>
              <p className="text-base font-semibold text-foreground">{profile.full_name ?? '—'}</p>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  profile.role === 'admin'
                    ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                    : 'bg-muted text-muted-foreground'
                }`}>{profile.role}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  profile.status === 'active'
                    ? 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-950/60 text-red-600'
                }`}>{profile.status}</span>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-3">
              <DetailRow icon={Mail} label="Email" value={profile.email ?? '—'} />
              <DetailRow icon={Shield} label="Role" value={profile.role} />
              <DetailRow icon={Calendar} label="Joined" value={formatRelativeTime(profile.created_at)} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  if (fullPage) return <div className="p-6 flex justify-center">{card}</div>;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={handleClose}
    >
      <div onClick={e => e.stopPropagation()}>{card}</div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={15} className="text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
