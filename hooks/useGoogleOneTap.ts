'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const SCRIPT_ID = 'google-gis-script';

/**
 * Activates Google One Tap when `enabled` is true.
 * Sends the Google credential to Express (POST /api/auth/google-one-tap).
 * Express calls Supabase, returns session tokens, frontend stores them via
 * supabase.auth.setSession() so useAuth's onAuthStateChange picks up the user.
 *
 * Handles:
 * - Script deduplication (safe across React Strict Mode double-mounts)
 * - Cleanup / cancel on unmount
 * - Toast error on failure
 * - Redirect to /app/dashboard on success
 */
export function useGoogleOneTap(enabled: boolean): void {
  const router = useRouter();

  useEffect(() => {
    if (!enabled || !CLIENT_ID) return;

    // `cancelled` guards against Strict Mode's cleanup → re-run cycle:
    // if cleanup fires before the GIS script has loaded, the queued `init`
    // call becomes a no-op via this flag.
    let cancelled = false;

    function init(): void {
      if (cancelled || !window.google?.accounts?.id) return;
      void (async () => {
        // GIS (especially with itp_support: true) embeds a nonce claim in the
        // credential JWT. GoTrue requires the raw nonce in the request body so
        // it can SHA-256 it and compare against the JWT claim.
        const rawNonce = crypto.randomUUID();
        const hashBuffer = await crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(rawNonce),
        );
        const hashedNonce = Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        if (cancelled || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: CLIENT_ID!,
          nonce: hashedNonce,
          callback: (r) => {
            void (async () => {
              if (cancelled) return;
              try {
                // Send credential + raw nonce to Express; Express calls Supabase.
                const res = await fetch(`${API_URL}/api/auth/google-one-tap`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ credential: r.credential, nonce: rawNonce }),
                });
                if (!res.ok) {
                  const { error } = await res.json() as { error?: string };
                  throw new Error(error ?? `Request failed: ${res.status}`);
                }
                const { access_token, refresh_token } = await res.json() as {
                  access_token: string;
                  refresh_token: string;
                };
                // Store the Supabase session locally so onAuthStateChange fires
                // and useAuth picks up the new user — no direct signInWithIdToken.
                const { error: sessionError } = await supabase.auth.setSession({
                  access_token,
                  refresh_token,
                });
                if (sessionError) throw sessionError;
                router.push('/app/dashboard');
              } catch (err) {
                console.error('[GoogleOneTap] sign-in failed:', err);
                toast.error('Google sign-in failed. Please try again.');
              }
            })();
          },
          auto_select: true,
          cancel_on_tap_outside: false,
          context: 'signin',
          itp_support: true,
        });
        window.google.accounts.id.prompt();
      })();
    }

    // Case 1: GIS library already loaded from a previous page or mount.
    if (window.google?.accounts?.id) {
      init();
      return () => {
        cancelled = true;
        window.google?.accounts.id.cancel();
      };
    }

    // Case 2: Script tag exists (injected by a previous mount) but hasn't
    // finished loading yet — attach a load listener instead of adding a
    // duplicate script, which covers Strict Mode's second mount.
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', init);
      return () => {
        cancelled = true;
        existing.removeEventListener('load', init);
        window.google?.accounts.id.cancel();
      };
    }

    // Case 3: First time — inject the script.
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.addEventListener('load', init);
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      script.removeEventListener('load', init);
      window.google?.accounts.id.cancel();
    };
  // router is stable (Next.js guarantees referential stability).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}
