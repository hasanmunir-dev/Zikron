import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import type { SyncQueueEntry, SyncEntity, SyncOperation } from '@/types';

type EnqueueInput = Pick<SyncQueueEntry, 'entity' | 'operation' | 'record_id' | 'payload'>;

export async function enqueue(input: EnqueueInput): Promise<void> {
  // Collapse duplicate updates for the same record — keep latest payload
  if (input.operation === 'update') {
    const existing = await db.syncQueue
      .filter(e => e.entity === input.entity && e.record_id === input.record_id && e.operation === 'update')
      .first();
    if (existing) {
      await db.syncQueue.update(existing.id, { payload: input.payload });
      return;
    }
  }

  // If a create is already queued and we're trying to delete, cancel the create
  if (input.operation === 'delete') {
    const pendingCreate = await db.syncQueue
      .filter(e => e.entity === input.entity && e.record_id === input.record_id && e.operation === 'create')
      .first();
    if (pendingCreate) {
      // Item was never on server — just remove the create entry, no delete needed
      await db.syncQueue.delete(pendingCreate.id);
      return;
    }
    // Also cancel any pending update for this record
    await db.syncQueue
      .filter(e => e.entity === input.entity && e.record_id === input.record_id && e.operation === 'update')
      .delete();
  }

  const entry: SyncQueueEntry = {
    id: uuidv4(),
    ...input,
    retry_count: 0,
    next_retry_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
  await db.syncQueue.add(entry);
}

export async function dequeue(id: string): Promise<void> {
  await db.syncQueue.delete(id);
}

export async function markFailed(id: string, error: string, retryCount: number): Promise<void> {
  const backoffMs = Math.min(1_000 * 2 ** retryCount, 64_000);
  await db.syncQueue.update(id, {
    error,
    retry_count: retryCount,
    next_retry_at: new Date(Date.now() + backoffMs).toISOString(),
  });
}

export async function getPending(): Promise<SyncQueueEntry[]> {
  const now = new Date().toISOString();
  const all = await db.syncQueue.toArray();
  return all
    .filter(e => e.next_retry_at <= now)
    .sort((a, b) => {
      const rank: Record<SyncOperation, number> = { create: 0, update: 1, delete: 2 };
      return rank[a.operation] - rank[b.operation] || a.created_at.localeCompare(b.created_at);
    });
}

export async function getPendingCount(): Promise<number> {
  return db.syncQueue.count();
}

export async function hasPendingCreate(entity: SyncEntity, recordId: string): Promise<boolean> {
  const found = await db.syncQueue
    .filter(e => e.entity === entity && e.record_id === recordId && e.operation === 'create')
    .first();
  return !!found;
}
