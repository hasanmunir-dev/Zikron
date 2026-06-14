type DataEvent = 'notes' | 'inbox' | 'self-chat' | 'lists' | 'all';
type Handler = () => void;

const listeners = new Map<DataEvent, Set<Handler>>();

export function onDataRefresh(event: DataEvent, handler: Handler): () => void {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event)!.add(handler);
  return () => listeners.get(event)?.delete(handler);
}

export function emitDataRefresh(event: DataEvent): void {
  listeners.get(event)?.forEach(fn => fn());
  if (event !== 'all') listeners.get('all')?.forEach(fn => fn());
}
