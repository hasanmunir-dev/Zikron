'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  GitCommit, Plus, Search, X, Pencil, Trash2, Eye, EyeOff,
  Save,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import {
  useAdminChangelogs, useAdminCreateChangelog,
  useAdminUpdateChangelog, useAdminDeleteChangelog, useAdminTogglePublish,
} from '@/hooks/queries/use-changelog';
import { MarkdownEditor } from '@/components/editor/markdown-editor';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { formatRelativeTime } from '@/utils/date';
import type { Changelog, ChangelogType, ChangelogChange } from '@/types';

const BASE = '/admin/changelog';

function toLocalDatetimeInput(iso: string): string {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

const TYPE_COLORS: Record<ChangelogType, string> = {
  feature: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
  improvement: 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400',
  fix: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400',
  security: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
  announcement: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
};

const TYPES: ChangelogType[] = ['feature', 'improvement', 'fix', 'security', 'announcement'];

// ─── Editor dialog ─────────────────────────────────────────────────────────────

function ChangelogEditorDialog({
  initial,
  onClose,
}: {
  initial?: Changelog;
  onClose: () => void;
}) {
  const createChangelog = useAdminCreateChangelog();
  const updateChangelog = useAdminUpdateChangelog();
  const isPending = createChangelog.isPending || updateChangelog.isPending;

  const [form, setForm] = useState({
    version: initial?.version ?? '',
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    type: (initial?.type ?? 'feature') as ChangelogType,
    published: initial?.published ?? false,
    deployed_at: initial?.deployed_at ? toLocalDatetimeInput(initial.deployed_at) : '',
    commit_sha: initial?.commit_sha ?? '',
    changes: initial?.changes ?? [] as ChangelogChange[],
  });

  const [newChangeText, setNewChangeText] = useState('');
  const [newChangeTag, setNewChangeTag] = useState<ChangelogType>('feature');

  function addChange() {
    const text = newChangeText.trim();
    if (!text) return;
    setForm(f => ({ ...f, changes: [...f.changes, { tag: newChangeTag, text }] }));
    setNewChangeText('');
  }

  function removeChange(idx: number) {
    setForm(f => ({ ...f, changes: f.changes.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      description: form.description || null,
      deployed_at: form.deployed_at ? new Date(form.deployed_at).toISOString() : null,
      commit_sha: form.commit_sha || null,
    };
    if (initial) {
      await updateChangelog.mutateAsync({ id: initial.id, ...payload });
    } else {
      await createChangelog.mutateAsync(payload);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center">
              <GitCommit size={17} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              {initial ? 'Edit Changelog' : 'New Changelog'}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Version + Type */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1.5">Version <span className="text-red-500">*</span></label>
              <input
                value={form.version}
                onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
                placeholder="e.g. 1.3.0"
                required
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1.5">Type</label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as ChangelogType }))}>
                <SelectTrigger className="w-full h-9 capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Title <span className="text-red-500">*</span></label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Lists polish + performance improvements"
              required
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <MarkdownEditor
              value={form.description}
              onChange={v => setForm(f => ({ ...f, description: v }))}
              placeholder="Optional summary (supports Markdown)…"
              minHeight={100}
            />
          </div>

          {/* Changes list */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Changes</label>
            {form.changes.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-3">
                {form.changes.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg border border-border">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize ${TYPE_COLORS[c.tag]}`}>{c.tag}</span>
                    <span className="text-sm text-foreground flex-1 min-w-0 truncate">{c.text}</span>
                    <button type="button" onClick={() => removeChange(i)} aria-label="Remove change" className="text-muted-foreground hover:text-red-500 transition-colors shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Select value={newChangeTag} onValueChange={v => setNewChangeTag(v as ChangelogType)}>
                <SelectTrigger className="capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <input
                value={newChangeText}
                onChange={e => setNewChangeText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChange(); } }}
                placeholder="Add a change line…"
                className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="button" onClick={addChange} className="px-3 py-2 text-sm font-medium bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors">
                <Plus size={15} />
              </button>
            </div>
          </div>

          {/* Deployed at + commit */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1.5">Deployed at</label>
              <DateTimePicker
                value={form.deployed_at}
                onChange={v => setForm(f => ({ ...f, deployed_at: v }))}
                placeholder="Pick deployment date & time"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1.5">Commit SHA</label>
              <input
                value={form.commit_sha}
                onChange={e => setForm(f => ({ ...f, commit_sha: e.target.value }))}
                placeholder="abc1234…"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
            </div>
          </div>

          {/* Publish toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.published}
                onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                className="sr-only"
              />
              <div className={`w-10 h-6 rounded-full transition-colors ${form.published ? 'bg-blue-600' : 'bg-muted'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mt-1 ml-1 ${form.published ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </div>
            <span className="text-sm font-medium text-foreground">Publish immediately</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !form.version.trim() || !form.title.trim()}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={14} /> {isPending ? 'Saving…' : (initial ? 'Save Changes' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

function AdminChangelogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: items = [], isFetching } = useAdminChangelogs();
  const togglePublish = useAdminTogglePublish();
  const deleteChangelog = useAdminDeleteChangelog();

  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = items.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.title.toLowerCase().includes(q) || c.version.toLowerCase().includes(q);
  });

  const editItem = editId ? items.find(c => c.id === editId) : null;
  const deleteItem = confirmDeleteId ? items.find(c => c.id === confirmDeleteId) : null;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Changelog</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Create and publish version updates.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shrink-0"
        >
          <Plus size={16} /> New Entry
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by version or title…"
          className="w-full pl-9 pr-8 py-2 text-sm border border-border rounded-lg bg-muted text-foreground placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <X size={14} />
          </button>
        )}
        {isFetching && <span className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-muted-foreground animate-pulse">Refreshing…</span>}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <GitCommit size={32} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {search ? 'No changelogs match your search.' : 'No changelog entries yet.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(item => (
            <div key={item.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
              {/* Icon */}
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <GitCommit size={15} className="text-muted-foreground" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-foreground font-mono">{item.version}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize ${TYPE_COLORS[item.type]}`}>{item.type}</span>
                      {item.published ? (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium">Published</span>
                      ) : (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">Draft</span>
                      )}
                    </div>
                    <p className="text-sm text-foreground mt-0.5 line-clamp-1">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description.replace(/[#*`_>]/g, '')}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground/60">
                      {item.changes.length > 0 && <span>{item.changes.length} change{item.changes.length !== 1 ? 's' : ''}</span>}
                      {item.deployed_at && <><span>·</span><span>{formatRelativeTime(item.deployed_at)}</span></>}
                      {item.commit_sha && <><span>·</span><span className="font-mono">{item.commit_sha.slice(0, 7)}</span></>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => togglePublish.mutate({ id: item.id, published: !item.published })}
                      disabled={togglePublish.isPending}
                      title={item.published ? 'Unpublish' : 'Publish'}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {item.published ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditId(item.id)}
                      title="Edit"
                      className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(item.id)}
                      title="Delete"
                      className="p-2 rounded-lg text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      {showCreate && <ChangelogEditorDialog onClose={() => setShowCreate(false)} />}
      {editItem && <ChangelogEditorDialog initial={editItem} onClose={() => setEditId(null)} />}

      <DeleteConfirmDialog
        open={!!deleteItem}
        onOpenChange={open => { if (!open) setConfirmDeleteId(null); }}
        title="Delete Changelog?"
        description="This will permanently remove this changelog entry."
        itemName={deleteItem ? `${deleteItem.version}: ${deleteItem.title}` : ''}
        onConfirm={() => {
          if (confirmDeleteId) deleteChangelog.mutate(confirmDeleteId, { onSuccess: () => setConfirmDeleteId(null) });
        }}
        isLoading={deleteChangelog.isPending}
      />
    </div>
  );
}

export default function AdminChangelogPage() {
  return (
    <Suspense>
      <AdminChangelogContent />
    </Suspense>
  );
}
