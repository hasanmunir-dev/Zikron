"use client";

import { motion } from "framer-motion";
import {
  Code2,
  Globe,
  Layers,
  Mail,
  BookOpen,
  Wrench,
  Layout,
  Brain,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const focusAreas = [
  { icon: Globe, label: "Web Applications" },
  { icon: Brain, label: "Knowledge Management Systems" },
  { icon: Wrench, label: "Developer Tools" },
  { icon: Layout, label: "Productivity Software" },
  { icon: Code2, label: "Full Stack Development" },
];

const philosophy = [
  {
    word: "Simple.",
    desc: "No unnecessary complexity in the interface or experience.",
  },
  {
    word: "Fast.",
    desc: "Every interaction should feel instant and responsive.",
  },
  {
    word: "Useful.",
    desc: "Every feature helps users save, organize, or find information faster.",
  },
];

const connectLinks = [
  {
    icon: Globe,
    label: "Portfolio",
    href: "https://hasanmunir.dev",
    display: "hasanmunir.dev",
  },
  {
    icon: FaLinkedin,
    label: "LinkedIn",
    href: "https://linkedin.com/in/hasanmunir-dev",
    display: "linkedin.com/in/hasanmunir-dev",
  },
  {
    icon: FaGithub,
    label: "GitHub",
    href: "https://github.com/hasanmunir-dev",
    display: "github.com/hasanmunir-dev",
  },
  {
    icon: Mail,
    label: "Email",
    href: "mailto:hasanmunir406@gmail.com",
    display: "hasanmunir406@gmail.com",
  },
];

export default function CreatorPage() {
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
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl"
            >
              <Code2 size={36} className="text-white" />
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-5xl font-bold tracking-tight"
            >
              Meet the Creator
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg text-muted-foreground max-w-xl leading-relaxed"
            >
              Zikron is designed, developed, and maintained by a single creator.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* About Hasan */}
      <section className="py-16 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="flex flex-col gap-8"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                About Hasan Munir
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Muhammad Hasan Munir is a Full Stack Software Engineer and
                Computer Science student. He enjoys building practical software
                that solves real problems.
              </p>
              <p className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
                His work focuses on:
              </p>
              <div className="flex flex-col gap-3">
                {focusAreas.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-blue-600" />
                    </div>
                    <span className="text-sm text-foreground font-medium">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Zikron */}
      <section className="py-16 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="flex flex-col gap-6"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Why Zikron Was Created
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The idea started from a personal problem. Important information
                was being saved across:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                {[
                  "WhatsApp",
                  "Screenshots",
                  "Browser Bookmarks",
                  "Notes",
                  "Google Drive",
                ].map((src) => (
                  <div
                    key={src}
                    className="px-3 py-2.5 rounded-xl bg-muted border border-border text-sm text-muted-foreground font-medium text-center"
                  >
                    {src}
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Zikron was created to solve that problem — one place for
                everything important.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Building Philosophy */}
      <section className="py-16 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="flex flex-col gap-6"
          >
            <motion.h2
              variants={fadeUp}
              className="text-2xl md:text-3xl font-bold"
            >
              Building Philosophy
            </motion.h2>
            <div className="flex flex-col gap-4">
              {philosophy.map(({ word, desc }) => (
                <motion.div
                  key={word}
                  variants={fadeUp}
                  className="p-5 rounded-2xl border border-border bg-card flex items-start gap-4"
                >
                  <span className="text-lg font-bold text-blue-600 shrink-0 mt-0.5">
                    {word}
                  </span>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Connect */}
      <section className="py-16 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="flex flex-col gap-6"
          >
            <motion.h2
              variants={fadeUp}
              className="text-2xl md:text-3xl font-bold"
            >
              Connect
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {connectLinks.map(({ icon: Icon, label, href, display }) => (
                <motion.a
                  key={label}
                  variants={fadeUp}
                  href={href}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:bg-muted transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center shrink-0 group-hover:bg-blue-600/20 transition-colors">
                    <Icon size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground">{display}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="flex flex-col items-center gap-6"
          >
            <motion.h2
              variants={fadeUp}
              className="text-2xl md:text-3xl font-bold"
            >
              Try what was built
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground">
              Zikron is free to use.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="/signup"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                Get started free
              </Link>
              <Link
                href="/contact"
                className="px-6 py-2.5 border border-border hover:bg-muted text-foreground rounded-xl text-sm font-medium transition-colors"
              >
                Get in touch
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
