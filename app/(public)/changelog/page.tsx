'use client';

import { motion } from 'framer-motion';
import { GitCommit, Clock, CheckCircle2, Zap, Wrench, Shield, Megaphone, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { usePublishedChangelogs } from '@/hooks/queries/use-changelog';
import type { ChangelogType, ChangelogChange } from '@/types';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const TYPE_CONFIG: Record<ChangelogType, { label: string; badgeClass: string; Icon: React.ElementType }> = {
  feature:      { label: 'New',          badgeClass: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',     Icon: Zap },
  improvement:  { label: 'Improved',     badgeClass: 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400', Icon: CheckCircle2 },
  fix:          { label: 'Fix',          badgeClass: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400',         Icon: Wrench },
  security:     { label: 'Security',     badgeClass: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400', Icon: Shield },
  announcement: { label: 'Announcement', badgeClass: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400', Icon: Megaphone },
};

function ChangeBadge({ change }: { change: ChangelogChange }) {
  const cfg = TYPE_CONFIG[change.tag] ?? TYPE_CONFIG.feature;
  return (
    <div className="flex items-start gap-2.5">
      <span className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 mt-0.5 ${cfg.badgeClass}`}>
        {cfg.label}
      </span>
      <span className="text-sm text-muted-foreground leading-relaxed">{change.text}</span>
    </div>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function ChangelogPage() {
  const { data: releases = [], isLoading } = usePublishedChangelogs();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              variants={fadeUp}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg"
            >
              <GitCommit size={24} className="text-white" />
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight">
              Changelog
            </motion.h1>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-xl leading-relaxed">
              Every feature, improvement, and fix — documented. See exactly what changed and when.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Releases */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-muted-foreground" />
            </div>
          ) : releases.length === 0 ? (
            <div className="text-center py-20">
              <Clock size={28} className="text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No releases published yet. Check back soon.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-2 bottom-2 w-px bg-border hidden sm:block" />

              <div className="flex flex-col gap-10">
                {releases.map((release, idx) => (
                  <motion.div
                    key={release.id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                    variants={stagger}
                    className="sm:pl-14 relative"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-3.5 top-2 w-3 h-3 rounded-full bg-blue-600 border-2 border-background hidden sm:block" />

                    {/* Card */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <motion.div variants={fadeUp} className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg font-bold font-mono text-foreground">{release.version}</span>
                            {idx === 0 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white font-medium">Latest</span>
                            )}
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize ${TYPE_CONFIG[release.type]?.badgeClass}`}>
                              {release.type}
                            </span>
                          </div>
                          <h2 className="text-base font-semibold text-foreground mt-1">{release.title}</h2>
                        </div>
                        {release.deployed_at && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 flex items-center gap-1">
                            <Clock size={11} /> {formatDate(release.deployed_at)}
                          </span>
                        )}
                      </motion.div>

                      {release.description && (
                        <motion.p variants={fadeUp} className="text-sm text-muted-foreground leading-relaxed mb-4">
                          {release.description}
                        </motion.p>
                      )}

                      {release.changes.length > 0 && (
                        <motion.div variants={fadeUp} className="flex flex-col gap-2 pt-4 border-t border-border">
                          {release.changes.map((change, i) => (
                            <ChangeBadge key={i} change={change} />
                          ))}
                        </motion.div>
                      )}

                      {release.commit_sha && (
                        <motion.p variants={fadeUp} className="text-xs text-muted-foreground/50 mt-4 font-mono">
                          {release.commit_sha.slice(0, 7)}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
            className="mt-16 p-6 rounded-2xl border border-border bg-card text-center"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Have a suggestion or found a bug? Let us know.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Send Feedback
              </Link>
              <Link
                href="/roadmap"
                className="px-5 py-2.5 border border-border hover:bg-muted text-foreground rounded-xl text-sm font-medium transition-colors"
              >
                View Roadmap
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
