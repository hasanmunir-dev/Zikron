'use client';

import { useState } from 'react';
import { MoreHorizontal, Eye, Pencil, Star, Archive, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteConfirmDialog } from './delete-confirm-dialog';

interface Props {
  onView?: () => void;
  onEdit?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isArchived?: boolean;
  onToggleArchive?: () => void;
  onDelete?: () => void;
  deleteTitle?: string;
  itemName?: string;
  className?: string;
}

export function ItemActions({
  onView,
  onEdit,
  isFavorite,
  onToggleFavorite,
  isArchived,
  onToggleArchive,
  onDelete,
  deleteTitle = 'Delete?',
  itemName,
  className,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className={className ?? 'p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'}
            aria-label="More actions"
          >
            <MoreHorizontal size={15} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onClick={(e) => e.stopPropagation()}
          className="min-w-36"
        >
          {onView && (
            <DropdownMenuItem onClick={onView}>
              <Eye size={14} className="mr-2 shrink-0" />
              View
            </DropdownMenuItem>
          )}
          {onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <Pencil size={14} className="mr-2 shrink-0" />
              Edit
            </DropdownMenuItem>
          )}
          {onToggleFavorite && (
            <DropdownMenuItem onClick={onToggleFavorite}>
              <Star
                size={14}
                className={`mr-2 shrink-0 ${isFavorite ? 'text-amber-400 fill-amber-400' : ''}`}
              />
              {isFavorite ? 'Unfavorite' : 'Favorite'}
            </DropdownMenuItem>
          )}
          {onToggleArchive && (
            <DropdownMenuItem onClick={onToggleArchive}>
              <Archive size={14} className="mr-2 shrink-0" />
              {isArchived ? 'Unarchive' : 'Archive'}
            </DropdownMenuItem>
          )}
          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setConfirmDelete(true)}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 size={14} className="mr-2 shrink-0" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {onDelete && (
        <DeleteConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title={deleteTitle}
          description="This action cannot be undone."
          itemName={itemName}
          onConfirm={() => { setConfirmDelete(false); onDelete(); }}
        />
      )}
    </>
  );
}
