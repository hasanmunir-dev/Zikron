'use client';

import {
  Bold, Italic, Code, Heading2, Quote,
  List, ListOrdered, ListChecks, Link, FileCode,
} from 'lucide-react';
import type { MarkdownFormat } from '@/lib/markdown/format-selection';

interface ToolbarItem {
  format: MarkdownFormat;
  icon: React.ReactNode;
  title: string;
}

const ITEMS: ToolbarItem[] = [
  { format: 'bold',         icon: <Bold size={13} />,                                             title: 'Bold' },
  { format: 'italic',       icon: <Italic size={13} />,                                           title: 'Italic' },
  { format: 'boldItalic',   icon: <span className="text-[11px] font-bold italic leading-none">BI</span>, title: 'Bold Italic' },
  { format: 'inlineCode',   icon: <Code size={13} />,                                             title: 'Inline Code' },
  { format: 'codeBlock',    icon: <FileCode size={13} />,                                         title: 'Code Block' },
  { format: 'heading',      icon: <Heading2 size={13} />,                                         title: 'Heading' },
  { format: 'quote',        icon: <Quote size={13} />,                                            title: 'Blockquote' },
  { format: 'bulletList',   icon: <List size={13} />,                                             title: 'Bullet List' },
  { format: 'numberedList', icon: <ListOrdered size={13} />,                                      title: 'Numbered List' },
  { format: 'checklist',    icon: <ListChecks size={13} />,                                       title: 'Checklist' },
  { format: 'link',         icon: <Link size={13} />,                                             title: 'Link' },
];

interface Props {
  onFormat: (format: MarkdownFormat) => void;
}

export function MarkdownFormatToolbar({ onFormat }: Props) {
  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {ITEMS.map(({ format, icon, title }) => (
        <button
          key={format}
          type="button"
          title={title}
          aria-label={title}
          onMouseDown={e => {
            // Prevent textarea from losing focus/selection
            e.preventDefault();
            onFormat(format);
          }}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center min-w-[26px]"
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
