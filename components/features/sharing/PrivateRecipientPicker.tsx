'use client';

import { useState, useRef, KeyboardEvent, useEffect, useMemo } from 'react';
import { X, Loader2, AlertCircle, Info, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { useContacts } from '@/hooks/queries/use-contacts';
import { ProfileAvatar } from '@/components/features/profile/ProfileAvatar';
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
  if (fullName) return fullName.split(' ').map(p => p[0] ?? '').join('').slice(0, 2).toUpperCase();
  return (email[0] ?? '?').toUpperCase();
}

// Returns all valid emails for a contact (rich array first, then legacy flat field)
function contactEmails(c: { email: string | null; emails?: { value: string }[] }): string[] {
  const rich = (c.emails ?? []).map(e => e.value).filter(Boolean);
  if (rich.length > 0) return rich;
  return c.email ? [c.email] : [];
}

export function PrivateRecipientPicker({ value, onChange, currentUserEmail, disabled }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: contacts = [] } = useContacts();

  // Already-added emails (for dedup)
  const addedEmails = useMemo(
    () => new Set(value.map(r => r.email.toLowerCase())),
    [value],
  );

  // Filter contacts by query and exclude already-added ones
  const suggestions = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [];

    return contacts
      .flatMap(c => {
        const emails = contactEmails(c);
        if (emails.length === 0) return [];
        // Use the first email as the "primary" one for this contact
        const primaryEmail = emails[0];
        if (addedEmails.has(primaryEmail.toLowerCase())) return [];
        // Match on name or any email
        const nameMatch = c.name.toLowerCase().includes(q);
        const emailMatch = emails.some(e => e.toLowerCase().includes(q));
        if (!nameMatch && !emailMatch) return [];
        return [{ id: c.id, name: c.name, email: primaryEmail, avatarUrl: c.avatar_url }];
      })
      .slice(0, 6); // cap at 6 suggestions
  }, [input, contacts, addedEmails]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setHighlightIdx(-1);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Open dropdown whenever there are suggestions
  useEffect(() => {
    setDropdownOpen(suggestions.length > 0);
    setHighlightIdx(-1);
  }, [suggestions]);

  async function addEmail(raw: string) {
    const email = raw.trim().toLowerCase();
    setError('');
    setInfoMsg('');
    if (!email) return;

    if (!EMAIL_RE.test(email)) { setError('Please enter a valid email address.'); return; }
    if (addedEmails.has(email)) { setError('This user is already added.'); return; }

    setDropdownOpen(false);
    setHighlightIdx(-1);
    setLoading(true);
    try {
      const result = await api.get<LookupResponse>(`/api/users/lookup?email=${encodeURIComponent(email)}`);
      if (!result.exists || !result.user) { setError('No Zikron user found with this email.'); return; }
      if (result.user.status === 'disabled') { setError('This user exists, but their account is disabled.'); return; }

      onChange([...value, {
        userId: result.user.id,
        email: result.user.email,
        fullName: result.user.full_name,
        avatarUrl: result.user.avatar_url,
        role: result.user.role,
        status: result.user.status,
      }]);
      setInput('');
      if (currentUserEmail?.toLowerCase() === email) setInfoMsg('This is your own account.');
    } catch {
      setError('Failed to look up this email. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (dropdownOpen && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIdx(i => Math.min(i + 1, suggestions.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIdx(i => Math.max(i - 1, -1));
        return;
      }
      if (e.key === 'Enter' && highlightIdx >= 0) {
        e.preventDefault();
        addEmail(suggestions[highlightIdx].email);
        return;
      }
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setHighlightIdx(-1);
        return;
      }
    }

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

      {/* Input area + dropdown wrapper */}
      <div ref={containerRef} className="relative">
        {/* Chip + input row */}
        <div
          className="min-h-10.5 w-full rounded-lg border border-border bg-background px-2 py-1.5 flex flex-wrap gap-1.5 cursor-text focus-within:ring-2 focus-within:ring-primary/30 transition-shadow"
          onClick={() => inputRef.current?.focus()}
        >
          {value.map(r => (
            <div
              key={r.userId}
              className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium rounded-full pl-1 pr-1.5 py-0.5 max-w-50"
            >
              {r.avatarUrl ? (
                <img src={r.avatarUrl} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
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

          <div className="flex items-center flex-1 min-w-35">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => { setInput(e.target.value); setError(''); setInfoMsg(''); }}
              onKeyDown={handleKeyDown}
              onFocus={() => { if (suggestions.length > 0) setDropdownOpen(true); }}
              onBlur={() => {
                // Small delay so dropdown click fires before blur closes it
                setTimeout(() => {
                  if (!dropdownRef.current?.matches(':focus-within')) {
                    setDropdownOpen(false);
                    setHighlightIdx(-1);
                    if (input.trim()) addEmail(input);
                  }
                }, 150);
              }}
              placeholder={value.length === 0 ? 'Search contacts or enter email…' : ''}
              disabled={disabled || loading}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50 py-0.5 px-1"
              autoComplete="off"
            />
            {loading && <Loader2 size={13} className="text-muted-foreground animate-spin mr-1 shrink-0" />}
          </div>
        </div>

        {/* Contacts suggestions dropdown */}
        {dropdownOpen && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 z-40 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
          >
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border">
              <Users size={11} className="text-muted-foreground" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Your contacts</span>
            </div>
            {suggestions.map((s, i) => (
              <button
                key={s.id + s.email}
                type="button"
                onMouseDown={e => {
                  // prevent blur from firing before click
                  e.preventDefault();
                  addEmail(s.email);
                }}
                onMouseEnter={() => setHighlightIdx(i)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                  i === highlightIdx ? 'bg-primary/8 text-foreground' : 'hover:bg-muted/60 text-foreground'
                }`}
              >
                <ProfileAvatar
                  name={s.name}
                  avatarUrl={s.avatarUrl}
                  size="xs"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{s.email}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <AlertCircle size={12} className="text-red-500 shrink-0" />
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}

      {/* Info */}
      {infoMsg && !error && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <Info size={12} className="text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">{infoMsg}</p>
        </div>
      )}

      {/* Added recipient cards */}
      {value.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {value.map(r => (
            <div
              key={r.userId}
              className="flex items-center gap-2.5 rounded-lg bg-muted/40 border border-border px-2.5 py-2"
            >
              {r.avatarUrl ? (
                <img src={r.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-semibold shrink-0">
                  {initials(r.fullName, r.email)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{r.fullName ?? r.email}</p>
                {r.fullName && <p className="text-[11px] text-muted-foreground truncate">{r.email}</p>}
              </div>
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">Zikron user</span>
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
