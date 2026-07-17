'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LayoutTemplate, Search, Shield, User, Trash2, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/utils/date';
import type { AdminTemplate, TemplateType } from '@/types';

const TYPE_COLORS: Record<TemplateType, string> = {
  note: 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400',
  inbox: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400',
  list: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400',
  reminder: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400',
  collection: 'bg-fuchsia-100 dark:bg-fuchsia-950/60 text-fuchsia-700 dark:text-fuchsia-400',
  contact: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400',
};

function TemplatesTable() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TemplateType | 'all'>('all');
  const [showSystemOnly, setShowSystemOnly] = useState(false);
  const [showCreateSystem, setShowCreateSystem] = useState(false);
  const [newSystemTemplate, setNewSystemTemplate] = useState({
    name: '', description: '', template_type: 'note' as TemplateType,
    title_template: '', content_template: '',
  });

  const queryClient = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin', 'templates', typeFilter, search, showSystemOnly],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (search) params.set('search', search);
      if (showSystemOnly) params.set('system', 'true');
      const res = await api.get<{ templates: AdminTemplate[]; total: number }>(`/api/admin/templates?${params.toString()}`);
      return res.templates;
    },
    staleTime: 1000 * 30,
  });

  const deleteTemplate = useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/templates/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'templates'] }),
  });

  const createSystem = useMutation({
    mutationFn: () => api.post('/api/admin/templates/system', { ...newSystemTemplate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'templates'] });
      setShowCreateSystem(false);
      setNewSystemTemplate({ name: '', description: '', template_type: 'note', title_template: '', content_template: '' });
    },
  });

  const types: (TemplateType | 'all')[] = ['all', 'note', 'inbox', 'list', 'reminder', 'collection', 'contact'];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg flex-1 max-w-xs">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground flex-1"
          />
        </div>
        <div className="flex items-center gap-1">
          {types.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                typeFilter === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showSystemOnly}
            onChange={e => setShowSystemOnly(e.target.checked)}
            className="rounded"
          />
          System only
        </label>
        <span className="text-sm text-muted-foreground ml-auto">{data.length} templates</span>
        <button
          type="button"
          onClick={() => setShowCreateSystem(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={14} />
          New System Template
        </button>
      </div>

      {/* Create system template form */}
      {showCreateSystem && (
        <div className="border border-border rounded-xl p-4 space-y-3 bg-muted/30">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Shield size={14} className="text-primary" />
            Create System Template
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={newSystemTemplate.name}
              onChange={e => setNewSystemTemplate(p => ({ ...p, name: e.target.value }))}
              placeholder="Name *"
              className="col-span-2 px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary"
            />
            <input
              value={newSystemTemplate.description}
              onChange={e => setNewSystemTemplate(p => ({ ...p, description: e.target.value }))}
              placeholder="Description"
              className="col-span-2 px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary"
            />
            <select
              value={newSystemTemplate.template_type}
              onChange={e => setNewSystemTemplate(p => ({ ...p, template_type: e.target.value as TemplateType }))}
              className="px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary"
            >
              {(['note', 'inbox', 'list', 'reminder', 'collection', 'contact'] as TemplateType[]).map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <input
              value={newSystemTemplate.title_template}
              onChange={e => setNewSystemTemplate(p => ({ ...p, title_template: e.target.value }))}
              placeholder="Title template (supports {{date}}, {{user_name}})"
              className="px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary"
            />
            <textarea
              value={newSystemTemplate.content_template}
              onChange={e => setNewSystemTemplate(p => ({ ...p, content_template: e.target.value }))}
              placeholder="Content template (markdown supported)"
              rows={4}
              className="col-span-2 px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary resize-none"
            />
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowCreateSystem(false)}
              className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => createSystem.mutate()}
              disabled={!newSystemTemplate.name || createSystem.isPending}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {createSystem.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Template</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Owner</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Uses</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Created</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No templates found.
                </td>
              </tr>
            ) : data.map(t => (
              <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    {t.is_system && (
                      <Shield size={12} className="text-primary mt-0.5 shrink-0" aria-label="System template" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">{t.name}</p>
                      {t.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t.description}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${TYPE_COLORS[t.template_type]}`}>
                    {t.template_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {t.is_system ? (
                    <span className="flex items-center gap-1">
                      <Shield size={10} className="text-primary" />
                      System
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <User size={10} />
                      {t.owner?.email ?? t.owner?.full_name ?? '—'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{t.usage_count}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{formatRelativeTime(t.created_at)}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete template "${t.name}"?`)) deleteTemplate.mutate(t.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete template"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminTemplatesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <LayoutTemplate className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold text-foreground">Templates</h1>
      </div>
      <TemplatesTable />
    </div>
  );
}
