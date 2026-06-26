'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { X, Loader2, AlertCircle, Info } from 'lucide-react';
import { api } from '@/lib/api';
import type { PrivateRecipient } from '@/types';

interface LookupResponse {
  exists: boolean;
  user?: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: 'user' | 'admin';
    status: 'active' | 'disabled';
  };
}

interface Props {
  value: PrivateRecipient[];
  onChange: (recipients: PrivateRecipient[]) => void;
  currentUserEmail?: string;
  disabled?: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function initials(fullName: string | null, email: string): string {
  if (fullName) {
    return fullName.split(' ').map(p => p[0] ?? '').join('').slice(0, 2).toUpperCase();
  }
  return (email[0] ?? '?').toUpperCase();
}

export function PrivateRecipientPicker({ value, onChange, currentUserEmail, disabled }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function addEmail(raw: string) {
    const email = raw.trim().toLowerCase();
    setError('');
    setInfoMsg('');

    if (!email) return;

    if (!EMAIL_RE.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (value.some(r => r.email.toLowerCase() === email)) {
      setError('This user is already added.');
      return;
    }

    setLoading(true);
    try {
      const result = await api.get<LookupResponse>(`/api/users/lookup?email=${encodeURIComponent(email)}`);

      if (!result.exists || !result.user) {
        setError('No Zikron user found with this email.');
        return;
      }

      if (result.user.status === 'disabled') {
        setError('This user exists, but their account is disabled.');
        return;
      }

      onChange([...value, {
        userId: result.user.id,
        email: result.user.email,
        fullName: result.user.full_name,
        avatarUrl: result.user.avatar_url,
        role: result.user.role,
        status: result.user.status,
      }]);

      setInput('');

      if (currentUserEmail?.toLowerCase() === email) {
        setInfoMsg('This is your own account.');
      }
    } catch {
      setError('Failed to look up this email. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail(input);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
      setError('');
      setInfoMsg('');
    }
  }

  function remove(userId: string) {
    onChange(value.filter(r => r.userId !== userId));
  }

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1">Recipients</p>
      <p className="text-[11px] text-muted-foreground/80 mb-2 leading-relaxed">
        Private links can only be opened by selected Zikron users after signing in.
      </p>

      {/* Input area with chips */}
      <div
        className="min-h-[42px] w-full rounded-lg border border-border bg-background px-2 py-1.5 flex flex-wrap gap-1.5 cursor-text focus-within:ring-2 focus-within:ring-primary/30 transition-shadow"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map(r => (
          <div
            key={r.userId}
            className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium rounded-full pl-1 pr-1.5 py-0.5 max-w-[200px]"
          >
            {r.avatarUrl ? (
              <img
                src={r.avatarUrl}
                alt=""
                className="w-4 h-4 rounded-full object-cover shrink-0"
              />
            ) : (
              <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold shrink-0">
                {initials(r.fullName, r.email)}
              </span>
            )}
            <span className="truncate">{r.fullName ?? r.email}</span>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); remove(r.userId); }}
              aria-label={`Remove ${r.email}`}
              className="text-primary/50 hover:text-primary transition-colors ml-0.5 shrink-0"
            >
              <X size={10} />
            </button>
          </div>
        ))}

        <div className="flex items-center flex-1 min-w-[140px]">
          <input
            ref={inputRef}
            type="email"
            value={input}
            onChange={e => { setInput(e.target.value); setError(''); setInfoMsg(''); }}
            onKeyDown={handleKeyDown}
            onBlur={() => { if (input.trim()) addEmail(input); }}
            placeholder={value.length === 0 ? 'Enter user email…' : ''}
            disabled={disabled || loading}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50 py-0.5 px-1"
          />
          {loading && (
            <Loader2 size={13} className="text-muted-foreground animate-spin mr-1 shrink-0" />
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <AlertCircle size={12} className="text-red-500 shrink-0" />
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}

      {/* Info (self-share notice) */}
      {infoMsg && !error && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <Info size={12} className="text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">{infoMsg}</p>
        </div>
      )}

      {/* Recipient cards */}
      {value.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {value.map(r => (
            <div
              key={r.userId}
              className="flex items-center gap-2.5 rounded-lg bg-muted/40 border border-border px-2.5 py-2"
            >
              {r.avatarUrl ? (
                <img
                  src={r.avatarUrl}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-semibold shrink-0">
                  {initials(r.fullName, r.email)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {r.fullName ?? r.email}
                </p>
                {r.fullName && (
                  <p className="text-[11px] text-muted-foreground truncate">{r.email}</p>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">
                Zikron user
              </span>
              <button
                type="button"
                onClick={() => remove(r.userId)}
                aria-label={`Remove ${r.email}`}
                className="text-muted-foreground hover:text-red-500 transition-colors shrink-0"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
