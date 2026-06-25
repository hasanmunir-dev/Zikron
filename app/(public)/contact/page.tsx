"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Globe, Send, CheckCircle, Loader2 } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { useSubmitContact } from "@/hooks/queries/use-contact";

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

const contactLinks = [
  {
    icon: Mail,
    label: "Email",
    href: "mailto:hasanmunir406@gmail.com",
    display: "hasanmunir406@gmail.com",
    description: "For questions, feedback, or anything else.",
  },
  {
    icon: FaGithub,
    label: "GitHub",
    href: "https://github.com/hasanmunir-dev",
    display: "github.com/hasanmunir-dev",
    description: "See the code and open issues.",
  },
  {
    icon: FaLinkedin,
    label: "LinkedIn",
    href: "https://linkedin.com/in/hasanmunir-dev",
    display: "linkedin.com/in/hasanmunir-dev",
    description: "Professional profile and updates.",
  },
  {
    icon: Globe,
    label: "Portfolio",
    href: "https://hasanmunir.dev",
    display: "hasanmunir.dev",
    description: "More projects and work.",
  },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const submit = useSubmitContact();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { name, email, subject, message } = form;
    await submit.mutateAsync({ name, email, subject: subject || undefined, message });
    setSent(true);
  }

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
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg"
            >
              <Mail size={24} className="text-white" />
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-5xl font-bold tracking-tight"
            >
              Get in Touch
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg text-muted-foreground max-w-xl leading-relaxed"
            >
              Questions, feedback, bug reports, or just want to say hi — reach
              out any time.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Form */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-col gap-6"
          >
            <motion.h2 variants={fadeUp} className="text-xl font-bold">
              Send a message
            </motion.h2>

            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-green-600/20 bg-green-600/5 text-center"
              >
                <CheckCircle size={40} className="text-green-500" />
                <p className="font-semibold text-foreground">
                  Message sent!
                </p>
                <p className="text-sm text-muted-foreground">
                  Thanks for reaching out. I&apos;ll get back to you soon.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", subject: "", message: "" });
                  }}
                  className="text-sm text-blue-600 hover:underline mt-2"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <motion.form
                variants={fadeUp}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-foreground"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="Your name"
                      className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600/50 transition"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-foreground"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="your@email.com"
                      className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600/50 transition"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="subject"
                    className="text-sm font-medium text-foreground"
                  >
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={form.subject}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, subject: e.target.value }))
                    }
                    placeholder="What is this about?"
                    className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600/50 transition"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="message"
                    className="text-sm font-medium text-foreground"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, message: e.target.value }))
                    }
                    placeholder="Write your message here..."
                    className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600/50 transition resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submit.isPending}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                >
                  {submit.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {submit.isPending ? "Sending..." : "Send Message"}
                </button>
              </motion.form>
            )}
          </motion.div>

          {/* Contact Links */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-col gap-6"
          >
            <motion.h2 variants={fadeUp} className="text-xl font-bold">
              Other ways to reach me
            </motion.h2>
            <div className="flex flex-col gap-3">
              {contactLinks.map(
                ({ icon: Icon, label, href, display, description }) => (
                  <motion.a
                    key={label}
                    variants={fadeUp}
                    href={href}
                    target={href.startsWith("mailto") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 p-4 rounded-2xl border border-border bg-card hover:bg-muted transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center shrink-0 group-hover:bg-blue-600/20 transition-colors mt-0.5">
                      <Icon size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {label}
                      </p>
                      <p className="text-xs text-blue-600 font-medium">
                        {display}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {description}
                      </p>
                    </div>
                  </motion.a>
                ),
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
