'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  // Track the last resolved user ID so TOKEN_REFRESHED events (same user,
  // new JWT) don't trigger a loading spinner and remount all children.
  const resolvedUserIdRef = useRef<string | null>(null);

  async function loadUserAndRole(sessionUser: User | null) {
    const isSameUser = sessionUser?.id === resolvedUserIdRef.current;

    // Only show the loading state when the identity actually changes
    // (initial mount, sign-in, or sign-out). TOKEN_REFRESHED keeps the same
    // user ID — skip the spinner so children are never unmounted.
    if (!isSameUser) {
      setLoading(true);
    }

    if (!sessionUser) {
      resolvedUserIdRef.current = null;
      setUser(null);
      setRole(null);
      setLoading(false);
      return;
    }

    // Token refresh for the same user — update the user object silently
    // (the new object carries a fresh access_token) but skip the DB round-trip.
    if (isSameUser) {
      setUser(sessionUser);
      setLoading(false);
      return;
    }

    // New identity: fetch role from the database.
    resolvedUserIdRef.current = sessionUser.id;
    setUser(sessionUser);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', sessionUser.id)
        .single();

      setRole((profile?.role as 'user' | 'admin') ?? 'user');
    } catch {
      setRole('user');
    }

    setLoading(false);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      loadUserAndRole(data.session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      loadUserAndRole(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, role, loading, signOut };
}

export function useRequireAuth() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  return { user, role, loading };
}
