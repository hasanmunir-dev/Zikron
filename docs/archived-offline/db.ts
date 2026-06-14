import Dexie, { type Table } from 'dexie';
import type { Note, InboxItem, SelfChatMessage, Category, SyncQueueEntry, List, ListColumn, ListRow, ListCell } from '@/types';

class ZikronDB extends Dexie {
  notes!: Table<Note>;
  inboxItems!: Table<InboxItem>;
  selfChatMessages!: Table<SelfChatMessage>;
  categories!: Table<Category>;
  syncQueue!: Table<SyncQueueEntry>;
  lists!: Table<List>;
  listColumns!: Table<ListColumn>;
  listRows!: Table<ListRow>;
  listCells!: Table<ListCell>;

  constructor() {
    super('zikron');

    // v1: original schema — syncQueue uses auto-increment integer PK
    this.version(1).stores({
      notes: 'id, user_id, is_favorite, is_archived, sync_status, created_at, updated_at',
      inboxItems: 'id, user_id, status, type, sync_status, created_at, updated_at',
      selfChatMessages: 'id, user_id, is_favorite, sync_status, created_at',
      categories: 'id, user_id',
      syncQueue: '++id, table, record_id, operation, created_at',
    });

    // v2: drop the old syncQueue (Dexie cannot change a primary key in-place)
    this.version(2).stores({
      syncQueue: null,
    });

    // v3: recreate syncQueue with string UUID primary key + new fields
    this.version(3).stores({
      notes: 'id, user_id, is_favorite, is_archived, sync_status, created_at, updated_at',
      inboxItems: 'id, user_id, status, type, sync_status, created_at, updated_at',
      selfChatMessages: 'id, user_id, is_favorite, sync_status, created_at',
      categories: 'id, user_id',
      syncQueue: 'id, entity, record_id, operation, next_retry_at, created_at',
    });

    // v4: add lists, list_columns, list_rows, list_cells tables
    this.version(4).stores({
      notes: 'id, user_id, is_favorite, is_archived, sync_status, created_at, updated_at',
      inboxItems: 'id, user_id, status, type, sync_status, created_at, updated_at',
      selfChatMessages: 'id, user_id, is_favorite, sync_status, created_at',
      categories: 'id, user_id',
      syncQueue: 'id, entity, record_id, operation, next_retry_at, created_at',
      lists: 'id, user_id, is_favorite, is_archived, sync_status, created_at, updated_at',
      listColumns: 'id, list_id, user_id, sort_order',
      listRows: 'id, list_id, user_id, sort_order',
      listCells: 'id, row_id, column_id',
    });
  }
}

export const db = new ZikronDB();
