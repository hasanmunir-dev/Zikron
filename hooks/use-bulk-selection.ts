import { useState, useCallback } from 'react';

export interface BulkSelection<TId extends string = string> {
  selectedIds: Set<TId>;
  selectedCount: number;
  isSelected: (id: TId) => boolean;
  toggle: (id: TId) => void;
  toggleAll: (ids: TId[], checked: boolean) => void;
  clear: () => void;
  getArray: () => TId[];
}

export function useBulkSelection<TId extends string = string>(): BulkSelection<TId> {
  const [selectedIds, setSelectedIds] = useState<Set<TId>>(new Set());

  const isSelected = useCallback((id: TId) => selectedIds.has(id), [selectedIds]);

  const toggle = useCallback((id: TId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback((ids: TId[], checked: boolean) => {
    setSelectedIds(checked ? new Set(ids) : new Set());
  }, []);

  const clear = useCallback(() => setSelectedIds(new Set()), []);

  const getArray = useCallback(() => Array.from(selectedIds), [selectedIds]);

  return { selectedIds, selectedCount: selectedIds.size, isSelected, toggle, toggleAll, clear, getArray };
}
