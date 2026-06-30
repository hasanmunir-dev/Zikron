'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Link2, Search, X, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { TYPE_CONFIG } from '@/components/features/links/LinkPicker';
import { formatDistanceToNow } from 'date-fns';
import type { AdminItemLink, LinkableItemType, RelationshipType } from '@/types';

const REL_LABELS: Record<RelationshipType, string> = {
  reference: 'Reference',
  related: 'Related',
  mentioned: 'Wiki mention',
};

const REL_COLORS: Record<RelationshipType, string> = {
  reference: 'bg-primary/10 text-primary',
  related: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400',
  mentioned: 'bg-muted text-muted-foreground',
};

function ItemTypeBadge({ type }: { type: LinkableItemType }) {
  const cfg = TYPE_CONFIG[type];
  return (
    <span className="flex items-center gap-1 text-xs">
      <cfg.Icon size={11} className={cfg.color} />
      <span className="text-muted-foreground capitalize">{cfg.label}</span>
    </span>
  );
}

function AdminLinksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page') ?? 1);
  const filterRel = searchParams.get('rel') as RelationshipType | null;
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'item-links', page, filterRel],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (filterRel) params.set('relationship_type', filterRel);
      return api.get<{ links: AdminItemLink[]; total: number; page: number; limit: number }>(
        `/api/admin/item-links?${params}`
      );
    },
    staleTime: 1000 * 60,
  });

  const links = data?.links ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 50);

  const filtered = search.trim()
    ? links.filter(l =>
        (l.owner_email ?? '').toLowerCase().includes(search.toLowerCase()) ||
        l.source_type.includes(search.toLowerCase()) ||
        l.target_type.includes(search.toLowerCase())
      )
    : links;

  function setPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.replace(`/admin/links?${params}`);
  }

  function setRel(rel: RelationshipType | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (rel) params.set('rel', rel); else params.delete('rel');
    params.delete('page');
    router.replace(`/admin/links?${params}`);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Link2 size={20} className="text-primary" />
            <h1 className="text-xl font-bold text-foreground">Knowledge Links</h1>
          </div>
          <p className="text-sm text-muted-foreground">All item-to-item links across the system</p>
        </div>
        <div className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
          {total} total link{total !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter by owner email or type…"
            className="w-full pl-8 pr-7 py-1.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={12} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {(['reference', 'related', 'mentioned'] as RelationshipType[]).map(rel => (
            <button
              key={rel}
              type="button"
              onClick={() => setRel(filterRel === rel ? null : rel)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                filterRel === rel
                  ? REL_COLORS[rel] + ' border-transparent'
                  : 'border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {REL_LABELS[rel]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No links found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-xs text-muted-foreground">
                  <th className="text-left px-4 py-2.5 font-semibold">Source</th>
                  <th className="px-2 py-2.5 w-6" />
                  <th className="text-left px-4 py-2.5 font-semibold">Target</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Relationship</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Owner</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(link => (
                  <tr key={link.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <ItemTypeBadge type={link.source_type} />
                        <p className="text-xs text-muted-foreground/60 font-mono">{link.source_id.slice(0, 8)}…</p>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-muted-foreground/40">
                      <ArrowRight size={12} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <ItemTypeBadge type={link.target_type} />
                        <p className="text-xs text-muted-foreground/60 font-mono">{link.target_id.slice(0, 8)}…</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${REL_COLORS[link.relationship_type]}`}>
                        {REL_LABELS[link.relationship_type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {link.owner_email ?? link.user_id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(link.created_at), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              type="button"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminLinksPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
      <AdminLinksContent />
    </Suspense>
  );
}
