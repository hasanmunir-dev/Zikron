'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function CtaSection() {
  return (
    <section className="py-24 px-6 relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700">
      {/* Decorative overlays — no negative z-index needed; content div comes after in DOM */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-5 leading-tight">
            Stop losing important information.
          </h2>
          <p className="text-blue-100 text-lg sm:text-xl mb-10 leading-relaxed">
            Start building your personal memory system with Zikron.{' '}
            Sign up with email or Google. Free to use.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-8 py-3.5 rounded-xl font-semibold text-base transition-all shadow-lg shadow-black/10 hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
            >
              Create account <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center border-2 border-white/40 hover:border-white/70 text-white px-8 py-3.5 rounded-xl font-medium text-base transition-colors w-full sm:w-auto"
            >
              Sign in
            </Link>
          </div>

          <p className="text-white/50 text-sm mt-7">
            No credit card required. No data sold.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
