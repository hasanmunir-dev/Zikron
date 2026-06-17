'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Table2, Clock, Trash2, Eye, Search, X } from 'lucide-react';
import { useAdminLists, useAdminDeleteList } from '@/hooks/queries/use-admin';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { formatRelativeTime } from '@/utils/date';
import type { AdminList } from '@/types';

export default function AdminListsPage() {
  const { data: lists = [], isLoading } = useAdminLists();
  const deleteList = useAdminDeleteList();
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<AdminList | null>(null);

  const filtered = search
    ? lists.filter(l =>
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.description?.toLowerCase().includes(search.toLowerCase()) ||
        (l.owner?.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (l.owner?.full_name ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : lists;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Lists</h2>
          <p className="text-sm text-muted-foreground mt-0.5">All lists across all users.</p>
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} list{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, description, or user..."
          className="w-full pl-9 pr-8 py-2 text-sm border border-border rounded-lg bg-muted text-foreground placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {search && (
          <button type="button" aria-label="Clear search" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Table2 size={28} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{search ? 'No lists match your search.' : 'No lists yet.'}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Owner</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Columns</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Rows</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Updated</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(list => (
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
                    <p className="text-xs text-foreground truncate">{list.owner?.full_name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground truncate">{list.owner?.email ?? '—'}</p>
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
                      {formatRelativeTime(list.updated_at)}
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
                        onClick={() => setPendingDelete(list)}
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

      <DeleteConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={open => { if (!open) setPendingDelete(null); }}
        title="Delete List?"
        description="This action cannot be undone."
        itemName={pendingDelete?.title}
        onConfirm={() => {
          if (pendingDelete) deleteList.mutate(pendingDelete.id, { onSettled: () => setPendingDelete(null) });
        }}
        isLoading={deleteList.isPending}
      />
    </div>
  );
}
