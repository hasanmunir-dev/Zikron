import { FolderOpen, Tags, Link as LinkIcon, Share2 } from 'lucide-react';

const upcoming = [
  { icon: FolderOpen, title: 'Smart collections', desc: 'Group notes, inbox items, and messages into named collections.' },
  { icon: Tags, title: 'Tag-based organization', desc: 'Auto-collect items by tag for instant organization.' },
  { icon: LinkIcon, title: 'Linked content', desc: 'Connect related notes and items across your workspace.' },
  { icon: Share2, title: 'Shareable collections', desc: 'Share a curated collection with a link.' },
];

export default function CollectionsPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground">Collections</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Organize your knowledge into curated groups.</p>
      </div>

      <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/50 rounded-2xl p-8 text-center mb-8">
        <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FolderOpen size={28} className="text-violet-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Coming in Phase 2</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Collections let you curate and group your saved content by project, topic, or anything you choose.
        </p>
      </div>

      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">What's coming</h4>
      <div className="space-y-3">
        {upcoming.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-4 bg-card border border-border rounded-xl p-4">
            <div className="w-9 h-9 bg-violet-50 dark:bg-violet-950/40 rounded-lg flex items-center justify-center shrink-0">
              <Icon size={17} className="text-violet-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
