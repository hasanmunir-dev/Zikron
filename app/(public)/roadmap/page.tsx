'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  FileUp,
  FolderOpen,
  GitBranch,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  Layers,
  MessageSquare,
  Mic,
  Search,
  Settings,
  Share2,
  Smartphone,
  Sparkles,
  Table2,
  Terminal,
  Users,
  Zap,
} from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

type RoadmapItem = {
  icon: React.ElementType;
  label: string;
  description: string;
  tag?: string;
};

const completed: RoadmapItem[] = [
  { icon: Inbox,          label: 'Universal Inbox',    description: 'Capture links, thoughts, and ideas instantly. Auto-detects URLs from plain text.' },
  { icon: BookOpen,       label: 'Markdown Notes',     description: 'Write in Markdown, read it rendered. Full formatting with toolbar and live preview.' },
  { icon: Table2,         label: 'Dynamic Lists',      description: 'Custom tables with user-defined columns. Inline editing, sort, and reorder rows.' },
  { icon: MessageSquare,  label: 'Self Chat',          description: 'Send messages to yourself with Markdown support. Favorite messages for quick access.' },
  { icon: Bell,           label: 'Reminders',          description: 'Due dates, priorities, and browser push notifications. Overdue and today views.' },
  { icon: FolderOpen,     label: 'Collections',        description: 'Group notes and inbox items into named projects. Milestones and progress tracking.' },
  { icon: Users,          label: 'Contacts',           description: 'Manage contacts with tags, notes, and follow-up dates. Linked to inbox and reminders.' },
  { icon: LayoutTemplate, label: 'Templates',          description: 'Reusable templates for notes, lists, reminders, inbox, collections, and contacts.' },
  { icon: Calendar,       label: 'Calendar',           description: 'All scheduled items in one place. Month, week, day, and list views with source filters.' },
  { icon: GitBranch,      label: 'Activity Timeline',  description: 'Chronological feed combining activity history and upcoming scheduled events.' },
  { icon: Search,         label: 'Global Search',      description: 'Search everything — notes, inbox, contacts, reminders, collections, and templates.' },
  { icon: Terminal,       label: 'Command Palette',    description: 'Keyboard-driven navigation and creation across all modules. Accessible from anywhere.' },
  { icon: Layers,         label: 'Tags & Graph',       description: 'Tag any item and explore connections visually via the knowledge graph.' },
  { icon: LayoutDashboard,label: 'Admin Dashboard',    description: 'Full platform admin panel: user management, content visibility, and metrics.' },
];

const coming: RoadmapItem[] = [
  { icon: ArrowLeftRight, label: 'Import / Export',    description: 'Export all your data as Markdown, CSV, or JSON. Import from Notion, Bear, and other tools.', tag: 'Near' },
  { icon: Zap,            label: 'Automation',         description: 'Rule-based triggers — auto-tag inbox items, remind on follow-up dates, and more.', tag: 'Near' },
  { icon: Settings,       label: 'Profile & Settings', description: 'Timezone preferences, notification settings, appearance, and account management.', tag: 'Near' },
  { icon: Share2,         label: 'Public link sharing', description: 'Share notes and lists via public or password-protected links with view tracking.', tag: 'Near' },
];

const future: RoadmapItem[] = [
  { icon: FileUp,     label: 'File uploads',    description: 'Attach files, PDFs, and images to notes, inbox items, and collections.' },
  { icon: Mic,        label: 'Voice notes',     description: 'Record voice memos and have them automatically transcribed into text.' },
  { icon: Smartphone, label: 'Mobile app',      description: 'Native iOS and Android app with offline support and background sync.' },
  { icon: Sparkles,   label: 'Premium plans',   description: 'Expanded storage limits, priority support, and access to advanced features.' },
];

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
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
              <Calendar size={24} className="text-white" />
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight">
              Roadmap
            </motion.h1>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-xl leading-relaxed text-lg">
              What is live, what is coming next, and what is planned for the future. Updated as the product evolves.
            </motion.p>

            {/* Stats */}
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-6 mt-2">
              {[
                { icon: CheckCircle2, label: `${completed.length} features live`, color: 'text-green-600' },
                { icon: Clock,        label: `${coming.length} coming next`,     color: 'text-blue-600' },
                { icon: Circle,       label: `${future.length} on the horizon`,  color: 'text-muted-foreground' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon size={15} className={color} />
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Completed — compact grid */}
      <section className="pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <CheckCircle2 size={18} className="text-green-600" />
              <h2 className="text-xl font-bold text-green-600">Live Now</h2>
              <span className="text-xs font-semibold bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 px-2.5 py-0.5 rounded-full border border-green-200 dark:border-green-900">
                {completed.length} features
              </span>
            </motion.div>

            <motion.div
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
            >
              {completed.map((item) => (
                <motion.div
                  key={item.label}
                  variants={fadeUp}
                  className="flex gap-3 p-4 rounded-xl border border-green-200/60 dark:border-green-900/40 bg-green-50/50 dark:bg-green-950/10 hover:border-green-300 dark:hover:border-green-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
                    <item.icon size={14} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Coming next + Future — 2-col */}
      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Coming Next */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <Clock size={18} className="text-blue-600" />
              <h2 className="text-xl font-bold text-blue-600">Coming Next</h2>
              <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                {coming.length} planned
              </span>
            </motion.div>

            <div className="space-y-3">
              {coming.map((item) => (
                <motion.div
                  key={item.label}
                  variants={fadeUp}
                  className="flex gap-4 p-4 rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/10"
                >
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
                    <item.icon size={15} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Future */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <Circle size={18} className="text-muted-foreground" />
              <h2 className="text-xl font-bold text-muted-foreground">Future</h2>
              <span className="text-xs font-semibold bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full border border-border">
                {future.length} on the horizon
              </span>
            </motion.div>

            <div className="space-y-3">
              {future.map((item) => (
                <motion.div
                  key={item.label}
                  variants={fadeUp}
                  className="flex gap-4 p-4 rounded-xl border border-border bg-muted/30"
                >
                  <div className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
                    <item.icon size={15} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.p variants={fadeUp} className="text-xs text-muted-foreground/60 mt-6 leading-relaxed">
              Roadmap is subject to change. Features are prioritised based on user needs and feedback.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Feedback CTA */}
      <section className="py-16 px-6 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex flex-col items-center gap-5"
          >
            <motion.h2 variants={fadeUp} className="text-2xl font-bold">
              Have a feature request?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground">
              Reach out — your feedback shapes what gets built next.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <a
                href="/contact"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                Send feedback
              </a>
              <a
                href="/signup"
                className="px-6 py-2.5 border border-border hover:bg-muted text-foreground rounded-xl text-sm font-medium transition-colors"
              >
                Get started free
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
