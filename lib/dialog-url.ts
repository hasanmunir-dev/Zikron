export type Panel = 'app' | 'admin';
export type DialogAction = 'detail' | 'create' | 'edit' | 'capture';

export interface DialogUrlOptions {
  panel: Panel;
  resource: string;
  action: DialogAction;
  id?: string;
  captureType?: string;
}

export interface DialogState {
  action: DialogAction;
  id?: string;
  captureType?: string;
}

export function detectPanel(pathname: string): Panel {
  return pathname.startsWith('/admin') ? 'admin' : 'app';
}

/**
 * Build a dialog URL from a base path (e.g. "/app/notes") + action.
 * Existing non-dialog search params are preserved when existingParams is provided.
 */
export function dialogUrl(
  basePath: string,
  action: DialogAction,
  id?: string,
  captureType?: string,
  existingParams?: URLSearchParams,
): string {
  const params = new URLSearchParams(existingParams?.toString() ?? '');
  // Clear any existing dialog params first
  params.delete('detail');
  params.delete('create');
  params.delete('edit');
  params.delete('capture');
  params.delete('new');

  switch (action) {
    case 'detail':   if (id)          params.set('detail',  id);          break;
    case 'edit':     if (id)          params.set('edit',    id);          break;
    case 'create':                    params.set('create',  'true');      break;
    case 'capture':  if (captureType) params.set('capture', captureType); break;
  }

  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/**
 * Convenience helper for dashboard-style usage where panel + resource are
 * separate from the base path.
 *
 * createDialogUrl({ panel: 'admin', resource: 'users', action: 'detail', id: '123' })
 * → /admin/users?detail=123
 */
export function createDialogUrl(opts: DialogUrlOptions): string {
  return dialogUrl(
    `/${opts.panel}/${opts.resource}`,
    opts.action,
    opts.id,
    opts.captureType,
  );
}

/** Parse dialog state from URL search params. Returns null when no dialog param is present. */
export function parseDialogState(searchParams: URLSearchParams): DialogState | null {
  const detail  = searchParams.get('detail');
  const edit    = searchParams.get('edit');
  const create  = searchParams.get('create');
  const capture = searchParams.get('capture');

  if (detail)  return { action: 'detail',  id: detail };
  if (edit)    return { action: 'edit',    id: edit };
  if (create)  return { action: 'create' };
  if (capture) return { action: 'capture', captureType: capture };
  return null;
}

/**
 * Strip all dialog-related params from the current URL, preserving filters
 * and any other non-dialog params. Use this as the close target.
 *
 * /app/notes?category=work&detail=123 → /app/notes?category=work
 */
export function closeDialogUrl(pathname: string, searchParams: URLSearchParams): string {
  const params = new URLSearchParams(searchParams.toString());
  params.delete('detail');
  params.delete('create');
  params.delete('edit');
  params.delete('capture');
  params.delete('new');
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
