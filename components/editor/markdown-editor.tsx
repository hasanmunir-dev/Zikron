'use client';

import { useState, useRef, useCallback } from 'react';
import { MarkdownViewer } from './markdown-viewer';
import { MarkdownFormatToolbar } from './markdown-format-toolbar';
import { applyMarkdownFormat, type MarkdownFormat } from '@/lib/markdown/format-selection';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  /** Which tab opens first. Defaults to 'write'. */
  defaultTab?: 'write' | 'preview';
  /** Hides Write tab and always renders preview. */
  readOnly?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write in Markdown...',
  minHeight = '160px',
  className = '',
  defaultTab = 'write',
  readOnly = false,
}: Props) {
  const [tab, setTab] = useState<'write' | 'preview'>(readOnly ? 'preview' : defaultTab);
  const [hasSelection, setHasSelection] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const checkSelection = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    setHasSelection(ta.selectionStart !== ta.selectionEnd);
  }, []);

  const handleFormat = useCallback((format: MarkdownFormat) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const result = applyMarkdownFormat({
      value,
      selectionStart: ta.selectionStart,
      selectionEnd: ta.selectionEnd,
      format,
    });
    onChange(result.value);
    // Restore selection after React re-renders the textarea value
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(result.selectionStart, result.selectionEnd);
      setHasSelection(result.selectionStart !== result.selectionEnd);
    });
  }, [value, onChange]);

  return (
    <div className={`border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Tab bar */}
      <div className="flex items-center border-b border-border bg-muted/50">
        {!readOnly && (
          <button
            type="button"
            onClick={() => setTab('write')}
            className={`px-4 py-2 text-xs font-medium transition-colors ${
              tab === 'write'
                ? 'text-foreground border-b-2 border-foreground bg-card -mb-px'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Write
          </button>
        )}
        <button
          type="button"
          onClick={() => setTab('preview')}
          className={`px-4 py-2 text-xs font-medium transition-colors ${
            tab === 'preview'
              ? 'text-foreground border-b-2 border-foreground bg-card -mb-px'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Preview
        </button>
      </div>

      {/* Floating format toolbar — only visible in write mode when text is selected */}
      {tab === 'write' && !readOnly && hasSelection && (
        <div className="border-b border-border bg-popover/95 backdrop-blur-sm px-2 py-1 shadow-sm">
          <MarkdownFormatToolbar onFormat={handleFormat} />
        </div>
      )}

      {/* Write area */}
      {tab === 'write' && !readOnly && (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onSelect={checkSelection}
          onMouseUp={checkSelection}
          onKeyUp={checkSelection}
          onBlur={() => setHasSelection(false)}
          placeholder={placeholder}
          style={{ minHeight }}
          className="w-full px-3 py-2.5 text-sm bg-card text-foreground placeholder:text-muted-foreground resize-y outline-none font-mono leading-relaxed"
        />
      )}

      {/* Preview area */}
      {(tab === 'preview' || readOnly) && (
        <div className="px-3 py-2.5 bg-card" style={{ minHeight }}>
          {value.trim() ? (
            <MarkdownViewer content={value} />
          ) : (
            <p className="text-sm text-muted-foreground/50 italic">Nothing to preview.</p>
          )}
        </div>
      )}
    </div>
  );
}
