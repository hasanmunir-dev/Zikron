export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : '');
}

export function buildShareUrl(token: string): string {
  return `${getAppUrl()}/s/${token}`;
}

export function buildRecipientShareUrl(individualToken: string): string {
  return `${getAppUrl()}/s/r/${individualToken}`;
}
