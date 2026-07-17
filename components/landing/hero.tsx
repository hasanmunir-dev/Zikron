'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  FolderOpen,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Search,
  Table2,
  Users,
} from 'lucide-react';

function AppMockup() {
  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Inbox, label: 'Inbox' },
    { icon: BookOpen, label: 'Notes' },
    { icon: Table2, label: 'Lists' },
    { icon: Bell, label: 'Reminders' },
    { icon: FolderOpen, label: 'Collections' },
    { icon: Users, label: 'Contacts' },
    { icon: Calendar, label: 'Calendar' },
    { icon: MessageSquare, label: 'Self Chat' },
    { icon: Search, label: 'Search' },
  ];

  return (
    <div className="relative w-full max-w-5xl mx-auto select-none">
      {/* Glow backdrop */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-blue-500/15 blur-3xl rounded-3xl -z-10" />

      <div className="relative rounded-2xl border border-border bg-card shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40 shrink-0">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-400/70 dark:bg-rose-500/50" />
            <div className="w-3 h-3 rounded-full bg-amber-400/70 dark:bg-amber-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-400/70 dark:bg-green-500/50" />
          </div>
          <div className="flex-1 max-w-[240px] mx-auto">
            <div className="bg-background/80 border border-border/60 rounded-md px-3 py-0.5 text-[11px] text-center text-muted-foreground/50 truncate">
              zikron.app/dashboard
            </div>
          </div>
        </div>

        {/* App layout */}
        <div className="flex" style={{ height: '400px' }}>
          {/* Sidebar */}
          <div className="w-[180px] shrink-0 border-r border-border bg-muted/20 flex flex-col py-3 hidden sm:flex">
            <div className="px-3 pb-2 mb-1">
              <span className="text-sm font-bold text-foreground">Zikron</span>
            </div>
            {sidebarItems.map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={`flex items-center gap-2.5 mx-2 px-2.5 py-[7px] rounded-lg text-[12px] font-medium mb-0.5 transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon size={13} className="shrink-0" />
                {label}
              </div>
            ))}
          </div>

          {/* Main area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top bar */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-background/40 shrink-0">
              <div className="flex-1 bg-muted rounded-lg px-3 py-1.5 text-[11px] text-muted-foreground/60 flex items-center gap-1.5 max-w-xs">
                <Search size={10} className="shrink-0" />
                Search notes, inbox, reminders…
              </div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shrink-0" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden p-3">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { label: 'Notes', count: '24' },
                  { label: 'Inbox', count: '8' },
                  { label: 'Reminders', count: '3' },
                  { label: 'Contacts', count: '12' },
                ].map(({ label, count }) => (
                  <div key={label} className="bg-muted/60 rounded-xl p-2.5 text-center border border-border/50">
                    <p className="text-sm font-bold text-foreground leading-none mb-0.5">{count}</p>
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Left col */}
                <div className="space-y-2.5">
                  {/* Note card */}
                  <div className="bg-card border border-border rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <BookOpen size={10} className="text-blue-500 shrink-0" />
                      <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Recent Note</span>
                    </div>
                    <p className="text-[11px] font-semibold text-foreground mb-1">Compiler Notes</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                      LR parsing, CFG, grammar rules, First/Follow sets, token recognition…
                    </p>
                    <div className="flex gap-1 mt-1.5">
                      <span className="text-[9px] bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full">compiler</span>
                      <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">study</span>
                    </div>
                  </div>

                  {/* Self-chat */}
                  <div className="bg-card border border-border rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MessageSquare size={10} className="text-violet-500 shrink-0" />
                      <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Self Chat</span>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white rounded-xl rounded-tr-sm px-2.5 py-1.5 text-[10px] leading-snug max-w-[85%]">
                        Don&apos;t forget to push deployment configs before the deadline
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right col */}
                <div className="space-y-2.5">
                  {/* Reminder */}
                  <div className="bg-card border border-amber-200 dark:border-amber-800/60 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Bell size={10} className="text-amber-500 shrink-0" />
                      <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Due Today</span>
                    </div>
                    <p className="text-[11px] font-semibold text-foreground mb-0.5">Submit compiler assignment</p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mb-2">Due at 11:59 PM · High priority</p>
                    <div className="flex gap-1">
                      <button className="text-[9px] bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                        Mark done
                      </button>
                    </div>
                  </div>

                  {/* List table */}
                  <div className="bg-card border border-border rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Table2 size={10} className="text-blue-500 shrink-0" />
                      <span className="text-[11px] font-semibold text-foreground">Git Commands</span>
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/60">
                          <th className="text-left pb-1 pr-2 text-[9px] font-medium text-muted-foreground">Command</th>
                          <th className="text-left pb-1 text-[9px] font-medium text-muted-foreground">Meaning</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ['git status', 'Show changes'],
                          ['git add .', 'Stage files'],
                          ['git commit', 'Save commit'],
                        ].map(([cmd, desc]) => (
                          <tr key={cmd} className="border-b border-border/40 last:border-0">
                            <td className="py-0.5 pr-2 font-mono text-[9px] text-blue-600 dark:text-blue-400 whitespace-nowrap">{cmd}</td>
                            <td className="py-0.5 text-[9px] text-muted-foreground">{desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Background atmosphere — no negative z-index; content div follows in DOM so it paints on top */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-blue-600/10 via-indigo-500/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-24 left-1/3 w-[500px] h-[400px] bg-blue-400/6 rounded-full blur-3xl" />
        <div className="absolute top-24 right-1/3 w-[500px] h-[400px] bg-indigo-500/6 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04] bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex justify-center mb-7"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-800/70 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-sm font-medium shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
            Your personal knowledge system
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center text-[2.75rem] sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6"
        >
          Capture everything.{' '}
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Find it when it matters.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed"
        >
          Notes, inbox, reminders, contacts, collections, calendar, and more — all in one organized, searchable, cloud-synced workspace.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.42 }}
          className="text-center text-sm text-muted-foreground/60 mb-10"
        >
          Built for students, developers, and knowledge workers.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.48 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20"
        >
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold text-base transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
          >
            Start for free <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center border border-border text-foreground hover:bg-muted px-8 py-3 rounded-xl font-medium text-base transition-colors w-full sm:w-auto"
          >
            Sign in
          </Link>
        </motion.div>

        {/* Product mockup */}
        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <AppMockup />
        </motion.div>
      </div>
    </section>
  );
}
