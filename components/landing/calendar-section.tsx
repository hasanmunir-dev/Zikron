'use client';

import { motion } from 'framer-motion';
import { Bell, BookOpen, Calendar, CheckCircle2, FolderOpen, Users } from 'lucide-react';
import { staggerContainer, staggerItem } from './motion-variants';

const calDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const calEvents: Record<number, { label: string; color: string }[]> = {
  3: [{ label: 'Review meeting', color: 'bg-cyan-500' }],
  7: [
    { label: 'Compiler note', color: 'bg-violet-500' },
    { label: 'HR follow-up', color: 'bg-cyan-500' },
  ],
  10: [{ label: 'Submit project', color: 'bg-amber-500' }],
  14: [{ label: 'Milestone due', color: 'bg-emerald-500' }],
  17: [{ label: 'Launch checklist', color: 'bg-violet-500' }],
  21: [
    { label: 'Sprint planning', color: 'bg-amber-500' },
    { label: 'Team retrospective', color: 'bg-blue-500' },
  ],
  24: [{ label: 'Design review', color: 'bg-fuchsia-500' }],
};

const upcomingEvents = [
  { icon: Bell, label: 'Submit project assignment', time: 'Today · 11:59 PM', color: 'text-amber-500 bg-amber-100 dark:bg-amber-950/60', dot: 'bg-amber-500' },
  { icon: BookOpen, label: 'Compiler Notes — review session', time: 'Tomorrow · 10:00 AM', color: 'text-violet-500 bg-violet-100 dark:bg-violet-950/60', dot: 'bg-violet-500' },
  { icon: Users, label: 'Follow up with Sara Rahman', time: 'Wed · 2:00 PM', color: 'text-cyan-500 bg-cyan-100 dark:bg-cyan-950/60', dot: 'bg-cyan-500' },
  { icon: FolderOpen, label: 'Website Redesign — milestone due', time: 'Thu · all day', color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-950/60', dot: 'bg-emerald-500' },
];

const sources = [
  { color: 'bg-violet-500', label: 'Notes' },
  { color: 'bg-blue-500', label: 'Inbox' },
  { color: 'bg-cyan-500', label: 'Contacts' },
  { color: 'bg-amber-500', label: 'Reminders' },
  { color: 'bg-emerald-500', label: 'Milestones' },
];

const features = [
  { label: 'Month, week, day & list views', desc: 'Switch views depending on whether you need overview or detail' },
  { label: 'All modules in one place', desc: 'Notes, reminders, contacts, inbox follow-ups and milestones unified' },
  { label: 'Color-coded by source', desc: 'Instantly see what kind of event you\'re looking at with a glance' },
  { label: 'Click to navigate', desc: 'Click any calendar event to jump straight to the source item' },
];

export function CalendarSection() {
  return (
    <section id="calendar" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-100 dark:border-teal-900 text-teal-600 dark:text-teal-400 text-sm font-medium mb-4">
            <Calendar size={13} />
            Calendar
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Everything on one timeline.
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Scheduled notes, reminders, contact follow-ups, and collection milestones — all visible in a single calendar. Nothing falls through the cracks.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Calendar mockup — 3 cols */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="lg:col-span-3 relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-teal-500/8 to-emerald-500/8 blur-2xl rounded-3xl" />
            <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              {/* Cal header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="text-teal-500" />
                  <span className="text-sm font-semibold text-foreground">July 2026</span>
                </div>
                {/* Source legend */}
                <div className="flex items-center gap-3">
                  {sources.map(({ color, label }) => (
                    <div key={label} className="hidden sm:flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${color}`} />
                      <span className="text-[10px] text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-border">
                {calDays.map(d => (
                  <div key={d} className="px-1 py-2 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid — 4 weeks */}
              <div className="grid grid-cols-7">
                {Array.from({ length: 28 }, (_, i) => {
                  const day = i + 1;
                  const events = calEvents[day] ?? [];
                  const isToday = day === 10;
                  return (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.012 }}
                      className={`min-h-[52px] p-1.5 border-b border-r border-border/50 last:border-r-0 ${
                        isToday ? 'bg-teal-50/50 dark:bg-teal-950/20' : ''
                      }`}
                    >
                      <p className={`text-[11px] font-medium mb-1 w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-teal-500 text-white' : 'text-muted-foreground'
                      }`}>
                        {day}
                      </p>
                      <div className="space-y-0.5">
                        {events.map(({ label, color }) => (
                          <div key={label} className={`${color} rounded text-white text-[8px] px-1 py-0.5 truncate font-medium`}>
                            {label}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Right column — 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            {/* Upcoming events */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="px-4 py-3 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Upcoming</p>
              </div>
              <div className="divide-y divide-border/60">
                {upcomingEvents.map(({ icon: Icon, label, time, color, dot }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                      <Icon size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{time}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Feature list */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              className="space-y-3"
            >
              {features.map(({ label, desc }) => (
                <motion.div key={label} variants={staggerItem} className="flex gap-3">
                  <CheckCircle2 size={14} className="text-teal-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
