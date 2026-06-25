'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, BookOpen, Inbox, MessageSquare, X, Table2, Bell, FolderOpen } from 'lucide-react';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/utils/date';
import type { Note, InboxItem, SelfChatMessage, List, Reminder, Collection } from '@/types';

type Result =
  | { type: 'note';       item: Note }
  | { type: 'inbox';      item: InboxItem }
  | { type: 'message';    item: SelfChatMessage }
  | { type: 'list';       item: List }
  | { type: 'reminder';   item: Reminder }
  | { type: 'collection'; item: Collection };

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') ?? '';
  const [input, setInput] = useState(query);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);

    const q = query.toLowerCase();

    async function runSearch() {
      const [notes, inbox, messages, lists, reminders, collections] = await Promise.all([
        api.get<Note[]>('/api/notes'),
        api.get<InboxItem[]>('/api/inbox'),
        api.get<SelfChatMessage[]>('/api/self-chat'),
        api.get<List[]>('/api/lists'),
        api.get<Reminder[]>('/api/reminders'),
        api.get<Collection[]>('/api/collections'),
      ]);

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

      const all: Result[] = [
        ...filteredNotes.map(item => ({ type: 'note' as const, item })),
        ...filteredInbox.map(item => ({ type: 'inbox' as const, item })),
        ...filteredMessages.map(item => ({ type: 'message' as const, item })),
        ...filteredLists.map(item => ({ type: 'list' as const, item })),
        ...filteredReminders.map(item => ({ type: 'reminder' as const, item })),
        ...filteredCollections.map(item => ({ type: 'collection' as const, item })),
      ];

      type Dated = { created_at: string; updated_at?: string };
      all.sort((a, b) => {
        const dateA = ((a.item as Dated).updated_at ?? (a.item as Dated).created_at);
        const dateB = ((b.item as Dated).updated_at ?? (b.item as Dated).created_at);
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      setResults(all);
      setLoading(false);
    }

    runSearch();
  }, [query]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim()) router.push(`/app/search?q=${encodeURIComponent(input.trim())}`);
  }

  const typeLabel: Record<Result['type'], string> = {
    note: 'Note', inbox: 'Inbox', message: 'Chat', list: 'List', reminder: 'Reminder', collection: 'Collection',
  };
  const typeIcon: Record<Result['type'], React.ElementType> = {
    note: BookOpen, inbox: Inbox, message: MessageSquare, list: Table2, reminder: Bell, collection: FolderOpen,
  };
  const typeColor: Record<Result['type'], string> = {
    note: 'bg-violet-100 dark:bg-violet-950/60 text-violet-600',
    inbox: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600',
    message: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600',
    list: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600',
    reminder: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600',
    collection: 'bg-fuchsia-100 dark:bg-fuchsia-950/60 text-fuchsia-600',
  };

  function getHref(result: Result): string {
    if (result.type === 'note') return `/app/notes?detail=${result.item.id}`;
    if (result.type === 'inbox') return `/app/inbox?detail=${result.item.id}`;
    if (result.type === 'message') return '/app/self-chat';
    if (result.type === 'list') return `/app/lists/${result.item.id}`;
    if (result.type === 'reminder') return `/app/reminders?detail=${result.item.id}`;
    if (result.type === 'collection') return `/app/collections?detail=${result.item.id}`;
    return '/app/dashboard';
  }

  function getLabel(result: Result): string {
    if (result.type === 'note') return result.item.title;
    if (result.type === 'inbox') return result.item.title;
    if (result.type === 'message') return result.item.content;
    if (result.type === 'list') return result.item.title;
    if (result.type === 'reminder') return result.item.title;
    if (result.type === 'collection') return result.item.title;
    return '';
  }

  function getSub(result: Result): string | null {
    if (result.type === 'note') return result.item.content;
    if (result.type === 'list') return result.item.description;
    if (result.type === 'reminder') return result.item.description;
    if (result.type === 'collection') return result.item.description;
    return null;
  }

  function highlight(text: string, q: string) {
    if (!q) return text;
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase()
        ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 rounded-sm">{part}</mark>
        : part
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Search</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Search across notes, inbox, messages, lists, reminders, and collections.</p>
      </div>

      <form onSubmit={handleSearch} className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Search everything..."
          className="w-full pl-10 pr-10 py-2.5 text-sm border border-border rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
        {input && (
          <button
            type="button"
            aria-label="Clear"
            onClick={() => setInput('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <X size={14} />
          </button>
        )}
      </form>

      {!query && (
        <div className="text-center py-16">
          <Search size={32} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Type something to search</p>
        </div>
      )}

      {query && loading && (
        <div className="text-center py-8 text-sm text-muted-foreground">Searching...</div>
      )}

      {query && !loading && results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground font-medium">No results for &quot;{query}&quot;</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Try different keywords.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-3">{results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;</p>
          <div className="space-y-3">
            {results.map((result, idx) => {
              const Icon = typeIcon[result.type];
              const label = getLabel(result);
              const sub = getSub(result);
              const href = getHref(result);

              return (
                <Link
                  key={`${result.type}-${result.item.id}-${idx}`}
                  href={href}
                  className="flex items-start gap-3 bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-all"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeColor[result.type]}`}>
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {typeLabel[result.type]}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">
                      {highlight(label, query)}
                    </p>
                    {sub && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {highlight(sub, query)}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground/50 shrink-0">
                    {formatRelativeTime(result.item.created_at)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
