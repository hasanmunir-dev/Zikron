'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutTemplate, Plus, Search, X, Star, Trash2, Pencil, Copy,
  Sparkles, FileText, Inbox, Table2, Bell, FolderOpen, Users, ArrowRight,
} from 'lucide-react';
import {
  useTemplates, useCreateTemplate, useUpdateTemplate,
  useDeleteTemplate, useDuplicateTemplate, useUseTemplate,
} from '@/hooks/queries/use-templates';
import { useAuth } from '@/hooks/useAuth';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { MarkdownEditor } from '@/components/editor/markdown-editor';
import { MarkdownViewer } from '@/components/editor/markdown-viewer';
import type { Template, TemplateType } from '@/types';

const BASE = '/app/templates';

type FilterTab = TemplateType | 'all';

const TABS: { id: FilterTab; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All', icon: LayoutTemplate },
  { id: 'note', label: 'Notes', icon: FileText },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'list', label: 'Lists', icon: Table2 },
  { id: 'reminder', label: 'Reminders', icon: Bell },
  { id: 'collection', label: 'Collections', icon: FolderOpen },
  { id: 'contact', label: 'Contacts', icon: Users },
];

const TYPE_USE_HREF: Record<TemplateType, string> = {
  note: '/app/notes',
  inbox: '/app/inbox',
  list: '/app/lists',
  reminder: '/app/reminders',
  collection: '/app/collections',
  contact: '/app/contacts',
};

const EMPTY_FORM = {
  name: '',
  description: '',
  template_type: 'note' as TemplateType,
  title_template: '',
  content_template: '',
};

export function TemplatesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [tab, setTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');

  const { data: templates = [], isLoading } = useTemplates(tab === 'all' ? undefined : tab);
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const duplicateTemplate = useDuplicateTemplate();
  const useTemplate = useUseTemplate();

  // URL state
  const createOpen = searchParams.get('create') === 'true';
  const editId = searchParams.get('edit') ?? undefined;
  const detailId = searchParams.get('detail') ?? undefined;
  const deleteId = searchParams.get('delete') ?? undefined;

  const editTemplate = editId ? templates.find(t => t.id === editId) : undefined;
  const detailTemplate = detailId ? templates.find(t => t.id === detailId) : undefined;
  const deleteTemplate_ = deleteId ? templates.find(t => t.id === deleteId) : undefined;

  // Form state
  const [form, setForm] = useState(EMPTY_FORM);

  const closeUrl = BASE;

  function openCreate() {
    setForm(EMPTY_FORM);
    router.push(`${BASE}?create=true`);
  }

  function openEdit(t: Template) {
    setForm({
      name: t.name,
      description: t.description ?? '',
      template_type: t.template_type,
      title_template: t.title_template ?? '',
      content_template: t.content_template ?? '',
    });
    router.push(`${BASE}?edit=${t.id}`);
  }

  function handleClose() {
    router.replace(closeUrl);
  }

  function handleCreate() {
    if (!form.name.trim()) return;
    createTemplate.mutate(
      {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        template_type: form.template_type,
        title_template: form.title_template.trim() || undefined,
        content_template: form.content_template.trim() || undefined,
        metadata_template: {},
      },
      { onSuccess: () => handleClose() },
    );
  }

  function handleUpdate() {
    if (!editId || !form.name.trim()) return;
    updateTemplate.mutate(
      {
        id: editId,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        template_type: form.template_type,
        title_template: form.title_template.trim() || undefined,
        content_template: form.content_template.trim() || undefined,
      },
      { onSuccess: () => handleClose() },
    );
  }

  function handleDelete() {
    if (!deleteId) return;
    deleteTemplate.mutate(deleteId, { onSuccess: () => handleClose() });
  }

  function handleDuplicate(id: string) {
    duplicateTemplate.mutate(id);
  }

  function handleToggleFavorite(t: Template) {
    if (t.is_system) return;
    updateTemplate.mutate({ id: t.id, is_favorite: !t.is_favorite });
  }

  function handleUse(t: Template) {
    useTemplate.mutate(t.id);
    const href = TYPE_USE_HREF[t.template_type];
    router.push(`${href}?create=true&template=${t.id}`);
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return templates;
    const q = search.toLowerCase();
    return templates.filter(
      t =>
        t.name.toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q) ||
        (t.content_template ?? '').toLowerCase().includes(q),
    );
  }, [templates, search]);

  const systemTemplates = filtered.filter(t => t.is_system);
  const userTemplates = filtered.filter(t => !t.is_system);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Templates</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Reusable starting points for notes, reminders, lists, and more.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> New Template
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 flex-wrap">
        {TABS.map(({ id, label }) => (
          <button
            type="button"
            key={id}
            onClick={() => setTab(id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-card pl-9 pr-9 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <LayoutTemplate size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No templates found.</p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Create your first template
          </button>
        </div>
      )}

      {systemTemplates.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground">System Templates</h3>
            <span className="text-xs text-muted-foreground">({systemTemplates.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {systemTemplates.map(t => (
              <TemplateCard
                key={t.id}
                template={t}
                onUse={handleUse}
                onDuplicate={handleDuplicate}
                onEdit={openEdit}
                onDelete={id => router.push(`${BASE}?delete=${id}`)}
                onFavorite={handleToggleFavorite}
                onDetail={id => router.push(`${BASE}?detail=${id}`)}
                isOwn={false}
              />
            ))}
          </div>
        </div>
      )}

      {userTemplates.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Copy size={14} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">My Templates</h3>
            <span className="text-xs text-muted-foreground">({userTemplates.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {userTemplates.map(t => (
              <TemplateCard
                key={t.id}
                template={t}
                onUse={handleUse}
                onDuplicate={handleDuplicate}
                onEdit={openEdit}
                onDelete={id => router.push(`${BASE}?delete=${id}`)}
                onFavorite={handleToggleFavorite}
                onDetail={id => router.push(`${BASE}?detail=${id}`)}
                isOwn={t.user_id === user?.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      {(createOpen || editId) && (
        <TemplateFormDialog
          mode={createOpen ? 'create' : 'edit'}
          form={form}
          setForm={setForm}
          onSave={createOpen ? handleCreate : handleUpdate}
          onClose={handleClose}
          isPending={createTemplate.isPending || updateTemplate.isPending}
        />
      )}

      {/* Detail Dialog */}
      {detailTemplate && (
        <TemplateDetailDialog
          template={detailTemplate}
          onClose={handleClose}
          onUse={handleUse}
          onDuplicate={handleDuplicate}
          onEdit={openEdit}
          onDelete={id => router.push(`${BASE}?delete=${id}`)}
          isOwn={detailTemplate.user_id === user?.id}
        />
      )}

      {/* Delete Confirm */}
      <DeleteConfirmDialog
        open={!!deleteTemplate_}
        onOpenChange={open => { if (!open) handleClose(); }}
        title="Delete Template"
        description={`"${deleteTemplate_?.name}" will be permanently deleted.`}
        onConfirm={handleDelete}
        isLoading={deleteTemplate.isPending}
      />
    </div>
  );
}

// ─── Template Card ────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<TemplateType, string> = {
  note: 'Note', inbox: 'Inbox', list: 'List',
  reminder: 'Reminder', collection: 'Collection', contact: 'Contact',
};

const TYPE_COLORS: Record<TemplateType, string> = {
  note: 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300',
  inbox: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300',
  list: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300',
  reminder: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
  collection: 'bg-fuchsia-100 dark:bg-fuchsia-950/60 text-fuchsia-700 dark:text-fuchsia-300',
  contact: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300',
};

interface TemplateCardProps {
  template: Template;
  isOwn: boolean;
  onUse: (t: Template) => void;
  onDuplicate: (id: string) => void;
  onEdit: (t: Template) => void;
  onDelete: (id: string) => void;
  onFavorite: (t: Template) => void;
  onDetail: (id: string) => void;
}

function TemplateCard({
  template: t,
  isOwn,
  onUse,
  onDuplicate,
  onEdit,
  onDelete,
  onFavorite,
  onDetail,
}: TemplateCardProps) {
  return (
    <div className="relative flex flex-col rounded-xl border border-border bg-card hover:border-primary/30 transition-colors p-4 group">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <button
          type="button"
          onClick={() => onDetail(t.id)}
          className="text-left flex-1 min-w-0"
        >
          <p className="text-sm font-semibold text-foreground truncate">{t.name}</p>
          {t.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{t.description}</p>
          )}
        </button>
        <button
          type="button"
          onClick={() => onFavorite(t)}
          disabled={t.is_system}
          className={`shrink-0 transition-colors ${
            t.is_favorite ? 'text-amber-400' : 'text-muted-foreground opacity-0 group-hover:opacity-100'
          } ${t.is_system ? 'cursor-default' : 'hover:text-amber-400'}`}
          aria-label={t.is_favorite ? 'Unfavorite' : 'Favorite'}
        >
          <Star size={14} className={t.is_favorite ? 'fill-amber-400' : ''} />
        </button>
      </div>

      {/* Content preview */}
      {t.content_template && (
        <p className="text-[11px] text-muted-foreground font-mono line-clamp-2 leading-relaxed mb-3 opacity-70">
          {t.content_template.slice(0, 100)}
        </p>
      )}

      {/* Bottom row */}
      <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-border/50">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[t.template_type]}`}>
          {TYPE_LABELS[t.template_type]}
        </span>
        <div className="flex items-center gap-1">
          {t.usage_count > 0 && (
            <span className="text-[10px] text-muted-foreground mr-1">{t.usage_count}x</span>
          )}
          <button
            type="button"
            onClick={() => onDuplicate(t.id)}
            title="Duplicate"
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
          >
            <Copy size={13} />
          </button>
          {isOwn && !t.is_system && (
            <>
              <button
                type="button"
                onClick={() => onEdit(t)}
                title="Edit"
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
              >
                <Pencil size={13} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(t.id)}
                title="Delete"
                className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => onUse(t)}
            className="flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded transition-colors"
          >
            Use <ArrowRight size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Template Form Dialog ─────────────────────────────────────────────────────

interface FormState {
  name: string;
  description: string;
  template_type: TemplateType;
  title_template: string;
  content_template: string;
}

interface TemplateFormDialogProps {
  mode: 'create' | 'edit';
  form: FormState;
  setForm: (f: FormState) => void;
  onSave: () => void;
  onClose: () => void;
  isPending: boolean;
}

function TemplateFormDialog({ mode, form, setForm, onSave, onClose, isPending }: TemplateFormDialogProps) {
  function field<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm({ ...form, [key]: value });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold text-foreground">
            {mode === 'create' ? 'New Template' : 'Edit Template'}
          </h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Template Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={e => field('name', e.target.value)}
              placeholder="e.g. Weekly Review"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={e => field('description', e.target.value)}
              placeholder="Brief description of this template..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Template Type</label>
            <select
              value={form.template_type}
              onChange={e => field('template_type', e.target.value as TemplateType)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {(Object.keys(TYPE_LABELS) as TemplateType[]).map(type => (
                <option key={type} value={type}>{TYPE_LABELS[type]}</option>
              ))}
            </select>
          </div>

          {/* Title template */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Title Template
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                supports {`{{title}}`}, {`{{date}}`}, {`{{time}}`}, {`{{user_name}}`}
              </span>
            </label>
            <input
              type="text"
              value={form.title_template}
              onChange={e => field('title_template', e.target.value)}
              placeholder="e.g. Meeting: {{title}} — {{date}}"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Content template */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Content Template
              <span className="ml-2 text-xs text-muted-foreground font-normal">Markdown supported</span>
            </label>
            <MarkdownEditor
              value={form.content_template}
              onChange={v => field('content_template', v)}
              placeholder="Write your template content here..."
              minHeight="180px"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!form.name.trim() || isPending}
            className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isPending ? 'Saving…' : mode === 'create' ? 'Create Template' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Template Detail Dialog ───────────────────────────────────────────────────

interface TemplateDetailDialogProps {
  template: Template;
  isOwn: boolean;
  onClose: () => void;
  onUse: (t: Template) => void;
  onDuplicate: (id: string) => void;
  onEdit: (t: Template) => void;
  onDelete: (id: string) => void;
}

function TemplateDetailDialog({
  template: t, isOwn, onClose, onUse, onDuplicate, onEdit, onDelete,
}: TemplateDetailDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-start justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-base font-semibold text-foreground">{t.name}</h2>
              {t.is_system && <Sparkles size={13} className="text-amber-500 shrink-0" />}
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[t.template_type]}`}>
                {TYPE_LABELS[t.template_type]}
              </span>
            </div>
            {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground shrink-0 ml-4">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {t.title_template && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Title Template</p>
              <p className="text-sm text-foreground font-mono bg-muted px-3 py-2 rounded-lg">{t.title_template}</p>
            </div>
          )}
          {t.content_template && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Content Preview</p>
              <div className="border border-border rounded-xl p-4 bg-background max-h-60 overflow-y-auto">
                <MarkdownViewer content={t.content_template} />
              </div>
            </div>
          )}
          {t.usage_count > 0 && (
            <p className="text-xs text-muted-foreground">Used {t.usage_count} time{t.usage_count !== 1 ? 's' : ''}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-5 py-4 border-t border-border shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDuplicate(t.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <Copy size={13} /> Duplicate
            </button>
            {isOwn && !t.is_system && (
              <>
                <button
                  type="button"
                  onClick={() => onEdit(t)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(t.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => { onUse(t); onClose(); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Use Template <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
