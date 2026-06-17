import { api } from './api';

// Converts a URL-safe base64 VAPID public key string to Uint8Array<ArrayBuffer>.
// The return type must be Uint8Array<ArrayBuffer> — not the bare Uint8Array alias
// (which defaults to Uint8Array<ArrayBufferLike> in TypeScript 5.6+) — because
// PushSubscriptionOptionsInit.applicationServerKey accepts BufferSource, and
// ArrayBufferView.buffer is typed as ArrayBuffer (concrete), not ArrayBufferLike.
// new Uint8Array(n) is typed as Uint8Array<ArrayBuffer> by the DOM lib.
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const bytes = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    bytes[i] = rawData.charCodeAt(i);
  }
  return bytes;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register('/sw.js');
}

export async function getOrCreatePushSubscription(): Promise<PushSubscription> {
  // Register the SW (no-op if already registered), then wait for it to be
  // fully active before touching pushManager. Using navigator.serviceWorker.ready
  // guarantees we have an activated registration — the Promise<SW> returned by
  // register() is resolved on first install but not necessarily activated yet.
  await registerServiceWorker();
  const registration = await navigator.serviceWorker.ready;

  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  const { publicKey } = await api.get<{ publicKey: string }>('/api/push/vapid-public-key');
  const applicationServerKey = urlBase64ToUint8Array(publicKey);

  return registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
}

export async function savePushSubscription(sub: PushSubscription): Promise<void> {
  const json = sub.toJSON();
  if (!json.keys) throw new Error('Push subscription missing keys');
  await api.post('/api/push/subscribe', { endpoint: sub.endpoint, keys: json.keys });
}

export async function removePushSubscription(sub: PushSubscription): Promise<void> {
  await api.deleteWithBody('/api/push/unsubscribe', { endpoint: sub.endpoint });
}
