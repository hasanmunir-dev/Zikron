'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Star, Archive, Pencil, Trash2, Table2, Loader2 } from 'lucide-react';
import { useList, useUpdateList, useDeleteList } from '@/hooks/queries/use-lists';
import { MarkdownViewer } from '@/components/editor/markdown-viewer';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { formatRelativeTime } from '@/utils/date';

interface Props {
  id: string;
}

export function ListDetailView({ id }: Props) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: list, isLoading } = useList(id);
  const updateList = useUpdateList();
  const deleteList = useDeleteList();

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6 animate-pulse">
          <div className="w-6 h-6 rounded bg-muted" />
          <div className="w-48 h-6 rounded bg-muted" />
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center py-20">
        <p className="text-muted-foreground">List not found.</p>
        <Link href="/app/lists" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          ← Back to Lists
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3 min-w-0">
          <Link href="/app/lists" className="mt-1 text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ChevronLeft size={20} />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
                <Table2 size={14} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h1 className="text-xl font-bold text-foreground truncate">{list.title}</h1>
            </div>
            {list.description && (
              <div className="text-sm text-muted-foreground">
                <MarkdownViewer content={list.description} compact />
              </div>
            )}
            <div className="flex items-center gap-3 mt-1.5">
              {list.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {list.tags.map(tag => (
                    <span key={tag} className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">#{tag}</span>
                  ))}
                </div>
              )}
              <span className="text-xs text-muted-foreground/50">Updated {formatRelativeTime(list.updated_at)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => updateList.mutate({ id: list.id, data: { is_favorite: !list.is_favorite } })}
            className={`p-2 rounded-lg transition-colors ${list.is_favorite ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-500' : 'hover:bg-muted text-muted-foreground'}`}
            title={list.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star size={16} className={list.is_favorite ? 'fill-amber-400' : ''} />
          </button>
          <button
            type="button"
            onClick={() => updateList.mutate({ id: list.id, data: { is_archived: !list.is_archived } })}
            className={`p-2 rounded-lg transition-colors ${list.is_archived ? 'bg-muted text-foreground' : 'hover:bg-muted text-muted-foreground'}`}
            title={list.is_archived ? 'Unarchive' : 'Archive'}
          >
            <Archive size={16} />
          </button>
          <Link
            href={`/app/lists/${list.id}/edit`}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
          >
            <Pencil size={14} /> Edit
          </Link>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={deleteList.isPending}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors disabled:opacity-50"
          >
            {deleteList.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span>{list.columns.length} column{list.columns.length !== 1 ? 's' : ''}</span>
        <span>·</span>
        <span>{list.rows.length} row{list.rows.length !== 1 ? 's' : ''}</span>
        {list.is_archived && (
          <>
            <span>·</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">Archived</span>
          </>
        )}
      </div>

      {/* Table */}
      {list.columns.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <Table2 size={28} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-3">This list has no columns yet.</p>
          <Link
            href={`/app/lists/${list.id}/edit`}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <Pencil size={13} /> Add columns
          </Link>
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
                      No rows yet. <Link href={`/app/lists/${list.id}/edit`} className="text-blue-600 hover:underline">Add rows</Link>
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
                            className={`px-4 py-2.5 align-top ${idx < list.columns.length - 1 ? 'border-r border-border' : ''}`}
                          >
                            {cell?.value
                              ? <MarkdownViewer content={cell.value} compact />
                              : <span className="text-muted-foreground/30 text-sm">—</span>}
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

      <DeleteConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete List?"
        description="This action cannot be undone."
        itemName={list.title}
        onConfirm={() => {
          deleteList.mutate(list.id, {
            onSuccess: () => router.push('/app/lists'),
          });
        }}
        isLoading={deleteList.isPending}
      />
    </div>
  );
}
