'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Hash, BookOpen, Inbox, List, Bell, FolderOpen, MessageSquare } from 'lucide-react';
import { useTag, useTagItems } from '@/hooks/queries/use-tags';
import { TagChip } from '@/components/features/tags/TagChip';
import { formatRelativeTime } from '@/utils/date';
import type { TagItem, TagItemType } from '@/types';

// ─── Module config ─────────────────────────────────────────────────────────────

const MODULE_CONFIG: Record<TagItemType, {
  label: string;
  icon: React.ElementType;
  href: (id: string) => string;
} | null> = {
  note:        { label: 'Notes',       icon: BookOpen,      href: id => `/app/notes?detail=${id}` },
  inbox:       { label: 'Inbox',       icon: Inbox,         href: id => `/app/inbox?detail=${id}` },
  list:        { label: 'Lists',       icon: List,          href: id => `/app/lists/${id}` },
  reminder:    { label: 'Reminders',   icon: Bell,          href: id => `/app/reminders?detail=${id}` },
  collection:  { label: 'Collections', icon: FolderOpen,    href: id => `/app/collections?detail=${id}` },
  self_chat:   { label: 'Self Chat',   icon: MessageSquare, href: () => `/app/self-chat` },
  file:        null,
  voice_note:  null,
  contact:     null,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TagDetailPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag: rawTag } = use(params);
  const tagName = decodeURIComponent(rawTag);

  const { data: tag, isLoading: tagLoading } = useTag(tagName);
  const { data: items = [], isLoading: itemsLoading } = useTagItems(tagName);

  // Group by item_type
  const groups: Partial<Record<TagItemType, TagItem[]>> = {};
  for (const item of items) {
    if (!groups[item.item_type]) groups[item.item_type] = [];
    groups[item.item_type]!.push(item);
  }

  const isLoading = tagLoading || itemsLoading;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href="/app/tags"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All Tags
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Hash className="w-6 h-6 text-muted-foreground" />
        <div>
          {tag ? (
            <>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-foreground">#{tag.name}</h1>
                <TagChip tag={tag} linkable={false} />
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {tag.item_count === 0 ? 'No items tagged' : tag.item_count === 1 ? '1 item tagged' : `${tag.item_count} items tagged`}
              </p>
            </>
          ) : (
            <h1 className="text-2xl font-semibold text-foreground">#{tagName}</h1>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No items tagged with #{tagName} yet.
        </div>
      ) : (
        <div className="space-y-6">
          {(Object.entries(groups) as [TagItemType, TagItem[]][]).map(([type, typeItems]) => {
            const cfg = MODULE_CONFIG[type];
            if (!cfg) return null;
            const Icon = cfg.icon;
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {cfg.label}
                  </h2>
                  <span className="text-xs text-muted-foreground">({typeItems.length})</span>
                </div>
                <div className="space-y-2">
                  {typeItems.map(item => (
                    <Link
                      key={item.id}
                      href={cfg.href(item.item_id)}
                      className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm text-foreground truncate">
                        {item.item_title ?? `(${type} ${item.item_id.slice(0, 8)}…)`}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0 ml-3">
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
