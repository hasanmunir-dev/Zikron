'use client';

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import type { WikiLinkTarget } from '@/hooks/use-wiki-link-map';
import type { LinkableItemType } from '@/types';

// ─── Wiki link URL resolver ───────────────────────────────────────────────────

const MODULE_PATHS: Record<LinkableItemType, string> = {
  note:       '/app/notes',
  inbox:      '/app/inbox',
  list:       '/app/lists',
  reminder:   '/app/reminders',
  collection: '/app/collections',
  contact:    '/app/contacts',
};

// ─── Pre-process: #tag → /app/tags/[name] links ──────────────────────────────
// Matches standalone #word (not inside code, not part of a heading marker)
// Regex: word boundary before #, then alphanumeric/hyphen/underscore chars

const TAG_RE = /(?<![`\w#])#([a-z0-9][a-z0-9_-]*)(?![`\w])/gi;

function processInlineTags(content: string): string {
  return content.replace(TAG_RE, (_match, name: string) => {
    return `[#${name}](/app/tags/${encodeURIComponent(name.toLowerCase())})`;
  });
}

// ─── Pre-process: [[Title]] → custom placeholder ──────────────────────────────
// We can't use a remark plugin easily without extra packages, so we convert
// [[Title]] into a special HTML comment that ReactMarkdown will ignore, and
// instead replace them before rendering with a span-wrapped React subtree.
// Simpler approach: transform the markdown string to inject anchor tags.

const WIKI_RE = /\[\[([^\]]+)\]\]/g;

function processWikiLinks(
  content: string,
  wikiLinks?: Map<string, WikiLinkTarget>,
): { html: string; hasMentions: boolean } {
  if (!wikiLinks || !content.includes('[[')) {
    return { html: content, hasMentions: false };
  }

  let hasMentions = false;
  const processed = content.replace(WIKI_RE, (_match, title: string) => {
    const key = title.trim().toLowerCase();
    const target = wikiLinks.get(key);
    hasMentions = true;
    if (target) {
      const href = `${MODULE_PATHS[target.type]}?detail=${target.id}`;
      // Encode as a plain markdown link so rehype-sanitize passes it through
      return `[${title}](${href})`;
    }
    // Not found — render as strikethrough-style italic text (no link)
    return `~~${title} (not found)~~`;
  });

  return { html: processed, hasMentions };
}

// ─── MarkdownViewer ───────────────────────────────────────────────────────────

interface Props {
  content: string;
  className?: string;
  /** Use compact prose sizing for tight spaces like table cells. */
  compact?: boolean;
  /**
   * Pass a Map<title_lowercase, WikiLinkTarget> to enable [[wiki link]] resolution.
   * Built from React Query cache via useWikiLinkMap().
   */
  wikiLinks?: Map<string, WikiLinkTarget>;
}

export function MarkdownViewer({ content, className = '', compact = false, wikiLinks }: Props) {
  const proseSize = compact ? 'prose-xs' : 'prose-sm';

  const processedContent = useMemo(() => {
    const withWiki = processWikiLinks(content, wikiLinks).html;
    return processInlineTags(withWiki);
  }, [content, wikiLinks]);

  return (
    <div
      className={`prose dark:prose-invert ${proseSize} max-w-none
        prose-headings:font-semibold prose-headings:text-foreground
        prose-p:text-foreground prose-p:leading-relaxed
        prose-strong:text-foreground prose-em:text-foreground
        prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg
        prose-blockquote:border-l-border prose-blockquote:text-muted-foreground
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-hr:border-border
        prose-li:text-foreground
        prose-th:text-foreground prose-td:text-foreground
        prose-table:border prose-table:border-border
        prose-thead:border-b prose-thead:border-border
        prose-tr:border-b prose-tr:border-border
        ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeSanitize]}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
