// ─── Calendar & Milestones ────────────────────────────────────────────────────

export type CalendarEventSource = 'note' | 'inbox' | 'contact' | 'reminder' | 'milestone';

export interface CalendarEvent {
  id: string;
  source: CalendarEventSource;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  status?: string;
  priority?: string;
  url: string;
  color?: string;
}

export interface CollectionMilestone {
  id: string;
  collection_id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ─── Templates ────────────────────────────────────────────────────────────────

export type TemplateType = 'note' | 'inbox' | 'list' | 'reminder' | 'collection' | 'contact';

export interface Template {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  template_type: TemplateType;
  title_template: string | null;
  content_template: string | null;
  metadata_template: Record<string, unknown>;
  is_favorite: boolean;
  is_system: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminTemplate extends Template {
  owner: { email: string | null; full_name: string | null } | null;
}

// ─── Activity Log ─────────────────────────────────────────────────────────────

export type ActivityItemType = 'note' | 'inbox' | 'list' | 'reminder' | 'collection' | 'tag' | 'contact' | 'shared_link' | 'self_chat';
export type ActivityAction = 'created' | 'updated' | 'deleted' | 'restored' | 'completed' | 'cancelled' | 'shared' | 'imported' | 'archived' | 'favorited';

export interface ActivityLog {
  id: string;
  user_id: string;
  action: ActivityAction;
  item_type: ActivityItemType;
  item_id: string | null;
  item_title: string | null;
  description: string;
  created_at: string;
}

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
  avatar_url: string | null;
  avatar_path: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'disabled';
  created_at: string;
  updated_at?: string;
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

// ─── Contact message types ─────────────────────────────────────────────────────

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  created_at: string;
}

// ─── Collection types ──────────────────────────────────────────────────────────

export type CollectionItemType = 'note' | 'inbox' | 'list' | 'self_chat' | 'reminder';

export interface Collection {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  cover_image: string | null;
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  user_id: string;
  item_type: CollectionItemType;
  item_id: string;
  sort_order: number;
  created_at: string;
}

export interface CollectionWithItems extends Collection {
  items: CollectionItem[];
}

export interface AdminCollection extends Collection {
  owner: AdminOwner | null;
  item_count: number;
}

// ─── Contact types ─────────────────────────────────────────────────────────────

export type ContactSource = 'manual' | 'google' | 'csv' | 'future_import';

export interface ContactEmail {
  value: string;
  label: string;
  primary: boolean;
}

export interface ContactPhone {
  value: string;
  label: string;
  primary: boolean;
  normalized?: string;
}

export interface ContactAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  label: string;
}

export interface ContactWebsite {
  value: string;
  label: string;
}

export interface ContactSocialLink {
  platform: string;
  value: string;
}

export interface Contact {
  id: string;
  user_id: string;
  source: ContactSource;
  google_resource_name: string | null;
  name: string;
  prefix: string | null;
  middle_name: string | null;
  nickname: string | null;
  birthday: string | null;
  // Legacy flat fields (kept for backward compat + Google dedup)
  email: string | null;
  phone: string | null;
  // Rich multi-value fields
  emails: ContactEmail[];
  phones: ContactPhone[];
  addresses: ContactAddress[];
  websites: ContactWebsite[];
  social_links: ContactSocialLink[];
  avatar_url: string | null;
  company: string | null;
  job_title: string | null;
  notes: string | null;
  favorite: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminContact extends Contact {
  owner: AdminOwner | null;
}

// ─── Sharing types ────────────────────────────────────────────────────────────

export type ShareType = 'public' | 'protected' | 'private' | 'tracked_protected';
export type ItemType = 'note' | 'inbox' | 'list' | 'collection' | 'reminder';

export interface PrivateRecipient {
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'disabled';
}
export type AccessStatus =
  | 'allowed' | 'denied' | 'suspicious' | 'expired'
  | 'revoked' | 'password_required' | 'password_failed' | 'login_required';

export interface SharedLinkRecipient {
  id: string;
  shared_link_id: string;
  contact_id: string | null;
  recipient_name: string | null;
  recipient_email: string | null;
  recipient_phone: string | null;
  required_login_user_id: string | null;
  individual_token: string | null;
  first_opened_at: string | null;
  last_opened_at: string | null;
  suspicious_access_count: number;
  is_revoked: boolean;
  created_at: string;
  updated_at: string;
}

export interface SharedLink {
  id: string;
  user_id: string;
  item_type: ItemType;
  item_id: string;
  share_type: ShareType;
  token: string;
  expires_at: string | null;
  view_limit: number | null;
  view_count: number;
  is_revoked: boolean;
  allow_download: boolean;
  created_at: string;
  updated_at: string;
  shared_link_recipients?: SharedLinkRecipient[];
  item_title: string | null;
  item_preview: string | null;
}

export interface AdminSharedLink extends SharedLink {
  owner: AdminOwner | null;
}

export interface ShareAccessLog {
  id: string;
  shared_link_id: string;
  recipient_id: string | null;
  viewer_user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  device_label: string | null;
  country: string | null;
  city: string | null;
  access_status: AccessStatus;
  reason: string | null;
  created_at: string;
}

// ─── Shared-with-me types ─────────────────────────────────────────────────────

export interface SharedWithMeOwner {
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export interface SharedWithMeItem {
  share_id: string;
  recipient_id: string;
  item_type: ItemType;
  item_id: string;
  share_type: ShareType;
  permission: 'viewer';
  shared_at: string;
  expires_at: string | null;
  requires_password: boolean;
  owner: SharedWithMeOwner | null;
  title: string;
  preview: string | null;
  link_token: string | null;
}

export type SharedWithMeResponse =
  | { status: 'ok'; item_type: ItemType; share_type: ShareType; content: unknown; viewer_role?: 'owner' | 'recipient' }
  | { status: 'password_required'; item_type: ItemType; share_type: ShareType }
  | { status: 'denied' | 'revoked' | 'expired' | 'not_found' };

// ─── Item link types ──────────────────────────────────────────────────────────

export type LinkableItemType = 'note' | 'inbox' | 'list' | 'reminder' | 'collection' | 'contact';
export type RelationshipType = 'reference' | 'related' | 'mentioned';

export interface ItemLink {
  id: string;
  user_id: string;
  source_type: LinkableItemType;
  source_id: string;
  target_type: LinkableItemType;
  target_id: string;
  relationship_type: RelationshipType;
  created_at: string;
}

/** A linkable item returned by the search endpoint */
export interface LinkableItem {
  id: string;
  title: string;
  type: LinkableItemType;
}

/** ItemLink with resolved target title/type for display */
export interface ItemLinkWithTarget extends ItemLink {
  target_title?: string;
  source_title?: string;
}

export interface AdminItemLink extends ItemLink {
  owner_email?: string | null;
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

// ─── Version History ──────────────────────────────────────────────────────────

export type VersionableItemType = 'note' | 'inbox' | 'list' | 'reminder' | 'collection';
export type VersionHistoryLimit = 0 | 50 | 100;

export interface ItemVersion {
  id: string;
  user_id: string;
  item_type: VersionableItemType;
  item_id: string;
  version_number: number;
  title_snapshot: string | null;
  content_snapshot: string | null;
  metadata_snapshot: Record<string, unknown> & { summary?: string };
  created_by: string;
  created_at: string;
}

export interface AdminItemVersion extends ItemVersion {
  owner_email: string | null;
}

// ─── Universal Tags ───────────────────────────────────────────────────────────

export type TagColor = 'slate' | 'violet' | 'blue' | 'green' | 'amber' | 'rose' | 'cyan';
export type TagItemType =
  | 'note' | 'inbox' | 'list' | 'reminder' | 'collection' | 'self_chat'
  | 'file' | 'voice_note' | 'contact';

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: TagColor;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface TagWithCount extends Tag {
  item_count: number;
}

export interface TagItem {
  id: string;
  tag_id: string;
  user_id: string;
  item_type: TagItemType;
  item_id: string;
  created_at: string;
  item_title?: string | null;
}

export interface AdminTag extends TagWithCount {
  owner_email: string | null;
}
