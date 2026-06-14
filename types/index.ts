// ─── List types ───────────────────────────────────────────────────────────────

export interface List {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  tags: string[];
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListColumn {
  id: string;
  list_id: string;
  user_id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ListRow {
  id: string;
  list_id: string;
  user_id: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ListCell {
  id: string;
  row_id: string;
  column_id: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface FullList extends List {
  columns: ListColumn[];
  rows: Array<ListRow & { cells: ListCell[] }>;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  category_id: string | null;
  tags: string[];
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface InboxItem {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  url: string | null;
  type: 'text' | 'link';
  status: 'inbox' | 'archived' | 'favorite';
  category_id: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface SelfChatMessage {
  id: string;
  user_id: string;
  content: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Admin types (server-side joined shapes) ──────────────────────────────────

export interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'disabled';
  created_at: string;
}

export interface AdminList {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  tags: string[];
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  profiles: { email: string | null; full_name: string | null } | null;
  row_count?: number;
  column_count?: number;
}

export interface AdminNote {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  tags: string[];
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  profiles: { email: string | null; full_name: string | null } | null;
}
