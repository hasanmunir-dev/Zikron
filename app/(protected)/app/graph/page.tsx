'use client';

import { Network } from 'lucide-react';
import { GraphCanvas } from '@/components/features/graph/GraphCanvas';

export default function GraphPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-57px)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3.5 border-b border-border shrink-0 bg-card">
        <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center">
          <Network size={14} className="text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h1 className="text-base font-bold text-foreground leading-none">Knowledge Graph</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Visualize how your knowledge is connected</p>
        </div>
      </div>

      {/* Full-height canvas */}
      <div className="flex-1 min-h-0">
        <GraphCanvas />
      </div>
    </div>
  );
}
