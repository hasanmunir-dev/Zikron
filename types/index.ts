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

// ─── Reminder types ────────────────────────────────────────────────────────────

export type ReminderStatus = 'pending' | 'completed' | 'cancelled';
export type ReminderPriority = 'low' | 'medium' | 'high';
export type ReminderLinkedType = 'none' | 'note' | 'inbox' | 'list' | 'self_chat';

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_at: string | null;
  status: ReminderStatus;
  priority: ReminderPriority;
  linked_type: ReminderLinkedType;
  linked_id: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// ─── Admin types (server-side joined shapes) ──────────────────────────────────

export interface AdminOwner {
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  status: string;
}

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
  owner: AdminOwner | null;
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
  owner: AdminOwner | null;
}

export interface AdminReminder extends Reminder {
  owner: AdminOwner | null;
}

// ─── Feedback types ────────────────────────────────────────────────────────────

export type FeedbackType = 'ui' | 'ux' | 'functionality' | 'bug' | 'performance' | 'suggestion' | 'other';
export type FeedbackStatus = 'open' | 'reviewed' | 'planned' | 'resolved' | 'rejected';
export type FeedbackLinkedType = 'none' | 'note' | 'inbox' | 'list' | 'self_chat' | 'reminder' | 'general';
export type FeedbackPriority = 'low' | 'medium' | 'high';

export interface Feedback {
  id: string;
  user_id: string;
  type: FeedbackType;
  title: string;
  message: string;
  linked_type: FeedbackLinkedType;
  linked_id: string | null;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminFeedback extends Feedback {
  owner: AdminOwner | null;
}

// ─── Changelog types ───────────────────────────────────────────────────────────

export type ChangelogType = 'feature' | 'improvement' | 'fix' | 'security' | 'announcement';

export interface ChangelogChange {
  tag: ChangelogType;
  text: string;
}

export interface Changelog {
  id: string;
  version: string;
  title: string;
  description: string | null;
  changes: ChangelogChange[];
  type: ChangelogType;
  published: boolean;
  deployed_at: string | null;
  commit_sha: string | null;
  created_at: string;
  updated_at: string;
}
