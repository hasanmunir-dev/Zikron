/**
 * Panel-aware route helpers.
 *
 * All modal URLs must stay within the panel they were opened from.
 * Use these helpers instead of hardcoding /app or /admin prefixes
 * so that admin modals never leak into /app routes and vice versa.
 */

export type Panel = 'app' | 'admin';

/** Infer the panel from the current pathname. */
export function detectPanel(pathname: string): Panel {
  return pathname.startsWith('/admin') ? 'admin' : 'app';
}

/** /panel/resource/id  e.g. /admin/my-notes/123 */
export function getDetailRoute(panel: Panel, resource: string, id: string): string {
  return `/${panel}/${resource}/${id}`;
}

/** /panel/resource  e.g. /app/notes */
export function getListRoute(panel: Panel, resource: string): string {
  return `/${panel}/${resource}`;
}

/** /panel/resource/new  e.g. /admin/my-notes/new */
export function getNewRoute(panel: Panel, resource: string): string {
  return `/${panel}/${resource}/new`;
}

/**
 * Guard (dev-only): throws if a navigation would cross panel boundaries.
 * Call before router.push() in any list page that opens detail modals.
 */
export function assertSamePanel(currentPathname: string, targetUrl: string): void {
  if (process.env.NODE_ENV !== 'development') return;
  const from = detectPanel(currentPathname);
  const to = detectPanel(targetUrl);
  if (from !== to) {
    throw new Error(
      `[routes] Panel route leak: navigating from /${from}/… to "${targetUrl}". ` +
      `Admin modals must stay under /admin, app modals under /app.`
    );
  }
}
