'use client';

import { useState } from 'react';
import { ImageIcon, Trash2, RefreshCw, CheckCircle2, AlertCircle, SlidersHorizontal } from 'lucide-react';
import { useAdminBucketFiles, useAdminDeleteBucketFile, type BucketFile } from '@/hooks/queries/use-profile';
import { ProfileAvatar } from '@/components/features/profile/ProfileAvatar';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';

type StatusFilter = 'all' | 'applied' | 'orphaned';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminProfilePicturesPage() {
  const { data, isLoading, refetch, isFetching } = useAdminBucketFiles();
  const deleteMutation = useAdminDeleteBucketFile();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [confirmPath, setConfirmPath] = useState<string | null>(null);

  const files = data?.files ?? [];
  const filtered = filter === 'all' ? files : files.filter(f => f.status === (filter as 'applied' | 'orphaned'));

  const appliedCount = files.filter(f => f.status === 'applied').length;
  const orphanedCount = files.filter(f => f.status === 'orphaned').length;

  function handleDeleteClick(path: string) {
    setConfirmPath(path);
  }

  async function handleConfirmDelete() {
    if (!confirmPath) return;
    await deleteMutation.mutateAsync(confirmPath);
    setConfirmPath(null);
  }

  const fileToDelete = files.find(f => f.path === confirmPath);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Profile Pictures</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage all files in the <code className="text-xs bg-muted px-1 py-0.5 rounded">profile-pictures</code> storage bucket.
            Orphaned files are safe to delete.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-muted-foreground shrink-0"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-2xl font-bold text-foreground">{files.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total files</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{appliedCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Applied</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{orphanedCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Orphaned</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal size={14} className="text-muted-foreground shrink-0" />
        {(['all', 'applied', 'orphaned'] as StatusFilter[]).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors capitalize ${
              filter === f
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {f}{f !== 'all' && (
              <span className="ml-1.5 opacity-70">
                {f === 'applied' ? appliedCount : orphanedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* File list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading bucket files…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <ImageIcon size={28} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {filter === 'all' ? 'No files in bucket.' : `No ${filter} files.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Preview</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Path</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Owner</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Size</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(file => (
                  <FileRow
                    key={file.path}
                    file={file}
                    onDelete={() => handleDeleteClick(file.path)}
                    isDeleting={deleteMutation.isPending && confirmPath === file.path}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Safety note */}
      <p className="mt-4 text-[11px] text-muted-foreground/60 text-center">
        Only orphaned files can be deleted. Applied files are currently linked to a user profile and cannot be removed from this panel.
      </p>

      {/* Confirm dialog */}
      <DeleteConfirmDialog
        open={!!confirmPath}
        onOpenChange={(open) => { if (!open) setConfirmPath(null); }}
        title="Delete Orphaned File"
        description="This file is not linked to any profile. Deleting it is permanent and cannot be undone."
        itemName={fileToDelete?.path}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function FileRow({ file, onDelete, isDeleting }: { file: BucketFile; onDelete: () => void; isDeleting: boolean }) {
  return (
    <tr className="hover:bg-muted/20 transition-colors">
      {/* Preview */}
      <td className="px-4 py-3">
        {file.publicUrl ? (
          <ProfileAvatar avatarUrl={file.publicUrl} name={file.owner?.full_name} size="sm" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <ImageIcon size={14} className="text-muted-foreground" />
          </div>
        )}
      </td>

      {/* Path */}
      <td className="px-4 py-3 max-w-50">
        <p className="text-xs font-mono text-foreground truncate">{file.path}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
          {new Date(file.createdAt).toLocaleDateString()}
        </p>
      </td>

      {/* Owner */}
      <td className="px-4 py-3 hidden md:table-cell">
        {file.owner ? (
          <div>
            <p className="text-xs font-medium text-foreground truncate">{file.owner.full_name ?? '—'}</p>
            <p className="text-[10px] text-muted-foreground truncate">{file.owner.email}</p>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        )}
      </td>

      {/* Size */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        {file.status === 'applied' ? (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
            <CheckCircle2 size={13} />
            Applied
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            <AlertCircle size={13} />
            Orphaned
          </span>
        )}
      </td>

      {/* Action */}
      <td className="px-4 py-3 text-right">
        {file.status === 'orphaned' && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="flex items-center gap-1 text-xs font-medium text-destructive hover:bg-destructive/10 px-2 py-1.5 rounded-lg transition-colors ml-auto disabled:opacity-50"
          >
            <Trash2 size={12} />
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        )}
      </td>
    </tr>
  );
}
