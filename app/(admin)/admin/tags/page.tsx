'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Hash, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { TagChip, TAG_COLORS } from '@/components/features/tags/TagChip';
import { formatRelativeTime } from '@/utils/date';
import type { AdminTag, TagColor } from '@/types';

function TagsTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'tags', page, search],
    queryFn: () =>
      api.get<{ tags: AdminTag[]; total: number; page: number; limit: number }>(
        `/api/admin/tags?page=${page}&limit=50${search ? `&search=${encodeURIComponent(search)}` : ''}`,
      ),
    staleTime: 1000 * 60,
  });

  const tags = data?.tags ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 50));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg flex-1 max-w-xs">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search tags…"
            className="text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground flex-1"
          />
        </div>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tag</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Owner</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Items</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 4 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : tags.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No tags found.
                </td>
              </tr>
            ) : tags.map(tag => (
              <tr key={tag.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <TagChip tag={tag} linkable={false} />
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{tag.owner_email ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{tag.item_count}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{formatRelativeTime(tag.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminTagsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Hash className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold text-foreground">Tags</h1>
      </div>
      <TagsTable />
    </div>
  );
}
