import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { api } from '@/lib/api';
import { isOnline } from '@/lib/sync/connectivity';
import { emitDataRefresh } from '@/lib/sync/events';
import type { List, ListColumn, ListRow, ListCell, FullList } from '@/types';

type ListInput = Pick<List, 'title' | 'description' | 'category_id' | 'tags' | 'is_favorite' | 'is_archived'>;

let _fetching = false;
let _lastFetchAt = 0;
const REVALIDATE_INTERVAL_MS = 30_000;

async function revalidate(): Promise<void> {
  const now = Date.now();
  if (_fetching || now - _lastFetchAt < REVALIDATE_INTERVAL_MS) return;
  _fetching = true;
  _lastFetchAt = now;
  try {
    const fresh = await api.get<List[]>('/api/lists');
    let changed = false;
    await db.transaction('rw', db.lists, async () => {
      for (const list of fresh) {
        const local = await db.lists.get(list.id);
        if (local?.sync_status === 'pending') continue;
        if (!local || local.updated_at !== list.updated_at) {
          await db.lists.put({ ...list, sync_status: 'synced' });
          changed = true;
        }
      }
    });
    if (changed) emitDataRefresh('lists');
  } catch {
    // serve from local cache
  } finally {
    _fetching = false;
  }
}

export const listsRepo = {
  async list(tab: 'all' | 'favorites' | 'archived' = 'all'): Promise<List[]> {
    const localCount = await db.lists.count();
    if (localCount === 0 && isOnline()) {
      await revalidate();
    } else if (isOnline()) {
      revalidate();
    }
    const all = await db.lists.orderBy('updated_at').reverse().toArray();
    return filterLists(all, tab);
  },

  async get(id: string): Promise<FullList | null> {
    const list = await db.lists.get(id);
    if (!list) return null;

    const [columns, rows] = await Promise.all([
      db.listColumns.where('list_id').equals(id).sortBy('sort_order'),
      db.listRows.where('list_id').equals(id).sortBy('sort_order'),
    ]);

    const rowsWithCells: Array<ListRow & { cells: ListCell[] }> = await Promise.all(
      rows.map(async (row) => {
        const cells = await db.listCells.where('row_id').equals(row.id).toArray();
        return { ...row, cells };
      })
    );

    return { ...list, columns, rows: rowsWithCells };
  },

  async fetchFull(id: string): Promise<FullList | null> {
    if (isOnline()) {
      try {
        const data = await api.get<FullList>(`/api/lists/${id}`);
        await db.transaction('rw', db.lists, db.listColumns, db.listRows, db.listCells, async () => {
          await db.lists.put({ ...data, sync_status: 'synced' });
          await db.listColumns.where('list_id').equals(id).delete();
          await db.listRows.where('list_id').equals(id).delete();
          for (const col of data.columns) {
            await db.listColumns.put(col);
          }
          for (const row of data.rows) {
            await db.listRows.put({ id: row.id, list_id: row.list_id, user_id: row.user_id, sort_order: row.sort_order, created_at: row.created_at, updated_at: row.updated_at });
            for (const cell of row.cells) {
              await db.listCells.put(cell);
            }
          }
        });
        return listsRepo.get(id);
      } catch {
        // fall through to local
      }
    }
    return listsRepo.get(id);
  },

  async create(input: ListInput, userId: string, columnNames: string[] = []): Promise<{ list: List; columns: ListColumn[] }> {
    const now = new Date().toISOString();
    const list: List = {
      id: uuidv4(),
      user_id: userId,
      ...input,
      sync_status: 'pending',
      created_at: now,
      updated_at: now,
    };

    const columns: ListColumn[] = columnNames.map((name, i) => ({
      id: uuidv4(),
      list_id: list.id,
      user_id: userId,
      name,
      sort_order: i,
      created_at: now,
      updated_at: now,
    }));

    await db.transaction('rw', db.lists, db.listColumns, async () => {
      await db.lists.put(list);
      for (const col of columns) await db.listColumns.put(col);
    });

    if (isOnline()) {
      try {
        const res = await api.post<{ list: List; columns: ListColumn[] }>('/api/lists', {
          ...input,
          id: list.id,
          columns: columnNames,
        });
        const serverList = { ...res.list, sync_status: 'synced' as const };
        await db.transaction('rw', db.lists, db.listColumns, async () => {
          await db.lists.put(serverList);
          await db.listColumns.where('list_id').equals(list.id).delete();
          for (const col of res.columns) await db.listColumns.put(col);
        });
        return { list: serverList, columns: res.columns };
      } catch {
        // saved locally as pending
      }
    }

    return { list, columns };
  },

  async update(id: string, changes: Partial<ListInput>): Promise<List> {
    const now = new Date().toISOString();
    const existing = await db.lists.get(id);
    if (!existing) throw new Error('List not found');
    const updated: List = { ...existing, ...changes, updated_at: now, sync_status: 'pending' };
    await db.lists.put(updated);
    if (isOnline()) {
      try {
        const server = await api.put<List>(`/api/lists/${id}`, changes);
        await db.lists.put({ ...server, sync_status: 'synced' });
        return server;
      } catch {
        // will sync later
      }
    }
    return updated;
  },

  async delete(id: string): Promise<void> {
    await db.transaction('rw', db.lists, db.listColumns, db.listRows, db.listCells, async () => {
      const rowIds = (await db.listRows.where('list_id').equals(id).toArray()).map(r => r.id);
      if (rowIds.length) await db.listCells.where('row_id').anyOf(rowIds).delete();
      await db.listRows.where('list_id').equals(id).delete();
      await db.listColumns.where('list_id').equals(id).delete();
      await db.lists.delete(id);
    });
    if (isOnline()) {
      try { await api.delete(`/api/lists/${id}`); } catch { /* will retry */ }
    }
  },

  // ─── Column operations ───────────────────────────────────────────────────────

  async addColumn(listId: string, userId: string, name: string): Promise<ListColumn> {
    const now = new Date().toISOString();
    const existing = await db.listColumns.where('list_id').equals(listId).toArray();
    const sort_order = existing.length;
    const col: ListColumn = { id: uuidv4(), list_id: listId, user_id: userId, name, sort_order, created_at: now, updated_at: now };
    await db.listColumns.put(col);

    // Create empty cells for all existing rows
    const rows = await db.listRows.where('list_id').equals(listId).toArray();
    await db.transaction('rw', db.listCells, async () => {
      for (const row of rows) {
        await db.listCells.put({ id: uuidv4(), row_id: row.id, column_id: col.id, value: '', created_at: now, updated_at: now });
      }
    });

    if (isOnline()) {
      try {
        const res = await api.post<{ column: ListColumn; cells: ListCell[] }>(`/api/lists/${listId}/columns`, { name });
        await db.listColumns.put(res.column);
        for (const cell of res.cells) await db.listCells.put(cell);
        return res.column;
      } catch { /* saved locally */ }
    }
    return col;
  },

  async updateColumn(columnId: string, name: string): Promise<void> {
    const now = new Date().toISOString();
    const col = await db.listColumns.get(columnId);
    if (!col) return;
    await db.listColumns.put({ ...col, name, updated_at: now });
    if (isOnline()) {
      try { await api.put(`/api/lists/${col.list_id}/columns/${columnId}`, { name }); } catch { /* ok */ }
    }
  },

  async deleteColumn(columnId: string): Promise<void> {
    const col = await db.listColumns.get(columnId);
    if (!col) return;
    await db.transaction('rw', db.listColumns, db.listCells, async () => {
      await db.listCells.where('column_id').equals(columnId).delete();
      await db.listColumns.delete(columnId);
    });
    if (isOnline()) {
      try { await api.delete(`/api/lists/${col.list_id}/columns/${columnId}`); } catch { /* ok */ }
    }
    // Re-index sort_order
    const remaining = await db.listColumns.where('list_id').equals(col.list_id).sortBy('sort_order');
    await db.transaction('rw', db.listColumns, async () => {
      for (let i = 0; i < remaining.length; i++) {
        await db.listColumns.put({ ...remaining[i], sort_order: i });
      }
    });
  },

  async moveColumn(columnId: string, direction: 'left' | 'right'): Promise<void> {
    const col = await db.listColumns.get(columnId);
    if (!col) return;
    const siblings = await db.listColumns.where('list_id').equals(col.list_id).sortBy('sort_order');
    const idx = siblings.findIndex(c => c.id === columnId);
    const swapIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;
    const now = new Date().toISOString();
    const swapCol = siblings[swapIdx];
    await db.transaction('rw', db.listColumns, async () => {
      await db.listColumns.put({ ...col, sort_order: swapCol.sort_order, updated_at: now });
      await db.listColumns.put({ ...swapCol, sort_order: col.sort_order, updated_at: now });
    });
  },

  // ─── Row operations ──────────────────────────────────────────────────────────

  async addRow(listId: string, userId: string, cellValues: Record<string, string> = {}): Promise<ListRow & { cells: ListCell[] }> {
    const now = new Date().toISOString();
    const existingRows = await db.listRows.where('list_id').equals(listId).toArray();
    const sort_order = existingRows.length;
    const row: ListRow = { id: uuidv4(), list_id: listId, user_id: userId, sort_order, created_at: now, updated_at: now };

    const columns = await db.listColumns.where('list_id').equals(listId).toArray();
    const cells: ListCell[] = columns.map(col => ({
      id: uuidv4(),
      row_id: row.id,
      column_id: col.id,
      value: cellValues[col.id] ?? '',
      created_at: now,
      updated_at: now,
    }));

    await db.transaction('rw', db.listRows, db.listCells, async () => {
      await db.listRows.put(row);
      for (const cell of cells) await db.listCells.put(cell);
    });

    if (isOnline()) {
      try {
        const res = await api.post<{ row: ListRow; cells: ListCell[] }>(`/api/lists/${listId}/rows`, { cells: cellValues });
        await db.transaction('rw', db.listRows, db.listCells, async () => {
          await db.listRows.delete(row.id);
          await db.listCells.where('row_id').equals(row.id).delete();
          await db.listRows.put(res.row);
          for (const cell of res.cells) await db.listCells.put(cell);
        });
        return { ...res.row, cells: res.cells };
      } catch { /* local version will be used */ }
    }
    return { ...row, cells };
  },

  async deleteRow(rowId: string): Promise<void> {
    const row = await db.listRows.get(rowId);
    if (!row) return;
    await db.transaction('rw', db.listRows, db.listCells, async () => {
      await db.listCells.where('row_id').equals(rowId).delete();
      await db.listRows.delete(rowId);
    });
    if (isOnline()) {
      try { await api.delete(`/api/lists/${row.list_id}/rows/${rowId}`); } catch { /* ok */ }
    }
  },

  // ─── Cell operations ─────────────────────────────────────────────────────────

  async updateCell(cellId: string, value: string): Promise<void> {
    const now = new Date().toISOString();
    const cell = await db.listCells.get(cellId);
    if (!cell) return;
    await db.listCells.put({ ...cell, value, updated_at: now });
    if (isOnline()) {
      const row = await db.listRows.get(cell.row_id);
      if (row) {
        try { await api.put(`/api/lists/${row.list_id}/cells/${cellId}`, { value }); } catch { /* ok */ }
      }
    }
  },
};

function filterLists(lists: List[], tab: 'all' | 'favorites' | 'archived'): List[] {
  return lists.filter(l => {
    if (tab === 'favorites') return l.is_favorite && !l.is_archived;
    if (tab === 'archived') return l.is_archived;
    return !l.is_archived;
  });
}
