'use client';

import { useState } from 'react';
import { History, ChevronDown, ChevronUp } from 'lucide-react';
import { useItemVersions } from '@/hooks/queries/use-history';
import type { ItemVersion, VersionableItemType } from '@/types';
import { VersionCompareDialog } from './VersionCompareDialog';

interface Props {
  itemType: VersionableItemType;
  itemId: string | undefined;
  currentTitle: string | null | undefined;
  currentContent: string | null | undefined;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export function VersionHistoryPanel({ itemType, itemId, currentTitle, currentContent }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ItemVersion | null>(null);

  const { data, isLoading } = useItemVersions(itemType, open ? itemId : undefined);
  const versions = data?.versions ?? [];

  if (!itemId) return null;

  return (
    <div className="border-t border-border mt-4 pt-3">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <History className="w-4 h-4 shrink-0" />
        <span className="font-medium">Version History</span>
        {open ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
      </button>

      {open && (
        <div className="mt-3 space-y-1">
          {isLoading && (
            <p className="text-xs text-muted-foreground py-2 px-1">Loading history…</p>
          )}
          {!isLoading && versions.length === 0 && (
            <p className="text-xs text-muted-foreground py-2 px-1">No versions saved yet.</p>
          )}
          {versions.map(v => (
            <button
              key={v.id}
              onClick={() => setSelected(v)}
              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-accent transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">v{v.version_number}</span>
                <span className="text-xs text-muted-foreground">{formatDate(v.created_at)}</span>
              </div>
              {v.metadata_snapshot?.summary && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {v.metadata_snapshot.summary as string}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <VersionCompareDialog
          version={selected}
          itemType={itemType}
          itemId={itemId}
          currentTitle={currentTitle ?? null}
          currentContent={currentContent ?? null}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
