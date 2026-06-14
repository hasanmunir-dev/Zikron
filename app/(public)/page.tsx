"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Inbox,
  MessageSquare,
  Search,
  Cloud,
  Shield,
  Table2,
  CheckCircle2,
  Lock,
  LayoutDashboard,
  Link2,
  Star,
  Archive,
  Sun,
  Bold,
  Code,
  Heading2,
  List,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

// ── Shared animation variants ────────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as const },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

const slideInLeft = {
  initial: { opacity: 0, x: -32 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as const },
};

const slideInRight = {
  initial: { opacity: 0, x: 32 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as const },
};

// ── Component ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Nav ── */}
      <motion.nav
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">Zikron</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Get started free
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-sm font-medium px-3 py-1 rounded-full mb-6 border border-blue-100 dark:border-blue-900"
        >
          <Cloud size={14} />
          Cloud-first personal knowledge hub
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-5xl sm:text-6xl font-bold leading-tight mb-6"
        >
          One place for everything{" "}
          <span className="text-blue-600">you want to remember</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            delay: 0.35,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="text-xl text-muted-foreground leading-relaxed mb-4 max-w-2xl mx-auto"
        >
          Zikron brings your inbox, notes, self-messages, and structured lists
          into one private cloud workspace — available instantly in any browser.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="text-sm text-muted-foreground mb-10"
        >
          Sign up with email or Google. No credit card required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-7 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-base w-full sm:w-auto justify-center"
          >
            Start for free <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="text-muted-foreground px-7 py-3 rounded-lg border border-border hover:bg-muted transition-colors font-medium text-base w-full sm:w-auto text-center"
          >
            Sign in
          </Link>
        </motion.div>
      </section>

      {/* ── Problem ── */}
      <section className="bg-muted/40 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h2 {...fadeUp} className="text-3xl font-bold mb-4">
            Your information is everywhere — and nowhere
          </motion.h2>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto"
          >
            Links saved in WhatsApp, notes in a phone app, ideas in email
            drafts. When you need it, you can never find it.
          </motion.p>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left"
          >
            {[
              {
                title: "Too many tools",
                body: "Notes app, bookmarks, messaging, todos — each thing lives somewhere different.",
              },
              {
                title: "No single search",
                body: "You saved it somewhere. But which app? Which device? You can't search across all of them.",
              },
              {
                title: "Device-locked data",
                body: "Captured on your phone, needed on your laptop. Nothing follows you everywhere.",
              },
            ].map(({ title, body }) => (
              <motion.div
                key={title}
                variants={staggerItem}
                className="bg-card border border-border rounded-xl p-5"
              >
                <p className="font-semibold mb-1">{title}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Modules ── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">
              Six modules. One workspace.
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to capture, organize, and find your
              information.
            </p>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {[
              {
                icon: LayoutDashboard,
                title: "Dashboard",
                desc: "See your totals at a glance — notes, inbox items, messages, lists. Quick-capture buttons for every module. Recent activity in one view.",
              },
              {
                icon: Inbox,
                title: "Inbox",
                desc: "Drop links, text, or thoughts in seconds. Auto-detects link vs text. Tabs for All, Favorites, and Archived. Add Markdown notes to any item.",
              },
              {
                icon: BookOpen,
                title: "Notes",
                desc: "Full Markdown notes with title, tags, and categories. Favorite and archive. Opens in a URL-driven modal — browser back closes it.",
              },
              {
                icon: MessageSquare,
                title: "Self Chat",
                desc: "Send messages to yourself like WhatsApp Saved Messages. Markdown supported. Favorite and delete. Scrollable chat history.",
              },
              {
                icon: Table2,
                title: "Lists",
                desc: "Build custom tables with any columns and rows. Inline editing, Markdown descriptions, tabs for All/Favorites/Archived.",
              },
              {
                icon: Search,
                title: "Global Search",
                desc: "One search across all modules. Results show the source — note, inbox item, message, or list — with direct navigation.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={staggerItem}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="flex flex-col gap-3 bg-card border border-border rounded-xl p-6 hover:border-blue-200 dark:hover:border-blue-800 transition-colors cursor-default"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/60 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon
                    size={20}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div>
                  <p className="font-semibold mb-1">{title}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Inbox deep-dive ── */}
      <section className="bg-muted/40 py-20">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-start gap-12">
          <motion.div {...slideInLeft} className="flex-1">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-sm font-medium px-3 py-1 rounded-full mb-4 border border-blue-100 dark:border-blue-900">
              <Inbox size={14} /> Universal Inbox
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Capture first. Organize later.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              The Inbox is your frictionless capture layer. Paste a link, write
              a thought, add context in Markdown — in seconds. Come back to
              triage when you have time.
            </p>
            <motion.ul
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="space-y-2"
            >
              {[
                "Auto-detects links vs plain text",
                "Add Markdown notes to any item",
                "Tabs: All · Favorites · Archived",
                "Full dialog with edit, favorite, archive, delete",
                "URL-driven: share or bookmark any item directly",
              ].map((item) => (
                <motion.li
                  key={item}
                  variants={staggerItem}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2
                    size={15}
                    className="text-blue-600 flex-shrink-0"
                  />
                  {item}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div {...slideInRight} className="flex-1 space-y-3">
            {[
              {
                type: "link",
                title: "Next.js 15 release notes",
                url: "nextjs.org/blog/next-15",
                status: "inbox",
              },
              {
                type: "text",
                title: "Remember to review the auth middleware",
                url: null,
                status: "favorite",
              },
              {
                type: "link",
                title: "shadcn/ui v2 changelog",
                url: "ui.shadcn.com/changelog",
                status: "inbox",
              },
            ].map(({ type, title, url, status }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: 32 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.45,
                  delay: i * 0.1,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className="bg-card border border-border rounded-xl p-4 flex items-start gap-3"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-lg flex items-center justify-center mt-0.5">
                  {type === "link" ? (
                    <Link2 size={14} className="text-blue-500" />
                  ) : (
                    <MessageSquare
                      size={14}
                      className="text-muted-foreground"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{title}</p>
                  {url && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {url}
                    </p>
                  )}
                </div>
                {status === "favorite" && (
                  <Star
                    size={14}
                    className="text-amber-400 fill-amber-400 flex-shrink-0 mt-1"
                  />
                )}
                {status === "archived" && (
                  <Archive
                    size={14}
                    className="text-muted-foreground flex-shrink-0 mt-1"
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Lists ── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <motion.div {...slideInLeft} className="flex-1">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-sm font-medium px-3 py-1 rounded-full mb-4 border border-blue-100 dark:border-blue-900">
              <Table2 size={14} /> Dynamic Lists
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Structured data, your way
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Not everything fits in a paragraph. Lists let you build custom
              tables — define the columns, add rows, and edit cells inline.
            </p>
            <motion.ul
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="space-y-2"
            >
              {[
                "Define any number of columns with custom names",
                "Add rows and edit cells inline",
                "Rename or delete columns at any time",
                "Markdown support in description and cells",
                "Favorite, archive, and search lists",
              ].map((item) => (
                <motion.li
                  key={item}
                  variants={staggerItem}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2
                    size={15}
                    className="text-blue-600 flex-shrink-0"
                  />
                  {item}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            {...slideInRight}
            className="flex-1 rounded-2xl border border-border bg-card p-5 overflow-auto"
          >
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              Git Commands
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Command", "Description"].map((h) => (
                    <th
                      key={h}
                      className="text-left py-2 pr-4 font-medium text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["git stash", "Save uncommitted changes temporarily"],
                  ["git rebase -i", "Interactively rewrite commit history"],
                  ["git bisect", "Binary search to find a bad commit"],
                  ["git reflog", "View history of HEAD movements"],
                ].map(([cmd, desc], i) => (
                  <motion.tr
                    key={cmd}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="border-b border-border/60"
                  >
                    <td className="py-2 pr-4 font-mono text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {cmd}
                    </td>
                    <td className="py-2 text-muted-foreground text-xs">
                      {desc}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ── Markdown ── */}
      <section className="bg-muted/40 py-20">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row-reverse items-start gap-12">
          <motion.div {...slideInRight} className="flex-1">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-sm font-medium px-3 py-1 rounded-full mb-4 border border-blue-100 dark:border-blue-900">
              <BookOpen size={14} /> Markdown everywhere
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Write in Markdown. Read it rendered.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Every content field in Zikron supports full Markdown with a Write
              / Preview toggle and a floating format toolbar.
            </p>
            <motion.ul
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="space-y-2 mb-6"
            >
              {[
                "Write / Preview tabs on every editor",
                "Floating toolbar: bold, italic, code, heading, lists",
                "Syntax-highlighted code blocks",
                "GFM: tables, checklists, strikethrough",
                "Secure HTML sanitization on render",
              ].map((item) => (
                <motion.li
                  key={item}
                  variants={staggerItem}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2
                    size={15}
                    className="text-blue-600 flex-shrink-0"
                  />
                  {item}
                </motion.li>
              ))}
            </motion.ul>
            <p className="text-xs text-muted-foreground">
              Applies to: Notes · Inbox · Self Chat · Lists
            </p>
          </motion.div>

          <motion.div {...slideInLeft} className="flex-1 space-y-3">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex gap-1 px-3 py-2 border-b border-border bg-muted/60">
                <span className="text-xs font-medium text-foreground bg-card border border-border px-2.5 py-1 rounded">
                  Write
                </span>
                <span className="text-xs font-medium text-muted-foreground px-2.5 py-1">
                  Preview
                </span>
              </div>
              {/* Animated toolbar buttons */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="flex items-center gap-1 px-3 py-1.5 border-b border-border/60 bg-muted/30"
              >
                {[Bold, Heading2, Code, List].map((Icon, i) => (
                  <motion.button
                    key={i}
                    variants={staggerItem}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-1.5 rounded hover:bg-muted transition-colors"
                  >
                    <Icon size={13} className="text-muted-foreground" />
                  </motion.button>
                ))}
              </motion.div>
              <pre className="p-4 text-xs font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap">{`## Setup notes

Run the dev server:

\`\`\`bash
npm run dev
\`\`\`

- [x] Install dependencies
- [ ] Configure env vars
- [ ] Run migrations`}</pre>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── UX Details ── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h2 {...fadeUp} className="text-3xl font-bold mb-4">
            Small details that matter
          </motion.h2>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-xl mx-auto mb-12"
          >
            Zikron is built to feel fast and stay out of your way.
          </motion.p>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-left"
          >
            {[
              {
                icon: ArrowRight,
                title: "URL-driven dialogs",
                body: "Every dialog has its own URL. Browser back closes it. Refresh keeps it open. Deep-link directly to any note or inbox item.",
              },
              {
                icon: Search,
                title: "Zero-latency open",
                body: "When you click a note or inbox item, it opens instantly from cache while the latest version loads in the background.",
              },
              {
                icon: Sun,
                title: "Light · Dark · System",
                body: "Full light and dark theme support across every page — public, app, and admin. Follows system preference by default.",
              },
              {
                icon: Star,
                title: "Favorites everywhere",
                body: "Star notes, inbox items, messages, and lists. Each module has a Favorites tab for quick access.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <motion.div
                key={title}
                variants={staggerItem}
                className="flex flex-col gap-3"
              >
                <div className="w-9 h-9 bg-blue-100 dark:bg-blue-950/60 rounded-lg flex items-center justify-center">
                  <Icon
                    size={16}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Admin ── */}
      <section className="bg-muted/40 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            {...fadeUp}
            className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-sm font-medium px-3 py-1 rounded-full mb-4 border border-blue-100 dark:border-blue-900"
          >
            <Lock size={14} /> Admin panel
          </motion.div>
          <motion.h2
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
            className="text-3xl font-bold mb-4"
          >
            Full platform visibility
          </motion.h2>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10"
          >
            A dedicated admin panel separate from the user app. Admins get read
            access to all user data — with row-level security enforced at the
            database level.
          </motion.p>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5"
          >
            {[
              {
                title: "User management",
                body: "View all users, enable or disable accounts instantly.",
              },
              {
                title: "Content overview",
                body: "Browse all notes, inbox items, messages, and lists across every user.",
              },
              {
                title: "Stats dashboard",
                body: "Platform-wide counts: users, notes, inbox, messages, lists, rows.",
              },
              {
                title: "Supabase RLS",
                body: "Admin access is granted explicitly via role. Never implicit. Enforced at DB level.",
              },
            ].map(({ title, body }) => (
              <motion.div
                key={title}
                variants={staggerItem}
                className="bg-card border border-border rounded-xl p-5 text-left"
              >
                <p className="font-semibold text-sm mb-1">{title}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h2 {...fadeUp} className="text-3xl font-bold mb-4">
            What&apos;s coming next
          </motion.h2>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-xl mx-auto mb-10"
          >
            Phase 1 is live. These features are planned for upcoming phases.
          </motion.p>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-2xl mx-auto"
          >
            {[
              { label: "Reminders with due dates", badge: "Phase 2" },
              {
                label: "Collections (groups of notes/items)",
                badge: "Phase 2",
              },
              { label: "Mobile app (React Native)", badge: "Phase 2" },
              { label: "File attachments", badge: "Phase 3" },
              { label: "Voice notes", badge: "Phase 3" },
              { label: "WhatsApp integration", badge: "Phase 3" },
            ].map(({ label, badge }) => (
              <motion.div
                key={label}
                variants={staggerItem}
                whileHover={{ x: 4, transition: { duration: 0.15 } }}
                className="flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3 cursor-default"
              >
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="text-3xl font-bold text-white mb-4"
          >
            Ready to stop losing things?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-blue-100 text-lg mb-8"
          >
            Sign up with email or Google. Free to use. Your data secured with
            Supabase row-level security.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-base"
            >
              Get started free <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 border border-blue-300 text-white px-8 py-3 rounded-lg hover:bg-blue-500 transition-colors font-medium text-base"
            >
              Sign in
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">Zikron</span> — Your
        personal knowledge hub &nbsp;·&nbsp; Built with Next.js + Supabase
      </footer>
    </div>
  );
}
