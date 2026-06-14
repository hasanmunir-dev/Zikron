import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { api } from '@/lib/api';
import { isOnline } from '@/lib/sync/connectivity';
import { enqueue } from '@/lib/sync/queue';
import { emitDataRefresh } from '@/lib/sync/events';
import type { SelfChatMessage } from '@/types';

let _fetching = false;
let _lastFetchAt = 0;
const REVALIDATE_INTERVAL_MS = 30_000;

async function revalidate(): Promise<void> {
  const now = Date.now();
  if (_fetching || now - _lastFetchAt < REVALIDATE_INTERVAL_MS) return;
  _fetching = true;
  _lastFetchAt = now;
  try {
    const fresh = await api.get<SelfChatMessage[]>('/api/self-chat');
    let changed = false;
    await db.transaction('rw', db.selfChatMessages, async () => {
      for (const msg of fresh) {
        const local = await db.selfChatMessages.get(msg.id);
        if (local?.sync_status === 'pending') continue;
        if (!local || local.updated_at !== msg.updated_at) {
          await db.selfChatMessages.put({ ...msg, sync_status: 'synced' });
          changed = true;
        }
      }
    });
    if (changed) emitDataRefresh('self-chat');
  } catch {
    // Network error — serve from local cache
  } finally {
    _fetching = false;
  }
}

export const selfChatRepo = {
  async list(): Promise<SelfChatMessage[]> {
    const localCount = await db.selfChatMessages.count();

    if (localCount === 0 && isOnline()) {
      await revalidate();
    } else if (isOnline()) {
      revalidate(); // non-blocking background refresh
    }

    return db.selfChatMessages.orderBy('created_at').toArray();
  },

  async invalidate(): Promise<void> {
    _lastFetchAt = 0;
    if (isOnline()) await revalidate();
  },

  async create(content: string, userId: string): Promise<SelfChatMessage> {
    const now = new Date().toISOString();
    const msg: SelfChatMessage = {
      id: uuidv4(),
      user_id: userId,
      content,
      is_favorite: false,
      created_at: now,
      updated_at: now,
      sync_status: 'pending',
    };

    await db.selfChatMessages.put(msg);

    if (isOnline()) {
      try {
        const server = await api.post<SelfChatMessage>('/api/self-chat', msg);
        await db.selfChatMessages.put({ ...server, sync_status: 'synced' });
        return server;
      } catch {
        // will retry
      }
    }

    await enqueue({ entity: 'self-chat', operation: 'create', record_id: msg.id, payload: JSON.stringify(msg) });
    return msg;
  },

  async toggleFavorite(id: string, current: boolean): Promise<SelfChatMessage> {
    const now = new Date().toISOString();
    const existing = await db.selfChatMessages.get(id);
    if (!existing) throw new Error('Message not found');

    const updated: SelfChatMessage = { ...existing, is_favorite: !current, updated_at: now, sync_status: 'pending' };
    await db.selfChatMessages.put(updated);

    const changes = { is_favorite: !current };

    if (isOnline()) {
      try {
        const server = await api.put<SelfChatMessage>(`/api/self-chat/${id}`, changes);
        await db.selfChatMessages.put({ ...server, sync_status: 'synced' });
        return server;
      } catch {
        // will retry
      }
    }

    await enqueue({ entity: 'self-chat', operation: 'update', record_id: id, payload: JSON.stringify(changes) });
    return updated;
  },

  async delete(id: string): Promise<void> {
    await db.selfChatMessages.delete(id);

    if (isOnline()) {
      try {
        await api.delete(`/api/self-chat/${id}`);
        return;
      } catch {
        // will retry
      }
    }

    await enqueue({ entity: 'self-chat', operation: 'delete', record_id: id });
  },
};
