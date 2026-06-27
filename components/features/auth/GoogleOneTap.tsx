'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useGoogleOneTap } from '@/hooks/useGoogleOneTap';

const FAILSAFE_MS = 15_000;

/**
 * Silently activates Google One Tap for unauthenticated users.
 * Renders a full-page loading overlay while the sign-in request is in-flight.
 *
 * Place once in the root layout, outside any auth-gated wrapper:
 *   <GoogleOneTap />
 *
 * Loading lifecycle:
 *   setLoading(true)  — called by the hook the moment a credential arrives
 *   setLoading(false) — called here when useAuth confirms the user is signed in,
 *                       OR by the hook on error, OR by the 15 s failsafe
 */
export function GoogleOneTap() {
  const { user, loading: authLoading } = useAuth();
  const [isOneTapLoading, setIsOneTapLoading] = useState(false);

  // Wait until auth state is resolved before enabling One Tap so we never
  // flash the prompt for an already-authenticated user.
  useGoogleOneTap(!authLoading && user === null, setIsOneTapLoading);

  // Primary clear: once useAuth confirms the user is signed in, the session
  // is established and navigation has started — safe to hide the overlay.
  // This fires because GoogleOneTap lives in the root layout and stays mounted
  // across the route change, so it sees the auth state update.
  useEffect(() => {
    if (isOneTapLoading && !authLoading && user !== null) {
      setIsOneTapLoading(false);
    }
  }, [isOneTapLoading, authLoading, user]);

  // Failsafe: if auth never resolves (network down, unexpected error), clear
  // the overlay after FAILSAFE_MS so the user is never permanently stuck.
  useEffect(() => {
    if (!isOneTapLoading) return;
    const id = setTimeout(() => {
      setIsOneTapLoading(false);
      toast.error('Sign-in timed out. Please try again.');
    }, FAILSAFE_MS);
    return () => clearTimeout(id);
  }, [isOneTapLoading]);

  if (!isOneTapLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Signing you in with Google...</p>
      </div>
    </div>
  );
}
