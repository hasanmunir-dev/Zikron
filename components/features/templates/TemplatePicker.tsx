'use client';

import { useState, useMemo } from 'react';
import { X, Search, LayoutTemplate, Star, Sparkles, Copy } from 'lucide-react';
import { useTemplates, useUseTemplate } from '@/hooks/queries/use-templates';
import type { Template, TemplateType } from '@/types';

interface TemplatePickerProps {
  templateType?: TemplateType;
  onSelect: (template: Template) => void;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  note: 'Notes',
  inbox: 'Inbox',
  list: 'Lists',
  reminder: 'Reminders',
  collection: 'Collections',
  contact: 'Contacts',
};

export function TemplatePicker({ templateType, onSelect, onClose }: TemplatePickerProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<TemplateType | undefined>(templateType);
  const { data: templates = [], isLoading } = useTemplates(filterType);
  const useTemplate = useUseTemplate();

  const filtered = useMemo(() => {
    if (!search.trim()) return templates;
    const q = search.toLowerCase();
    return templates.filter(
      t =>
        t.name.toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q),
    );
  }, [templates, search]);

  const systemTemplates = filtered.filter(t => t.is_system);
  const userTemplates = filtered.filter(t => !t.is_system);

  function handleSelect(template: Template) {
    useTemplate.mutate(template.id);
    onSelect(template);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <LayoutTemplate size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-foreground">Choose a Template</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search + type filter */}
        <div className="px-4 py-3 border-b border-border space-y-3 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              autoFocus
            />
          </div>
          {!templateType && (
            <div className="flex gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setFilterType(undefined)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  !filterType
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setFilterType(value as TemplateType)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    filterType === value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Template list */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <LayoutTemplate size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No templates found.</p>
            </div>
          )}

          {systemTemplates.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles size={12} className="text-amber-500" />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  System Templates
                </p>
              </div>
              <div className="space-y-1.5">
                {systemTemplates.map(t => (
                  <TemplateCard key={t.id} template={t} onSelect={handleSelect} />
                ))}
              </div>
            </div>
          )}

          {userTemplates.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Copy size={12} className="text-muted-foreground" />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  My Templates
                </p>
              </div>
              <div className="space-y-1.5">
                {userTemplates.map(t => (
                  <TemplateCard key={t.id} template={t} onSelect={handleSelect} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: Template;
  onSelect: (t: Template) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      className="w-full text-left rounded-xl border border-border bg-card hover:bg-muted hover:border-primary/40 transition-all p-3 group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-foreground truncate">{template.name}</p>
            {template.is_favorite && (
              <Star size={11} className="shrink-0 fill-amber-400 text-amber-400" />
            )}
          </div>
          {template.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{template.description}</p>
          )}
        </div>
        <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
          {TYPE_LABELS[template.template_type] ?? template.template_type}
        </span>
      </div>
      {template.content_template && (
        <p className="mt-1.5 text-[11px] text-muted-foreground line-clamp-2 font-mono leading-relaxed opacity-70">
          {template.content_template.slice(0, 120)}
        </p>
      )}
    </button>
  );
}
