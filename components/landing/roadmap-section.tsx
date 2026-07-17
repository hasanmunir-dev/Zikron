'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Layers } from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem } from './motion-variants';

const roadmapItems = [
  {
    phase: 'Live now',
    badge: 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900',
    icon: CheckCircle2,
    iconColor: 'text-green-500',
    items: [
      { label: 'Inbox', desc: 'Capture links, thoughts, and ideas instantly' },
      { label: 'Markdown Notes', desc: 'Write and render rich notes with full Markdown' },
      { label: 'Dynamic Lists', desc: 'Custom tables for commands, data, and comparisons' },
      { label: 'Reminders', desc: 'Due dates, priorities, and browser notifications' },
      { label: 'Collections', desc: 'Group notes and items into projects with milestones' },
      { label: 'Contacts', desc: 'Manage contacts with tags and follow-up dates' },
      { label: 'Templates', desc: 'Reusable templates for every module' },
      { label: 'Calendar', desc: 'Unified view of all scheduled items across modules' },
      { label: 'Activity Timeline', desc: 'Chronological feed of activity and upcoming events' },
      { label: 'Self Chat', desc: 'Message yourself with Markdown support' },
      { label: 'Global Search', desc: 'Find anything across all modules instantly' },
      { label: 'Command Palette', desc: 'Keyboard-driven navigation and actions' },
    ],
  },
  {
    phase: 'Coming next',
    badge: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    icon: Clock,
    iconColor: 'text-blue-500',
    items: [
      { label: 'Import / Export', desc: 'Export your data as Markdown, CSV, or JSON and import from other tools' },
      { label: 'Automation', desc: 'Rule-based triggers — e.g. auto-tag inbox items or remind on follow-up dates' },
      { label: 'Profile & Settings', desc: 'Timezone, notification preferences, account management' },
      { label: 'Public link sharing', desc: 'Share notes and lists via protected or public links' },
    ],
  },
  {
    phase: 'Future',
    badge: 'bg-muted text-muted-foreground border-border',
    icon: Layers,
    iconColor: 'text-muted-foreground',
    items: [
      { label: 'File uploads', desc: 'Attach files, PDFs, and images to notes and collections' },
      { label: 'Voice notes', desc: 'Record and transcribe voice memos' },
      { label: 'Mobile app', desc: 'Native iOS and Android app with offline sync' },
      { label: 'Premium plans', desc: 'Expanded storage and advanced features' },
    ],
  },
];

export function RoadmapSection() {
  return (
    <section id="roadmap" className="py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div {...fadeInUp} className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            What is built. What is coming.
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Zikron is actively developed. Here is what is live today and what is planned next.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {roadmapItems.map(({ phase, badge, icon: PhaseIcon, iconColor, items }) => (
            <motion.div
              key={phase}
              variants={staggerItem}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <PhaseIcon size={15} className={iconColor} />
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge}`}>
                  {phase}
                </span>
              </div>

              <div className="space-y-3.5">
                {items.map(({ label, desc }) => (
                  <div key={label} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-[7px] shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          {...fadeInUp}
          className="text-center text-sm text-muted-foreground/60 mt-8"
        >
          Roadmap is subject to change. Features are prioritised based on user needs.
        </motion.p>
      </div>
    </section>
  );
}
