'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Table2 } from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem } from './motion-variants';

const gitCommands = [
  { cmd: 'git status', desc: 'Show changed files in the working tree' },
  { cmd: 'git add .', desc: 'Stage all changes for the next commit' },
  { cmd: 'git commit -m', desc: 'Save staged changes with a message' },
  { cmd: 'git stash', desc: 'Temporarily shelve uncommitted changes' },
  { cmd: 'git rebase -i', desc: 'Interactively rewrite commit history' },
  { cmd: 'git bisect', desc: 'Binary-search to find a bad commit' },
];

const useCases = [
  'Git commands and shell shortcuts',
  'Vocabulary lists with translations',
  'Study terms and definitions',
  'Formula and algorithm reference',
  'Feature comparison tables',
  'Meeting notes in table format',
];

export function ListsSection() {
  return (
    <section id="lists" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 text-sm font-medium mb-5">
              <Table2 size={13} />
              Dynamic Lists
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">
              Turn small references into{' '}
              <span className="text-blue-600">clean tables.</span>
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed mb-7">
              Not everything fits in a paragraph. Build custom tables with any columns and rows — add, rename, delete, and edit cells inline.
            </p>

            <motion.ul
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              className="space-y-2.5"
            >
              {useCases.map(item => (
                <motion.li
                  key={item}
                  variants={staggerItem}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground"
                >
                  <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                  {item}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Right: table mockup */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/8 to-indigo-500/8 blur-2xl rounded-3xl" />
            <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <Table2 size={15} className="text-blue-600" />
                  <span className="text-sm font-semibold text-foreground">Git Commands</span>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{gitCommands.length} rows</span>
              </div>

              {/* Table */}
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground">Command</th>
                      <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gitCommands.map(({ cmd, desc }, i) => (
                      <motion.tr
                        key={cmd}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06 }}
                        className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-5 py-2.5 font-mono text-[12px] text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          {cmd}
                        </td>
                        <td className="px-5 py-2.5 text-sm text-muted-foreground">{desc}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
