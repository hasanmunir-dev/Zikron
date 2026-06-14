import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { api } from '@/lib/api';
import { isOnline } from '@/lib/sync/connectivity';
import { enqueue } from '@/lib/sync/queue';
import { emitDataRefresh } from '@/lib/sync/events';
import type { InboxItem } from '@/types';

type InboxInput = Pick<InboxItem, 'title' | 'content' | 'url' | 'type' | 'tags' | 'category_id'>;

let _fetching = false;
let _lastFetchAt = 0;
const REVALIDATE_INTERVAL_MS = 30_000;

async function revalidate(): Promise<void> {
  const now = Date.now();
  if (_fetching || now - _lastFetchAt < REVALIDATE_INTERVAL_MS) return;
  _fetching = true;
  _lastFetchAt = now;
  try {
    const fresh = await api.get<InboxItem[]>('/api/inbox');
    let changed = false;
    await db.transaction('rw', db.inboxItems, async () => {
      for (const item of fresh) {
        const local = await db.inboxItems.get(item.id);
        if (local?.sync_status === 'pending') continue;
        if (!local || local.updated_at !== item.updated_at) {
          await db.inboxItems.put({ ...item, sync_status: 'synced' });
          changed = true;
        }
      }
    });
    if (changed) emitDataRefresh('inbox');
  } catch {
    // Network error — serve from local cache
  } finally {
    _fetching = false;
  }
}

export const inboxRepo = {
  async list(tab: 'inbox' | 'favorite' | 'archived' = 'inbox'): Promise<InboxItem[]> {
    const localCount = await db.inboxItems.count();

    if (localCount === 0 && isOnline()) {
      await revalidate();
    } else if (isOnline()) {
      revalidate(); // non-blocking background refresh
    }

    const all = await db.inboxItems.toArray();
    return all
      .filter(i => i.status === tab)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async invalidate(): Promise<void> {
    _lastFetchAt = 0;
    if (isOnline()) await revalidate();
  },

  async create(input: InboxInput, userId: string): Promise<InboxItem> {
    const now = new Date().toISOString();
    const item: InboxItem = {
      id: uuidv4(),
      user_id: userId,
      ...input,
      status: 'inbox',
      created_at: now,
      updated_at: now,
      sync_status: 'pending',
    };

    await db.inboxItems.put(item);

    if (isOnline()) {
      try {
        const server = await api.post<InboxItem>('/api/inbox', item);
        await db.inboxItems.put({ ...server, sync_status: 'synced' });
        return server;
      } catch {
        // will retry
      }
    }

    await enqueue({ entity: 'inbox', operation: 'create', record_id: item.id, payload: JSON.stringify(item) });
    return item;
  },

  async update(id: string, changes: Partial<Pick<InboxItem, 'status' | 'title' | 'content' | 'url' | 'tags'>>): Promise<InboxItem> {
    const now = new Date().toISOString();
    const existing = await db.inboxItems.get(id);
    if (!existing) throw new Error('Item not found');

    const updated: InboxItem = { ...existing, ...changes, updated_at: now, sync_status: 'pending' };
    await db.inboxItems.put(updated);

    if (isOnline()) {
      try {
        const server = await api.put<InboxItem>(`/api/inbox/${id}`, changes);
        await db.inboxItems.put({ ...server, sync_status: 'synced' });
        return server;
      } catch {
        // will retry
      }
    }

    await enqueue({ entity: 'inbox', operation: 'update', record_id: id, payload: JSON.stringify(changes) });
    return updated;
  },

  async delete(id: string): Promise<void> {
    await db.inboxItems.delete(id);

    if (isOnline()) {
      try {
        await api.delete(`/api/inbox/${id}`);
        return;
      } catch {
        // will retry
      }
    }

    await enqueue({ entity: 'inbox', operation: 'delete', record_id: id });
  },
};
