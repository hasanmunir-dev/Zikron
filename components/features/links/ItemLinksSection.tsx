'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Link2, Plus, X, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useItemLinks, useCreateItemLink, useDeleteItemLink } from '@/hooks/queries/use-item-links';
import { LinkPicker, TYPE_CONFIG } from './LinkPicker';
import type { ItemLink, LinkableItem, LinkableItemType } from '@/types';

// ─── Resolve a link target to a navigable href ────────────────────────────────

function itemHref(type: LinkableItemType, id: string): string {
  const paths: Record<LinkableItemType, string> = {
    note:       '/app/notes',
    inbox:      '/app/inbox',
    list:       '/app/lists',
    reminder:   '/app/reminders',
    collection: '/app/collections',
    contact:    '/app/contacts',
  };
  return `${paths[type]}?detail=${id}`;
}

// ─── Single link chip ─────────────────────────────────────────────────────────

interface LinkChipProps {
  link: ItemLink;
  displayType: LinkableItemType;
  displayId: string;
  displayTitle: string | undefined;
  onRemove?: () => void;
  isBacklink?: boolean;
}

function LinkChip({ link, displayType, displayId, displayTitle, onRemove, isBacklink }: LinkChipProps) {
  const cfg = TYPE_CONFIG[displayType];
  const title = displayTitle ?? `${cfg.label} (${displayId.slice(0, 6)}…)`;

  return (
    <div className="flex items-center gap-1.5 group/chip">
      <Link
        href={itemHref(displayType, displayId)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 border border-border transition-colors max-w-[180px]"
      >
        <cfg.Icon size={11} className={`shrink-0 ${cfg.color}`} />
        <span className="text-xs text-foreground truncate">{title}</span>
        {link.relationship_type === 'mentioned' && (
          <span className="text-[9px] text-muted-foreground shrink-0 ml-0.5">wiki</span>
        )}
      </Link>
      {isBacklink && (
        <ArrowRight size={10} className="text-muted-foreground/40 shrink-0" />
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="opacity-0 group-hover/chip:opacity-100 p-0.5 rounded text-muted-foreground hover:text-red-400 transition-all"
          title="Remove link"
        >
          <X size={11} />
        </button>
      )}
    </div>
  );
}

// ─── ItemLinksSection ─────────────────────────────────────────────────────────

interface Props {
  itemType: LinkableItemType;
  itemId: string;
  /** Map of id → title for displaying linked item names */
  titleMap?: Map<string, string>;
}

export function ItemLinksSection({ itemType, itemId, titleMap }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [showBacklinks, setShowBacklinks] = useState(true);

  const { data, isLoading } = useItemLinks(itemType, itemId);
  const createLink = useCreateItemLink();
  const deleteLink = useDeleteItemLink();

  const outgoing = data?.outgoing ?? [];
  const incoming = data?.incoming ?? [];

  // Only show user-created outgoing links (not auto wiki-mentioned ones in the explicit section)
  const explicitOutgoing = outgoing.filter(l => l.relationship_type !== 'mentioned');
  const allLinkedIds = outgoing.map(l => l.target_id);

  function handleSelect(item: LinkableItem) {
    setShowPicker(false);
    createLink.mutate({
      source_type: itemType,
      source_id: itemId,
      target_type: item.type,
      target_id: item.id,
      relationship_type: 'reference',
    });
  }

  function handleRemove(link: ItemLink) {
    deleteLink.mutate({
      id: link.id,
      sourceType: link.source_type,
      sourceId: link.source_id,
      targetType: link.target_type,
      targetId: link.target_id,
    });
  }

  const hasContent = explicitOutgoing.length > 0 || incoming.length > 0;

  if (isLoading) return null;

  return (
    <div className="border-t border-border pt-3 mt-1 space-y-3">
      {/* ── Linked Items ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Link2 size={12} className="text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Linked Items</span>
            {explicitOutgoing.length > 0 && (
              <span className="text-[10px] bg-muted text-muted-foreground px-1 rounded">{explicitOutgoing.length}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowPicker(v => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus size={12} />
            <span>Add link</span>
          </button>
        </div>

        {showPicker && (
          <div className="mb-2">
            <LinkPicker
              onSelect={handleSelect}
              excludeIds={[itemId, ...allLinkedIds]}
              autoFocus
            />
          </div>
        )}

        {explicitOutgoing.length === 0 && !showPicker ? (
          <p className="text-xs text-muted-foreground/60 italic">No linked items yet.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {explicitOutgoing.map(link => (
              <LinkChip
                key={link.id}
                link={link}
                displayType={link.target_type}
                displayId={link.target_id}
                displayTitle={titleMap?.get(link.target_id)}
                onRemove={() => handleRemove(link)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Referenced By (Backlinks) ── */}
      {incoming.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowBacklinks(v => !v)}
            className="flex items-center gap-1.5 mb-2 w-full text-left"
          >
            <ArrowRight size={12} className="text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Referenced By</span>
            <span className="text-[10px] bg-muted text-muted-foreground px-1 rounded">{incoming.length}</span>
            {showBacklinks ? <ChevronUp size={11} className="text-muted-foreground ml-auto" /> : <ChevronDown size={11} className="text-muted-foreground ml-auto" />}
          </button>
          {showBacklinks && (
            <div className="flex flex-wrap gap-1.5">
              {incoming.map(link => (
                <LinkChip
                  key={link.id}
                  link={link}
                  displayType={link.source_type}
                  displayId={link.source_id}
                  displayTitle={titleMap?.get(link.source_id)}
                  isBacklink
                />
              ))}
            </div>
          )}
        </div>
      )}

      {!hasContent && !showPicker && (
        <p className="text-xs text-muted-foreground/50 italic text-center pb-1">
          Link this item to others using the button above or <code className="font-mono bg-muted px-1 rounded">[[Title]]</code> in Markdown.
        </p>
      )}
    </div>
  );
}
