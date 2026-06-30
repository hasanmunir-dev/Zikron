'use client';

import { Suspense, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/utils/date';
import type { AdminItemVersion, VersionableItemType } from '@/types';

const TYPES: Array<VersionableItemType | ''> = ['', 'note', 'inbox', 'list', 'reminder', 'collection'];

function HistoryTable() {
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<VersionableItemType | ''>('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'item-versions', page, filterType],
    queryFn: () =>
      api.get<{ versions: AdminItemVersion[]; total: number; page: number; limit: number }>(
        `/api/admin/history?page=${page}&limit=50${filterType ? `&item_type=${filterType}` : ''}`,
      ),
    staleTime: 1000 * 60,
  });

  const versions = data?.versions ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 50));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={filterType}
          onChange={e => { setFilterType(e.target.value as VersionableItemType | ''); setPage(1); }}
          className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-foreground"
        >
          {TYPES.map(t => (
            <option key={t} value={t}>{t === '' ? 'All types' : t}</option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground">{total.toLocaleString()} total versions</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Item ID</th>
              <th className="px-4 py-3 text-left">v#</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Summary</th>
              <th className="px-4 py-3 text-left">Owner</th>
              <th className="px-4 py-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">Loading…</td></tr>
            )}
            {!isLoading && versions.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">No versions found.</td></tr>
            )}
            {versions.map(v => (
              <tr key={v.id} className="hover:bg-accent/30 transition-colors">
                <td className="px-4 py-2.5">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground capitalize">
                    {v.item_type}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground max-w-[120px] truncate">
                  {v.item_id}
                </td>
                <td className="px-4 py-2.5 text-center font-medium">v{v.version_number}</td>
                <td className="px-4 py-2.5 max-w-[200px] truncate">{v.title_snapshot ?? '—'}</td>
                <td className="px-4 py-2.5 max-w-[200px] truncate text-muted-foreground">
                  {(v.metadata_snapshot?.summary as string) ?? '—'}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground text-xs">{v.owner_email ?? '—'}</td>
                <td className="px-4 py-2.5 text-muted-foreground text-xs whitespace-nowrap">
                  {formatRelativeTime(v.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-sm px-3 py-1.5 border border-border rounded-lg hover:bg-accent disabled:opacity-40 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-sm px-3 py-1.5 border border-border rounded-lg hover:bg-accent disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminHistoryPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Version History</h1>
        <p className="text-sm text-muted-foreground mt-0.5">All item version snapshots across all users.</p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <HistoryTable />
      </Suspense>
    </div>
  );
}
