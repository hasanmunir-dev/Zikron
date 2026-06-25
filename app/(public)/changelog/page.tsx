'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Layers } from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const releases = [
  {
    version: 'Version 1.2',
    date: 'June 2025',
    status: 'latest',
    summary: 'Push notifications, reminders overhaul, and global search improvements.',
    changes: [
      { type: 'new', text: 'Browser push notifications for due reminders' },
      { type: 'new', text: 'Reminder priority levels: low, medium, high' },
      { type: 'new', text: 'Reminder linking to notes, inbox items, lists, or self-chat messages' },
      { type: 'new', text: 'Admin reminders management page' },
      { type: 'improved', text: 'Global search now includes reminders' },
      { type: 'improved', text: 'Dashboard reminders widget shows overdue and upcoming items' },
    ],
  },
  {
    version: 'Version 1.1',
    date: 'May 2025',
    status: 'released',
    summary: 'Lists module, Markdown editor, and admin panel.',
    changes: [
      { type: 'new', text: 'Lists module with custom columns, rows, and cells' },
      { type: 'new', text: 'Markdown editor with live preview and format toolbar' },
      { type: 'new', text: 'Syntax highlighting in code blocks' },
      { type: 'new', text: 'Admin panel: users, notes, inbox, lists, self-chat management' },
      { type: 'new', text: 'Role-based access control (user / admin)' },
      { type: 'new', text: 'Google OAuth login' },
      { type: 'improved', text: 'All content dialogs now URL-driven (shareable, back-button safe)' },
      { type: 'improved', text: 'React Query caching layer — instant navigation, no full reloads' },
    ],
  },
  {
    version: 'Version 1.0',
    date: 'April 2025',
    status: 'released',
    summary: 'Initial release — the core personal knowledge system.',
    changes: [
      { type: 'new', text: 'Notes: create, edit, delete, favorite, archive' },
      { type: 'new', text: 'Inbox: capture text and links, tabs, search' },
      { type: 'new', text: 'Self Chat: send messages to yourself, search, favorite, delete' },
      { type: 'new', text: 'Global Search across notes, inbox, and self-chat' },
      { type: 'new', text: 'Light / Dark / System theme toggle' },
      { type: 'new', text: 'Email + password authentication' },
      { type: 'new', text: 'User dashboard with stats and recent activity' },
      { type: 'new', text: 'Responsive sidebar navigation' },
    ],
  },
];

const tagColors: Record<string, string> = {
  new: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
  improved: 'bg-green-600/10 text-green-600 border-green-600/20',
  fixed: 'bg-yellow-600/10 text-yellow-600 border-yellow-600/20',
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              variants={fadeUp}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg"
            >
              <Clock size={24} className="text-white" />
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight">
              Changelog
            </motion.h1>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-xl leading-relaxed">
              A history of updates and improvements to Zikron.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Releases */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border hidden sm:block" />

            <div className="flex flex-col gap-12">
              {releases.map((release) => (
                <motion.div
                  key={release.version}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-80px' }}
                  variants={stagger}
                  className="sm:pl-16 relative"
                >
                  {/* Dot */}
                  <div className="hidden sm:flex absolute left-0 top-1 w-10 h-10 rounded-full bg-card border border-border items-center justify-center shadow-sm">
                    {release.status === 'latest' ? (
                      <div className="w-3 h-3 rounded-full bg-blue-600" />
                    ) : (
                      <CheckCircle2 size={16} className="text-muted-foreground" />
                    )}
                  </div>

                  <motion.div variants={fadeUp} className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold">{release.version}</h2>
                    {release.status === 'latest' && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-600/10 text-blue-600 border border-blue-600/20">
                        Latest
                      </span>
                    )}
                  </motion.div>

                  <motion.p variants={fadeUp} className="text-xs text-muted-foreground mb-1">
                    {release.date}
                  </motion.p>
                  <motion.p variants={fadeUp} className="text-sm text-muted-foreground mb-5">
                    {release.summary}
                  </motion.p>

                  <motion.ul variants={stagger} className="flex flex-col gap-2.5">
                    {release.changes.map((change) => (
                      <motion.li
                        key={change.text}
                        variants={fadeUp}
                        className="flex items-start gap-3"
                      >
                        <span
                          className={`shrink-0 mt-0.5 px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${tagColors[change.type]}`}
                        >
                          {change.type}
                        </span>
                        <span className="text-sm text-muted-foreground leading-relaxed">{change.text}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex flex-col items-center gap-6"
          >
            <motion.div variants={fadeUp} className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
              <Layers size={20} className="text-white" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold">
              Start using Zikron today
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground">
              Free to use. No credit card required.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <a
                href="/signup"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                Get started free
              </a>
              <a
                href="/about"
                className="px-6 py-2.5 border border-border hover:bg-muted text-foreground rounded-xl text-sm font-medium transition-colors"
              >
                About Zikron
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
