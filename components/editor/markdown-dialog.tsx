'use client';

import { X } from 'lucide-react';
import { MarkdownEditor } from './markdown-editor';
import { MarkdownViewer } from './markdown-viewer';

export type MarkdownDialogMode = 'read' | 'edit' | 'create';

interface Props {
  mode: MarkdownDialogMode;
  /** Override the default tab for this mode. */
  defaultTab?: 'preview' | 'write';
  title?: string;
  value: string;
  onChange?: (value: string) => void;
  onSave?: () => void;
  onClose: () => void;
  /** Label shown on the save button. Defaults to 'Save'. */
  saveLabel?: string;
  /** Additional content rendered below the editor (e.g. metadata fields). */
  footer?: React.ReactNode;
}

function resolveDefaultTab(
  mode: MarkdownDialogMode,
  override?: 'preview' | 'write',
): 'preview' | 'write' {
  if (override) return override;
  return mode === 'read' ? 'preview' : 'write';
}

export function MarkdownDialog({
  mode,
  defaultTab,
  title,
  value,
  onChange,
  onSave,
  onClose,
  saveLabel = 'Save',
  footer,
}: Props) {
  const tab = resolveDefaultTab(mode, defaultTab);
  const readOnly = mode === 'read';
  const canSave = !readOnly && !!onSave;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border shadow-2xl rounded-t-2xl sm:rounded-2xl flex flex-col w-[96vw] sm:w-[95vw] sm:max-w-5xl h-[90vh] sm:h-auto sm:max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
          {title ? (
            <h2 className="font-semibold text-foreground truncate pr-4">{title}</h2>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2 shrink-0">
            {canSave && (
              <button
                type="button"
                onClick={onSave}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                {saveLabel}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {readOnly ? (
            <MarkdownViewer content={value} />
          ) : (
            <MarkdownEditor
              value={value}
              onChange={onChange ?? (() => {})}
              defaultTab={tab}
              minHeight="400px"
              className="h-full"
            />
          )}
        </div>

        {/* Optional footer slot */}
        {footer && (
          <div className="border-t border-border px-5 py-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
