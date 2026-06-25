"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Table2, Search, X } from "lucide-react";
import { useLists, useUpdateList, useDeleteList } from "@/hooks/queries/use-lists";
import { formatRelativeTime } from "@/utils/date";
import { ItemActions } from "@/components/shared/item-actions";
import type { List } from "@/types";

type Tab = "all" | "favorites" | "archived";

export function ListsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");

  const { data: lists = [], isFetching } = useLists(tab);
  const updateList = useUpdateList();
  const deleteList = useDeleteList();

  const filtered = search
    ? lists.filter(
        (l) =>
          l.title.toLowerCase().includes(search.toLowerCase()) ||
          l.description?.toLowerCase().includes(search.toLowerCase()) ||
          l.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())),
      )
    : lists;

  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: "All lists" },
    { id: "favorites", label: "Favorites" },
    { id: "archived", label: "Archived" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Lists</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Structured tables for commands, terms, vocabulary, comparisons, and
            more.
          </p>
        </div>
        <Link
          href="/app/lists/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shrink-0"
        >
          <Plus size={16} /> New List
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
        {isFetching && (
          <span className="ml-2 text-xs text-muted-foreground self-center animate-pulse">
            Refreshing…
          </span>
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
          placeholder="Search lists..."
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

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Table2 size={26} className="text-muted-foreground/30" />
          </div>
          <p className="text-base font-semibold text-foreground mb-1">
            {search ? "No lists match your search" : "No lists yet"}
          </p>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-5">
            {!search &&
              "Create your first structured table for commands, definitions, formulas, vocabulary, comparisons, or study references."}
          </p>
          {!search && tab === "all" && (
            <Link
              href="/app/lists/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus size={15} /> Create List
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              onToggleFavorite={() =>
                updateList.mutate({ id: list.id, data: { is_favorite: !list.is_favorite } })
              }
              onArchive={() =>
                updateList.mutate({ id: list.id, data: { is_archived: !list.is_archived } })
              }
              onDelete={() => deleteList.mutate(list.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ListCard({
  list,
  onToggleFavorite,
  onArchive,
  onDelete,
}: {
  list: List;
  onToggleFavorite: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const router = useRouter();

  return (
    <Link
      href={`/app/lists/${list.id}`}
      className="group relative bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-all flex flex-col min-h-32"
    >
      <div className="relative z-10 flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
            <Table2
              size={13}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>
          <h3 className="font-semibold text-foreground text-sm line-clamp-2 flex-1">
            {list.title}
          </h3>
        </div>
        <ItemActions
          onEdit={() => router.push(`/app/lists/${list.id}/edit`)}
          isFavorite={list.is_favorite}
          onToggleFavorite={onToggleFavorite}
          isArchived={list.is_archived}
          onToggleArchive={onArchive}
          onDelete={onDelete}
          deleteTitle="Delete List?"
          itemName={list.title}
          collectionItemType="list"
          collectionItemId={list.id}
        />
      </div>

      {list.description && (
        <p className="relative z-10 text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1 mb-2">
          {list.description}
        </p>
      )}

      <div className="relative z-10 mt-auto flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {list.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
        <span className="text-xs text-muted-foreground/50">
          {formatRelativeTime(list.updated_at)}
        </span>
      </div>
    </Link>
  );
}
