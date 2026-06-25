'use client';

import { motion } from 'framer-motion';
import { Layers, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const chapters = [
  {
    tag: 'How It Started',
    heading: 'WhatsApp as a memory system',
    body: `Like many people, I used WhatsApp Saved Messages as a personal storage system.
Whenever I found a useful link, a code snippet, a command, a note, or an idea — I sent it to myself.
At first it worked. Later it became a mess.`,
    items: ['A useful link', 'A code snippet', 'A command', 'A note', 'An idea'],
  },
  {
    tag: 'The Real Problem',
    heading: 'Finding it again',
    body: `The issue was not saving information. The issue was finding it again.
Information was scattered everywhere. The more information I saved, the harder it became to retrieve.`,
    items: null,
  },
  {
    tag: 'The First Idea',
    heading: 'One system for everything',
    body: `Instead of saving things in multiple apps, why not have one system dedicated to personal knowledge?
A place where everything important could live together.
That idea eventually became Zikron.`,
    items: null,
  },
  {
    tag: 'Today',
    heading: 'A complete memory system',
    body: `Zikron is evolving into a complete personal knowledge and memory system.`,
    items: ['Capture information', 'Organize it', 'Search it', 'Remember it'],
  },
  {
    tag: 'Future',
    heading: 'The goal is simple',
    body: `Become the place where people keep everything important. Not another notes app. A complete memory system.`,
    items: null,
  },
];

export default function StoryPage() {
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
            <motion.div
              variants={fadeUp}
              className="px-3 py-1.5 rounded-full border border-border bg-muted text-xs font-medium text-muted-foreground"
            >
              The story behind Zikron
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight">
              How It Started
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Every product starts with a problem. This is the story of mine.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Story chapters */}
      <section className="pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border hidden sm:block" />

            <div className="flex flex-col gap-12">
              {chapters.map((chapter, i) => (
                <motion.div
                  key={chapter.tag}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-80px' }}
                  variants={stagger}
                  className="sm:pl-16 relative"
                >
                  {/* Timeline dot */}
                  <div className="hidden sm:flex absolute left-0 top-1 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 items-center justify-center shadow-sm">
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>

                  <motion.div variants={fadeUp} className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      {chapter.tag}
                    </span>
                  </motion.div>

                  <motion.h2 variants={fadeUp} className="text-xl md:text-2xl font-bold mb-3">
                    {chapter.heading}
                  </motion.h2>

                  <motion.div variants={fadeUp} className="flex flex-col gap-3">
                    {chapter.body.split('\n').filter(Boolean).map((line, j) => (
                      <p key={j} className="text-muted-foreground leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </motion.div>

                  {chapter.items && (
                    <motion.div variants={fadeUp} className="mt-4">
                      <ul className="flex flex-col gap-2">
                        {chapter.items.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
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
            <motion.div variants={fadeUp} className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
              <Layers size={22} className="text-white" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold">
              Be part of the story
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground">
              Zikron is free to use. Start capturing your knowledge today.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                Get started free <ArrowRight size={14} />
              </Link>
              <Link
                href="/creator"
                className="px-6 py-2.5 border border-border hover:bg-muted text-foreground rounded-xl text-sm font-medium transition-colors"
              >
                Meet the creator
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
