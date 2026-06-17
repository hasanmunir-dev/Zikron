'use client';

import { motion } from 'framer-motion';
import { Bookmark, Camera, FolderOpen, HardDrive, MessageSquare, Brain } from 'lucide-react';
import { staggerContainer, staggerItem, fadeInUp } from './motion-variants';

const problems = [
  {
    icon: MessageSquare,
    label: 'WhatsApp Saved Messages',
    body: 'Quick to send yourself, impossible to find later. No search, no structure.',
  },
  {
    icon: Camera,
    label: 'Screenshots',
    body: 'Hundreds of screenshots buried in your gallery. You remember taking it but not where.',
  },
  {
    icon: Bookmark,
    label: 'Browser Bookmarks',
    body: 'Saved to "read later". Never read. Never found again.',
  },
  {
    icon: HardDrive,
    label: 'Notes Apps',
    body: 'Five different apps, each with different notes. None of them talk to each other.',
  },
  {
    icon: FolderOpen,
    label: 'Random Folders',
    body: 'Files scattered across Desktop, Downloads, and Google Drive with no system.',
  },
  {
    icon: Brain,
    label: 'Just Your Memory',
    body: 'Relying on "I\'ll remember this." You won\'t. Nobody does.',
  },
];

export function ProblemSection() {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div {...fadeInUp} className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Your important things are{' '}
            <span className="text-muted-foreground">scattered everywhere.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            You save things quickly because you have to. But finding them later is painful — or impossible.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {problems.map(({ icon: Icon, label, body }) => (
            <motion.div
              key={label}
              variants={staggerItem}
              className="flex gap-4 p-5 rounded-2xl bg-card border border-border hover:border-border/80 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={16} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
