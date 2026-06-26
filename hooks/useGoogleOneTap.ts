'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const SCRIPT_ID = 'google-gis-script';

// Generates a cryptographically random nonce and its SHA-256 hash.
// Google receives the hash (embedded in the signed JWT as the `nonce` claim).
// Supabase receives the raw value — it re-hashes and compares against the JWT.
async function generateNonce(): Promise<[rawNonce: string, hashedNonce: string]> {
  const rawBytes = crypto.getRandomValues(new Uint8Array(32));
  const rawNonce = btoa(String.fromCharCode(...rawBytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawNonce));
  const hashedNonce = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  return [rawNonce, hashedNonce];
}

/**
 * Activates Google One Tap when `enabled` is true.
 * Uses supabase.auth.signInWithIdToken() — no custom backend endpoint needed.
 * The existing useAuth onAuthStateChange listener picks up the new session.
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

    // init is async because nonce generation uses crypto.subtle (Promise-based).
    // Event listeners don't await the returned promise — errors are handled internally.
    async function init(): Promise<void> {
      if (cancelled || !window.google?.accounts?.id) return;

      const [rawNonce, hashedNonce] = await generateNonce();
      if (cancelled) return; // guard in case cleanup fired during the await

      window.google.accounts.id.initialize({
        client_id: CLIENT_ID!,
        // Hashed nonce → Google embeds it as the `nonce` claim in the signed JWT.
        nonce: hashedNonce,
        callback: (r) => {
          void (async () => {
            if (cancelled) return;
            try {
              // Raw nonce → Supabase hashes it and compares with the JWT claim.
              const { error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: r.credential,
                nonce: rawNonce,
              });
              if (error) throw error;
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
