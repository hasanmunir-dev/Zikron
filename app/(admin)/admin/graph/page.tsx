'use client';

import { Network, FileText, Inbox, Table2, Bell, FolderOpen, User, Hash, Link2, Tag, Folder } from 'lucide-react';
import { useAdminGraphStats } from '@/hooks/queries/use-graph';

const NODE_ICONS: Record<string, { icon: typeof FileText; color: string; bg: string }> = {
  notes:       { icon: FileText,   color: 'text-blue-600',   bg: 'bg-blue-100 dark:bg-blue-950/40' },
  inbox:       { icon: Inbox,      color: 'text-slate-600',  bg: 'bg-slate-100 dark:bg-slate-900/40' },
  lists:       { icon: Table2,     color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-950/40' },
  reminders:   { icon: Bell,       color: 'text-amber-600',  bg: 'bg-amber-100 dark:bg-amber-950/40' },
  collections: { icon: FolderOpen, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-950/40' },
  contacts:    { icon: User,       color: 'text-green-600',  bg: 'bg-green-100 dark:bg-green-950/40' },
  tags:        { icon: Hash,       color: 'text-rose-600',   bg: 'bg-rose-100 dark:bg-rose-950/40' },
};

const EDGE_ICONS = {
  links:                 { icon: Link2,  label: 'Direct Links' },
  collection_memberships:{ icon: Folder, label: 'Collection Memberships' },
  tag_associations:      { icon: Tag,    label: 'Tag Associations' },
};

export default function AdminGraphPage() {
  const { data: stats, isLoading } = useAdminGraphStats();

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const s = stats as any;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center">
          <Network size={18} className="text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Knowledge Graph — Admin</h1>
          <p className="text-sm text-muted-foreground">Read-only statistics across all users</p>
        </div>
      </div>

      {/* Total stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-2xl font-bold text-foreground">{s?.totalNodes?.toLocaleString() ?? '—'}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Nodes</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-2xl font-bold text-foreground">{s?.totalEdges?.toLocaleString() ?? '—'}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Edges</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 col-span-2 sm:col-span-1">
          <p className="text-2xl font-bold text-foreground">
            {s?.totalEdges && s?.totalNodes ? (s.totalEdges / Math.max(s.totalNodes, 1)).toFixed(1) : '—'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Avg Edges / Node</p>
        </div>
      </div>

      {/* Node breakdown */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Nodes by Module</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-border">
          {Object.entries(NODE_ICONS).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div key={key} className="p-4 space-y-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.bg}`}>
                  <Icon size={15} className={config.color} />
                </div>
                <p className="text-xl font-bold text-foreground">{s?.nodes?.[key]?.toLocaleString() ?? '0'}</p>
                <p className="text-xs text-muted-foreground capitalize">{key}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edge breakdown */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Edges by Relationship</h2>
        </div>
        <div className="divide-y divide-border">
          {(Object.entries(EDGE_ICONS) as [keyof typeof EDGE_ICONS, typeof EDGE_ICONS[keyof typeof EDGE_ICONS]][]).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div key={key} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <Icon size={14} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">{config.label}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{s?.edges?.[key]?.toLocaleString() ?? '0'}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Most connected items */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Most Connected Items</h2>
          </div>
          <div className="divide-y divide-border">
            {(s?.mostConnected ?? []).slice(0, 5).map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-5 py-2.5">
                <div className="min-w-0">
                  <span className="text-xs font-medium text-muted-foreground capitalize">{item.type}</span>
                  <p className="text-xs text-foreground truncate font-mono">{item.id.slice(0, 8)}…</p>
                </div>
                <span className="text-sm font-bold text-foreground shrink-0 ml-2">{item.linkCount}</span>
              </div>
            ))}
            {(!s?.mostConnected || s.mostConnected.length === 0) && (
              <p className="px-5 py-4 text-xs text-muted-foreground">No linked items yet</p>
            )}
          </div>
        </div>

        {/* Most used tags */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Most Used Tags</h2>
          </div>
          <div className="divide-y divide-border">
            {(s?.mostUsedTags ?? []).map((tag: any) => (
              <div key={tag.id} className="flex items-center justify-between px-5 py-2.5">
                <div className="flex items-center gap-2">
                  <Hash size={12} className="text-rose-500 shrink-0" />
                  <span className="text-sm text-foreground">{tag.name}</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">{tag.count} items</span>
              </div>
            ))}
            {(!s?.mostUsedTags || s.mostUsedTags.length === 0) && (
              <p className="px-5 py-4 text-xs text-muted-foreground">No tags yet</p>
            )}
          </div>
        </div>

        {/* Largest collections */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Largest Collections</h2>
          </div>
          <div className="divide-y divide-border">
            {(s?.largestCollections ?? []).map((col: any) => (
              <div key={col.id} className="flex items-center justify-between px-5 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <FolderOpen size={12} className="text-purple-500 shrink-0" />
                  <span className="text-sm text-foreground truncate">{col.title}</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground shrink-0 ml-2">{col.count} items</span>
              </div>
            ))}
            {(!s?.largestCollections || s.largestCollections.length === 0) && (
              <p className="px-5 py-4 text-xs text-muted-foreground">No collections yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-muted/40 border border-border rounded-xl px-5 py-4 text-xs text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground text-sm">How relationships work</p>
        <p><strong>Direct Links</strong> — Items explicitly linked via the Knowledge Links system (item_links table)</p>
        <p><strong>Collection Memberships</strong> — Items assigned to collections (collection_items table)</p>
        <p><strong>Tag Associations</strong> — Items tagged with a shared tag (tag_items table)</p>
        <p className="text-muted-foreground/60 pt-1">Semantic / AI relationships are not implemented — all edges are explicit user actions.</p>
      </div>
    </div>
  );
}
