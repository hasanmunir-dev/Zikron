'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';

interface Props {
  content: string;
  className?: string;
  /** Use compact prose sizing for tight spaces like table cells. */
  compact?: boolean;
}

export function MarkdownViewer({ content, className = '', compact = false }: Props) {
  const proseSize = compact ? 'prose-xs' : 'prose-sm';

  return (
    <div
      className={`prose dark:prose-invert ${proseSize} max-w-none
        prose-headings:font-semibold prose-headings:text-foreground
        prose-p:text-foreground prose-p:leading-relaxed
        prose-strong:text-foreground prose-em:text-foreground
        prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg
        prose-blockquote:border-l-border prose-blockquote:text-muted-foreground
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
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
        {content}
      </ReactMarkdown>
    </div>
  );
}
