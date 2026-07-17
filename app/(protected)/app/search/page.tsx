'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  BookOpen,
  Inbox,
  MessageSquare,
  X,
  Table2,
  Bell,
  FolderOpen,
  Users,
  Link2,
  ExternalLink,
  ArrowRight,
  LayoutTemplate,
} from 'lucide-react';
import { api } from '@/lib/api';
import { noteKeys } from '@/hooks/queries/use-notes';
import { inboxKeys } from '@/hooks/queries/use-inbox';
import { selfChatKeys } from '@/hooks/queries/use-self-chat';
import { listKeys } from '@/hooks/queries/use-lists';
import { reminderKeys } from '@/hooks/queries/use-reminders';
import { collectionKeys } from '@/hooks/queries/use-collections';
import { contactKeys } from '@/hooks/queries/use-contacts';
import { templateKeys } from '@/hooks/queries/use-templates';
import { formatRelativeTime } from '@/utils/date';
import type { Note, InboxItem, SelfChatMessage, List, Reminder, Collection, Contact, SharedLink, Template } from '@/types';

type FilterTab = 'all' | 'notes' | 'inbox' | 'lists' | 'chat' | 'reminders' | 'collections' | 'contacts' | 'shared' | 'templates';

type Result =
  | { type: 'note';        item: Note }
  | { type: 'inbox';       item: InboxItem }
  | { type: 'message';     item: SelfChatMessage }
  | { type: 'list';        item: List }
  | { type: 'reminder';    item: Reminder }
  | { type: 'collection';  item: Collection }
  | { type: 'contact';     item: Contact }
  | { type: 'shared_link'; item: SharedLink & { created_at: string } }
  | { type: 'template';    item: Template };

const tabConfig: { id: FilterTab; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'all',         label: 'All',         icon: Search,          color: 'text-foreground' },
  { id: 'notes',       label: 'Notes',       icon: BookOpen,        color: 'text-violet-600' },
  { id: 'inbox',       label: 'Inbox',       icon: Inbox,           color: 'text-blue-600' },
  { id: 'lists',       label: 'Lists',       icon: Table2,          color: 'text-indigo-600' },
  { id: 'chat',        label: 'Chat',        icon: MessageSquare,   color: 'text-emerald-600' },
  { id: 'reminders',   label: 'Reminders',   icon: Bell,            color: 'text-amber-600' },
  { id: 'collections', label: 'Collections', icon: FolderOpen,      color: 'text-fuchsia-600' },
  { id: 'contacts',    label: 'Contacts',    icon: Users,           color: 'text-cyan-600' },
  { id: 'shared',      label: 'Shared',      icon: Link2,           color: 'text-rose-600' },
  { id: 'templates',   label: 'Templates',   icon: LayoutTemplate,  color: 'text-orange-600' },
];

const typeLabel: Record<Result['type'], string> = {
  note: 'Note', inbox: 'Inbox', message: 'Chat', list: 'List',
  reminder: 'Reminder', collection: 'Collection', contact: 'Contact', shared_link: 'Shared',
  template: 'Template',
};
const typeIcon: Record<Result['type'], React.ElementType> = {
  note: BookOpen, inbox: Inbox, message: MessageSquare, list: Table2,
  reminder: Bell, collection: FolderOpen, contact: Users, shared_link: Link2,
  template: LayoutTemplate,
};
const typeColor: Record<Result['type'], string> = {
  note:        'bg-violet-100 dark:bg-violet-950/60 text-violet-600',
  inbox:       'bg-blue-100 dark:bg-blue-950/60 text-blue-600',
  message:     'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600',
  list:        'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600',
  reminder:    'bg-amber-100 dark:bg-amber-950/60 text-amber-600',
  collection:  'bg-fuchsia-100 dark:bg-fuchsia-950/60 text-fuchsia-600',
  contact:     'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600',
  shared_link: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600',
  template:    'bg-orange-100 dark:bg-orange-950/60 text-orange-600',
};
const typeBadgeColor: Record<Result['type'], string> = {
  note:        'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400',
  inbox:       'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400',
  message:     'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400',
  list:        'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400',
  reminder:    'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400',
  collection:  'bg-fuchsia-100 dark:bg-fuchsia-950/60 text-fuchsia-700 dark:text-fuchsia-400',
  contact:     'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400',
  shared_link: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400',
  template:    'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400',
};

function getHref(result: Result): string {
  if (result.type === 'note')        return `/app/notes?detail=${result.item.id}`;
  if (result.type === 'inbox')       return `/app/inbox?detail=${result.item.id}`;
  if (result.type === 'message')     return '/app/self-chat';
  if (result.type === 'list')        return `/app/lists/${result.item.id}`;
  if (result.type === 'reminder')    return `/app/reminders?detail=${result.item.id}`;
  if (result.type === 'collection')  return `/app/collections?detail=${result.item.id}`;
  if (result.type === 'contact')     return `/app/contacts?detail=${result.item.id}`;
  if (result.type === 'shared_link') return '/app/shared';
  if (result.type === 'template')    return `/app/templates?detail=${result.item.id}`;
  return '/app/dashboard';
}

function getLabel(result: Result): string {
  if (result.type === 'note')        return result.item.title;
  if (result.type === 'inbox')       return result.item.title;
  if (result.type === 'message')     return result.item.content;
  if (result.type === 'list')        return result.item.title;
  if (result.type === 'reminder')    return result.item.title;
  if (result.type === 'collection')  return result.item.title;
  if (result.type === 'contact')     return result.item.name;
  if (result.type === 'shared_link') return `${result.item.share_type} · ${result.item.item_type}`;
  if (result.type === 'template')    return result.item.name;
  return '';
}

function getSub(result: Result): string | null {
  if (result.type === 'note')        return result.item.content ?? null;
  if (result.type === 'inbox')       return result.item.content ?? result.item.url ?? null;
  if (result.type === 'message')     return null;
  if (result.type === 'list')        return result.item.description ?? null;
  if (result.type === 'reminder')    return result.item.description ?? (result.item.due_at ? `Due ${new Date(result.item.due_at).toLocaleDateString()}` : null);
  if (result.type === 'collection')  return result.item.description ?? null;
  if (result.type === 'contact')     return [result.item.job_title, result.item.company, result.item.email].filter(Boolean).join(' · ') || null;
  if (result.type === 'shared_link') return `${result.item.view_count} view${result.item.view_count !== 1 ? 's' : ''} · ${result.item.is_revoked ? 'revoked' : 'active'}`;
  if (result.type === 'template')    return result.item.description ?? (result.item.template_type ? `Type: ${result.item.template_type}` : null);
  return null;
}

function highlight(text: string, q: string): React.ReactNode {
  if (!q.trim()) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase()
      ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-700/60 rounded-sm px-0.5">{part}</mark>
      : part,
  );
}

function TabButton({ tab, active, onClick }: { tab: typeof tabConfig[0]; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      <tab.icon size={12} />
      {tab.label}
    </button>
  );
}

function ResultCard({ result, query }: { result: Result; query: string }) {
  const Icon = typeIcon[result.type];
  const label = getLabel(result);
  const sub = getSub(result);
  const href = getHref(result);
  const anyItem = result.item as { updated_at?: string; created_at: string };
  const updated = anyItem.updated_at ?? anyItem.created_at;

  return (
    <Link
      href={href}
      className="group flex items-start gap-3 bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/20 transition-all"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${typeColor[result.type]}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeBadgeColor[result.type]}`}>
            {typeLabel[result.type]}
          </span>
          <span className="text-[10px] text-muted-foreground">{formatRelativeTime(updated ?? result.item.created_at)}</span>
        </div>
        <p className="text-sm font-medium text-foreground line-clamp-1">
          {highlight(label, query)}
        </p>
        {sub && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {highlight(sub, query)}
          </p>
        )}
      </div>
      <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-muted-foreground">Open</span>
        <ExternalLink size={12} className="text-muted-foreground" />
      </div>
    </Link>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-4 flex gap-3 animate-pulse">
          <div className="w-9 h-9 rounded-xl bg-muted shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-3 w-1/2 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

const TAB_TYPE_MAP: Record<FilterTab, Result['type'] | null> = {
  all: null, notes: 'note', inbox: 'inbox', lists: 'list',
  chat: 'message', reminders: 'reminder', collections: 'collection',
  contacts: 'contact', shared: 'shared_link', templates: 'template',
};

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') ?? '';
  const [input, setInput] = useState(query);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  useEffect(() => { setInput(query); }, [query]);

  // #tag prefix → redirect to tag page
  useEffect(() => {
    const tagMatch = query.match(/^#([a-z0-9_-]+)$/i);
    if (tagMatch) {
      router.replace(`/app/tags/${encodeURIComponent(tagMatch[1].toLowerCase())}`);
    }
  }, [query, router]);

  const { data: notes = [], isFetching: nf }      = useQuery({ queryKey: noteKeys.all(),      queryFn: () => api.get<Note[]>('/api/notes'),           enabled: !!query });
  const { data: inbox = [], isFetching: inf }      = useQuery({ queryKey: inboxKeys.all(),     queryFn: () => api.get<InboxItem[]>('/api/inbox'),      enabled: !!query });
  const { data: messages = [], isFetching: mf }    = useQuery({ queryKey: selfChatKeys.all(),  queryFn: () => api.get<SelfChatMessage[]>('/api/self-chat'), enabled: !!query });
  const { data: lists = [], isFetching: lf }       = useQuery({ queryKey: listKeys.all(),      queryFn: () => api.get<List[]>('/api/lists'),           enabled: !!query });
  const { data: reminders = [], isFetching: rf }   = useQuery({ queryKey: reminderKeys.all(),  queryFn: () => api.get<Reminder[]>('/api/reminders'),  enabled: !!query });
  const { data: collections = [], isFetching: cf } = useQuery({ queryKey: collectionKeys.all(), queryFn: () => api.get<Collection[]>('/api/collections'), enabled: !!query });
  const { data: contacts = [], isFetching: ctf }   = useQuery({ queryKey: contactKeys.all(),   queryFn: () => api.get<Contact[]>('/api/contacts'),    enabled: !!query });
  const { data: sharedLinks = [], isFetching: sf }  = useQuery({ queryKey: ['shared-links'],        queryFn: () => api.get<SharedLink[]>('/api/shared-links'), enabled: !!query });
  const { data: templates = [], isFetching: tf }    = useQuery({ queryKey: templateKeys.all(),       queryFn: () => api.get<Template[]>('/api/templates'),      enabled: !!query });

  const loading = query && (nf || inf || mf || lf || rf || cf || ctf || sf || tf);

  const allResults = useMemo<Result[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const filteredNotes = notes.filter(n =>
      !n.is_archived && (
        n.title.toLowerCase().includes(q) ||
        (n.content ?? '').toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q))
      )
    );
    const filteredInbox = inbox.filter(i =>
      i.status !== 'archived' && (
        i.title.toLowerCase().includes(q) ||
        (i.content ?? '').toLowerCase().includes(q) ||
        (i.url ?? '').toLowerCase().includes(q) ||
        i.tags.some(t => t.toLowerCase().includes(q))
      )
    );
    const filteredMessages = messages.filter(m => m.content.toLowerCase().includes(q));
    const filteredLists = lists.filter(l =>
      !l.is_archived && (
        l.title.toLowerCase().includes(q) ||
        (l.description ?? '').toLowerCase().includes(q) ||
        l.tags.some(t => t.toLowerCase().includes(q))
      )
    );
    const filteredReminders = reminders.filter(r =>
      r.title.toLowerCase().includes(q) ||
      (r.description ?? '').toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q))
    );
    const filteredCollections = collections.filter(c =>
      !c.is_archived && (
        c.title.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q)
      )
    );
    const filteredContacts = contacts.filter(c =>
      !c.archived && (
        c.name.toLowerCase().includes(q) ||
        (c.email ?? '').toLowerCase().includes(q) ||
        (c.phone ?? '').toLowerCase().includes(q) ||
        (c.company ?? '').toLowerCase().includes(q) ||
        (c.notes ?? '').toLowerCase().includes(q) ||
        (c.emails ?? []).some((e: { value: string }) => e.value?.toLowerCase().includes(q)) ||
        (c.phones ?? []).some((p: { value: string }) => p.value?.toLowerCase().includes(q))
      )
    );
    const filteredSharedLinks = (sharedLinks as SharedLink[]).filter(l =>
      l.item_type.toLowerCase().includes(q) ||
      l.share_type.toLowerCase().includes(q) ||
      l.token.toLowerCase().includes(q)
    );
    const filteredTemplates = (templates as Template[]).filter(t =>
      t.name.toLowerCase().includes(q) ||
      (t.description ?? '').toLowerCase().includes(q) ||
      (t.title_template ?? '').toLowerCase().includes(q) ||
      (t.content_template ?? '').toLowerCase().includes(q) ||
      t.template_type.toLowerCase().includes(q)
    );

    const all: Result[] = [
      ...filteredNotes.map(item => ({ type: 'note' as const, item })),
      ...filteredInbox.map(item => ({ type: 'inbox' as const, item })),
      ...filteredMessages.map(item => ({ type: 'message' as const, item })),
      ...filteredLists.map(item => ({ type: 'list' as const, item })),
      ...filteredReminders.map(item => ({ type: 'reminder' as const, item })),
      ...filteredCollections.map(item => ({ type: 'collection' as const, item })),
      ...filteredContacts.map(item => ({ type: 'contact' as const, item })),
      ...filteredSharedLinks.map(item => ({ type: 'shared_link' as const, item: item as SharedLink & { created_at: string } })),
      ...filteredTemplates.map(item => ({ type: 'template' as const, item })),
    ];

    type Dated = { created_at: string; updated_at?: string };
    all.sort((a, b) => {
      const dateA = ((a.item as Dated).updated_at ?? (a.item as Dated).created_at);
      const dateB = ((b.item as Dated).updated_at ?? (b.item as Dated).created_at);
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    return all;
  }, [query, notes, inbox, messages, lists, reminders, collections, contacts, sharedLinks, templates]);

  const filteredResults = useMemo(() => {
    const mappedType = TAB_TYPE_MAP[activeTab];
    if (!mappedType) return allResults;
    return allResults.filter(r => r.type === mappedType);
  }, [allResults, activeTab]);

  const countByTab = useMemo(() => {
    const counts: Record<FilterTab, number> = {
      all: allResults.length, notes: 0, inbox: 0, lists: 0,
      chat: 0, reminders: 0, collections: 0, contacts: 0, shared: 0, templates: 0,
    };
    for (const result of allResults) {
      const tab = Object.entries(TAB_TYPE_MAP).find(([, t]) => t === result.type)?.[0] as FilterTab | undefined;
      if (tab) counts[tab]++;
    }
    return counts;
  }, [allResults]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    const tagMatch = trimmed.match(/^#([a-z0-9_-]+)$/i);
    if (tagMatch) {
      router.push(`/app/tags/${encodeURIComponent(tagMatch[1].toLowerCase())}`);
    } else {
      router.push(`/app/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-foreground">Search</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Search across notes, inbox, lists, chat, reminders, collections, contacts, and shared items.
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          autoFocus
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Search everything..."
          className="w-full pl-11 pr-10 py-3 text-sm border border-border rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
        {input && (
          <button
            type="button"
            aria-label="Clear"
            onClick={() => { setInput(''); router.push('/app/search'); }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </form>

      {/* Filter tabs */}
      {query && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-4 scrollbar-hide">
          {tabConfig.map(tab => (
            <TabButton
              key={tab.id}
              tab={tab}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>
      )}

      {/* Count summary */}
      {query && !loading && allResults.length > 0 && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground">
            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
            {activeTab !== 'all' && ` in ${tabConfig.find(t => t.id === activeTab)?.label}`}
            {' '}for &quot;{query}&quot;
            {activeTab !== 'all' && countByTab.all > filteredResults.length && (
              <span> · {countByTab.all} total across all types</span>
            )}
          </p>
          {activeTab !== 'all' && (
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              Show all <ArrowRight size={11} />
            </button>
          )}
        </div>
      )}

      {/* Empty state — no query */}
      {!query && (
        <div className="text-center py-20">
          <Search size={36} className="text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-sm font-medium text-muted-foreground">Type to search everything</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Notes · Inbox · Lists · Chat · Reminders · Collections · Contacts · Shared
          </p>
          <div className="mt-4 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <span>Tip: use</span>
            <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 text-[10px] font-medium">⌘K</kbd>
            <span>to open the command palette</span>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {query && loading && <ResultsSkeleton />}

      {/* No results */}
      {query && !loading && filteredResults.length === 0 && allResults.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm font-medium text-muted-foreground">No results for &quot;{query}&quot;</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Try different keywords or check spelling.</p>
        </div>
      )}

      {/* No results in current tab but results exist overall */}
      {query && !loading && filteredResults.length === 0 && allResults.length > 0 && (
        <div className="text-center py-10">
          <p className="text-sm font-medium text-muted-foreground">
            No {tabConfig.find(t => t.id === activeTab)?.label.toLowerCase()} match &quot;{query}&quot;
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className="mt-2 text-xs text-blue-600 hover:underline"
          >
            Show all {allResults.length} results instead
          </button>
        </div>
      )}

      {/* Results */}
      {!loading && filteredResults.length > 0 && (
        <div className="space-y-2">
          {filteredResults.map((result, idx) => (
            <ResultCard
              key={`${result.type}-${result.item.id}-${idx}`}
              result={result}
              query={query}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<ResultsSkeleton />}>
      <SearchResults />
    </Suspense>
  );
}
