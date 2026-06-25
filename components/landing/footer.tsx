import Link from 'next/link';
import { Layers } from 'lucide-react';

const productLinks = [
  { href: '/about', label: 'About' },
  { href: '/creator', label: 'Creator' },
  { href: '/story', label: 'Story' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/changelog', label: 'Changelog' },
];

const legalLinks = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
];

const accountLinks = [
  { href: '/contact', label: 'Contact' },
  { href: '/login', label: 'Sign in' },
  { href: '/signup', label: 'Sign up' },
];

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="flex flex-col gap-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <Layers size={13} className="text-white" />
              </div>
              <span className="text-sm font-bold text-foreground">Zikron</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[180px]">
              Personal knowledge and memory system.
            </p>
          </div>

          {/* Product */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Product</p>
            <div className="flex flex-col gap-2">
              {productLinks.map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Legal</p>
            <div className="flex flex-col gap-2">
              {legalLinks.map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Account</p>
            <div className="flex flex-col gap-2">
              {accountLinks.map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground/50">
            © {new Date().getFullYear()} Zikron. Built with Next.js · Supabase · Tailwind CSS.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/hasanmunir-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/hasanmunir-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://hasanmunir.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Portfolio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
