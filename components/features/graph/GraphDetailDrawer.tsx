'use client';

import { X, ExternalLink, Crosshair, GitFork } from 'lucide-react';
import Link from 'next/link';
import { NODE_TYPE_CONFIG } from './GraphNode';
import type { GraphNodeType } from '@/hooks/queries/use-graph';

interface Props {
  nodeId: string;
  nodeType: GraphNodeType;
  label: string;
  data: Record<string, unknown>;
  neighborCount: number;
  onClose: () => void;
  onCenter: () => void;
  onHighlightNeighbors: () => void;
}

const ITEM_HREF: Record<GraphNodeType, (id: string) => string> = {
  note:       id => `/app/notes?detail=${id}`,
  inbox:      id => `/app/inbox?detail=${id}`,
  list:       id => `/app/lists/${id}`,
  reminder:   id => `/app/reminders?detail=${id}`,
  collection: id => `/app/collections?detail=${id}`,
  contact:    id => `/app/contacts?detail=${id}`,
  tag:        id => `/app/tags/${id}`,
};

export function GraphDetailDrawer({ nodeId, nodeType, label, data, neighborCount, onClose, onCenter, onHighlightNeighbors }: Props) {
  const cfg = NODE_TYPE_CONFIG[nodeType];
  const Icon = cfg.icon;
  const itemId = nodeId.split(':').slice(1).join(':');
  const href = ITEM_HREF[nodeType]?.(itemId);

  return (
    <div className="absolute right-3 top-14 z-30 w-64 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      {/* Coloured header strip */}
      <div className={`flex items-center justify-between px-3.5 py-2.5 ${cfg.chip} border-b border-border`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon size={13} strokeWidth={2.2} />
          <span className="text-xs font-semibold uppercase tracking-wider">{cfg.label}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 p-0.5 rounded opacity-70 hover:opacity-100 transition-opacity"
        >
          <X size={13} />
        </button>
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-3">
        {/* Title */}
        <p className="text-sm font-semibold text-foreground leading-snug wrap-break-word">{label}</p>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-1.5">
          {neighborCount > 0 && (
            <span className="text-[11px] bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 font-medium">
              {neighborCount} connection{neighborCount !== 1 ? 's' : ''}
            </span>
          )}
          {data.is_favorite === true && (
            <span className="text-[11px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-full px-2.5 py-0.5 font-medium">
              ★ Favorite
            </span>
          )}
          {data.is_archived === true && (
            <span className="text-[11px] bg-muted text-muted-foreground rounded-full px-2.5 py-0.5">
              Archived
            </span>
          )}
          {typeof data.status === 'string' && (
            <span className="text-[11px] bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 capitalize">
              {data.status}
            </span>
          )}
        </div>

        {typeof data.email === 'string' && (
          <p className="text-[11px] text-muted-foreground truncate">{data.email}</p>
        )}
      </div>

      {/* Actions */}
      <div className="px-3.5 pb-3.5 space-y-2">
        {href && (
          <Link
            href={href}
            className="flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            <ExternalLink size={12} />
            Open Item
          </Link>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCenter}
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium bg-muted hover:bg-muted/70 text-foreground rounded-lg transition-colors"
          >
            <Crosshair size={11} />
            Center
          </button>
          <button
            type="button"
            onClick={onHighlightNeighbors}
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium bg-muted hover:bg-muted/70 text-foreground rounded-lg transition-colors"
          >
            <GitFork size={11} />
            Neighbors
          </button>
        </div>
      </div>
    </div>
  );
}
