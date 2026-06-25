"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, BookOpen, Search, X } from "lucide-react";
import { savePageState, getPageState, cacheItem } from "@/lib/page-state";
import { dialogUrl, closeDialogUrl, parseDialogState } from "@/lib/dialog-url";
import { formatRelativeTime } from "@/utils/date";
import { useNotes, useUpdateNote, useDeleteNote } from "@/hooks/queries/use-notes";
import { ItemActions } from "@/components/shared/item-actions";
import { NoteDialog } from "./NoteDialog";
import type { Note } from "@/types";

type Tab = "all" | "favorites" | "archived";
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
  const [search, setSearch] = useState(saved?.search ?? "");

  const dialog = parseDialogState(searchParams);
  const closeUrl = closeDialogUrl(basePath, searchParams);

  const { data: notes = [], isLoading, isFetching } = useNotes(tab);
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      router.replace(dialogUrl(basePath, "create"));
    }
  }, [searchParams, router, basePath]);

  useEffect(() => {
    savePageState<SavedState>(stateKey, { tab, search });
  }, [tab, search, stateKey]);

  function handleToggleFavorite(note: Note) {
    updateNote.mutate({ id: note.id, data: { is_favorite: !note.is_favorite } });
  }

  function handleArchive(note: Note) {
    updateNote.mutate({ id: note.id, data: { is_archived: !note.is_archived } });
  }

  function handleDelete(note: Note) {
    deleteNote.mutate(note.id);
  }

  const filtered = search
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.content?.toLowerCase().includes(search.toLowerCase()) ||
          n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())),
      )
    : notes;

  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: "All notes" },
    { id: "favorites", label: "Favorites" },
    { id: "archived", label: "Archived" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
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

      <div className="flex gap-1 mb-5">
        {tabs.map(({ id, label }) => (
          <button
            type="button"
            key={id}
            onClick={() => setTab(id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${
                tab === id
                  ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
          >
            {label}
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

      {isLoading && notes.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-4 h-32 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              detailUrl={dialogUrl(basePath, "detail", note.id)}
              editUrl={dialogUrl(basePath, "edit", note.id)}
              onToggleFavorite={() => handleToggleFavorite(note)}
              onArchive={() => handleArchive(note)}
              onDelete={() => handleDelete(note)}
            />
          ))}
        </div>
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
}: {
  note: Note;
  detailUrl: string;
  editUrl: string;
  onToggleFavorite: () => void;
  onArchive: () => void;
  onDelete: () => void;
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
