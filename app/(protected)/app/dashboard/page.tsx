"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
import { useSharedLinks } from "@/hooks/queries/use-shared-links";
import { formatRelativeTime } from "@/utils/date";
import type { Note, InboxItem, SelfChatMessage, List, Reminder, Collection, Contact, SharedLink } from "@/types";

const quickCapture = [
  {
    icon: Inbox,
    label: "Add to Inbox",
    href: "/app/inbox?create=true",
    adminHref: "admin/my-inbox?create=true",
    color: "text-blue-600 bg-blue-100 dark:bg-blue-950/60",
  },
  {
    icon: BookOpen,
    label: "New Note",
    href: "/app/notes?create=true",
    adminHref: "admin/my-notes?create=true",
    color: "text-violet-600 bg-violet-100 dark:bg-violet-950/60",
  },
  {
    icon: Table2,
    label: "New List",
    href: "/app/lists/new",
    adminHref: "admin/my-lists/new",
    color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-950/60",
  },
  {
    icon: MessageSquare,
    label: "Self Chat",
    href: "/app/self-chat",
    adminHref: "admin/my-chat",
    color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60",
  },
  {
    icon: Bell,
    label: "Reminder",
    href: "/app/reminders",
    adminHref: "admin/my-reminders",
    color: "text-amber-600 bg-amber-100 dark:bg-amber-950/60",
  },
];

export default function DashboardPage() {
  const pathname = usePathname();
  const { user } = useAuth();

  const { data: notes = [] } = useQuery({
    queryKey: noteKeys.all(),
    queryFn: () => api.get<Note[]>('/api/notes'),
  });
  const { data: inbox = [] } = useQuery({
    queryKey: inboxKeys.all(),
    queryFn: () => api.get<InboxItem[]>('/api/inbox'),
  });
  const { data: messages = [] } = useQuery({
    queryKey: selfChatKeys.all(),
    queryFn: () => api.get<SelfChatMessage[]>('/api/self-chat'),
  });
  const { data: lists = [] } = useQuery({
    queryKey: listKeys.all(),
    queryFn: () => api.get<List[]>('/api/lists'),
  });
  const { data: reminders = [] } = useQuery({
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

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const activeSharedLinks = (sharedLinks as SharedLink[]).filter(l => {
    const isExpired = !!l.expires_at && new Date(l.expires_at) < new Date();
    return !l.is_revoked && !isExpired;
  });
  const suspiciousAccessCount = (sharedLinks as SharedLink[]).reduce((sum, l) =>
    sum + (l.shared_link_recipients?.reduce((s, r) => s + r.suspicious_access_count, 0) ?? 0), 0,
  );

  const counts = {
    notes: notes.length,
    inbox: inbox.filter(i => i.status === 'inbox').length,
    messages: messages.length,
    lists: lists.length,
    sharedLinks: activeSharedLinks.length,
  };

  const recents = [
    ...notes.slice(0, 3),
    ...inbox.slice(0, 2),
    ...[...messages].reverse().slice(0, 2),
  ]
    .sort((a, b) =>
      new Date((b as Note).updated_at ?? b.created_at).getTime() -
      new Date((a as Note).updated_at ?? a.created_at).getTime(),
    )
    .slice(0, 5);

  const recentLists = lists.slice(0, 3);
  const favorites = [
    ...notes.filter(n => n.is_favorite).slice(0, 3),
    ...messages.filter(m => m.is_favorite).slice(0, 2),
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {greeting}, {firstName}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Here&apos;s what&apos;s happening in your knowledge hub.
        </p>
      </div>

      {/* Suspicious access alert */}
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
              Possible link leak or new device detected on your tracked links. Review your shared links.
            </p>
          </div>
        </Link>
      )}

      {/* Quick capture */}
      <section>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick capture
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {quickCapture.map(({ icon: Icon, label, href, adminHref, color }) => {
            const targetHref = pathname.startsWith("/admin") ? `/${adminHref}` : href;
            return (
              <Link
                key={href}
                href={targetHref}
                className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground text-center">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Overview
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {[
            { label: "Notes", value: counts.notes, icon: BookOpen, href: "/app/notes" },
            { label: "Inbox", value: counts.inbox, icon: Inbox, href: "/app/inbox" },
            { label: "Lists", value: counts.lists, icon: Table2, href: "/app/lists" },
            { label: "Messages", value: counts.messages, icon: MessageSquare, href: "/app/self-chat" },
            { label: "Shared", value: counts.sharedLinks, icon: Link2, href: "/app/shared" },
          ].map(({ label, value, icon: Icon, href }) => (
            <Link
              key={label}
              href={href}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <Icon size={14} className="text-muted-foreground/50" />
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Lists */}
      {recentLists.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recent Lists
            </h3>
            <Link href="/app/lists" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentLists.map((list) => (
              <Link
                key={list.id}
                href={`/app/lists/${list.id}`}
                className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3 hover:shadow-sm transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
                  <Table2 size={13} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="flex-1 text-sm text-foreground truncate">{list.title}</span>
                <span className="text-xs text-muted-foreground shrink-0">{formatRelativeTime(list.updated_at)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Collections */}
      <RecentCollections collections={collections} />

      {/* Favorite Contacts */}
      {contacts.filter(c => c.favorite && !c.archived).length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Favorite Contacts</h3>
            <Link href="/app/contacts?tab=favorites" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {contacts.filter(c => c.favorite && !c.archived).slice(0, 3).map(contact => {
              const initials = contact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <Link
                  key={contact.id}
                  href={`/app/contacts?detail=${contact.id}`}
                  className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 hover:shadow-sm transition-all"
                >
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{contact.name}</p>
                    {contact.job_title && <p className="text-xs text-muted-foreground truncate">{contact.job_title}</p>}
                  </div>
                  <Star size={12} className="text-amber-400 fill-amber-400 shrink-0 ml-auto" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Contacts */}
      {contacts.filter(c => !c.archived).length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Contacts</h3>
            <Link href="/app/contacts" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {contacts.filter(c => !c.archived).slice(0, 4).map(contact => {
              const initials = contact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <Link
                  key={contact.id}
                  href={`/app/contacts?detail=${contact.id}`}
                  className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3 hover:shadow-sm transition-all"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground truncate">{contact.name}</p>
                    {(contact.job_title || contact.company) && (
                      <p className="text-xs text-muted-foreground truncate">
                        {[contact.job_title, contact.company].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {contact.email && <Mail size={12} className="text-muted-foreground/50" />}
                    {contact.phone && <Phone size={12} className="text-muted-foreground/50" />}
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(contact.created_at)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Reminders widget */}
      {(() => {
        const now = new Date();
        const overdue = reminders.filter(r => r.status === 'pending' && r.due_at && new Date(r.due_at) < now);
        const upcoming = reminders.filter(r => r.status === 'pending' && r.due_at && new Date(r.due_at) >= now).slice(0, 3);
        const pending = reminders.filter(r => r.status === 'pending');
        return (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reminders</h3>
              <Link href="/app/reminders" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {pending.length === 0 ? (
              <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-4">
                <Bell size={18} className="text-muted-foreground/40 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">No pending reminders.</p>
                  <Link href="/app/reminders?create=true" className="text-xs text-blue-600 hover:underline">Create one</Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {overdue.length > 0 && (
                  <Link href="/app/reminders?filter=overdue" className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-2.5 hover:shadow-sm transition-all">
                    <Bell size={14} className="text-red-500 shrink-0" />
                    <span className="text-sm text-red-600 dark:text-red-400 font-medium">{overdue.length} overdue reminder{overdue.length !== 1 ? 's' : ''}</span>
                  </Link>
                )}
                {upcoming.map(r => (
                  <Link
                    key={r.id}
                    href={`/app/reminders?detail=${r.id}`}
                    className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3 hover:shadow-sm transition-all"
                  >
                    <Bell size={14} className="text-amber-500 shrink-0" />
                    <span className="flex-1 text-sm text-foreground truncate">{r.title}</span>
                    {r.due_at && <span className="text-xs text-muted-foreground shrink-0">{new Date(r.due_at).toLocaleDateString()}</span>}
                  </Link>
                ))}
                {pending.length > upcoming.length + overdue.length && (
                  <Link href="/app/reminders" className="block text-xs text-center text-muted-foreground hover:text-foreground py-1">
                    +{pending.length - upcoming.length} more pending
                  </Link>
                )}
              </div>
            )}
          </section>
        );
      })()}

      {/* Recent activity */}
      <section>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Recent activity
        </h3>
        {recents.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="Nothing here yet"
            desc="Start by adding something to your inbox or writing a note."
          />
        ) : (
          <div className="space-y-2">
            {recents.map((item) => (
              <RecentItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Favorites */}
      {favorites.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Favorites
            </h3>
            <Link href="/app/notes?tab=favorites" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {favorites.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3">
                <Star size={14} className="text-amber-400 fill-amber-400 shrink-0" />
                <span className="text-sm text-foreground truncate">
                  {"title" in item ? item.title : item.content}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const COLLECTION_COLORS: Record<string, string> = {
  blue: 'bg-blue-500', violet: 'bg-violet-500', green: 'bg-emerald-500',
  rose: 'bg-rose-500', amber: 'bg-amber-500', cyan: 'bg-cyan-500', slate: 'bg-slate-500',
};

function RecentCollections({ collections }: { collections: Collection[] }) {
  const recent = [...collections].filter(c => !c.is_archived).slice(0, 3);
  if (recent.length === 0) return null;
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Collections</h3>
        <Link href="/app/collections" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
          View all <ArrowRight size={12} />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {recent.map(col => (
          <Link
            key={col.id}
            href={`/app/collections?detail=${col.id}`}
            className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 hover:shadow-sm transition-all"
          >
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-base ${COLLECTION_COLORS[col.color ?? ''] ?? 'bg-violet-500'} text-white shrink-0`}>
              {col.icon ?? '📁'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{col.title}</p>
              {col.is_favorite && <Star size={10} className="text-amber-400 fill-amber-400 inline" />}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function RecentItem({ item }: { item: Note | InboxItem | SelfChatMessage }) {
  const isNote = "title" in item && "is_archived" in item;
  const isInbox = "status" in item;
  const label = isNote || isInbox ? (item as Note).title : (item as SelfChatMessage).content;
  const time = formatRelativeTime((item as Note).updated_at ?? item.created_at);
  const href = isNote
    ? `/app/notes?detail=${item.id}`
    : isInbox
      ? `/app/inbox?detail=${item.id}`
      : "/app/self-chat";

  const typeIcon = isNote
    ? { Icon: BookOpen, color: "bg-violet-100 dark:bg-violet-950/60 text-violet-600" }
    : isInbox
      ? { Icon: Inbox, color: "bg-blue-100 dark:bg-blue-950/60 text-blue-600" }
      : { Icon: MessageSquare, color: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600" };

  return (
    <Link
      href={href}
      onClick={isNote ? () => cacheItem(item as Note) : undefined}
      className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3 hover:shadow-sm transition-all"
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${typeIcon.color}`}>
        <typeIcon.Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate">{label}</p>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{time}</span>
    </Link>
  );
}

function EmptyState({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
      <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
        <Icon size={20} className="text-muted-foreground/40" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-xs text-muted-foreground/70 mt-1">{desc}</p>
    </div>
  );
}
