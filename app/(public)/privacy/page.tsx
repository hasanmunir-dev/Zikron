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
        text: 'When you sign up, we collect your email address and any profile information you provide (such as your name). If you sign in with Google, we receive your Google account email and display name — solely to create and identify your Zikron account.',
      },
      {
        subtitle: 'Content You Create',
        text: 'All content you create in Zikron — notes, inbox items, lists, self-chat messages, reminders, collections, and contacts — is stored in our database. This data belongs to you.',
      },
      {
        subtitle: 'Google Contacts Data (if you connect Google)',
        text: 'If you choose to connect your Google account for the Contacts import feature, we request read-only access to your Google Contacts (OAuth 2.0 scope: contacts.readonly). We import only the contact fields you have stored in Google: full name, email address(es), phone number(s), employer, job title, and profile photo URL. We do not read any other Google data — not your Gmail, Google Drive, Google Calendar, or any other Google service.',
      },
      {
        subtitle: 'Google OAuth Tokens',
        text: 'To perform the contacts import on your behalf, we store your Google OAuth access token and refresh token. These tokens are encrypted at rest using AES-256-GCM encryption before being written to our database. The encryption key is never stored alongside the tokens. Token values are never logged, never returned to the frontend, and never transmitted to any third party.',
      },
      {
        subtitle: 'Push Notification Subscriptions',
        text: 'If you enable browser push notifications for reminders, we store your push subscription endpoint. This is used only to deliver reminder notifications you have set up.',
      },
      {
        subtitle: 'Usage Data',
        text: 'We may collect basic, anonymised usage information (such as which features are used) to improve the product. We do not track individual behaviour for advertising purposes.',
      },
    ],
  },
  {
    title: '2. Why We Collect Your Data',
    content: [
      {
        subtitle: 'To provide the service',
        text: 'Your content is stored so you can access, search, and manage it from anywhere. Without storing your data we cannot provide Zikron\'s core functionality.',
      },
      {
        subtitle: 'To authenticate you',
        text: 'Your account credentials are used to verify your identity and protect your data from unauthorised access.',
      },
      {
        subtitle: 'To power Google Contacts import',
        text: 'We use your Google Contacts data exclusively to populate the Contacts section of your Zikron account. Imported contacts appear in Zikron\'s people management features (search, tagging, notes, favourites). This data is not used for any other purpose.',
      },
      {
        subtitle: 'To send reminder notifications',
        text: 'Push notification subscriptions are used exclusively to deliver the reminder alerts you have created.',
      },
    ],
  },
  {
    title: '3. Google Contacts — Specific Disclosures',
    content: [
      {
        subtitle: 'Scope requested',
        text: 'Zikron requests the OAuth 2.0 scope contacts.readonly. This grants read-only access to your Google Contacts. Zikron never writes to, modifies, or deletes any data in your Google account.',
      },
      {
        subtitle: 'Purpose limitation',
        text: 'Data obtained through Google Contacts is used solely to display and manage your contacts within Zikron. It is not used to build advertising profiles, is not shared with advertisers or data brokers, and is not combined with data from other sources to infer sensitive attributes.',
      },
      {
        subtitle: 'No sharing with third parties',
        text: 'Your Google Contacts data is never sold, rented, licensed, or shared with any third party. It remains within your Zikron account and is accessible only to you.',
      },
      {
        subtitle: 'No use for advertising',
        text: 'Zikron does not display advertisements. Your Google Contacts data is never used for targeted advertising, retargeting, or any form of behavioural profiling.',
      },
      {
        subtitle: 'Revoking access',
        text: 'You can disconnect your Google account from Zikron at any time from the Contacts page (Disconnect button). When you disconnect, your OAuth tokens are permanently deleted from our database. Previously imported contacts remain in your Zikron account unless you delete them manually. You can also revoke access from your Google Account security settings at myaccount.google.com/permissions.',
      },
    ],
  },
  {
    title: '4. How Long We Keep Your Data',
    content: [
      {
        subtitle: 'Account and content data',
        text: 'Your account and all content you create (notes, contacts, reminders, etc.) is retained for as long as your account is active. If you delete an item, it is permanently removed from our database immediately.',
      },
      {
        subtitle: 'Google OAuth tokens',
        text: 'OAuth tokens are deleted immediately when you disconnect your Google account from Zikron. They are also deleted automatically when you delete your Zikron account.',
      },
      {
        subtitle: 'Push notification subscriptions',
        text: 'Push subscriptions are deleted when you disable notifications or delete your account. Expired subscriptions (reported as gone by the browser push service) are deleted automatically by our server.',
      },
      {
        subtitle: 'Account deletion',
        text: 'When you request account deletion, all your data — including content, contacts, integrations, and OAuth tokens — is permanently deleted within 30 days.',
      },
    ],
  },
  {
    title: '5. How Your Data Is Protected',
    content: [
      {
        subtitle: 'Row-Level Security (RLS)',
        text: 'Every row in our database is protected by Row-Level Security policies. Your data can only be accessed by your own authenticated session — even at the database level.',
      },
      {
        subtitle: 'Encrypted tokens',
        text: 'Google OAuth tokens are encrypted with AES-256-GCM before storage. The plaintext token value is never written to disk.',
      },
      {
        subtitle: 'Encrypted in transit',
        text: 'All communication between your browser, our API, and our database occurs over HTTPS/TLS. No data is transmitted in plaintext.',
      },
      {
        subtitle: 'JWT-authenticated API',
        text: 'Every backend API request is authenticated using a Supabase-signed JWT. Unauthenticated or tampered requests are rejected before reaching any data.',
      },
    ],
  },
  {
    title: '6. Your Rights and Choices',
    content: [
      {
        subtitle: 'Access your data',
        text: 'You can view all your content — including imported contacts — inside the Zikron app at any time.',
      },
      {
        subtitle: 'Delete specific data',
        text: 'You can delete any note, inbox item, list, message, reminder, collection, or contact at any time directly within the app. Deletion is immediate and permanent.',
      },
      {
        subtitle: 'Disconnect Google',
        text: 'You can revoke Zikron\'s access to your Google Contacts at any time by clicking "Disconnect" on the Contacts page. This deletes your stored tokens immediately.',
      },
      {
        subtitle: 'Delete your account',
        text: 'To delete your entire account and all associated data, email us at hasanmunir406@gmail.com. We will permanently remove all your data within 30 days and confirm by email.',
      },
      {
        subtitle: 'Export your data',
        text: 'Account data export is on the roadmap. Until then, contact us and we will provide your data in a machine-readable format on request.',
      },
    ],
  },
  {
    title: '7. Cookies and Local Storage',
    content: [
      {
        subtitle: 'Authentication cookies',
        text: 'Supabase uses HTTP-only cookies to maintain your authenticated session securely. These are strictly necessary for the service to function.',
      },
      {
        subtitle: 'Theme preference',
        text: 'Your light/dark/system theme preference is stored in localStorage on your device. No server is involved.',
      },
    ],
  },
  {
    title: '8. Changes to This Policy',
    content: [
      {
        subtitle: 'Notification of changes',
        text: 'If this Privacy Policy changes materially — particularly regarding how Google user data is handled — we will update this page, change the "Last updated" date, and notify active users by email where required. Continued use of Zikron after a change constitutes acceptance of the updated policy.',
      },
    ],
  },
  {
    title: '9. Contact',
    content: [
      {
        subtitle: 'Privacy questions',
        text: 'If you have any questions about this Privacy Policy, how your data is handled, or want to exercise your data rights, contact us at hasanmunir406@gmail.com. We respond within 5 business days.',
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
              Last updated: June 2026
            </motion.p>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-xl leading-relaxed">
              Zikron is built on the principle that your data is yours. This policy explains what we
              collect, why we collect it, how long we keep it, and how you can delete it — including
              specific disclosures for data accessed via Google OAuth.
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
