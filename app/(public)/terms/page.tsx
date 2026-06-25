'use client';

import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import Link from 'next/link';
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

type SectionItem = {
  text: string;
  subtitle?: string;
};

type Section = {
  title: string;
  content: SectionItem[];
};

const sections: Section[] = [
  {
    title: '1. Acceptance of Terms',
    content: [
      {
        text: 'By creating an account or using Zikron, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the service.',
      },
    ],
  },
  {
    title: '2. Description of Service',
    content: [
      {
        text: 'Zikron is a personal knowledge and memory management application. It allows you to capture, organize, search, and manage notes, inbox items, lists, self-chat messages, and reminders. The service is provided as-is during its current development phase.',
      },
    ],
  },
  {
    title: '3. Your Account',
    content: [
      {
        subtitle: 'Account creation',
        text: 'You must provide a valid email address to create an account. You are responsible for keeping your login credentials secure.',
      },
      {
        subtitle: 'One account per person',
        text: 'Each account is for a single individual. You may not share your account or create accounts on behalf of others without their consent.',
      },
      {
        subtitle: 'Account termination',
        text: 'We reserve the right to suspend or terminate accounts that violate these terms, engage in abuse of the service, or use the service for unlawful purposes.',
      },
    ],
  },
  {
    title: '4. Your Content',
    content: [
      {
        subtitle: 'Ownership',
        text: 'You own all content you create in Zikron. Notes, lists, messages, and reminders belong to you.',
      },
      {
        subtitle: 'License to us',
        text: 'By using the service, you grant us a limited, non-exclusive license to store and display your content solely for the purpose of providing the service to you.',
      },
      {
        subtitle: 'Prohibited content',
        text: 'You may not store or share content that is illegal, violates the rights of others, or is harmful, abusive, or fraudulent.',
      },
    ],
  },
  {
    title: '5. Acceptable Use',
    content: [
      {
        text: 'You agree not to: attempt to gain unauthorized access to the service or other users\' data; use the service to distribute malware or spam; reverse engineer or attempt to extract the source code; use the service in any way that could damage or impair its operation.',
      },
    ],
  },
  {
    title: '6. Service Availability',
    content: [
      {
        text: 'Zikron is provided on an "as available" basis. We do not guarantee uninterrupted access or uptime. We may perform maintenance, updates, or changes to the service at any time.',
      },
    ],
  },
  {
    title: '7. Disclaimer of Warranties',
    content: [
      {
        text: 'Zikron is provided "as is" without warranties of any kind, express or implied. We do not warrant that the service will be error-free, secure, or meet your specific requirements.',
      },
    ],
  },
  {
    title: '8. Limitation of Liability',
    content: [
      {
        text: 'To the maximum extent permitted by law, Zikron and its creator shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service, including loss of data.',
      },
    ],
  },
  {
    title: '9. Privacy',
    content: [
      {
        text: 'Your use of Zikron is also governed by our Privacy Policy, which is incorporated into these terms by reference.',
      },
    ],
  },
  {
    title: '10. Changes to Terms',
    content: [
      {
        text: 'We may update these Terms of Service from time to time. If we make material changes, we will update this page with the new date. Continued use of the service after changes are posted constitutes your acceptance of the new terms.',
      },
    ],
  },
  {
    title: '11. Contact',
    content: [
      {
        text: 'For questions about these terms, contact us at hasanmunir406@gmail.com.',
      },
    ],
  },
];

export default function TermsPage() {
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
              <FileText size={24} className="text-white" />
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight">
              Terms of Service
            </motion.h1>
            <motion.p variants={fadeUp} className="text-muted-foreground text-sm">
              Last updated: June 2025
            </motion.p>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-xl leading-relaxed">
              These terms govern your use of Zikron. Please read them carefully before using the
              service.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">
          {sections.map((section) => (
            <motion.div
              key={section.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={stagger}
              className="flex flex-col gap-4"
            >
              <motion.h2 variants={fadeUp} className="text-lg md:text-xl font-bold border-b border-border pb-3">
                {section.title}
              </motion.h2>
              {section.content.map(({ subtitle, text }, i) => (
                <motion.div key={i} variants={fadeUp} className="flex flex-col gap-1.5">
                  {subtitle && <p className="text-sm font-semibold text-foreground">{subtitle}</p>}
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </motion.div>
              ))}
            </motion.div>
          ))}

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
            className="p-4 rounded-xl border border-border bg-muted text-sm text-muted-foreground"
          >
            By using Zikron you also agree to our{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline font-medium">
              Privacy Policy
            </Link>
            .
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
