'use client';

import { motion } from 'framer-motion';
import {
  Bell,
  BookOpen,
  Calendar,
  FolderOpen,
  GitBranch,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  MessageSquare,
  Moon,
  Search,
  Table2,
  Terminal,
  Users,
} from 'lucide-react';
import { staggerContainer, staggerItem, fadeInUp } from './motion-variants';

const features = [
  {
    icon: Inbox,
    title: 'Universal Inbox',
    desc: 'Save quick thoughts, links, and ideas before organizing them later. Auto-detects links from plain text.',
    color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
  },
  {
    icon: BookOpen,
    title: 'Markdown Notes',
    desc: 'Write in Markdown, read it rendered. Full formatting support — headings, code blocks, checklists, tables.',
    color: 'bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400',
  },
  {
    icon: Table2,
    title: 'Dynamic Lists',
    desc: 'Create custom tables for commands, definitions, formulas, and comparisons. Define columns, add rows, edit inline.',
    color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
  },
  {
    icon: MessageSquare,
    title: 'Self Chat',
    desc: 'Send messages to yourself like a saved messages channel. Markdown supported. Favorite for quick access later.',
    color: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
  },
  {
    icon: Bell,
    title: 'Reminders',
    desc: 'Set reminders with due dates and priority. See what\'s overdue, due today, and upcoming. Browser push notifications.',
    color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
  },
  {
    icon: FolderOpen,
    title: 'Collections',
    desc: 'Group notes and inbox items into named collections. Add milestones, track progress, and organize projects.',
    color: 'bg-fuchsia-100 dark:bg-fuchsia-950/60 text-fuchsia-600 dark:text-fuchsia-400',
  },
  {
    icon: Users,
    title: 'Contacts',
    desc: 'Store and manage contacts with tags, notes, and follow-up dates. Keep everything linked to your workflow.',
    color: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400',
  },
  {
    icon: LayoutTemplate,
    title: 'Templates',
    desc: 'Create reusable templates for notes, lists, reminders, and more. Start any item from a template in one click.',
    color: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
  },
  {
    icon: Calendar,
    title: 'Calendar',
    desc: 'See all scheduled items across every module in one view. Month, week, day, and list layouts with source filters.',
    color: 'bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400',
  },
  {
    icon: GitBranch,
    title: 'Activity Timeline',
    desc: 'A combined feed of everything you\'ve done and what\'s coming up. Filter by activity, scheduled, or both.',
    color: 'bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400',
  },
  {
    icon: Search,
    title: 'Global Search',
    desc: 'Search everything from one place — notes, inbox, messages, lists, reminders, contacts, and templates.',
    color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: Terminal,
    title: 'Command Palette',
    desc: 'Keyboard-driven command palette to navigate, create, and act without touching the mouse.',
    color: 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400',
  },
  // {
  //   icon: LayoutDashboard,
  //   title: 'Admin Dashboard',
  //   desc: 'Separate admin panel with full platform visibility — user management, content overview, and statistics.',
  //   color: 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400',
  // },
  {
    icon: Moon,
    title: 'Light · Dark · System',
    desc: 'Full theme support across every page. Follows your system preference automatically. Toggle anytime.',
    color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeInUp} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
            Everything included
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            One workspace. Every tool you need.
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Zikron replaces scattered apps with a single, fast, organized system.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {features.map(({ icon: Icon, title, desc, color }) => (
            <motion.div
              key={title}
              variants={staggerItem}
              whileHover={{ y: -3, transition: { duration: 0.18 } }}
              className="flex flex-col gap-4 p-5 rounded-2xl bg-card border border-border hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-sm transition-all cursor-default"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1.5">{title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
