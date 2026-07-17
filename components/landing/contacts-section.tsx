'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Mail, Phone, Users } from 'lucide-react';
import { staggerContainer, staggerItem } from './motion-variants';

const contacts = [
  {
    initials: 'SR',
    name: 'Sara Rahman',
    role: 'Product Manager · Acme Corp',
    tags: ['client', 'product'],
    followUp: { label: 'Follow-up today', urgent: true },
    color: 'from-violet-500 to-fuchsia-500',
  },
  {
    initials: 'JK',
    name: 'James Kim',
    role: 'Senior Engineer · TechFlow',
    tags: ['developer', 'referral'],
    followUp: { label: 'Follow-up in 3 days', urgent: false },
    color: 'from-blue-500 to-indigo-500',
  },
  {
    initials: 'AL',
    name: 'Amina Lahiri',
    role: 'Freelance Designer',
    tags: ['designer', 'contractor'],
    followUp: null,
    color: 'from-cyan-500 to-teal-500',
  },
  {
    initials: 'TP',
    name: 'Tom Park',
    role: 'CEO · Startup X',
    tags: ['investor', 'lead'],
    followUp: { label: 'Follow-up overdue', urgent: true },
    color: 'from-amber-500 to-orange-500',
  },
];

const features = [
  { label: 'Tags & categories', desc: 'Organise contacts with custom tags and find them instantly' },
  { label: 'Follow-up reminders', desc: 'Set follow-up dates per contact and see who needs attention today' },
  { label: 'Notes on contacts', desc: 'Write free-form notes in Markdown on every contact record' },
  { label: 'Linked to your inbox', desc: 'Inbox items and reminders can be linked to a specific contact' },
];

const tagColors: Record<string, string> = {
  client: 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400',
  product: 'bg-fuchsia-100 dark:bg-fuchsia-950/60 text-fuchsia-700 dark:text-fuchsia-400',
  developer: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400',
  referral: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400',
  designer: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400',
  contractor: 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400',
  investor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400',
  lead: 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400',
};

export function ContactsSection() {
  return (
    <section id="contacts" className="py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-100 dark:border-cyan-900 text-cyan-600 dark:text-cyan-400 text-sm font-medium mb-5">
              <Users size={13} />
              Contacts
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">
              Keep people in the loop.{' '}
              <span className="text-cyan-600">Never miss a follow-up.</span>
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed mb-7">
              Your contact book lives next to your notes and tasks. Tag people, write notes on them, and set follow-up dates so no important relationship gets forgotten.
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
                  <CheckCircle2 size={15} className="text-cyan-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Mini stat row */}
            <div className="flex items-center gap-5 mt-8 pt-7 border-t border-border">
              {[
                { icon: Mail, label: 'Email stored' },
                { icon: Phone, label: 'Phone stored' },
                { icon: Clock, label: 'Follow-up dates' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon size={13} className="text-muted-foreground/60" />
                  {label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: contact card mockup */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-cyan-500/8 to-blue-500/8 blur-2xl rounded-3xl" />
            <div className="relative space-y-2.5">
              {contacts.map(({ initials, name, role, tags, followUp, color }, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="flex items-center gap-4 bg-card border border-border rounded-xl px-4 py-3.5 hover:border-cyan-200 dark:hover:border-cyan-800/60 transition-colors"
                >
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
                    <span className="text-[11px] font-bold text-white">{initials}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">{name}</p>
                      {tags.map(t => (
                        <span key={t} className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${tagColors[t]}`}>
                          {t}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{role}</p>
                  </div>

                  {followUp && (
                    <div className={`flex items-center gap-1 shrink-0 text-[10px] font-medium px-2 py-1 rounded-full ${
                      followUp.urgent
                        ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                        : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                    }`}>
                      <Clock size={9} />
                      {followUp.label}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
