import { db } from '@/lib/db';
import { api } from '@/lib/api';
import { isOnline } from './connectivity';
import { getPending, getPendingCount, dequeue, markFailed } from './queue';
import { emitDataRefresh } from './events';
import type { Note, InboxItem, SelfChatMessage } from '@/types';

export type EngineStatus = 'idle' | 'syncing' | 'offline' | 'error';

type StatusListener = (status: EngineStatus, pending: number) => void;

const LAST_SYNC_KEY = 'zikron:last_sync';
// Minimum milliseconds between visibility-triggered syncs. Prevents rapid
// refetches when the user alt-tabs quickly or the OS briefly hides the window.
const VISIBILITY_COOLDOWN_MS = 60_000;

class SyncEngine {
  private _status: EngineStatus = 'idle';
  private _pending = 0;
  private listeners = new Set<StatusListener>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private active = false;
  private syncing = false;
  private lastVisibilitySync = 0;

  // ─── Subscribe ──────────────────────────────────────────────────────────────

  subscribe(fn: StatusListener): () => void {
    this.listeners.add(fn);
    fn(this._status, this._pending);
    return () => this.listeners.delete(fn);
  }

  private notify(status: EngineStatus, pending: number) {
    this._status = status;
    this._pending = pending;
    this.listeners.forEach(fn => fn(status, pending));
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  start() {
    if (this.active) return;
    this.active = true;

    // Use visibilitychange instead of window.focus.
    // visibilitychange is more reliable across platforms (desktop, mobile,
    // PWA, lock/unlock) and only fires when the tab truly becomes visible,
    // not on every click or iframe focus within the page.
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    window.addEventListener('online', this.handleOnline);

    // Periodic background sync — only runs when pending items exist.
    this.timer = setInterval(() => this.run(), 30_000);
    this.run();
  }

  stop() {
    this.active = false;
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('online', this.handleOnline);
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  triggerSync() { this.run(); }

  // Fires when the tab returns to the foreground (or device unlocks).
  // Cooldown prevents a barrage of syncs when the user rapidly switches tabs.
  private handleVisibilityChange = () => {
    if (document.visibilityState !== 'visible') return;
    const now = Date.now();
    if (now - this.lastVisibilitySync < VISIBILITY_COOLDOWN_MS) return;
    this.lastVisibilitySync = now;
    this.run();
  };

  private handleOnline = () => {
    // Always sync immediately when connectivity is restored — no cooldown.
    this.run();
  };

  // ─── Main sync loop ─────────────────────────────────────────────────────────

  async run() {
    if (!isOnline()) {
      this.notify('offline', await getPendingCount());
      return;
    }
    if (this.syncing) return;

    const pending = await getPendingCount();
    if (pending === 0) {
      this.notify('idle', 0);
      return;
    }

    this.syncing = true;
    this.notify('syncing', pending);

    try {
      await this.pushQueue();
      await this.pullDelta();
      this.notify('idle', 0);
    } catch {
      this.notify('error', await getPendingCount());
    } finally {
      this.syncing = false;
    }
  }

  // ─── Push pending queue ─────────────────────────────────────────────────────

  private async pushQueue() {
    const entries = await getPending();

    for (const entry of entries) {
      try {
        const payload = entry.payload ? (JSON.parse(entry.payload) as Record<string, unknown>) : {};

        switch (entry.entity) {
          case 'notes':
            if (entry.operation === 'create') {
              const n = await api.post<Note>('/api/notes', payload);
              await db.notes.put({ ...n, sync_status: 'synced' });
            } else if (entry.operation === 'update') {
              const n = await api.put<Note>(`/api/notes/${entry.record_id}`, payload);
              await db.notes.put({ ...n, sync_status: 'synced' });
            } else {
              await api.delete(`/api/notes/${entry.record_id}`);
              await db.notes.delete(entry.record_id);
            }
            emitDataRefresh('notes');
            break;

          case 'inbox':
            if (entry.operation === 'create') {
              const i = await api.post<InboxItem>('/api/inbox', payload);
              await db.inboxItems.put({ ...i, sync_status: 'synced' });
            } else if (entry.operation === 'update') {
              const i = await api.put<InboxItem>(`/api/inbox/${entry.record_id}`, payload);
              await db.inboxItems.put({ ...i, sync_status: 'synced' });
            } else {
              await api.delete(`/api/inbox/${entry.record_id}`);
              await db.inboxItems.delete(entry.record_id);
            }
            emitDataRefresh('inbox');
            break;

          case 'self-chat':
            if (entry.operation === 'create') {
              const m = await api.post<SelfChatMessage>('/api/self-chat', payload);
              await db.selfChatMessages.put({ ...m, sync_status: 'synced' });
            } else if (entry.operation === 'update') {
              const m = await api.put<SelfChatMessage>(`/api/self-chat/${entry.record_id}`, payload);
              await db.selfChatMessages.put({ ...m, sync_status: 'synced' });
            } else {
              await api.delete(`/api/self-chat/${entry.record_id}`);
              await db.selfChatMessages.delete(entry.record_id);
            }
            emitDataRefresh('self-chat');
            break;
        }

        await dequeue(entry.id);
      } catch (e) {
        if (entry.operation === 'delete' && e instanceof Error && e.message.includes('404')) {
          await dequeue(entry.id);
          continue;
        }
        await markFailed(entry.id, e instanceof Error ? e.message : 'Unknown', entry.retry_count + 1);
      }
    }
  }

  // ─── Pull delta from server ─────────────────────────────────────────────────

  private async pullDelta() {
    const since = localStorage.getItem(LAST_SYNC_KEY);
    const qs = since ? `?since=${encodeURIComponent(since)}` : '';

    const [notes, inbox, messages] = await Promise.allSettled([
      api.get<Note[]>(`/api/notes${qs}`),
      api.get<InboxItem[]>(`/api/inbox${qs}`),
      api.get<SelfChatMessage[]>(`/api/self-chat${qs}`),
    ]);

    // Track whether anything actually changed so we only trigger UI refreshes
    // when there is new data — not on every sync cycle.
    let notesChanged = false;
    let inboxChanged = false;
    let messagesChanged = false;

    await db.transaction('rw', db.notes, db.inboxItems, db.selfChatMessages, async () => {
      if (notes.status === 'fulfilled') {
        for (const note of notes.value) {
          const local = await db.notes.get(note.id);
          if (local?.sync_status === 'pending') continue;
          if (local?.updated_at !== note.updated_at) {
            await db.notes.put({ ...note, sync_status: 'synced' });
            notesChanged = true;
          }
        }
      }
      if (inbox.status === 'fulfilled') {
        for (const item of inbox.value) {
          const local = await db.inboxItems.get(item.id);
          if (local?.sync_status === 'pending') continue;
          if (local?.updated_at !== item.updated_at) {
            await db.inboxItems.put({ ...item, sync_status: 'synced' });
            inboxChanged = true;
          }
        }
      }
      if (messages.status === 'fulfilled') {
        for (const msg of messages.value) {
          const local = await db.selfChatMessages.get(msg.id);
          if (local?.sync_status === 'pending') continue;
          if (local?.updated_at !== msg.updated_at) {
            await db.selfChatMessages.put({ ...msg, sync_status: 'synced' });
            messagesChanged = true;
          }
        }
      }
    });

    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

    // Only tell pages to re-render if their data actually changed.
    if (notesChanged) emitDataRefresh('notes');
    if (inboxChanged) emitDataRefresh('inbox');
    if (messagesChanged) emitDataRefresh('self-chat');
  }
}

export const syncEngine = new SyncEngine();
