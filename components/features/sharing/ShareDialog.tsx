'use client';

import { useState } from 'react';
import {
  Globe,
  Lock,
  Users,
  Target,
  Copy,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Link2,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';
import { useCreateSharedLink, useRevokeSharedLink, useSharedLinks } from '@/hooks/queries/use-shared-links';
import { useAuth } from '@/hooks/useAuth';
import { PrivateRecipientPicker } from './PrivateRecipientPicker';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import type { ItemType, ShareType, SharedLink, PrivateRecipient } from '@/types';

// ─── Share type definitions ───────────────────────────────────────────────────

interface ShareTypeOption {
  value: ShareType;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const SHARE_TYPES: ShareTypeOption[] = [
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone with the link',
    icon: Globe,
    color: 'text-emerald-600',
  },
  {
    value: 'protected',
    label: 'Protected',
    description: 'Anyone with the link and password',
    icon: Lock,
    color: 'text-amber-600',
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only selected logged-in users',
    icon: Users,
    color: 'text-blue-600',
  },
  {
    value: 'tracked_protected',
    label: 'Tracked Protected',
    description: 'Separate protected link per contact',
    icon: Target,
    color: 'text-violet-600',
  },
];

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors shrink-0"
    >
      {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ─── Existing link row ────────────────────────────────────────────────────────

function ExistingLinkRow({
  link,
  baseUrl,
  onRevoke,
}: {
  link: SharedLink;
  baseUrl: string;
  onRevoke: (id: string) => void;
}) {
  const typeInfo = SHARE_TYPES.find(t => t.value === link.share_type)!;
  const Icon = typeInfo.icon;
  const shareUrl = link.share_type === 'tracked_protected'
    ? null
    : `${baseUrl}/s/${link.token}`;

  const isActive = !link.is_revoked &&
    (!link.expires_at || new Date(link.expires_at) > new Date()) &&
    (link.view_limit === null || link.view_count < link.view_limit);

  return (
    <div className={`rounded-xl border p-3 space-y-2 ${link.is_revoked ? 'border-border opacity-50' : 'border-border'}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon size={14} className={typeInfo.color} />
          <span className="text-xs font-medium text-foreground">{typeInfo.label}</span>
          {!isActive && (
            <span className="text-[10px] bg-red-100 dark:bg-red-950/40 text-red-600 rounded-full px-1.5 py-0.5 font-medium">
              {link.is_revoked ? 'Revoked' : 'Expired'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Eye size={11} />
          {link.view_count}{link.view_limit ? `/${link.view_limit}` : ''}
        </div>
      </div>

      {shareUrl && isActive && (
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 rounded-lg bg-muted/50 border border-border px-2.5 py-1.5 text-xs text-muted-foreground font-mono truncate">
            {shareUrl}
          </div>
          <CopyButton text={shareUrl} />
        </div>
      )}

      {link.share_type === 'tracked_protected' && link.shared_link_recipients && (
        <div className="space-y-1">
          {link.shared_link_recipients.map(r => {
            const rUrl = r.individual_token ? `${baseUrl}/s/r/${r.individual_token}` : null;
            return (
              <div key={r.id} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground min-w-[80px] truncate">{r.recipient_name ?? r.recipient_email ?? 'Recipient'}</span>
                {r.suspicious_access_count > 0 && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-100 dark:bg-amber-950/40 rounded-full px-1.5 py-0.5">
                    <AlertTriangle size={9} />
                    Suspicious access
                  </span>
                )}
                {rUrl && isActive && !r.is_revoked && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-xs font-mono text-muted-foreground truncate max-w-[140px]">{rUrl}</span>
                    <CopyButton text={rUrl} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isActive && (
        <button
          type="button"
          onClick={() => onRevoke(link.id)}
          className="text-xs text-red-500 hover:text-red-600 transition-colors"
        >
          Revoke link
        </button>
      )}
    </div>
  );
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

interface ShareDialogProps {
  itemType: ItemType;
  itemId: string;
  itemTitle: string;
  onClose: () => void;
}

export function ShareDialog({ itemType, itemId, itemTitle, onClose }: ShareDialogProps) {
  const [shareType, setShareType] = useState<ShareType>('public');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [viewLimit, setViewLimit] = useState('');
  const [allowDownload, setAllowDownload] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [privateRecipients, setPrivateRecipients] = useState<PrivateRecipient[]>([]);

  const { user } = useAuth();
  const { data: allLinks = [] } = useSharedLinks();
  const createLink = useCreateSharedLink();
  const revokeLink = useRevokeSharedLink();

  const existingLinks = allLinks.filter(l => l.item_type === itemType && l.item_id === itemId);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const needsPassword = shareType === 'protected' || shareType === 'tracked_protected';
  const isPrivate = shareType === 'private';
  const canCreate = !isPrivate || privateRecipients.length > 0;

  async function handleCreate() {
    await createLink.mutateAsync({
      item_type: itemType,
      item_id: itemId,
      share_type: shareType,
      password: needsPassword && password ? password : undefined,
      expires_at: expiresAt || undefined,
      view_limit: viewLimit ? parseInt(viewLimit, 10) : undefined,
      allow_download: allowDownload,
      recipients: isPrivate
        ? privateRecipients.map(r => ({
            name: r.fullName ?? undefined,
            email: r.email,
            required_login_user_id: r.userId,
          }))
        : undefined,
    });
    setPassword('');
    setExpiresAt('');
    setViewLimit('');
    setPrivateRecipients([]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Link2 size={16} className="text-primary" />
            <h2 className="font-semibold text-foreground text-sm">Share</h2>
            <span className="text-xs text-muted-foreground truncate max-w-[180px]">{itemTitle}</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Share type grid */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Share type</p>
            <div className="grid grid-cols-2 gap-2">
              {SHARE_TYPES.map(opt => {
                const Icon = opt.icon;
                const active = shareType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setShareType(opt.value)}
                    className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all ${
                      active
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30 hover:bg-muted/30'
                    }`}
                  >
                    <Icon size={15} className={`${opt.color} shrink-0 mt-0.5`} />
                    <div>
                      <p className="text-xs font-semibold text-foreground">{opt.label}</p>
                      <p className="text-[11px] text-muted-foreground leading-tight">{opt.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Password field */}
          {needsPassword && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                {shareType === 'tracked_protected' ? 'Default password (optional per-link override)' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter a password"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          )}

          {/* Private sharing recipient picker */}
          {isPrivate && (
            <PrivateRecipientPicker
              value={privateRecipients}
              onChange={setPrivateRecipients}
              currentUserEmail={user?.email ?? undefined}
              disabled={createLink.isPending}
            />
          )}

          {/* Advanced options */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(v => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              Advanced options
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Expires at</label>
                    <DateTimePicker
                      value={expiresAt}
                      onChange={setExpiresAt}
                      placeholder="No expiry"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">View limit</label>
                    <input
                      type="number"
                      min="1"
                      value={viewLimit}
                      onChange={e => setViewLimit(e.target.value)}
                      placeholder="Unlimited"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowDownload}
                    onChange={e => setAllowDownload(e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-xs text-foreground">Allow download</span>
                </label>
              </div>
            )}
          </div>

          {/* Generate button */}
          <button
            type="button"
            onClick={handleCreate}
            disabled={createLink.isPending || (needsPassword && shareType === 'protected' && !password) || !canCreate}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Link2 size={14} />
            {createLink.isPending ? 'Generating…' : isPrivate ? `Generate link for ${privateRecipients.length} user${privateRecipients.length !== 1 ? 's' : ''}` : 'Generate link'}
          </button>
          {isPrivate && privateRecipients.length === 0 && (
            <p className="text-[11px] text-center text-muted-foreground -mt-1">Add at least one recipient to generate a private link.</p>
          )}

          {/* Existing links */}
          {existingLinks.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Existing links</p>
              <div className="space-y-2">
                {existingLinks.map(link => (
                  <ExistingLinkRow
                    key={link.id}
                    link={link}
                    baseUrl={baseUrl}
                    onRevoke={id => revokeLink.mutate(id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
