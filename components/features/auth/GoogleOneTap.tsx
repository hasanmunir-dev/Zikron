'use client';

import { useAuth } from '@/hooks/useAuth';
import { useGoogleOneTap } from '@/hooks/useGoogleOneTap';

/**
 * Silently activates Google One Tap for unauthenticated users.
 * Renders nothing — One Tap UI is drawn by Google's script.
 *
 * Place once in the root layout, outside any auth-gated wrapper:
 *   <GoogleOneTap />
 */
export function GoogleOneTap() {
  const { user, loading } = useAuth();
  // Wait until the auth state is resolved before deciding to show One Tap.
  // This prevents a flash of One Tap for already-authenticated users.
  useGoogleOneTap(!loading && user === null);
  return null;
}
