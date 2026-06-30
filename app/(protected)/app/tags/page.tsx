'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Hash, Search, Trash2 } from 'lucide-react';
import { useTags, useDeleteTag } from '@/hooks/queries/use-tags';
import { TagChip, TAG_COLORS } from '@/components/features/tags/TagChip';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import type { TagWithCount, TagColor } from '@/types';

export default function TagsPage() {
  const [query, setQuery] = useState('');
  const [deletingTag, setDeletingTag] = useState<TagWithCount | null>(null);
  const { data: tags = [], isLoading } = useTags();
  const deleteTag = useDeleteTag();

  const filtered = tags.filter(t =>
    !query || t.name.includes(query.toLowerCase().trim()),
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold text-foreground">Tags</h1>
          <span className="text-sm text-muted-foreground">({tags.length})</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg mb-6">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search tags…"
          className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Tag grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {query ? `No tags matching "${query}"` : 'No tags yet. Add #tags inside notes, reminders, or other items.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(tag => {
            const colors = TAG_COLORS[tag.color as TagColor] ?? TAG_COLORS.slate;
            return (
              <div
                key={tag.id}
                className="group flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
              >
                <Link
                  href={`/app/tags/${encodeURIComponent(tag.name)}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors.bg.replace('bg-', 'bg-').split(' ')[0]}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">#{tag.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tag.item_count === 0
                        ? 'No items'
                        : tag.item_count === 1
                        ? '1 item'
                        : `${tag.item_count} items`}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-1">
                  <TagChip tag={tag} linkable={false} size="xs" />
                  <button
                    type="button"
                    onClick={() => setDeletingTag(tag)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all"
                    title="Delete tag"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deletingTag}
        onOpenChange={open => { if (!open) setDeletingTag(null); }}
        title="Delete Tag?"
        description="This will remove the tag from all items. Items themselves will not be deleted."
        itemName={deletingTag?.name ? `#${deletingTag.name}` : undefined}
        onConfirm={() => {
          if (deletingTag) deleteTag.mutate(deletingTag.id);
          setDeletingTag(null);
        }}
      />
    </div>
  );
}
