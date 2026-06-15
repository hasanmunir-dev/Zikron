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
  Zap,
  Table2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { cacheItem } from "@/lib/page-state";
import { noteKeys } from "@/hooks/queries/use-notes";
import { inboxKeys } from "@/hooks/queries/use-inbox";
import { selfChatKeys } from "@/hooks/queries/use-self-chat";
import { listKeys } from "@/hooks/queries/use-lists";
import { formatRelativeTime } from "@/utils/date";
import type { Note, InboxItem, SelfChatMessage, List } from "@/types";

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

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const counts = {
    notes: notes.length,
    inbox: inbox.filter(i => i.status === 'inbox').length,
    messages: messages.length,
    lists: lists.length,
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
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {greeting}, {firstName} 👋
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Here&apos;s what&apos;s happening in your knowledge hub.
        </p>
      </div>

      {/* Quick capture */}
      <section>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick capture
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {quickCapture.map(({ icon: Icon, label, href, adminHref, color }) => {
            const targetHref = pathname.startsWith("/admin") ? `/${adminHref}` : href;
            return (
              <Link
                key={href}
                href={targetHref}
                className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-xl hover:border-border hover:shadow-sm transition-all group"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Notes", value: counts.notes, icon: BookOpen, href: "/app/notes" },
            { label: "Inbox", value: counts.inbox, icon: Inbox, href: "/app/inbox" },
            { label: "Lists", value: counts.lists, icon: Table2, href: "/app/lists" },
            { label: "Messages", value: counts.messages, icon: MessageSquare, href: "/app/self-chat" },
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

      {/* Reminders placeholder */}
      <section className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-xl p-4 flex items-center gap-3">
        <Bell size={20} className="text-amber-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Reminders coming soon</p>
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
            Set time-based reminders for your notes and inbox items.
          </p>
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Recent activity
        </h3>
        {recents.length === 0 ? (
          <EmptyState
            icon={Zap}
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
            <Link href="/app/notes" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
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

  return (
    <Link
      href={href}
      onClick={isNote ? () => cacheItem(item as Note) : undefined}
      className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3 hover:shadow-sm transition-all"
    >
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
