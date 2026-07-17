'use client';

import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, FolderOpen, Inbox } from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem } from './motion-variants';

const milestones = [
  { label: 'Research & discovery', done: true },
  { label: 'Wireframes approved', done: true },
  { label: 'Design system built', done: true },
  { label: 'Frontend implementation', done: false },
  { label: 'QA & launch', done: false },
];

const collectionItems = [
  { type: 'note', label: 'Brand guidelines', preview: 'Colors, typography, spacing rules…', color: 'text-violet-500 bg-violet-100 dark:bg-violet-950/60' },
  { type: 'note', label: 'Component audit', preview: 'List of all reusable components…', color: 'text-violet-500 bg-violet-100 dark:bg-violet-950/60' },
  { type: 'inbox', label: 'Figma inspiration link', preview: 'figma.com/community/file/…', color: 'text-blue-500 bg-blue-100 dark:bg-blue-950/60' },
  { type: 'inbox', label: 'Competitor screenshots', preview: 'Saved from review session…', color: 'text-blue-500 bg-blue-100 dark:bg-blue-950/60' },
];

const features = [
  { label: 'Add any note or inbox item', desc: 'Collect related content into a single named project space' },
  { label: 'Milestone tracking', desc: 'Define milestones with due dates and mark them off as you progress' },
  { label: 'Progress at a glance', desc: 'See a completion bar and open items count without opening the collection' },
  { label: 'Nested organisation', desc: 'Collections appear in search so you can jump straight to the project' },
];

const completed = milestones.filter(m => m.done).length;
const pct = Math.round((completed / milestones.length) * 100);

export function CollectionsSection() {
  return (
    <section id="collections" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: mockup */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-fuchsia-500/8 to-violet-500/8 blur-2xl rounded-3xl" />
            <div className="relative space-y-3">
              {/* Collection card */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                  <div className="w-9 h-9 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-950/60 flex items-center justify-center shrink-0">
                    <FolderOpen size={16} className="text-fuchsia-600 dark:text-fuchsia-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Website Redesign</p>
                    <p className="text-xs text-muted-foreground mt-0.5">4 items · updated 2h ago</p>
                  </div>
                  <span className="text-xs font-semibold text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-100 dark:bg-fuchsia-950/60 px-2 py-0.5 rounded-full">
                    {pct}%
                  </span>
                </div>

                {/* Progress */}
                <div className="px-5 py-3 border-b border-border/60">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Milestones</span>
                    <span>{completed}/{milestones.length} done</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                      className="h-full bg-fuchsia-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-border/60">
                  {collectionItems.map(({ type, label, preview, color }) => (
                    <div key={label} className="flex items-center gap-3 px-5 py-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                        {type === 'note' ? <BookOpen size={10} /> : <Inbox size={10} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate">{label}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{preview}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones card */}
              <div className="bg-card border border-border rounded-2xl px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Milestones</p>
                <div className="space-y-2">
                  {milestones.map(({ label, done }, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-2.5"
                    >
                      <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${done ? 'bg-fuchsia-500 border-fuchsia-500' : 'border-muted-foreground/30'}`}>
                        {done && <CheckCircle2 size={10} className="text-white" />}
                      </div>
                      <span className={`text-xs ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: copy */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-50 dark:bg-fuchsia-950/50 border border-fuchsia-100 dark:border-fuchsia-900 text-fuchsia-600 dark:text-fuchsia-400 text-sm font-medium mb-5">
              <FolderOpen size={13} />
              Collections
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">
              Group everything into{' '}
              <span className="text-fuchsia-600">projects.</span>
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed mb-7">
              Collections bring your notes and inbox items together under one project. Define milestones, track progress, and see the full picture without switching contexts.
            </p>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              className="space-y-4"
            >
              {features.map(({ label, desc }) => (
                <motion.div key={label} variants={staggerItem} className="flex gap-3">
                  <CheckCircle2 size={15} className="text-fuchsia-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
