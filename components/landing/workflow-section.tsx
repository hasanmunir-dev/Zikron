'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Eye, FolderOpen, Search, Zap } from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem } from './motion-variants';

const steps = [
  {
    icon: Zap,
    step: '01',
    title: 'Capture',
    desc: 'Drop anything into the Inbox or Self Chat in seconds. A link, a thought, a command — don\'t worry about where it goes yet.',
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400',
  },
  {
    icon: FolderOpen,
    step: '02',
    title: 'Organize',
    desc: 'Move it into Notes, Lists, or Collections. Tag contacts, set reminders with due dates.',
    color: 'text-violet-600 bg-violet-100 dark:bg-violet-950/60 dark:text-violet-400',
  },
  {
    icon: Search,
    step: '03',
    title: 'Search',
    desc: 'One search box finds everything — notes, inbox, contacts, reminders, collections, and templates. No switching apps.',
    color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-400',
  },
  {
    icon: Eye,
    step: '04',
    title: 'Act',
    desc: 'Open it right where you left off. URL-driven dialogs mean browser back closes them and deep links always work.',
    color: 'text-green-600 bg-green-100 dark:bg-green-950/60 dark:text-green-400',
  },
];

export function WorkflowSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div {...fadeInUp} className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            A system, not just an app.
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Zikron is designed around a simple four-step workflow that builds on itself.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="relative"
        >
          {/* Connector line */}
          <div className="hidden lg:block absolute top-[52px] left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ icon: Icon, step, title, desc, color }, i) => (
              <motion.div
                key={title}
                variants={staggerItem}
                className="flex flex-col items-center text-center"
              >
                <div className="relative mb-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} shadow-sm`}>
                    <Icon size={20} />
                  </div>
                  <span className="absolute -top-2 -right-2 text-[10px] font-bold text-muted-foreground/50 bg-background border border-border rounded-full w-5 h-5 flex items-center justify-center">
                    {step}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                {i < steps.length - 1 && (
                  <ArrowRight size={14} className="text-muted-foreground/40 mt-4 lg:hidden" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Example flow */}
        <motion.div
          {...fadeInUp}
          className="mt-14 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <span className="font-medium">Example:</span>
          {[
            'Drop a link in Inbox',
            '→',
            'Move it to a Collection',
            '→',
            'Set a reminder follow-up',
            '→',
            'See it on Calendar',
          ].map((item, i) => (
            <span
              key={i}
              className={item === '→' ? 'text-muted-foreground/40' : 'bg-card border border-border rounded-lg px-2.5 py-1 text-foreground'}
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
