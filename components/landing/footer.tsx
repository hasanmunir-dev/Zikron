import Link from 'next/link';
import { Layers } from 'lucide-react';

const footerLinks = [
  { href: '#features', label: 'Features' },
  { href: '#markdown', label: 'Markdown' },
  { href: '#lists', label: 'Lists' },
  { href: '#roadmap', label: 'Roadmap' },
  { href: '/login', label: 'Sign in' },
  { href: '/signup', label: 'Sign up' },
];

export function Footer() {
  return (
    <footer className="border-t border-border py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Layers size={13} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground">Zikron</span>
              <p className="text-xs text-muted-foreground">Personal knowledge and memory system.</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {footerLinks.map(({ href, label }) => (
              href.startsWith('#') ? (
                <a
                  key={label}
                  href={href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={label}
                  href={href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              )
            ))}
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-xs text-muted-foreground/50">
            Built with Next.js · Supabase · Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
