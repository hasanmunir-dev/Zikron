'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Table2, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/utils/date';
import type { AdminList, ListColumn, ListRow, ListCell } from '@/types';

type AdminFullList = AdminList & {
  columns: ListColumn[];
  rows: Array<ListRow & { cells: ListCell[] }>;
};

export default function AdminListDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [list, setList] = useState<AdminFullList | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AdminFullList>(`/api/admin/lists/${id}`)
      .then(data => setList(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-48 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-muted-foreground">List not found.</p>
        <Link href="/admin/lists" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          ← Back to Lists
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <Link href="/admin/lists" className="mt-1 text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <ChevronLeft size={20} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
              <Table2 size={14} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-xl font-bold text-foreground truncate">{list.title}</h1>
          </div>
          {list.description && (
            <p className="text-sm text-muted-foreground mb-1">{list.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <span>
              Owner: <span className="font-medium text-foreground">{list.owner?.full_name ?? list.owner?.email ?? 'Unknown'}</span>
            </span>
            <span>·</span>
            <span>{list.columns.length} columns</span>
            <span>·</span>
            <span>{list.rows.length} rows</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {formatRelativeTime(list.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Tags */}
      {list.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {list.tags.map(tag => (
            <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">#{tag}</span>
          ))}
        </div>
      )}

      {/* Table */}
      {list.columns.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-sm text-muted-foreground">This list has no columns.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-max">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  {list.columns.map((col, idx) => (
                    <th
                      key={col.id}
                      className={`text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground min-w-36 ${idx < list.columns.length - 1 ? 'border-r border-border' : ''}`}
                    >
                      {col.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.rows.length === 0 ? (
                  <tr>
                    <td colSpan={list.columns.length} className="px-4 py-8 text-center text-xs text-muted-foreground">
                      No rows in this list.
                    </td>
                  </tr>
                ) : (
                  list.rows.map(row => (
                    <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                      {list.columns.map((col, idx) => {
                        const cell = row.cells.find(c => c.column_id === col.id);
                        return (
                          <td
                            key={col.id}
                            className={`px-4 py-2.5 text-sm text-foreground ${idx < list.columns.length - 1 ? 'border-r border-border' : ''}`}
                          >
                            {cell?.value || <span className="text-muted-foreground/30">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
