"use client";

import Link from "next/link";
import { Link as LinkIcon, FileText } from "lucide-react";
import { MarkdownViewer } from "@/components/editor/markdown-viewer";
import { ItemActions } from "@/components/shared/item-actions";
import { cacheItem } from "@/lib/page-state";
import { formatRelativeTime } from "@/utils/date";
import type { InboxItem } from "@/types";

interface Props {
  item: InboxItem;
  detailUrl: string;
  onToggleFavorite: (id: string, current: boolean) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export function InboxItemCard({
  item,
  detailUrl,
  onToggleFavorite,
  onArchive,
  onDelete,
}: Props) {
  return (
    <Link href={detailUrl}
        scroll={false}
        onClick={() => cacheItem(item)} className="group block relative bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-all">
      {/* <Link
        href={detailUrl}
        scroll={false}
        onClick={() => cacheItem(item)}
        className="absolute inset-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label={`Open: ${item.title}`}
      /> */}
      <div className="flex items-start gap-3">
        <div className="relative z-10 w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
          {item.type === "link" ? (
            <LinkIcon size={15} className="text-blue-500" />
          ) : (
            <FileText size={15} className="text-muted-foreground" />
          )}
        </div>

        <div className="relative z-10 flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {item.title}
          </p>
          {item.content && (
            <div className="mt-0.5 line-clamp-3 text-xs text-muted-foreground [&_.prose]:text-xs [&_.prose_p]:my-0 [&_.prose_ul]:my-0 [&_.prose_ol]:my-0 [&_.prose_li]:my-0 [&_.prose_h1]:text-xs [&_.prose_h2]:text-xs [&_.prose_h3]:text-xs [&_.prose_pre]:my-0 [&_.prose_blockquote]:my-0">
              <MarkdownViewer content={item.content} compact />
            </div>
          )}
          {item.url && (
            <p className="text-xs text-blue-500 mt-0.5 truncate">
              {item.url}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
            <span className="text-xs text-muted-foreground/50">
              {formatRelativeTime(item.created_at)}
            </span>
          </div>
        </div>

        <div className="relative z-10 shrink-0">
          <ItemActions
            isFavorite={item.status === "favorite"}
            onToggleFavorite={() => onToggleFavorite(item.id, item.status === "favorite")}
            isArchived={item.status === "archived"}
            onToggleArchive={() => onArchive(item.id)}
            onDelete={() => onDelete(item.id)}
            deleteTitle="Delete Inbox Item?"
            itemName={item.title}
            collectionItemType="inbox"
            collectionItemId={item.id}
          />
        </div>
      </div>
    </Link>
  );
}
