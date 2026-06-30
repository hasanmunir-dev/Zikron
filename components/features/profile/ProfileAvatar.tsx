'use client';

import Image from 'next/image';
import { User } from 'lucide-react';

interface ProfileAvatarProps {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
}

const SIZE_MAP = {
  xs: { container: 'w-6 h-6',   text: 'text-[10px]', icon: 10 },
  sm: { container: 'w-8 h-8',   text: 'text-xs',     icon: 12 },
  md: { container: 'w-10 h-10', text: 'text-sm',     icon: 16 },
  lg: { container: 'w-14 h-14', text: 'text-lg',     icon: 22 },
  xl: { container: 'w-24 h-24', text: 'text-3xl',    icon: 36 },
};

function getInitials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return 'Z';
}

export function ProfileAvatar({
  name,
  email,
  avatarUrl,
  size = 'sm',
  className = '',
  onClick,
  clickable = false,
}: ProfileAvatarProps) {
  const { container, text, icon } = SIZE_MAP[size];
  const initials = getInitials(name, email);
  const isClickable = clickable || !!onClick;

  const base = `relative shrink-0 rounded-full overflow-hidden flex items-center justify-center ${container} ${
    isClickable ? 'cursor-pointer ring-2 ring-transparent hover:ring-primary/60 transition-all duration-150' : ''
  } ${className}`;

  if (avatarUrl) {
    return (
      <div className={base} onClick={onClick} role={isClickable ? 'button' : undefined} tabIndex={isClickable ? 0 : undefined}
        onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); } : undefined}
        aria-label={isClickable ? 'View profile picture' : undefined}>
        <Image
          src={avatarUrl}
          alt={name ?? email ?? 'Profile picture'}
          fill
          sizes={size === 'xl' ? '96px' : size === 'lg' ? '56px' : '40px'}
          className="object-cover"
          unoptimized={avatarUrl.startsWith('http') && !avatarUrl.includes('supabase')}
        />
      </div>
    );
  }

  return (
    <div
      className={`${base} bg-primary text-primary-foreground font-semibold select-none`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); } : undefined}
      aria-label={isClickable ? 'View profile picture' : undefined}
    >
      {initials === 'Z' && !name && !email
        ? <User size={icon} strokeWidth={2} />
        : <span className={text}>{initials}</span>
      }
    </div>
  );
}
