'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Table2, Clock, Trash2, Eye } from 'lucide-react';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/utils/date';
import type { AdminList } from '@/types';

export default function AdminListsPage() {
  const [lists, setLists] = useState<AdminList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AdminList[]>('/api/admin/lists')
      .then(data => setLists(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete list "${title}"? This cannot be undone.`)) return;
    await api.delete(`/api/admin/lists/${id}`);
    setLists(prev => prev.filter(l => l.id !== id));
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">All Lists</h2>
        <p className="text-sm text-muted-foreground mt-0.5">View and manage all user lists.</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading lists...</div>
        ) : lists.length === 0 ? (
          <div className="p-8 text-center">
            <Table2 size={28} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No lists yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Owner</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Columns</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Rows</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Created</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lists.map(list => (
                <tr key={list.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
                        <Table2 size={13} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate max-w-xs">{list.title}</p>
                        {list.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-xs">{list.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="min-w-0">
                      <p className="text-xs text-foreground truncate">{list.profiles?.full_name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground truncate">{list.profiles?.email ?? '—'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-muted-foreground">{list.column_count ?? 0}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-muted-foreground">{list.row_count ?? 0}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={11} />
                      {formatRelativeTime(list.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/lists/${list.id}`}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="View list"
                      >
                        <Eye size={14} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(list.id, list.title)}
                        className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 text-muted-foreground hover:text-red-500 transition-colors"
                        title="Delete list"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
