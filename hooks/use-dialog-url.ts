'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { parseDialogState, closeDialogUrl, type DialogState } from '@/lib/dialog-url';

export interface DialogUrlState {
  /** Parsed dialog action + id, or null when no dialog param is in the URL. */
  dialog: DialogState | null;
  /**
   * The URL to navigate to in order to close the current dialog.
   * Strips only dialog-related params; preserves filters, sorting, etc.
   */
  closeUrl: string;
}

/**
 * Reads the current URL and returns the active dialog state.
 * Use router.replace(closeUrl, { scroll: false }) to close without adding a
 * history entry, or router.back() if the dialog was opened with router.push.
 */
export function useDialogUrl(): DialogUrlState {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dialog = parseDialogState(searchParams);
  const closeUrl = closeDialogUrl(pathname, searchParams);
  return { dialog, closeUrl };
}
