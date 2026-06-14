/**
 * Module-level store for lightweight UI state that should survive page navigation.
 * Lives at module scope so it persists as long as the JS bundle is alive (the
 * whole browser session), surviving React unmount/remount cycles.
 *
 * Not persisted to localStorage — resets on hard refresh (by design).
 */
const store = new Map<string, unknown>();

export function savePageState<T>(key: string, state: T): void {
  store.set(key, state);
}

export function getPageState<T>(key: string): T | undefined {
  return store.get(key) as T | undefined;
}

// ─── Generic single-item cache for instant modal opening ─────────────────────
//
// The list page calls cacheItem(row) before navigating to a detail URL.
// The modal page reads getCachedItem(id) synchronously in the useState
// initializer — zero async latency, no IndexedDB round-trip.
//
// One slot is sufficient because we always cache → navigate → read in sequence;
// there is never a need to hold two cached items simultaneously.

let _cachedItem: { id: string } | null = null;

export function cacheItem(item: { id: string }): void {
  _cachedItem = item;
}

export function getCachedItem<T extends { id: string }>(id: string): T | null {
  return _cachedItem?.id === id ? (_cachedItem as T) : null;
}

// Backward-compatible aliases used by existing note code
export const cacheNote = cacheItem;
export const getCachedNote = getCachedItem;
