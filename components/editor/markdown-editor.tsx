'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { MarkdownViewer } from './markdown-viewer';
import { MarkdownFormatToolbar } from './markdown-format-toolbar';
import { applyMarkdownFormat, type MarkdownFormat } from '@/lib/markdown/format-selection';
import { useSearchLinkable } from '@/hooks/queries/use-item-links';
import { useTags } from '@/hooks/queries/use-tags';
import { TAG_COLORS } from '@/components/features/tags/TagChip';
import { TYPE_CONFIG } from '@/components/features/links/LinkPicker';
import type { LinkableItem, TagColor } from '@/types';
import type { WikiLinkTarget } from '@/hooks/use-wiki-link-map';

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
  /** Pass to enable [[wiki link]] resolution in Preview tab */
  wikiLinks?: Map<string, WikiLinkTarget>;
}

// ─── Detect [[ trigger in textarea ───────────────────────────────────────────

function getWikiQuery(value: string, cursorPos: number): string | null {
  const before = value.slice(0, cursorPos);
  const openIdx = before.lastIndexOf('[[');
  if (openIdx === -1) return null;
  // Make sure there's no closing ]] between openIdx and cursor
  const between = before.slice(openIdx + 2);
  if (between.includes(']]')) return null;
  return between;
}

// ─── Detect # tag trigger in textarea ────────────────────────────────────────

function getTagQuery(value: string, cursorPos: number): string | null {
  const before = value.slice(0, cursorPos);
  // # followed by 0+ word chars at cursor, not preceded by word char / # / `
  const match = before.match(/(?<![`\w#])#([a-z0-9_-]*)$/i);
  if (!match) return null;
  // Don't trigger when the line starts with heading markers (## heading)
  const lineStart = before.lastIndexOf('\n') + 1;
  const lineContent = before.slice(lineStart);
  if (/^#{1,6}\s/.test(lineContent)) return null;
  return match[1].toLowerCase();
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write in Markdown…',
  minHeight = '160px',
  className = '',
  defaultTab = 'write',
  readOnly = false,
  wikiLinks,
}: Props) {
  const [tab, setTab] = useState<'write' | 'preview'>(readOnly ? 'preview' : defaultTab);
  const [hasSelection, setHasSelection] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── [[ autocomplete state ──────────────────────────────────────────────────
  const [wikiQuery, setWikiQuery] = useState<string | null>(null);
  const [wikiDropdownIdx, setWikiDropdownIdx] = useState(0);
  const { data: wikiResults = [] } = useSearchLinkable(wikiQuery ?? '');
  const showWikiDropdown = wikiQuery !== null && wikiQuery.length >= 0;

  // ── # tag autocomplete state ───────────────────────────────────────────────
  const [tagQuery, setTagQuery] = useState<string | null>(null);
  const [tagDropdownIdx, setTagDropdownIdx] = useState(0);
  const { data: allTags = [] } = useTags();
  const tagResults = tagQuery !== null
    ? allTags.filter(t => !tagQuery || t.name.startsWith(tagQuery)).slice(0, 10)
    : [];
  const showTagDropdown = tagQuery !== null;

  const checkSelection = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    setHasSelection(ta.selectionStart !== ta.selectionEnd);
    // Check for [[ trigger
    const wq = getWikiQuery(ta.value, ta.selectionStart);
    setWikiQuery(wq);
    setWikiDropdownIdx(0);
    // Check for # tag trigger (only when no wiki dropdown)
    if (wq === null) {
      const tq = getTagQuery(ta.value, ta.selectionStart);
      setTagQuery(tq);
      setTagDropdownIdx(0);
    } else {
      setTagQuery(null);
    }
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
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(result.selectionStart, result.selectionEnd);
      setHasSelection(result.selectionStart !== result.selectionEnd);
    });
  }, [value, onChange]);

  // Insert [[Title]] at cursor, replacing the [[partial text
  const insertWikiLink = useCallback((item: LinkableItem) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const cursor = ta.selectionStart;
    const before = value.slice(0, cursor);
    const after = value.slice(cursor);
    const openIdx = before.lastIndexOf('[[');
    const newValue = before.slice(0, openIdx) + `[[${item.title}]]` + after;
    onChange(newValue);
    setWikiQuery(null);
    requestAnimationFrame(() => {
      ta.focus();
      const newPos = openIdx + item.title.length + 4; // [[ + title + ]]
      ta.setSelectionRange(newPos, newPos);
    });
  }, [value, onChange]);

  // Insert #tagname at cursor, replacing the #partial text
  const insertTag = useCallback((tagName: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const cursor = ta.selectionStart;
    const before = value.slice(0, cursor);
    const after = value.slice(cursor);
    // Find the # that opened the trigger
    const match = before.match(/(?<![`\w#])#([a-z0-9_-]*)$/i);
    if (!match) return;
    const openIdx = before.length - match[0].length;
    const inserted = `#${tagName}`;
    const newValue = before.slice(0, openIdx) + inserted + after;
    onChange(newValue);
    setTagQuery(null);
    requestAnimationFrame(() => {
      ta.focus();
      const newPos = openIdx + inserted.length;
      ta.setSelectionRange(newPos, newPos);
    });
  }, [value, onChange]);

  // Keyboard handling in write mode
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showWikiDropdown && wikiResults.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setWikiDropdownIdx(i => Math.min(i + 1, wikiResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setWikiDropdownIdx(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (wikiResults[wikiDropdownIdx]) {
          e.preventDefault();
          insertWikiLink(wikiResults[wikiDropdownIdx]);
        }
      } else if (e.key === 'Escape') {
        setWikiQuery(null);
      }
      return;
    }
    if (showTagDropdown && tagResults.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setTagDropdownIdx(i => Math.min(i + 1, tagResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setTagDropdownIdx(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (tagResults[tagDropdownIdx]) {
          e.preventDefault();
          insertTag(tagResults[tagDropdownIdx].name);
        }
      } else if (e.key === 'Escape') {
        setTagQuery(null);
      }
    }
  }, [showWikiDropdown, wikiResults, wikiDropdownIdx, insertWikiLink, showTagDropdown, tagResults, tagDropdownIdx, insertTag]);

  // Dismiss dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
        setWikiQuery(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

      {/* Floating format toolbar */}
      {tab === 'write' && !readOnly && hasSelection && (
        <div className="border-b border-border bg-popover/95 backdrop-blur-sm px-2 py-1 shadow-sm">
          <MarkdownFormatToolbar onFormat={handleFormat} />
        </div>
      )}

      {/* Write area */}
      {tab === 'write' && !readOnly && (
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => { onChange(e.target.value); checkSelection(); }}
            onSelect={checkSelection}
            onMouseUp={checkSelection}
            onKeyUp={checkSelection}
            onKeyDown={handleKeyDown}
            onBlur={() => { setHasSelection(false); setTagQuery(null); setWikiQuery(null); }}
            placeholder={placeholder}
            style={{ minHeight }}
            className="w-full px-3 py-2.5 text-sm bg-card text-foreground placeholder:text-muted-foreground resize-y outline-none font-mono leading-relaxed"
          />

          {/* [[ autocomplete dropdown */}
          {showWikiDropdown && wikiResults.length > 0 && (
            <div className="absolute left-3 z-50 w-64 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
              style={{ bottom: 0, transform: 'translateY(100%)' }}
            >
              <div className="px-2 py-1 border-b border-border">
                <span className="text-[10px] text-muted-foreground">Link to item — ↑↓ navigate, Enter/Tab select, Esc dismiss</span>
              </div>
              {wikiResults.map((item, idx) => {
                const cfg = TYPE_CONFIG[item.type];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseDown={e => { e.preventDefault(); insertWikiLink(item); }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors ${idx === wikiDropdownIdx ? 'bg-primary/10' : 'hover:bg-muted'}`}
                  >
                    <cfg.Icon size={12} className={`shrink-0 ${cfg.color}`} />
                    <span className="flex-1 text-sm text-foreground truncate">{item.title}</span>
                    <span className="text-[10px] text-muted-foreground">{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* # tag autocomplete dropdown */}
          {showTagDropdown && tagResults.length > 0 && (
            <div className="absolute left-3 z-50 w-52 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
              style={{ bottom: 0, transform: 'translateY(100%)' }}
            >
              <div className="px-2 py-1 border-b border-border">
                <span className="text-[10px] text-muted-foreground">Insert tag — ↑↓ navigate, Enter/Tab select, Esc dismiss</span>
              </div>
              {tagResults.map((tag, idx) => {
                const colors = TAG_COLORS[tag.color as TagColor] ?? TAG_COLORS.slate;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onMouseDown={e => { e.preventDefault(); insertTag(tag.name); }}
                    className={`w-full flex items-center px-3 py-1.5 text-left transition-colors ${idx === tagDropdownIdx ? 'bg-primary/10' : 'hover:bg-muted'}`}
                  >
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${colors.bg} ${colors.text} ${colors.ring}`}>
                      #{tag.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Preview area */}
      {(tab === 'preview' || readOnly) && (
        <div className="px-3 py-2.5 bg-card" style={{ minHeight }}>
          {value.trim() ? (
            <MarkdownViewer content={value} wikiLinks={wikiLinks} />
          ) : (
            <p className="text-sm text-muted-foreground/50 italic">Nothing to preview.</p>
          )}
        </div>
      )}
    </div>
  );
}
