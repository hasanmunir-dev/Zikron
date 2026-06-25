'use client';

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const sections = [
  {
    title: '1. What Data We Collect',
    content: [
      {
        subtitle: 'Account Information',
        text: 'When you sign up, we collect your email address and any profile information you provide (such as your name). If you sign in with Google, we receive your Google account email and display name.',
      },
      {
        subtitle: 'Content You Create',
        text: 'All content you create in Zikron — notes, inbox items, lists, self-chat messages, and reminders — is stored in our database. This data belongs to you.',
      },
      {
        subtitle: 'Usage Data',
        text: 'We may collect basic usage information such as the features you use and the frequency of use, to improve the product.',
      },
      {
        subtitle: 'Push Notification Subscriptions',
        text: 'If you enable browser push notifications for reminders, we store your push subscription endpoint. This is used only to send you reminder notifications.',
      },
    ],
  },
  {
    title: '2. Why We Store Your Data',
    content: [
      {
        subtitle: 'To provide the service',
        text: 'Your content is stored so you can access, search, and manage it from anywhere.',
      },
      {
        subtitle: 'To authenticate you',
        text: 'Your account credentials are used to verify your identity and protect your data from unauthorized access.',
      },
      {
        subtitle: 'To send reminders',
        text: 'Push notification subscriptions are used exclusively to deliver reminder notifications you have set up.',
      },
    ],
  },
  {
    title: '3. How Your Data Is Protected',
    content: [
      {
        subtitle: 'Row-Level Security (RLS)',
        text: 'Every piece of data in the database is protected by Row-Level Security policies. This means your data can only be accessed by you — even at the database level.',
      },
      {
        subtitle: 'Authentication',
        text: 'All requests to the backend are authenticated using Supabase JWT tokens. Unauthenticated requests are rejected.',
      },
      {
        subtitle: 'Encrypted at rest and in transit',
        text: 'Your data is encrypted at rest by Supabase PostgreSQL and in transit via HTTPS/TLS.',
      },
      {
        subtitle: 'No third-party data sharing',
        text: 'We do not sell, rent, or share your personal data with third parties for marketing or advertising purposes.',
      },
    ],
  },
  {
    title: '4. Your Rights',
    content: [
      {
        subtitle: 'Access your data',
        text: 'You can view all your content inside the Zikron app at any time.',
      },
      {
        subtitle: 'Delete your data',
        text: 'You can delete any note, inbox item, list, message, or reminder at any time. To delete your entire account and all associated data, contact us at hasanmunir406@gmail.com.',
      },
      {
        subtitle: 'Export your data',
        text: 'Account data export is on the roadmap. Until then, contact us and we will provide your data in a readable format.',
      },
    ],
  },
  {
    title: '5. Cookies and Local Storage',
    content: [
      {
        subtitle: 'Authentication cookies',
        text: 'Supabase uses HTTP-only cookies to maintain your authenticated session securely.',
      },
      {
        subtitle: 'Theme preference',
        text: 'Your light/dark/system theme preference is stored in localStorage on your device.',
      },
    ],
  },
  {
    title: '6. Changes to This Policy',
    content: [
      {
        subtitle: 'Updates',
        text: 'If this Privacy Policy changes materially, we will update this page and note the date of the last change. Continued use of Zikron after a change constitutes acceptance of the updated policy.',
      },
    ],
  },
  {
    title: '7. Contact',
    content: [
      {
        subtitle: 'Questions about privacy',
        text: 'If you have any questions about this Privacy Policy or how your data is handled, contact us at hasanmunir406@gmail.com.',
      },
    ],
  },
];

export default function PrivacyPage() {
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
              <Shield size={24} className="text-white" />
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight">
              Privacy Policy
            </motion.h1>
            <motion.p variants={fadeUp} className="text-muted-foreground text-sm">
              Last updated: June 2025
            </motion.p>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-xl leading-relaxed">
              Zikron is built on the principle that your data is yours. This policy explains what we
              collect, why, and how we protect it.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={stagger}
              className="flex flex-col gap-5"
            >
              <motion.h2 variants={fadeUp} className="text-lg md:text-xl font-bold border-b border-border pb-3">
                {section.title}
              </motion.h2>
              {section.content.map(({ subtitle, text }) => (
                <motion.div key={subtitle} variants={fadeUp} className="flex flex-col gap-1.5">
                  <p className="text-sm font-semibold text-foreground">{subtitle}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </motion.div>
              ))}
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
