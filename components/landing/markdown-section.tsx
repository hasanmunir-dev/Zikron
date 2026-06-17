'use client';

import { motion } from 'framer-motion';
import { Bold, CheckSquare, Code, Heading2, List } from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem } from './motion-variants';

const writeContent = `## Compiler Notes

**Important for exam**

- [x] Revise CFG and grammars
- [ ] Practice LR parse tables
- [ ] Review First/Follow sets

\`\`\`bash
# Run the test suite
npm run test
\`\`\`

> Remember: shift-reduce conflicts`;

const previewBlocks = [
  { type: 'heading', content: 'Compiler Notes' },
  { type: 'bold', content: 'Important for exam' },
  {
    type: 'checklist',
    items: [
      { done: true, text: 'Revise CFG and grammars' },
      { done: false, text: 'Practice LR parse tables' },
      { done: false, text: 'Review First/Follow sets' },
    ],
  },
  { type: 'code', content: '# Run the test suite\nnpm run test' },
  { type: 'quote', content: 'Remember: shift-reduce conflicts' },
];

const toolbarItems = [
  { icon: Bold, label: 'Bold' },
  { icon: Heading2, label: 'Heading' },
  { icon: Code, label: 'Code' },
  { icon: List, label: 'List' },
  { icon: CheckSquare, label: 'Checklist' },
];

const markdownFeatures = [
  'Bold, italic, bold italic',
  'Headings H1–H3',
  'Checklists and bullet lists',
  'Code blocks with syntax highlighting',
  'Tables and blockquotes',
  'Links and strikethrough',
];

export function MarkdownSection() {
  return (
    <section id="markdown" className="py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div {...fadeInUp} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-900 text-violet-600 dark:text-violet-400 text-sm font-medium mb-4">
            Markdown everywhere
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Write in Markdown.{' '}
            <span className="text-muted-foreground">Read it rendered.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Every content field — notes, inbox, self-chat, reminders — supports full Markdown with a live preview and formatting toolbar.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Write side */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
          >
            {/* Tabs */}
            <div className="flex gap-0.5 px-4 pt-3 border-b border-border bg-muted/30">
              <div className="text-xs font-medium text-foreground bg-card border border-border border-b-card px-3 py-1.5 rounded-t-lg -mb-px relative z-10">
                Write
              </div>
              <div className="text-xs font-medium text-muted-foreground px-3 py-1.5">
                Preview
              </div>
            </div>
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border/60 bg-muted/20">
              {toolbarItems.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon size={13} />
                </button>
              ))}
            </div>
            {/* Editor */}
            <pre className="p-5 text-[12.5px] font-mono text-muted-foreground leading-[1.7] whitespace-pre-wrap overflow-hidden">
              {writeContent}
            </pre>
          </motion.div>

          {/* Preview side */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
            className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
          >
            <div className="flex gap-0.5 px-4 pt-3 border-b border-border bg-muted/30">
              <div className="text-xs font-medium text-muted-foreground px-3 py-1.5">
                Write
              </div>
              <div className="text-xs font-medium text-foreground bg-card border border-border border-b-card px-3 py-1.5 rounded-t-lg -mb-px relative z-10">
                Preview
              </div>
            </div>
            <div className="p-5 space-y-3">
              {previewBlocks.map((block, i) => {
                if (block.type === 'heading') {
                  return (
                    <h2 key={i} className="text-base font-bold text-foreground border-b border-border pb-1.5">
                      {block.content}
                    </h2>
                  );
                }
                if (block.type === 'bold') {
                  return (
                    <p key={i} className="text-sm font-semibold text-foreground">
                      {block.content}
                    </p>
                  );
                }
                if (block.type === 'checklist' && block.items) {
                  return (
                    <ul key={i} className="space-y-1.5">
                      {block.items.map(({ done, text }) => (
                        <li key={text} className="flex items-center gap-2 text-sm">
                          <div className={`w-3.5 h-3.5 rounded border-[1.5px] flex items-center justify-center shrink-0 ${done ? 'bg-blue-600 border-blue-600' : 'border-muted-foreground/40'}`}>
                            {done && (
                              <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <span className={done ? 'line-through text-muted-foreground' : 'text-foreground'}>{text}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }
                if (block.type === 'code') {
                  return (
                    <div key={i} className="bg-muted rounded-lg p-3">
                      <pre className="text-[11px] font-mono text-muted-foreground whitespace-pre">{block.content}</pre>
                    </div>
                  );
                }
                if (block.type === 'quote') {
                  return (
                    <blockquote key={i} className="border-l-2 border-blue-500 pl-3 text-sm text-muted-foreground italic">
                      {block.content}
                    </blockquote>
                  );
                }
                return null;
              })}
            </div>
          </motion.div>
        </div>

        {/* Feature list */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="flex flex-wrap justify-center gap-2 mt-10"
        >
          {markdownFeatures.map(f => (
            <motion.span
              key={f}
              variants={staggerItem}
              className="text-sm text-muted-foreground bg-card border border-border rounded-full px-3 py-1"
            >
              {f}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
