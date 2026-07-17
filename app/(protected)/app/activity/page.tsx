"use client";

import { useState } from "react";
import { Activity, Filter } from "lucide-react";
import { useActivity } from "@/hooks/queries/use-activity";
import { formatRelativeTime } from "@/utils/date";
import type { ActivityItemType } from "@/types";

const ITEM_TYPE_LABELS: Record<string, string> = {
  note: "Notes",
  inbox: "Inbox",
  list: "Lists",
  reminder: "Reminders",
  collection: "Collections",
  tag: "Tags",
  contact: "Contacts",
  shared_link: "Shared Links",
  self_chat: "Self Chat",
};

const ACTION_COLORS: Record<string, string> = {
  created: "text-emerald-500",
  updated: "text-blue-500",
  deleted: "text-red-500",
  restored: "text-violet-500",
  completed: "text-emerald-500",
  cancelled: "text-slate-400",
  shared: "text-cyan-500",
  imported: "text-amber-500",
  archived: "text-slate-400",
  favorited: "text-amber-500",
};

const FILTER_TYPES: Array<{ value: ActivityItemType | undefined; label: string }> = [
  { value: undefined, label: "All" },
  { value: "note", label: "Notes" },
  { value: "inbox", label: "Inbox" },
  { value: "list", label: "Lists" },
  { value: "reminder", label: "Reminders" },
  { value: "collection", label: "Collections" },
  { value: "self_chat", label: "Self Chat" },
  { value: "contact", label: "Contacts" },
];

export default function ActivityPage() {
  const [filterType, setFilterType] = useState<ActivityItemType | undefined>(undefined);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useActivity(filterType);

  const allActivity = data?.pages.flatMap(p => p.activity) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-primary" />
          <h1 className="text-xl font-semibold">Activity Timeline</h1>
          {total > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {total}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          <select
            className="rounded-lg border border-border bg-card px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            value={filterType ?? ""}
            onChange={e => setFilterType((e.target.value as ActivityItemType) || undefined)}
          >
            {FILTER_TYPES.map(({ value, label }) => (
              <option key={value ?? "all"} value={value ?? ""}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="mt-1 h-2 w-2 shrink-0 animate-pulse rounded-full bg-muted" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && allActivity.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <Activity size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No activity yet. Start creating items to see your timeline here.</p>
        </div>
      )}

      {allActivity.length > 0 && (
        <div className="relative">
          <div className="absolute left-[5px] top-0 bottom-0 w-px bg-border" />
          <div className="space-y-0">
            {allActivity.map((entry, i) => (
              <div key={entry.id} className="relative flex gap-4 pb-5">
                <div className="relative mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-border bg-background" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{entry.description}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={ACTION_COLORS[entry.action] ?? "text-muted-foreground"}>
                      {entry.action}
                    </span>
                    <span>·</span>
                    <span>{ITEM_TYPE_LABELS[entry.item_type] ?? entry.item_type}</span>
                    <span>·</span>
                    <span>{formatRelativeTime(entry.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasNextPage && (
        <button
          type="button"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="mt-4 w-full rounded-lg border border-border py-2 text-sm text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          {isFetchingNextPage ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}
