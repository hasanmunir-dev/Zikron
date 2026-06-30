'use client';

import { RotateCcw, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MarkdownViewer } from '@/components/editor/markdown-viewer';
import { useRestoreVersion } from '@/hooks/queries/use-history';
import type { ItemVersion, VersionableItemType } from '@/types';

interface Props {
  version: ItemVersion;
  itemType: VersionableItemType;
  itemId: string;
  currentTitle: string | null;
  currentContent: string | null;
  onClose: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export function VersionCompareDialog({
  version,
  itemType,
  itemId,
  currentTitle,
  currentContent,
  onClose,
}: Props) {
  const restore = useRestoreVersion(itemType, itemId);

  function handleRestore() {
    restore.mutate(version.id, { onSuccess: onClose });
  }

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle>
            Version {version.version_number} — {formatDate(version.created_at)}
          </DialogTitle>
          {version.metadata_snapshot?.summary && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {version.metadata_snapshot.summary as string}
            </p>
          )}
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 min-h-[300px]">
          {/* Historical version */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              v{version.version_number}
            </p>
            <div className="flex-1 rounded-lg border border-border bg-muted/30 p-3 overflow-y-auto text-sm">
              {version.title_snapshot && (
                <p className="font-semibold text-base mb-2">{version.title_snapshot}</p>
              )}
              {version.content_snapshot ? (
                <MarkdownViewer content={version.content_snapshot} />
              ) : (
                <p className="text-muted-foreground italic text-xs">No content</p>
              )}
            </div>
          </div>

          {/* Current version */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Current
            </p>
            <div className="flex-1 rounded-lg border border-border bg-muted/30 p-3 overflow-y-auto text-sm">
              {currentTitle && (
                <p className="font-semibold text-base mb-2">{currentTitle}</p>
              )}
              {currentContent ? (
                <MarkdownViewer content={currentContent} />
              ) : (
                <p className="text-muted-foreground italic text-xs">No content</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter showCloseButton>
          <Button
            onClick={handleRestore}
            disabled={restore.isPending}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {restore.isPending ? 'Restoring…' : `Restore v${version.version_number}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
