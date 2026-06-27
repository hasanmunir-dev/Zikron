'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getOrCreatePushSubscription, registerServiceWorker, removePushSubscription, savePushSubscription } from '@/lib/push';

export type PushPermission = 'default' | 'granted' | 'denied' | 'unsupported';

export function usePushNotifications() {
  const [permission, setPermission] = useState<PushPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

  useEffect(() => {
    if (!isSupported) { setPermission('unsupported'); return; }

    setPermission(Notification.permission as PushPermission);

    registerServiceWorker().then((reg) => {
      reg.pushManager.getSubscription().then((sub) => setIsSubscribed(!!sub));
    }).catch(() => {/* sw may not load in dev without HTTPS */});
  }, [isSupported]);

  async function enable() {
    if (!isSupported) return;
    setIsLoading(true);
    setError(null);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm as PushPermission);
      if (perm !== 'granted') { setError('Notification permission denied'); return; }

      const sub = await getOrCreatePushSubscription();
      await savePushSubscription(sub);
      setIsSubscribed(true);
      toast.success('Push notifications enabled');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to enable notifications');
    } finally {
      setIsLoading(false);
    }
  }

  async function disable() {
    if (!isSupported) return;
    setIsLoading(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await removePushSubscription(sub);
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
      toast.success('Push notifications disabled');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to disable notifications');
    } finally {
      setIsLoading(false);
    }
  }

  return { permission, isSubscribed, isLoading, error, isSupported, enable, disable };
}
