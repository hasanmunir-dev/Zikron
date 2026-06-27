"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, BookOpen, Search, X, Users, Check, Trash2, Star, Archive } from "lucide-react";
import { savePageState, getPageState, cacheItem } from "@/lib/page-state";
import { dialogUrl, closeDialogUrl, parseDialogState } from "@/lib/dialog-url";
import { formatRelativeTime } from "@/utils/date";
import { useNotes, useUpdateNote, useDeleteNote, useBulkUpdateNotes, useBulkDeleteNotes } from "@/hooks/queries/use-notes";
import { useSharedWithMe } from "@/hooks/queries/use-shared-links";
import { ItemActions } from "@/components/shared/item-actions";
import { NoteDialog } from "./NoteDialog";
import { ShareDialog } from "@/components/features/sharing/ShareDialog";
import { SharedItemDetailDialog } from "@/components/features/sharing/SharedItemDetailDialog";
import { useBulkSelection } from "@/hooks/use-bulk-selection";
import { BulkActionToolbar } from "@/components/shared/bulk-action-toolbar";
import type { BulkAction } from "@/components/shared/bulk-action-toolbar";
import type { Note, SharedWithMeItem } from "@/types";
import { MasonryGrid, MasonrySkeleton } from "@/components/shared/masonry-grid";

type Tab = "all" | "favorites" | "archived" | "shared";
type SavedState = { tab: Tab; search: string };

interface Props {
  basePath: string;
}

export function NotesPage({ basePath }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stateKey = `notes:${basePath}`;
  
  const saved = getPageState<SavedState>(stateKey);
  const [tab, setTab] = useState<Tab>(saved?.tab ?? "all");
  const notesTab = tab === 'shared' ? 'all' : tab;
  const { data: notes = [], isLoading, isFetching } = useNotes(notesTab);
  const { data: sharedItems = [] } = useSharedWithMe();
  const sharedNotes = sharedItems.filter(i => i.item_type === 'note');

  const [search, setSearch] = useState(saved?.search ?? "");

  const dialog = parseDialogState(searchParams);
  const closeUrl = closeDialogUrl(basePath, searchParams);
  const sharedViewId = searchParams.get("shared_view");
  const sharedViewItem = sharedViewId ? sharedNotes.find(i => i.share_id === sharedViewId) : null;
  const closeSharedViewUrl = (() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("shared_view");
    const qs = p.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  })();
  const shareId = searchParams.get("share");
  const shareNote = shareId ? notes.find(n => n.id === shareId) : null;
  const closeShareUrl = (() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("share");
    const qs = p.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  })();

  // const { data: notes = [], isLoading, isFetching } = useNotes(tab);
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const bulk = useBulkSelection();
  const bulkUpdate = useBulkUpdateNotes();
  const bulkDelete = useBulkDeleteNotes();

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      router.replace(dialogUrl(basePath, "create"));
    }
  }, [searchParams, router, basePath]);

  useEffect(() => {
    savePageState<SavedState>(stateKey, { tab, search });
  }, [tab, search, stateKey]);

  useEffect(() => { bulk.clear(); }, [tab]);

  function handleToggleFavorite(note: Note) {
    updateNote.mutate({ id: note.id, data: { is_favorite: !note.is_favorite } });
  }

  function handleArchive(note: Note) {
    updateNote.mutate({ id: note.id, data: { is_archived: !note.is_archived } });
  }

  function handleDelete(note: Note) {
    deleteNote.mutate(note.id);
  }

  const filteredOwned = search
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.content?.toLowerCase().includes(search.toLowerCase()) ||
          n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())),
      )
    : notes;

  const filteredShared = search
    ? sharedNotes.filter(i => i.title.toLowerCase().includes(search.toLowerCase()))
    : sharedNotes;

  // "all" tab merges owned + shared (shared appear after owned)
  const filtered = tab === 'shared' ? [] : filteredOwned;

  const ownedNoteIds = filtered.map(n => n.id);

  const bulkActions: BulkAction[] = [
    {
      label: 'Favorite',
      icon: Star,
      onClick: () => {
        bulkUpdate.mutate({ ids: bulk.getArray(), updates: { is_favorite: true } });
        bulk.clear();
      },
      disabled: bulkUpdate.isPending,
    },
    {
      label: 'Archive',
      icon: Archive,
      onClick: () => {
        bulkUpdate.mutate({ ids: bulk.getArray(), updates: { is_archived: true } });
        bulk.clear();
      },
      disabled: bulkUpdate.isPending,
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive' as const,
      onClick: () => {
        if (confirm(`Delete ${bulk.selectedCount} note${bulk.selectedCount !== 1 ? 's' : ''}? This cannot be undone.`)) {
          bulkDelete.mutate(bulk.getArray());
          bulk.clear();
        }
      },
      disabled: bulkDelete.isPending,
    },
  ];

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "all", label: "All notes" },
    { id: "favorites", label: "Favorites" },
    { id: "archived", label: "Archived" },
    { id: "shared", label: "Shared with me", count: sharedNotes.length },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Notes</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Write, organize, and find your notes.
          </p>
        </div>
        <Link
          href={dialogUrl(basePath, "create")}
          scroll={false}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> New note
        </Link>
      </div>

      <div className="flex gap-1 mb-5 flex-wrap">
        {tabs.map(({ id, label, count }) => (
          <button
            type="button"
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${
                tab === id
                  ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
          >
            {label}
            {count !== undefined && count > 0 && (
              <span className="text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                {count}
              </span>
            )}
          </button>
        ))}
        {isFetching && notes.length > 0 && (
          <span className="ml-2 self-center w-3 h-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        )}
      </div>

      <div className="relative mb-5">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="w-full pl-9 pr-8 py-2 text-sm border border-border rounded-lg bg-muted text-foreground placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {search && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {tab !== 'shared' && filtered.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            id="select-all-notes"
            checked={bulk.selectedCount === filtered.length && filtered.length > 0}
            onChange={e => bulk.toggleAll(ownedNoteIds, e.target.checked)}
            className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
          />
          <label htmlFor="select-all-notes" className="text-xs text-muted-foreground cursor-pointer select-none">
            {bulk.selectedCount > 0 ? `${bulk.selectedCount} selected` : `Select all ${filtered.length}`}
          </label>
          {bulk.selectedCount > 0 && (
            <button type="button" onClick={bulk.clear} className="text-xs text-muted-foreground hover:text-foreground ml-1">
              Clear
            </button>
          )}
        </div>
      )}

      {tab === 'shared' ? (
        /* ── Shared with me view ── */
        filteredShared.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
              <BookOpen size={22} className="text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {search ? "No shared notes match your search" : "No notes shared with you yet"}
            </p>
          </div>
        ) : (
          <MasonryGrid>
            {filteredShared.map(item => (
              <SharedNoteCard
                key={item.share_id}
                item={item}
                onClick={() => router.push(`${basePath}?shared_view=${item.share_id}`)}
              />
            ))}
          </MasonryGrid>
        )
      ) : isLoading && notes.length === 0 ? (
        <MasonrySkeleton count={6} />
      ) : filtered.length === 0 && (tab !== 'all' || filteredShared.length === 0) ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
            <BookOpen size={22} className="text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {search ? "No notes match your search" : "No notes yet"}
          </p>
          {!search && tab === "all" && (
            <Link
              href={dialogUrl(basePath, "create")}
              scroll={false}
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Write your first note
            </Link>
          )}
        </div>
      ) : (
        <MasonryGrid>
          {filtered.map((note) => (
            <div key={note.id} className="relative group/sel">
              {/* Checkbox overlay */}
              <button
                type="button"
                onClick={e => { e.stopPropagation(); bulk.toggle(note.id); }}
                aria-label={`${bulk.isSelected(note.id) ? 'Deselect' : 'Select'} ${note.title}`}
                className={`absolute top-2 left-2 z-30 flex items-center justify-center w-5 h-5 rounded border-2 transition-all ${
                  bulk.isSelected(note.id)
                    ? 'bg-primary border-primary opacity-100'
                    : 'bg-card border-border opacity-0 group-hover/sel:opacity-100'
                } ${bulk.selectedCount > 0 ? 'opacity-100' : ''}`}
              >
                {bulk.isSelected(note.id) && <Check size={11} className="text-primary-foreground" />}
              </button>
              {/* Click overlay when in bulk mode */}
              {bulk.selectedCount > 0 && (
                <div
                  className="absolute inset-0 z-20 cursor-pointer rounded-xl"
                  onClick={() => bulk.toggle(note.id)}
                  aria-hidden="true"
                />
              )}
              <NoteCard
                key={note.id}
                note={note}
                detailUrl={dialogUrl(basePath, "detail", note.id)}
                editUrl={dialogUrl(basePath, "edit", note.id)}
                onToggleFavorite={() => handleToggleFavorite(note)}
                onArchive={() => handleArchive(note)}
                onDelete={() => handleDelete(note)}
                onShare={() => router.push(`${basePath}?share=${note.id}`)}
              />
            </div>
          ))}
          {/* Shared notes appear in "all" tab after owned notes */}
          {tab === 'all' && filteredShared.map(item => (
            <SharedNoteCard
              key={item.share_id}
              item={item}
              onClick={() => router.push(`${basePath}?shared_view=${item.share_id}`)}
            />
          ))}
        </MasonryGrid>
      )}

      {dialog?.action === "create" && (
        <NoteDialog mode="create" closeUrl={closeUrl} defaultTab="write" />
      )}
      {dialog?.action === "detail" && dialog.id && (
        <NoteDialog
          mode="edit"
          id={dialog.id}
          closeUrl={closeUrl}
          defaultTab="preview"
        />
      )}
      {dialog?.action === "edit" && dialog.id && (
        <NoteDialog
          mode="edit"
          id={dialog.id}
          closeUrl={closeUrl}
          defaultTab="write"
        />
      )}
      {shareId && shareNote && (
        <ShareDialog
          itemType="note"
          itemId={shareId}
          itemTitle={shareNote.title}
          onClose={() => router.push(closeShareUrl)}
        />
      )}
      {sharedViewItem && (
        <SharedItemDetailDialog
          item={sharedViewItem}
          onClose={() => router.push(closeSharedViewUrl)}
        />
      )}
      <BulkActionToolbar
        count={bulk.selectedCount}
        total={filtered.length}
        actions={bulkActions}
        onClear={bulk.clear}
        onSelectAll={() => bulk.toggleAll(ownedNoteIds, true)}
      />
    </div>
  );
}

function NoteCard({
  note,
  detailUrl,
  editUrl,
  onToggleFavorite,
  onArchive,
  onDelete,
  onShare,
}: {
  note: Note;
  detailUrl: string;
  editUrl: string;
  onToggleFavorite: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onShare: () => void;
}) {
  const router = useRouter();

  return (
    <Link
        href={detailUrl}
        scroll={false}
        onClick={() => cacheItem(note)} className="group relative bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-all flex flex-col min-h-35">
      {/* <Link
        href={detailUrl}
        scroll={false}
        onClick={() => cacheItem(note)}
        className="absolute inset-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label={`Open note: ${note.title}`}
      /> */}

      <div className="relative z-10 flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-foreground text-sm line-clamp-2 flex-1">
          {note.title}
        </h3>
        <ItemActions
          onEdit={() => router.push(editUrl)}
          isFavorite={note.is_favorite}
          onToggleFavorite={onToggleFavorite}
          isArchived={note.is_archived}
          onToggleArchive={onArchive}
          onDelete={onDelete}
          deleteTitle="Delete Note?"
          itemName={note.title}
          collectionItemType="note"
          collectionItemId={note.id}
          onShare={onShare}
        />
      </div>

      {note.content && (
        <p className="relative z-10 text-xs text-muted-foreground leading-relaxed line-clamp-4 flex-1">
          {note.content}
        </p>
      )}

      <div className="relative z-10 mt-3 flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
        <span className="text-xs text-muted-foreground/50">
          {formatRelativeTime(note.updated_at)}
        </span>
      </div>
    </Link>
  );
}

function SharedNoteCard({ item, onClick }: { item: SharedWithMeItem; onClick: () => void }) {
  const ownerLabel = item.owner?.full_name ?? item.owner?.email ?? 'Unknown';
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative bg-card border border-blue-200 dark:border-blue-900/50 rounded-xl p-4 hover:shadow-sm transition-all flex flex-col min-h-[140px] text-left w-full"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-foreground text-sm line-clamp-2 flex-1">{item.title}</h3>
        <span className="shrink-0 text-[10px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded-full">
          Shared
        </span>
      </div>
      <div className="flex items-center gap-1.5 mt-auto pt-2">
        <Users size={11} className="text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground truncate">By {ownerLabel}</span>
      </div>
    </button>
  );
}
