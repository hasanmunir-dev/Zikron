"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Inbox,
  BookOpen,
  MessageSquare,
  Bell,
  Star,
  ArrowRight,
  Clock,
  Table2,
  FolderOpen,
  Users,
  Mail,
  Phone,
  Link2,
  AlertTriangle,
  Plus,
  TrendingUp,
  CheckCircle2,
  BellOff,
  BellRing,
  Share2,
  Network,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { cacheItem } from "@/lib/page-state";
import { noteKeys } from "@/hooks/queries/use-notes";
import { inboxKeys } from "@/hooks/queries/use-inbox";
import { selfChatKeys } from "@/hooks/queries/use-self-chat";
import { listKeys } from "@/hooks/queries/use-lists";
import { reminderKeys } from "@/hooks/queries/use-reminders";
import { collectionKeys } from "@/hooks/queries/use-collections";
import { contactKeys } from "@/hooks/queries/use-contacts";
import { useSharedLinks, useSharedWithMe } from "@/hooks/queries/use-shared-links";
import { useRecentLinks } from "@/hooks/queries/use-item-links";
import { useRecentVersions } from "@/hooks/queries/use-history";
import { useFrequentTags, useRecentTags } from "@/hooks/queries/use-tags";
import { TagChip } from "@/components/features/tags/TagChip";
import { TYPE_CONFIG } from "@/components/features/links/LinkPicker";
import { GraphCanvas } from "@/components/features/graph/GraphCanvas";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { formatRelativeTime } from "@/utils/date";
import type { Note, InboxItem, SelfChatMessage, List, Reminder, Collection, Contact, SharedLink, SharedWithMeItem, ItemLink, LinkableItemType, VersionableItemType } from "@/types";

const COLLECTION_COLORS: Record<string, string> = {
  blue: 'bg-blue-500', violet: 'bg-violet-500', green: 'bg-emerald-500',
  rose: 'bg-rose-500', amber: 'bg-amber-500', cyan: 'bg-cyan-500', slate: 'bg-slate-500',
};

function getComputedStatus(r: Reminder) {
  const now = new Date();
  if (r.status !== 'pending') return r.status;
  if (!r.due_at) return 'pending';
  const due = new Date(r.due_at);
  if (due < now) return 'overdue';
  const today = new Date(); today.setHours(23, 59, 59, 999);
  if (due <= today) return 'today';
  return 'upcoming';
}

// ──────────────────────────────────────────────
//  Skeleton
// ──────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-muted rounded animate-pulse ${className}`} />;
}

// ──────────────────────────────────────────────
//  Widget wrapper
// ──────────────────────────────────────────────
function Widget({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-2xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function WidgetHeader({ title, href, count }: { title: string; href?: string; count?: number }) {
  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-2">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
        {count !== undefined && count > 0 && (
          <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-medium">{count}</span>
        )}
      </div>
      {href && (
        <Link href={href} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
          View all <ArrowRight size={11} />
        </Link>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
//  Today's Reminders
// ──────────────────────────────────────────────
function TodayRemindersWidget({ reminders }: { reminders: Reminder[] }) {
  const todayItems = reminders.filter(r => getComputedStatus(r) === 'today');
  return (
    <Widget>
      <WidgetHeader title="Due Today" href="/app/reminders?filter=today" count={todayItems.length} />
      <div className="px-4 pb-4">
        {todayItems.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No reminders due today.</p>
        ) : (
          <div className="space-y-2">
            {todayItems.slice(0, 4).map(r => (
              <Link
                key={r.id}
                href={`/app/reminders?detail=${r.id}`}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 border border-border hover:shadow-sm transition-all bg-background"
              >
                <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                <span className="flex-1 text-sm text-foreground truncate">{r.title}</span>
                {r.due_at && (
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(r.due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
        <Link
          href="/app/reminders?create=true"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-3 transition-colors"
        >
          <Plus size={12} /> New reminder
        </Link>
      </div>
    </Widget>
  );
}

// ──────────────────────────────────────────────
//  Overdue Reminders
// ──────────────────────────────────────────────
function OverdueWidget({ reminders }: { reminders: Reminder[] }) {
  const overdue = reminders.filter(r => getComputedStatus(r) === 'overdue');
  if (overdue.length === 0) return null;
  return (
    <Widget>
      <WidgetHeader title="Overdue" href="/app/reminders?filter=overdue" count={overdue.length} />
      <div className="px-4 pb-4 space-y-2">
        {overdue.slice(0, 5).map(r => (
          <Link
            key={r.id}
            href={`/app/reminders?detail=${r.id}`}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 hover:shadow-sm transition-all"
          >
            <Bell size={13} className="text-red-500 shrink-0" />
            <span className="flex-1 text-sm text-foreground truncate">{r.title}</span>
            {r.due_at && (
              <span className="text-[10px] text-red-500 shrink-0">
                {formatRelativeTime(r.due_at)}
              </span>
            )}
          </Link>
        ))}
        {overdue.length > 5 && (
          <Link href="/app/reminders?filter=overdue" className="text-xs text-center block text-muted-foreground hover:text-foreground">
            +{overdue.length - 5} more overdue
          </Link>
        )}
      </div>
    </Widget>
  );
}

// ──────────────────────────────────────────────
//  Recent Notes
// ──────────────────────────────────────────────
function RecentNotesWidget({ notes }: { notes: Note[] }) {
  const recent = notes.filter(n => !n.is_archived).slice(0, 4);
  return (
    <Widget>
      <WidgetHeader title="Recent Notes" href="/app/notes" />
      <div className="px-4 pb-4">
        {recent.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No notes yet.</p>
        ) : (
          <div className="space-y-2">
            {recent.map(note => (
              <Link
                key={note.id}
                href={`/app/notes?detail=${note.id}`}
                onClick={() => cacheItem(note)}
                className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 border border-border bg-background hover:shadow-sm transition-all"
              >
                <BookOpen size={13} className="text-violet-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate font-medium">{note.title}</p>
                  {note.content && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{note.content}</p>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{formatRelativeTime(note.updated_at)}</span>
              </Link>
            ))}
          </div>
        )}
        <Link
          href="/app/notes?create=true"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-3 transition-colors"
        >
          <Plus size={12} /> New note
        </Link>
      </div>
    </Widget>
  );
}

// ──────────────────────────────────────────────
//  Recent Inbox
// ──────────────────────────────────────────────
function RecentInboxWidget({ inbox }: { inbox: InboxItem[] }) {
  const recent = inbox.filter(i => i.status !== 'archived').slice(0, 4);
  return (
    <Widget>
      <WidgetHeader title="Recent Inbox" href="/app/inbox" />
      <div className="px-4 pb-4">
        {recent.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">Inbox is empty.</p>
        ) : (
          <div className="space-y-2">
            {recent.map(item => (
              <Link
                key={item.id}
                href={`/app/inbox?detail=${item.id}`}
                className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 border border-border bg-background hover:shadow-sm transition-all"
              >
                <Inbox size={13} className="text-blue-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate font-medium">{item.title}</p>
                  {item.url && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{item.url}</p>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{formatRelativeTime(item.created_at)}</span>
              </Link>
            ))}
          </div>
        )}
        <Link
          href="/app/inbox?create=true"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-3 transition-colors"
        >
          <Plus size={12} /> Capture to inbox
        </Link>
      </div>
    </Widget>
  );
}

// ──────────────────────────────────────────────
//  Recent Lists
// ──────────────────────────────────────────────
function RecentListsWidget({ lists }: { lists: List[] }) {
  const recent = lists.filter(l => !l.is_archived).slice(0, 4);
  return (
    <Widget>
      <WidgetHeader title="Recent Lists" href="/app/lists" />
      <div className="px-4 pb-4">
        {recent.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No lists yet.</p>
        ) : (
          <div className="space-y-2">
            {recent.map(list => (
              <Link
                key={list.id}
                href={`/app/lists/${list.id}`}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 border border-border bg-background hover:shadow-sm transition-all"
              >
                <Table2 size={13} className="text-indigo-500 shrink-0" />
                <span className="flex-1 text-sm text-foreground truncate">{list.title}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">{formatRelativeTime(list.updated_at)}</span>
              </Link>
            ))}
          </div>
        )}
        <Link
          href="/app/lists/new"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-3 transition-colors"
        >
          <Plus size={12} /> New list
        </Link>
      </div>
    </Widget>
  );
}

// ──────────────────────────────────────────────
//  Recent Collections
// ──────────────────────────────────────────────
function RecentCollectionsWidget({ collections }: { collections: Collection[] }) {
  const recent = collections.filter(c => !c.is_archived).slice(0, 4);
  return (
    <Widget>
      <WidgetHeader title="Collections" href="/app/collections" />
      <div className="px-4 pb-4">
        {recent.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No collections yet.</p>
        ) : (
          <div className="space-y-2">
            {recent.map(col => (
              <Link
                key={col.id}
                href={`/app/collections?detail=${col.id}`}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 border border-border bg-background hover:shadow-sm transition-all"
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0 ${COLLECTION_COLORS[col.color ?? ''] ?? 'bg-violet-500'} text-white`}>
                  {col.icon ?? '📁'}
                </div>
                <span className="flex-1 text-sm text-foreground truncate">{col.title}</span>
                {col.is_favorite && <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />}
              </Link>
            ))}
          </div>
        )}
        <Link
          href="/app/collections?create=true"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-3 transition-colors"
        >
          <Plus size={12} /> New collection
        </Link>
      </div>
    </Widget>
  );
}

// ──────────────────────────────────────────────
//  Shared With Me
// ──────────────────────────────────────────────
function SharedWithMeWidget({ items }: { items: SharedWithMeItem[] }) {
  const recent = items.slice(0, 3);
  if (recent.length === 0) return null;
  return (
    <Widget>
      <WidgetHeader title="Shared with Me" href="/app/shared?tab=received" count={items.length} />
      <div className="px-4 pb-4 space-y-2">
        {recent.map(item => (
          <div key={item.share_id} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 border border-border bg-background">
            <Share2 size={13} className="text-rose-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.item_type} · from {item.owner?.full_name ?? item.owner?.email ?? 'Unknown'}</p>
            </div>
          </div>
        ))}
      </div>
    </Widget>
  );
}

// ──────────────────────────────────────────────
//  Notification Status
// ──────────────────────────────────────────────
function NotificationWidget() {
  const { permission, isSubscribed, enable } = usePushNotifications();
  if (isSubscribed) return null;
  return (
    <Widget>
      <div className="px-4 py-4">
        <div className="flex items-start gap-3">
          {permission === 'denied' ? (
            <BellOff size={16} className="text-red-500 shrink-0 mt-0.5" />
          ) : (
            <BellRing size={16} className="text-amber-500 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {permission === 'denied' ? 'Notifications blocked' : 'Enable notifications'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {permission === 'denied'
                ? 'Allow Zikron in browser settings to get reminder alerts.'
                : 'Get alerted when reminders are due.'}
            </p>
            {permission !== 'denied' && (
              <button
                type="button"
                onClick={enable}
                className="mt-2 text-xs px-3 py-1 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Enable push notifications
              </button>
            )}
          </div>
        </div>
      </div>
    </Widget>
  );
}

// ──────────────────────────────────────────────
//  Quick Actions
// ──────────────────────────────────────────────
const quickActions = [
  { icon: BookOpen,   label: 'New Note',        href: '/app/notes?create=true',       color: 'text-violet-600 bg-violet-100 dark:bg-violet-950/60' },
  { icon: Inbox,      label: 'Capture Inbox',   href: '/app/inbox?create=true',        color: 'text-blue-600 bg-blue-100 dark:bg-blue-950/60' },
  { icon: Table2,     label: 'New List',         href: '/app/lists/new',                color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950/60' },
  { icon: Bell,       label: 'New Reminder',     href: '/app/reminders?create=true',   color: 'text-amber-600 bg-amber-100 dark:bg-amber-950/60' },
  { icon: FolderOpen, label: 'New Collection',   href: '/app/collections?create=true', color: 'text-fuchsia-600 bg-fuchsia-100 dark:bg-fuchsia-950/60' },
  { icon: Users,      label: 'Add Contact',      href: '/app/contacts?create=true',    color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-950/60' },
];

function QuickActionsWidget() {
  return (
    <Widget>
      <WidgetHeader title="Quick Actions" />
      <div className="px-4 pb-4 grid grid-cols-3 gap-2">
        {quickActions.map(({ icon: Icon, label, href, color }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-background hover:border-primary/30 hover:shadow-sm transition-all group"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
              <Icon size={16} />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground text-center leading-tight">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </Widget>
  );
}

// ──────────────────────────────────────────────
//  Recent Activity
// ──────────────────────────────────────────────
function RecentActivityWidget({
  notes,
  inbox,
  messages,
  reminders,
  lists,
}: {
  notes: Note[];
  inbox: InboxItem[];
  messages: SelfChatMessage[];
  reminders: Reminder[];
  lists: List[];
}) {
  type ActivityItem = {
    id: string;
    label: string;
    type: string;
    icon: React.ElementType;
    iconColor: string;
    href: string;
    time: string;
  };

  const items: ActivityItem[] = [
    ...notes.slice(0, 3).map(n => ({
      id: `note-${n.id}`,
      label: n.title,
      type: 'Note',
      icon: BookOpen,
      iconColor: 'text-violet-500',
      href: `/app/notes?detail=${n.id}`,
      time: n.updated_at ?? n.created_at,
    })),
    ...inbox.filter(i => i.status !== 'archived').slice(0, 2).map(i => ({
      id: `inbox-${i.id}`,
      label: i.title,
      type: 'Inbox',
      icon: Inbox,
      iconColor: 'text-blue-500',
      href: `/app/inbox?detail=${i.id}`,
      time: i.created_at,
    })),
    ...[...messages].reverse().slice(0, 2).map(m => ({
      id: `msg-${m.id}`,
      label: m.content,
      type: 'Chat',
      icon: MessageSquare,
      iconColor: 'text-emerald-500',
      href: '/app/self-chat',
      time: m.created_at,
    })),
    ...reminders.filter(r => r.status === 'pending').slice(0, 2).map(r => ({
      id: `rem-${r.id}`,
      label: r.title,
      type: 'Reminder',
      icon: Bell,
      iconColor: 'text-amber-500',
      href: `/app/reminders?detail=${r.id}`,
      time: r.created_at,
    })),
    ...lists.slice(0, 2).map(l => ({
      id: `list-${l.id}`,
      label: l.title,
      type: 'List',
      icon: Table2,
      iconColor: 'text-indigo-500',
      href: `/app/lists/${l.id}`,
      time: l.updated_at ?? l.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 6);

  return (
    <Widget>
      <WidgetHeader title="Recent Activity" />
      <div className="px-4 pb-4">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">Nothing yet. Start adding content.</p>
        ) : (
          <div className="space-y-1.5">
            {items.map(item => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-muted/60 transition-colors"
              >
                <item.icon size={13} className={`${item.iconColor} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{item.label}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{item.type}</span>
                  <span className="text-[10px] text-muted-foreground">{formatRelativeTime(item.time)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Widget>
  );
}

// ──────────────────────────────────────────────
//  Stats Row
// ──────────────────────────────────────────────
function StatsRow({
  notes, inbox, lists, reminders, collections, contacts, sharedLinks,
}: {
  notes: Note[];
  inbox: InboxItem[];
  lists: List[];
  reminders: Reminder[];
  collections: Collection[];
  contacts: Contact[];
  sharedLinks: SharedLink[];
}) {
  const pendingReminders = reminders.filter(r => r.status === 'pending').length;
  const activeInbox = inbox.filter(i => i.status === 'inbox').length;
  const activeShared = sharedLinks.filter(l => !l.is_revoked && !(l.expires_at && new Date(l.expires_at) < new Date())).length;

  const stats = [
    { label: 'Notes',       value: notes.length,       icon: BookOpen,   href: '/app/notes',       color: 'text-violet-600 bg-violet-100 dark:bg-violet-950/60' },
    { label: 'Inbox',       value: activeInbox,         icon: Inbox,       href: '/app/inbox',       color: 'text-blue-600 bg-blue-100 dark:bg-blue-950/60' },
    { label: 'Lists',       value: lists.length,       icon: Table2,      href: '/app/lists',       color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950/60' },
    { label: 'Reminders',   value: pendingReminders,   icon: Bell,        href: '/app/reminders',   color: 'text-amber-600 bg-amber-100 dark:bg-amber-950/60' },
    { label: 'Collections', value: collections.length, icon: FolderOpen,  href: '/app/collections', color: 'text-fuchsia-600 bg-fuchsia-100 dark:bg-fuchsia-950/60' },
    { label: 'Contacts',    value: contacts.length,    icon: Users,       href: '/app/contacts',    color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-950/60' },
    { label: 'Shared',      value: activeShared,       icon: Link2,       href: '/app/shared',      color: 'text-rose-600 bg-rose-100 dark:bg-rose-950/60' },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {stats.map(({ label, value, icon: Icon, href, color }) => (
        <Link
          key={label}
          href={href}
          className="bg-card border border-border rounded-xl p-3 hover:shadow-sm transition-all group"
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${color}`}>
            <Icon size={14} />
          </div>
          <p className="text-xl font-bold text-foreground">{value}</p>
          <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{label}</p>
        </Link>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
//  Contacts Snapshot
// ──────────────────────────────────────────────
function ContactsWidget({ contacts }: { contacts: Contact[] }) {
  const favorites = contacts.filter(c => c.favorite && !c.archived).slice(0, 3);
  if (favorites.length === 0) return null;
  return (
    <Widget>
      <WidgetHeader title="Favorite Contacts" href="/app/contacts?tab=favorites" />
      <div className="px-4 pb-4 space-y-2">
        {favorites.map(contact => {
          const initials = contact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
          return (
            <Link
              key={contact.id}
              href={`/app/contacts?detail=${contact.id}`}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 border border-border bg-background hover:shadow-sm transition-all"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{contact.name}</p>
                {contact.job_title && <p className="text-xs text-muted-foreground truncate">{contact.job_title}</p>}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {contact.email && <Mail size={11} className="text-muted-foreground/50" />}
                {contact.phone && <Phone size={11} className="text-muted-foreground/50" />}
                <Star size={11} className="text-amber-400 fill-amber-400" />
              </div>
            </Link>
          );
        })}
      </div>
    </Widget>
  );
}

// ──────────────────────────────────────────────
//  Recently Edited widget
// ──────────────────────────────────────────────

const VERSION_ITEM_PATHS: Record<VersionableItemType, string> = {
  note: '/app/notes', inbox: '/app/inbox', list: '/app/lists',
  reminder: '/app/reminders', collection: '/app/collections',
};

function RecentlyEditedWidget() {
  const { data: versions = [], isLoading } = useRecentVersions(8);

  if (isLoading || versions.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <WidgetHeader title="Recently Edited" href="#" />
      <div className="space-y-1">
        {versions.map(v => {
          const href = `${VERSION_ITEM_PATHS[v.item_type]}?detail=${v.item_id}`;
          const summary = v.metadata_snapshot?.summary as string | undefined;
          return (
            <Link
              key={v.id}
              href={href}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-accent transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {v.title_snapshot ?? 'Untitled'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {summary ?? v.item_type} · {formatRelativeTime(v.created_at)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
//  Knowledge Graph widget
// ──────────────────────────────────────────────

function GraphWidget() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center">
            <Network size={12} className="text-violet-600 dark:text-violet-400" />
          </div>
          <span className="text-sm font-semibold text-foreground">Knowledge Graph</span>
        </div>
        <Link href="/app/graph" className="text-xs text-primary hover:underline font-medium">
          Open full graph →
        </Link>
      </div>
      <div className="h-52 w-full">
        <GraphCanvas miniMode />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
//  Frequently Used Tags widget
// ──────────────────────────────────────────────

function FrequentTagsWidget() {
  const { data: tags = [], isLoading } = useFrequentTags(12);
  if (isLoading || tags.length === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <WidgetHeader title="Frequently Used Tags" href="/app/tags" />
      <div className="flex flex-wrap gap-1.5">
        {tags.map(tag => (
          <TagChip key={tag.id} tag={tag} linkable size="xs" />
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
//  Recent Tags widget
// ──────────────────────────────────────────────

function RecentTagsWidget() {
  const { data: tags = [], isLoading } = useRecentTags(10);
  if (isLoading || tags.length === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <WidgetHeader title="Recent Tags" href="/app/tags" />
      <div className="flex flex-wrap gap-1.5">
        {tags.map(tag => (
          <TagChip key={tag.id} tag={tag} linkable size="xs" />
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
//  Recently Connected Knowledge widget
// ──────────────────────────────────────────────

const ITEM_PATHS: Record<LinkableItemType, string> = {
  note: '/app/notes', inbox: '/app/inbox', list: '/app/lists',
  reminder: '/app/reminders', collection: '/app/collections', contact: '/app/contacts',
};

function RecentlyConnectedWidget() {
  const { data: links = [], isLoading } = useRecentLinks(6);
  const qc = useQueryClient();

  const idMap = useMemo(() => {
    const m = new Map<string, { title: string; type: LinkableItemType }>();
    const add = (id: string, title: string, type: LinkableItemType) => { if (id) m.set(id, { title, type }); };
    (qc.getQueryData<Note[]>(noteKeys.all()) ?? []).forEach(n => add(n.id, n.title, 'note'));
    (qc.getQueryData<InboxItem[]>(inboxKeys.all()) ?? []).forEach(i => add(i.id, i.title, 'inbox'));
    (qc.getQueryData<List[]>(listKeys.all()) ?? []).forEach(l => add(l.id, l.title, 'list'));
    (qc.getQueryData<Reminder[]>(reminderKeys.all()) ?? []).forEach(r => add(r.id, r.title, 'reminder'));
    (qc.getQueryData<Collection[]>(collectionKeys.all()) ?? []).forEach(c => add(c.id, c.title, 'collection'));
    (qc.getQueryData<Contact[]>(contactKeys.all()) ?? []).forEach(c => add(c.id, c.name, 'contact'));
    return m;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qc]);

  if (isLoading || links.length === 0) return null;

  return (
    <Widget>
      <WidgetHeader title="Recently Connected" href="/app/notes" />
      <div className="px-4 pb-3 space-y-2">
        {(links as ItemLink[]).map(link => {
          const src = idMap.get(link.source_id);
          const tgt = idMap.get(link.target_id);
          const srcCfg = TYPE_CONFIG[link.source_type];
          const tgtCfg = TYPE_CONFIG[link.target_type];
          const srcHref = `${ITEM_PATHS[link.source_type]}?detail=${link.source_id}`;
          const tgtHref = `${ITEM_PATHS[link.target_type]}?detail=${link.target_id}`;
          return (
            <div key={link.id} className="flex items-center gap-1.5 text-xs">
              <Link href={srcHref} className="flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded hover:bg-muted/70 transition-colors max-w-[140px]">
                <srcCfg.Icon size={10} className={`shrink-0 ${srcCfg.color}`} />
                <span className="text-foreground truncate">{src?.title ?? link.source_id.slice(0, 6)}</span>
              </Link>
              <ArrowRight size={10} className="text-muted-foreground/50 shrink-0" />
              <Link href={tgtHref} className="flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded hover:bg-muted/70 transition-colors max-w-[140px]">
                <tgtCfg.Icon size={10} className={`shrink-0 ${tgtCfg.color}`} />
                <span className="text-foreground truncate">{tgt?.title ?? link.target_id.slice(0, 6)}</span>
              </Link>
              <span className="text-muted-foreground/40 ml-auto shrink-0">{formatRelativeTime(link.created_at)}</span>
            </div>
          );
        })}
      </div>
    </Widget>
  );
}

// ──────────────────────────────────────────────
//  Main dashboard page
// ──────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();

  const { data: notes = [], isLoading: notesLoading } = useQuery({
    queryKey: noteKeys.all(),
    queryFn: () => api.get<Note[]>('/api/notes'),
  });
  const { data: inbox = [], isLoading: inboxLoading } = useQuery({
    queryKey: inboxKeys.all(),
    queryFn: () => api.get<InboxItem[]>('/api/inbox'),
  });
  const { data: messages = [] } = useQuery({
    queryKey: selfChatKeys.all(),
    queryFn: () => api.get<SelfChatMessage[]>('/api/self-chat'),
  });
  const { data: lists = [], isLoading: listsLoading } = useQuery({
    queryKey: listKeys.all(),
    queryFn: () => api.get<List[]>('/api/lists'),
  });
  const { data: reminders = [], isLoading: remindersLoading } = useQuery({
    queryKey: reminderKeys.all(),
    queryFn: () => api.get<Reminder[]>('/api/reminders'),
  });
  const { data: collections = [] } = useQuery({
    queryKey: collectionKeys.all(),
    queryFn: () => api.get<Collection[]>('/api/collections'),
  });
  const { data: contacts = [] } = useQuery({
    queryKey: contactKeys.all(),
    queryFn: () => api.get<Contact[]>('/api/contacts'),
  });
  const { data: sharedLinks = [] } = useSharedLinks();
  const { data: sharedWithMe = [] } = useSharedWithMe();

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const suspiciousAccessCount = (sharedLinks as SharedLink[]).reduce(
    (sum, l) => sum + (l.shared_link_recipients?.reduce((s, r) => s + r.suspicious_access_count, 0) ?? 0),
    0,
  );

  const overdueCount = reminders.filter(r => getComputedStatus(r) === 'overdue').length;
  const isInitialLoading = notesLoading && inboxLoading && listsLoading && remindersLoading;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Hero greeting ── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {greeting}, {firstName}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm flex items-center gap-2">
            <TrendingUp size={13} />
            Your knowledge hub — {notes.length + inbox.filter(i => i.status === 'inbox').length + lists.length} items across all modules
          </p>
        </div>
        <Link
          href="/app/search"
          className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 border border-border rounded-lg bg-card hover:shadow-sm transition-all"
        >
          <Clock size={12} /> Search history
        </Link>
      </div>

      {/* ── Alerts ── */}
      <div className="space-y-2">
        {suspiciousAccessCount > 0 && (
          <Link
            href="/app/shared"
            className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
          >
            <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {suspiciousAccessCount} suspicious access{suspiciousAccessCount !== 1 ? 'es' : ''} detected
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Possible link leak or new device detected on your tracked links.
              </p>
            </div>
          </Link>
        )}
        {overdueCount > 0 && (
          <Link
            href="/app/reminders?filter=overdue"
            className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/30 px-4 py-3 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
          >
            <Bell size={15} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                {overdueCount} overdue reminder{overdueCount !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Review and complete or reschedule.</p>
            </div>
          </Link>
        )}
      </div>

      {/* ── Stats row ── */}
      {isInitialLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-3">
              <Skeleton className="w-7 h-7 rounded-lg mb-2" />
              <Skeleton className="h-6 w-8 mb-1" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      ) : (
        <StatsRow
          notes={notes}
          inbox={inbox}
          lists={lists}
          reminders={reminders}
          collections={collections}
          contacts={contacts}
          sharedLinks={sharedLinks as SharedLink[]}
        />
      )}

      {/* ── Main masonry grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          <RecentActivityWidget
            notes={notes}
            inbox={inbox}
            messages={messages as SelfChatMessage[]}
            reminders={reminders}
            lists={lists}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RecentNotesWidget notes={notes} />
            <RecentInboxWidget inbox={inbox} />
          </div>
          <RecentlyEditedWidget />
          <RecentlyConnectedWidget />
          <GraphWidget />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FrequentTagsWidget />
            <RecentTagsWidget />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RecentListsWidget lists={lists} />
            <RecentCollectionsWidget collections={collections} />
          </div>
        </div>

        {/* Right side panel */}
        <div className="space-y-4">
          <QuickActionsWidget />
          <TodayRemindersWidget reminders={reminders} />
          <OverdueWidget reminders={reminders} />
          <SharedWithMeWidget items={sharedWithMe as SharedWithMeItem[]} />
          <ContactsWidget contacts={contacts} />
          <NotificationWidget />
        </div>
      </div>
    </div>
  );
}
