import { api } from './api';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register('/sw.js');
}

export async function getOrCreatePushSubscription(): Promise<PushSubscription> {
  const reg = await registerServiceWorker();
  await navigator.serviceWorker.ready;

  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing;

  const { publicKey } = await api.get<{ publicKey: string }>('/api/push/vapid-public-key');
  const applicationServerKey = urlBase64ToUint8Array(publicKey);

  return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
}

export async function savePushSubscription(sub: PushSubscription): Promise<void> {
  const json = sub.toJSON();
  await api.post('/api/push/subscribe', { endpoint: sub.endpoint, keys: json.keys });
}

export async function removePushSubscription(sub: PushSubscription): Promise<void> {
  await api.deleteWithBody('/api/push/unsubscribe', { endpoint: sub.endpoint });
}
