import type { Template } from '@/types';

// Simple {{variable}} resolver — no scripting, just date/time/title substitutions

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatTime(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface ResolveOptions {
  title?: string;
  userName?: string;
}

function resolve(text: string | null, opts: ResolveOptions, now: Date): string {
  if (!text) return '';
  return text
    .replace(/\{\{title\}\}/g, opts.title ?? '')
    .replace(/\{\{date\}\}/g, formatDate(now))
    .replace(/\{\{time\}\}/g, formatTime(now))
    .replace(/\{\{user_name\}\}/g, opts.userName ?? '');
}

export function resolveTemplateVariables(
  template: Template,
  opts: ResolveOptions = {},
): Pick<Template, 'title_template' | 'content_template'> {
  const now = new Date();
  return {
    title_template: resolve(template.title_template, opts, now) || null,
    content_template: resolve(template.content_template, opts, now) || null,
  };
}
