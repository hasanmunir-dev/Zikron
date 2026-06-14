import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { api } from '@/lib/api';
import { isOnline } from '@/lib/sync/connectivity';
import { enqueue } from '@/lib/sync/queue';
import { emitDataRefresh } from '@/lib/sync/events';
import type { Note } from '@/types';

type NoteInput = Pick<Note, 'title' | 'content' | 'tags' | 'is_favorite' | 'is_archived' | 'category_id'>;

// Module-level revalidation guard — persists across page remounts.
// Prevents hammering the API on every navigation; fires at most once per interval.
let _fetching = false;
let _lastFetchAt = 0;
const REVALIDATE_INTERVAL_MS = 30_000;

async function revalidate(): Promise<void> {
  const now = Date.now();
  if (_fetching || now - _lastFetchAt < REVALIDATE_INTERVAL_MS) return;
  _fetching = true;
  _lastFetchAt = now;
  try {
    const fresh = await api.get<Note[]>('/api/notes');
    let changed = false;
    await db.transaction('rw', db.notes, async () => {
      for (const note of fresh) {
        const local = await db.notes.get(note.id);
        if (local?.sync_status === 'pending') continue;
        if (!local || local.updated_at !== note.updated_at) {
          await db.notes.put({ ...note, sync_status: 'synced' });
          changed = true;
        }
      }
    });
    if (changed) emitDataRefresh('notes');
  } catch {
    // Network error — serve from local cache, sync engine will retry
  } finally {
    _fetching = false;
  }
}

function sortedDesc(notes: Note[]): Note[] {
  return notes.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export const notesRepo = {
  async list(tab: 'all' | 'favorites' | 'archived' = 'all'): Promise<Note[]> {
    const localCount = await db.notes.count();

    if (localCount === 0 && isOnline()) {
      // First ever load for this session — IndexedDB is empty.
      // Wait for the API so the page doesn't flash an empty state.
      await revalidate();
    } else if (isOnline()) {
      // Data exists locally — return it immediately and revalidate in the
      // background (fire-and-forget). Pages refresh via onDataRefresh if
      // anything actually changed.
      revalidate();
    }

    const all = await db.notes.orderBy('updated_at').reverse().toArray();
    return filterNotes(all, tab);
  },

  async get(id: string): Promise<Note | undefined> {
    const local = await db.notes.get(id);
    if (local) return local;
    // Not in IndexedDB — load all notes (triggers API fetch if online, fills cache)
    await notesRepo.list('all');
    return db.notes.get(id);
  },

  // Force a fresh API pull regardless of the revalidation interval — call after mutations
  // that invalidate the cache (e.g. import, bulk operations).
  async invalidate(): Promise<void> {
    _lastFetchAt = 0;
    if (isOnline()) await revalidate();
  },

  async create(input: NoteInput, userId: string): Promise<Note> {
    const now = new Date().toISOString();
    const note: Note = {
      id: uuidv4(),
      user_id: userId,
      ...input,
      created_at: now,
      updated_at: now,
      sync_status: 'pending',
    };

    await db.notes.put(note);

    if (isOnline()) {
      try {
        const server = await api.post<Note>('/api/notes', note);
        await db.notes.put({ ...server, sync_status: 'synced' });
        return server;
      } catch {
        // save as pending — sync engine will retry
      }
    }

    await enqueue({ entity: 'notes', operation: 'create', record_id: note.id, payload: JSON.stringify(note) });
    return note;
  },

  async update(id: string, changes: Partial<NoteInput>): Promise<Note> {
    const now = new Date().toISOString();
    const existing = await db.notes.get(id);
    if (!existing) throw new Error('Note not found');

    const updated: Note = { ...existing, ...changes, updated_at: now, sync_status: 'pending' };
    await db.notes.put(updated);

    if (isOnline()) {
      try {
        const server = await api.put<Note>(`/api/notes/${id}`, changes);
        await db.notes.put({ ...server, sync_status: 'synced' });
        return server;
      } catch {
        // will retry
      }
    }

    await enqueue({ entity: 'notes', operation: 'update', record_id: id, payload: JSON.stringify(changes) });
    return updated;
  },

  async delete(id: string): Promise<void> {
    await db.notes.delete(id);

    if (isOnline()) {
      try {
        await api.delete(`/api/notes/${id}`);
        return;
      } catch {
        // will retry
      }
    }

    await enqueue({ entity: 'notes', operation: 'delete', record_id: id });
  },
};

function filterNotes(notes: Note[], tab: 'all' | 'favorites' | 'archived'): Note[] {
  const result = notes.filter(n => {
    if (tab === 'favorites') return n.is_favorite && !n.is_archived;
    if (tab === 'archived') return n.is_archived;
    return !n.is_archived;
  });
  return sortedDesc(result);
}
