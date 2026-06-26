'use client';

import Link from 'next/link';
import { FileText, Inbox, Table2, FolderOpen, Bell, ArrowRight } from 'lucide-react';
import type { ItemType } from '@/types';

// ─── Item metadata ────────────────────────────────────────────────────────────

const ITEM_ICONS: Record<ItemType, React.ElementType> = {
  note: FileText,
  inbox: Inbox,
  list: Table2,
  collection: FolderOpen,
  reminder: Bell,
};

const ITEM_LABELS: Record<ItemType, string> = {
  note: 'Note',
  inbox: 'Inbox item',
  list: 'List',
  collection: 'Collection',
  reminder: 'Reminder',
};

const ITEM_OPEN_LABELS: Record<ItemType, string> = {
  note: 'Open Note',
  inbox: 'Open Inbox item',
  list: 'Open List',
  collection: 'Open Collection',
  reminder: 'Open Reminder',
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  itemType: ItemType;
  itemTitle: string | null;
  itemPreview: string | null;
  openUrl: string;
  ownerLabel?: string | null;
}

export function SharedItemPreviewCard({ itemType, itemTitle, itemPreview, openUrl, ownerLabel }: Props) {
  const Icon = ITEM_ICONS[itemType];
  const isAvailable = !!itemTitle;

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-2">
      {/* Header row */}
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-background border border-border">
          <Icon size={13} className="text-muted-foreground" />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
          {ITEM_LABELS[itemType]}
        </span>
        {ownerLabel && (
          <span className="text-[10px] text-muted-foreground">by {ownerLabel}</span>
        )}
      </div>

      {/* Title + preview */}
      {isAvailable ? (
        <>
          <p className="text-sm font-semibold text-foreground leading-tight line-clamp-1">{itemTitle}</p>
          {itemPreview && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{itemPreview}</p>
          )}
        </>
      ) : (
        <p className="text-xs text-muted-foreground italic">This shared item is no longer available.</p>
      )}

      {/* Open button */}
      <div className="pt-1">
        {isAvailable ? (
          <Link
            href={openUrl}
            scroll={false}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            {ITEM_OPEN_LABELS[itemType]}
            <ArrowRight size={11} />
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground cursor-not-allowed opacity-50">
            {ITEM_OPEN_LABELS[itemType]}
          </span>
        )}
      </div>
    </div>
  );
}
