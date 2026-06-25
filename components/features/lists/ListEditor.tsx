'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, ChevronLeft, ChevronRight, Table2, Tag, X, Loader2 } from 'lucide-react';
import { listsService } from '@/lib/services/lists';
import { listKeys } from '@/hooks/queries/use-lists';
import { useAuth } from '@/hooks/useAuth';
import { MarkdownEditor } from '@/components/editor/markdown-editor';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import type { List, ListColumn, ListRow, ListCell, FullList } from '@/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface LocalColumn {
  id: string;
  name: string;
  sort_order: number;
  isNew?: boolean;
}

interface LocalCell {
  id: string;
  column_id: string;
  value: string;
  isNew?: boolean;
}

interface LocalRow {
  id: string;
  sort_order: number;
  cells: LocalCell[];
  isNew?: boolean;
}

interface Props {
  mode: 'create' | 'edit';
  initialData?: FullList;
  backHref?: string;
}

function generateTempId() {
  return `tmp_${Math.random().toString(36).slice(2)}`;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function ListEditor({ mode, initialData, backHref = '/app/lists' }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [columns, setColumns] = useState<LocalColumn[]>(
    initialData?.columns.map(c => ({ id: c.id, name: c.name, sort_order: c.sort_order })) ?? [
      { id: generateTempId(), name: 'Column 1', sort_order: 0, isNew: true },
    ]
  );
  const [rows, setRows] = useState<LocalRow[]>(
    initialData?.rows.map(r => ({
      id: r.id,
      sort_order: r.sort_order,
      cells: r.cells.map(c => ({ id: c.id, column_id: c.column_id, value: c.value })),
    })) ?? []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pendingDeleteRow, setPendingDeleteRow] = useState<string | null>(null);
  const [pendingDeleteColumn, setPendingDeleteColumn] = useState<string | null>(null);

  const titleRef = useRef<HTMLInputElement>(null);

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  function getCellValue(row: LocalRow, columnId: string): string {
    return row.cells.find(c => c.column_id === columnId)?.value ?? '';
  }

  function updateCellValue(rowId: string, columnId: string, value: string) {
    setRows(prev => prev.map(row => {
      if (row.id !== rowId) return row;
      const cell = row.cells.find(c => c.column_id === columnId);
      if (cell) {
        return { ...row, cells: row.cells.map(c => c.column_id === columnId ? { ...c, value } : c) };
      }
      return { ...row, cells: [...row.cells, { id: generateTempId(), column_id: columnId, value, isNew: true }] };
    }));
  }

  function addColumn() {
    const newCol: LocalColumn = {
      id: generateTempId(),
      name: `Column ${columns.length + 1}`,
      sort_order: columns.length,
      isNew: true,
    };
    setColumns(prev => [...prev, newCol]);
    // Add empty cell for new column in every existing row
    setRows(prev => prev.map(row => ({
      ...row,
      cells: [...row.cells, { id: generateTempId(), column_id: newCol.id, value: '', isNew: true }],
    })));
  }

  function removeColumn(colId: string) {
    setColumns(prev => prev.filter(c => c.id !== colId).map((c, i) => ({ ...c, sort_order: i })));
    setRows(prev => prev.map(row => ({ ...row, cells: row.cells.filter(c => c.column_id !== colId) })));
  }

  function renameColumn(colId: string, name: string) {
    setColumns(prev => prev.map(c => c.id === colId ? { ...c, name } : c));
  }

  function moveColumn(colId: string, dir: 'left' | 'right') {
    setColumns(prev => {
      const idx = prev.findIndex(c => c.id === colId);
      const swapIdx = dir === 'left' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next.map((c, i) => ({ ...c, sort_order: i }));
    });
  }

  function addRow() {
    const newRow: LocalRow = {
      id: generateTempId(),
      sort_order: rows.length,
      cells: columns.map(col => ({ id: generateTempId(), column_id: col.id, value: '', isNew: true })),
      isNew: true,
    };
    setRows(prev => [...prev, newRow]);
  }

  function removeRow(rowId: string) {
    setRows(prev => prev.filter(r => r.id !== rowId).map((r, i) => ({ ...r, sort_order: i })));
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  }

  function removeTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag));
  }

  // ─── Save ─────────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!title.trim()) { setError('Title is required'); titleRef.current?.focus(); return; }
    if (!user) return;
    setSaving(true);
    setError('');

    try {
      if (mode === 'create') {
        const { list, columns: createdCols } = await listsService.create(
          { title: title.trim(), description: description.trim() || null, category_id: null, tags, is_favorite: false, is_archived: false },
          columns.map(c => c.name),
        );

        // Build column ID mapping (temp → server)
        const colIdMap = new Map<string, string>();
        columns.forEach((localCol, i) => {
          if (createdCols[i]) colIdMap.set(localCol.id, createdCols[i].id);
        });

        // Add all rows
        for (const row of rows) {
          const cellValues: Record<string, string> = {};
          for (const cell of row.cells) {
            const serverId = colIdMap.get(cell.column_id);
            if (serverId) cellValues[serverId] = cell.value;
          }
          await listsService.addRow(list.id, cellValues);
        }

        await queryClient.invalidateQueries({ queryKey: listKeys.all() });
        router.push(`/app/lists/${list.id}`);
      } else if (initialData) {
        await listsService.update(initialData.id, {
          title: title.trim(),
          description: description.trim() || null,
          tags,
        });
        await queryClient.invalidateQueries({ queryKey: listKeys.all() });
        await queryClient.invalidateQueries({ queryKey: listKeys.detail(initialData.id) });
        router.push(`/app/lists/${initialData.id}`);
      }
    } catch (e) {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // In edit mode, column/row changes are saved immediately
  const handleColumnRenameBlur = useCallback(async (colId: string, name: string) => {
    if (mode !== 'edit' || !initialData || colId.startsWith('tmp_')) return;
    await listsService.updateColumn(initialData.id, colId, name);
  }, [mode, initialData]);

  const handleCellBlur = useCallback(async (cellId: string, value: string) => {
    if (mode !== 'edit' || !initialData || cellId.startsWith('tmp_')) return;
    await listsService.updateCell(initialData.id, cellId, value);
  }, [mode, initialData]);

  const handleAddColumnEdit = useCallback(async () => {
    if (mode !== 'edit' || !initialData) return;
    const { column: col } = await listsService.addColumn(initialData.id, `Column ${columns.length + 1}`);
    setColumns(prev => [...prev, { id: col.id, name: col.name, sort_order: col.sort_order }]);
    setRows(prev => prev.map(row => ({
      ...row,
      cells: [...row.cells, { id: generateTempId(), column_id: col.id, value: '' }],
    })));
  }, [mode, initialData, columns.length]);

  const handleRemoveColumnEdit = useCallback(async (colId: string) => {
    if (mode !== 'edit' || !initialData) return;
    removeColumn(colId);
    if (!colId.startsWith('tmp_')) await listsService.deleteColumn(initialData.id, colId);
  }, [mode, initialData]);

  const handleAddRowEdit = useCallback(async () => {
    if (mode !== 'edit' || !initialData) return;
    const { row, cells } = await listsService.addRow(initialData.id);
    setRows(prev => [...prev, {
      id: row.id,
      sort_order: row.sort_order,
      cells: cells.map(c => ({ id: c.id, column_id: c.column_id, value: c.value })),
    }]);
  }, [mode, initialData]);

  const handleRemoveRowEdit = useCallback(async (rowId: string) => {
    if (mode !== 'edit' || !initialData) return;
    removeRow(rowId);
    if (!rowId.startsWith('tmp_')) await listsService.deleteRow(initialData.id, rowId);
  }, [mode, initialData]);

  // ─── Unified handlers (create vs edit) ───────────────────────────────────────

  const onAddColumn = mode === 'create' ? addColumn : handleAddColumnEdit;
  const onRemoveColumn = mode === 'create'
    ? removeColumn
    : (colId: string) => setPendingDeleteColumn(colId);
  const onAddRow = mode === 'create' ? addRow : handleAddRowEdit;
  const onRemoveRow = mode === 'create'
    ? removeRow
    : (rowId: string) => setPendingDeleteRow(rowId);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <a
          href={backHref}
          className="text-muted-foreground hover:text-foreground transition-colors"
          onClick={e => { e.preventDefault(); router.push(backHref); }}
        >
          <ChevronLeft size={20} />
        </a>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center">
            <Table2 size={16} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {mode === 'create' ? 'New List' : 'Edit List'}
          </h2>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Title *</label>
          <input
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Git Commands, Vocabulary, CMD Reference..."
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Description</label>
          <MarkdownEditor
            value={description}
            onChange={setDescription}
            placeholder="Optional description (Markdown supported)..."
            minHeight="100px"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Tags</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                #{tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-foreground">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                placeholder="Add tag and press Enter"
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button type="button" onClick={addTag} className="px-3 py-1.5 text-xs bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors">
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Table Builder */}
      <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Table</p>
          <span className="text-xs text-muted-foreground">{columns.length} column{columns.length !== 1 ? 's' : ''} · {rows.length} row{rows.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-max">
            <thead>
              <tr className="bg-muted/50">
                {/* Row actions column */}
                <th className="w-8 border-b border-border" />
                {columns.map((col, idx) => (
                  <th key={col.id} className="border-b border-r border-border px-0 py-0 text-left min-w-36">
                    <div className="flex items-center gap-1 px-2 py-1.5 group/header">
                      <input
                        value={col.name}
                        onChange={e => renameColumn(col.id, e.target.value)}
                        onBlur={e => handleColumnRenameBlur(col.id, e.target.value)}
                        className="flex-1 text-xs font-semibold text-foreground bg-transparent focus:outline-none min-w-0"
                        aria-label={`Column ${idx + 1} name`}
                      />
                      <div className="flex items-center gap-0.5 opacity-100 md:opacity-70 md:group-hover/header:opacity-100 transition-opacity shrink-0">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => moveColumn(col.id, 'left')}
                            className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                            title="Move left"
                          >
                            <ChevronLeft size={12} />
                          </button>
                        )}
                        {idx < columns.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveColumn(col.id, 'right')}
                            className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                            title="Move right"
                          >
                            <ChevronRight size={12} />
                          </button>
                        )}
                        {columns.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onRemoveColumn(col.id)}
                            className="p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-muted-foreground hover:text-red-500 transition-colors"
                            title="Delete column"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
                {/* Add column button */}
                <th className="border-b border-border w-10 px-1">
                  <button
                    type="button"
                    onClick={() => void onAddColumn()}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Add column"
                  >
                    <Plus size={14} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={row.id} className="group/row hover:bg-muted/20 transition-colors">
                  <td className="border-b border-border px-2 py-0 w-8">
                    <button
                      type="button"
                      onClick={() => void onRemoveRow(row.id)}
                      className="opacity-100 md:opacity-70 md:group-hover/row:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-muted-foreground hover:text-red-500 transition-opacity"
                      title="Delete row"
                    >
                      <Trash2 size={11} />
                    </button>
                  </td>
                  {columns.map(col => {
                    const cell = row.cells.find(c => c.column_id === col.id);
                    return (
                      <td key={col.id} className="border-b border-r border-border px-0 py-0 min-w-36">
                        <input
                          value={getCellValue(row, col.id)}
                          onChange={e => updateCellValue(row.id, col.id, e.target.value)}
                          onBlur={cell ? (e => handleCellBlur(cell.id, e.target.value)) : undefined}
                          placeholder="—"
                          className="w-full px-3 py-2 text-xs text-foreground bg-transparent focus:outline-none focus:bg-blue-50/50 dark:focus:bg-blue-950/20 placeholder:text-muted-foreground/30"
                        />
                      </td>
                    );
                  })}
                  <td className="border-b border-border" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add row */}
        <div className="px-4 py-2.5 border-t border-border">
          <button
            type="button"
            onClick={() => void onAddRow()}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus size={13} /> Add row
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 mb-4">{error}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {mode === 'create' ? 'Create List' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.push(backHref)}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Row delete confirmation (edit mode only) */}
      <DeleteConfirmDialog
        open={pendingDeleteRow !== null}
        onOpenChange={open => { if (!open) setPendingDeleteRow(null); }}
        title="Delete Row?"
        description="This action cannot be undone. The row and all its cell data will be permanently removed."
        onConfirm={() => {
          if (pendingDeleteRow) void handleRemoveRowEdit(pendingDeleteRow);
          setPendingDeleteRow(null);
        }}
      />

      {/* Column delete confirmation (edit mode only) */}
      <DeleteConfirmDialog
        open={pendingDeleteColumn !== null}
        onOpenChange={open => { if (!open) setPendingDeleteColumn(null); }}
        title="Delete Column?"
        description="This action cannot be undone. The column and all its cell data will be permanently removed."
        itemName={pendingDeleteColumn ? columns.find(c => c.id === pendingDeleteColumn)?.name : undefined}
        onConfirm={() => {
          if (pendingDeleteColumn) void handleRemoveColumnEdit(pendingDeleteColumn);
          setPendingDeleteColumn(null);
        }}
      />
    </div>
  );
}
