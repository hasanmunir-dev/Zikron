'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Bell, CheckCircle2, Clock } from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem } from './motion-variants';

const reminders = [
  {
    title: 'Submit compiler assignment',
    time: 'Overdue by 2 hours',
    priority: 'High',
    status: 'overdue',
  },
  {
    title: 'Revise LR parsing',
    time: 'Due today at 8:00 PM',
    priority: 'Medium',
    status: 'today',
  },
  {
    title: 'Push project to GitHub',
    time: 'Tomorrow at 10:00 AM',
    priority: 'Medium',
    status: 'upcoming',
  },
  {
    title: 'Call HR about internship',
    time: 'In 3 days',
    priority: 'Low',
    status: 'upcoming',
  },
  {
    title: 'Review auth middleware',
    time: 'Completed yesterday',
    priority: 'High',
    status: 'completed',
  },
];

const statusConfig = {
  overdue: {
    badge: 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-900/60',
    label: 'Overdue',
    Icon: AlertCircle,
    iconClass: 'text-red-500',
    timeClass: 'text-red-500 dark:text-red-400',
  },
  today: {
    badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-900/60',
    label: 'Due Today',
    Icon: Clock,
    iconClass: 'text-amber-500',
    timeClass: 'text-amber-600 dark:text-amber-400',
  },
  upcoming: {
    badge: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
    border: 'border-border',
    label: 'Upcoming',
    Icon: Clock,
    iconClass: 'text-blue-500',
    timeClass: 'text-muted-foreground',
  },
  completed: {
    badge: 'bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400',
    border: 'border-border',
    label: 'Completed',
    Icon: CheckCircle2,
    iconClass: 'text-green-500',
    timeClass: 'text-muted-foreground',
  },
};

const priorityColor: Record<string, string> = {
  High: 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400',
  Medium: 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400',
  Low: 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
};

export function RemindersSection() {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: reminder cards */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-amber-500/8 to-blue-500/8 blur-2xl rounded-3xl" />
            <div className="relative space-y-2.5">
              {reminders.map(({ title, time, priority, status }, i) => {
                const cfg = statusConfig[status as keyof typeof statusConfig];
                const { Icon } = cfg;
                return (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ delay: i * 0.07, duration: 0.4 }}
                    className={`flex items-center gap-4 bg-card border rounded-xl px-4 py-3 ${cfg.border} ${status === 'completed' ? 'opacity-60' : ''}`}
                  >
                    <Icon size={15} className={`${cfg.iconClass} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {title}
                      </p>
                      <p className={`text-xs mt-0.5 ${cfg.timeClass}`}>{time}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${priorityColor[priority]}`}>
                        {priority}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right: copy */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900 text-amber-600 dark:text-amber-400 text-sm font-medium mb-5">
              <Bell size={13} />
              Reminders
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">
              Remember what matters{' '}
              <span className="text-amber-600">before it slips.</span>
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed mb-7">
              Create reminders with due dates, priority levels, and Markdown descriptions. See what&apos;s overdue, due today, and upcoming at a glance.
            </p>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              className="space-y-3"
            >
              {[
                { label: 'Due Today', desc: 'See all reminders due today highlighted at the top', color: 'text-amber-500' },
                { label: 'Overdue alerts', desc: 'Overdue reminders shown in red so nothing is missed', color: 'text-red-500' },
                { label: 'Browser push notifications', desc: 'Get notified in the browser when a reminder is due', color: 'text-blue-500' },
                { label: 'Linked to your content', desc: 'Link reminders to a note, inbox item, list, or message', color: 'text-green-500' },
              ].map(({ label, desc, color }) => (
                <motion.div key={label} variants={staggerItem} className="flex gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')} mt-2 shrink-0`} />
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
