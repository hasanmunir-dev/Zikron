'use client';

import { motion } from 'framer-motion';
import { Layers, Brain, Search, Archive, MessageSquare, Bell, CheckSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const scatterSources = [
  'WhatsApp Saved Messages',
  'Screenshots',
  'Google Drive',
  'Browser Bookmarks',
  'Notes Apps',
  'Random Documents',
];

const storeItems = [
  { icon: MessageSquare, label: 'Notes' },
  { icon: Archive, label: 'Inbox Captures' },
  { icon: CheckSquare, label: 'Lists' },
  { icon: MessageSquare, label: 'Self Chat Messages' },
  { icon: Bell, label: 'Reminders' },
];

const roadmapItems = [
  'Collections',
  'Contacts',
  'Secure Sharing',
  'File Uploads',
  'PDF Viewing',
  'Voice Notes',
  'Mobile Application',
  'Offline Sync',
  'Premium Features',
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-col items-center gap-6"
          >
            <motion.div variants={fadeUp} className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Layers size={26} className="text-white" />
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight">
              About Zikron
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              A personal knowledge and memory system designed to help people capture, organize,
              search, and remember important information.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="flex flex-col gap-8"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">The Problem</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Most people save important things in different places:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {scatterSources.map((src) => (
                  <div
                    key={src}
                    className="px-4 py-3 rounded-xl bg-muted border border-border text-sm text-muted-foreground font-medium"
                  >
                    {src}
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-col gap-3">
              <p className="text-foreground font-medium">After some time, finding information becomes difficult.</p>
              <p className="text-muted-foreground">Important ideas get lost.</p>
              <p className="text-muted-foreground">Useful resources are forgotten.</p>
              <p className="text-muted-foreground">Knowledge becomes scattered.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-16 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="flex flex-col gap-8"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">The Solution</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Zikron brings everything together into one organized workspace.
              </p>
              <p className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Store:</p>
              <div className="flex flex-col gap-3">
                {storeItems.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-blue-600" />
                    </div>
                    <span className="text-sm text-foreground font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-col gap-2">
              <p className="text-foreground font-medium">Search everything from one place.</p>
              <p className="text-muted-foreground">Organize information in a way that is easy to revisit later.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-16 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="flex flex-col gap-6"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Vision</h2>
              <div className="p-6 rounded-2xl border border-blue-600/20 bg-blue-600/5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Brain size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold text-lg leading-snug">
                      To become the personal operating system for knowledge.
                    </p>
                    <p className="text-muted-foreground mt-2 leading-relaxed">
                      A place where users can capture anything important and always find it when needed.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-16 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="flex flex-col gap-6"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Roadmap</h2>
              <p className="text-muted-foreground mb-6">Upcoming features:</p>
              <div className="flex flex-wrap gap-2">
                {roadmapItems.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 text-sm rounded-full border border-border bg-muted text-muted-foreground font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Link
                href="/roadmap"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                View full roadmap <ArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="flex flex-col items-center gap-6"
          >
            <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold">
              Start capturing your knowledge
            </motion.h2>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                Get started free
              </Link>
              <Link
                href="/story"
                className="px-6 py-2.5 border border-border hover:bg-muted text-foreground rounded-xl text-sm font-medium transition-colors"
              >
                Read the story
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
