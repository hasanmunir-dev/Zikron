'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Loader2,
  BookOpen,
  Inbox,
  MessageSquare,
  Search,
  Bell,
  Layers,
  Users,
  Share2,
  Mic,
  Smartphone,
  FileUp,
  Brain,
  Link2,
  FolderKanban,
} from 'lucide-react';
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

type RoadmapItem = {
  icon: React.ElementType;
  label: string;
  description: string;
};

const columns: { title: string; status: 'completed' | 'in-progress' | 'planned'; color: string; items: RoadmapItem[] }[] = [
  {
    title: 'Completed',
    status: 'completed',
    color: 'text-green-600',
    items: [
      { icon: BookOpen, label: 'Notes', description: 'Create, edit, favorite, archive, and search notes with Markdown support.' },
      { icon: Inbox, label: 'Inbox', description: 'Capture text and links, organize with tabs, and search instantly.' },
      { icon: MessageSquare, label: 'Self Chat', description: 'Send messages to yourself — like a private WhatsApp.' },
      { icon: Search, label: 'Global Search', description: 'Search across all modules from one place.' },
      { icon: Layers, label: 'Lists', description: 'Custom tables with columns, rows, and Markdown cell values.' },
      { icon: Bell, label: 'Reminders', description: 'Reminders with due dates, priorities, and browser push notifications.' },
    ],
  },
  {
    title: 'In Progress',
    status: 'in-progress',
    color: 'text-blue-600',
    items: [
      { icon: FolderKanban, label: 'Collections', description: 'Group notes and inbox items into named collections for better organization.' },
    ],
  },
  {
    title: 'Planned',
    status: 'planned',
    color: 'text-muted-foreground',
    items: [
      { icon: Users, label: 'Contacts', description: 'Manage personal contacts with Google Contacts import.' },
      { icon: Share2, label: 'Secure Sharing', description: 'Share notes and lists publicly, with password protection, or privately.' },
      { icon: Link2, label: 'Tracked Links', description: 'Protected sharing links with access logs and view tracking.' },
      { icon: FileUp, label: 'File Uploads', description: 'Attach files and documents to your notes and inbox items.' },
      { icon: FileUp, label: 'PDF Viewing', description: 'View and annotate PDFs directly inside Zikron.' },
      { icon: Mic, label: 'Voice Notes', description: 'Record voice notes and have them transcribed automatically.' },
      { icon: Smartphone, label: 'Mobile Application', description: 'iOS and Android app with offline sync via SQLite.' },
      { icon: Brain, label: 'AI Features', description: 'Smart summarization, search suggestions, and auto-tagging.' },
      { icon: Users, label: 'Team Collaboration', description: 'Share workspaces and collaborate with your team.' },
    ],
  },
];

const statusIcon = {
  completed: <CheckCircle2 size={14} className="text-green-600" />,
  'in-progress': <Loader2 size={14} className="text-blue-600 animate-spin" />,
  planned: <Circle size={14} className="text-muted-foreground" />,
};

const columnBg = {
  completed: 'border-green-600/20 bg-green-600/5',
  'in-progress': 'border-blue-600/20 bg-blue-600/5',
  planned: 'border-border bg-muted/30',
};

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
              <FolderKanban size={24} className="text-white" />
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight">
              Roadmap
            </motion.h1>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-xl leading-relaxed">
              Where Zikron is headed. This is a public roadmap — features may change based on usage and feedback.
            </motion.p>

            {/* Legend */}
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-5 text-sm">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-green-600" />
                <span className="text-muted-foreground">Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Loader2 size={14} className="text-blue-600" />
                <span className="text-muted-foreground">In Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Circle size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">Planned</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Kanban columns */}
      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => (
            <motion.div
              key={col.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={stagger}
              className="flex flex-col gap-4"
            >
              <motion.div variants={fadeUp} className="flex items-center gap-2 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  {statusIcon[col.status]}
                  <h2 className={`font-bold text-base ${col.color}`}>{col.title}</h2>
                </div>
                <span className="ml-auto text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
                  {col.items.length}
                </span>
              </motion.div>

              <div className="flex flex-col gap-3">
                {col.items.map((item) => (
                  <motion.div
                    key={item.label}
                    variants={fadeUp}
                    className={`p-4 rounded-2xl border ${columnBg[col.status]} flex flex-col gap-3`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
                        <item.icon size={14} className="text-muted-foreground" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
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
              Reach out — feedback shapes what gets built next.
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
