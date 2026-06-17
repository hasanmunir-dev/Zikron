'use client';

import { motion } from 'framer-motion';
import { Clock, Layers } from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem } from './motion-variants';

const roadmapItems = [
  {
    phase: 'Coming next',
    badge: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    icon: Clock,
    iconColor: 'text-blue-500',
    items: [
      { label: 'Collections', desc: 'Group notes and inbox items into named collections' },
      { label: 'Contacts', desc: 'Store and search contacts with Google Contacts import' },
      { label: 'Public sharing', desc: 'Share notes and lists via protected or public links' },
    ],
  },
  {
    phase: 'Future',
    badge: 'bg-muted text-muted-foreground border-border',
    icon: Layers,
    iconColor: 'text-muted-foreground',
    items: [
      { label: 'File uploads', desc: 'Attach files, PDFs, and images to notes' },
      { label: 'Voice notes', desc: 'Record and transcribe voice memos' },
      { label: 'Mobile app', desc: 'Native iOS and Android app with offline sync' },
      { label: 'Offline sync', desc: 'Work offline on mobile, sync when connected' },
      { label: 'Premium plans', desc: 'Expanded storage and advanced features' },
    ],
  },
];

export function RoadmapSection() {
  return (
    <section id="roadmap" className="py-24 px-6 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeInUp} className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            What is coming next
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            These features are planned — not available yet. The current product is fully functional without them.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
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

              <div className="space-y-4">
                {items.map(({ label, desc }) => (
                  <div key={label} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-[7px] shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
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
          Roadmap is subject to change. Features are planned based on user needs.
        </motion.p>
      </div>
    </section>
  );
}
