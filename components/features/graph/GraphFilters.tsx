'use client';

import { useEffect, useRef } from 'react';
import { Link2, Tag, Folder, X, RotateCcw } from 'lucide-react';
import { NODE_TYPE_CONFIG } from './GraphNode';
import type { GraphNodeType, GraphEdgeType } from '@/hooks/queries/use-graph';

const ALL_NODE_TYPES: GraphNodeType[] = ['note', 'inbox', 'list', 'reminder', 'collection', 'contact', 'tag'];

const EDGE_TYPE_CONFIG: Record<GraphEdgeType, {
  label: string;
  icon: typeof Link2;
  dotBg: string;
  dotBorder: string;
}> = {
  link:       { label: 'Direct Links',  icon: Link2,   dotBg: 'bg-indigo-500',  dotBorder: 'border-indigo-500' },
  collection: { label: 'In Collection', icon: Folder,  dotBg: 'bg-purple-500',  dotBorder: 'border-purple-500' },
  tag:        { label: 'Shared Tag',    icon: Tag,     dotBg: 'bg-rose-500',    dotBorder: 'border-rose-500' },
};

interface Props {
  activeNodeTypes: GraphNodeType[];
  activeEdgeTypes: GraphEdgeType[];
  onNodeTypeToggle: (t: GraphNodeType) => void;
  onEdgeTypeToggle: (t: GraphEdgeType) => void;
  totalNodes: number;
  totalEdges: number;
  onClose: () => void;
}

export function GraphFilters({
  activeNodeTypes, activeEdgeTypes,
  onNodeTypeToggle, onEdgeTypeToggle,
  totalNodes, totalEdges, onClose,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const isFiltered = activeNodeTypes.length < ALL_NODE_TYPES.length || activeEdgeTypes.length < 3;

  function resetAll() {
    ALL_NODE_TYPES.forEach(t => { if (!activeNodeTypes.includes(t)) onNodeTypeToggle(t); });
    (['link', 'collection', 'tag'] as GraphEdgeType[]).forEach(t => { if (!activeEdgeTypes.includes(t)) onEdgeTypeToggle(t); });
  }

  return (
    <div
      ref={panelRef}
      className="absolute top-14 left-3 z-30 w-52 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">Filters</span>
          <span className="text-[10px] bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 leading-none tabular-nums">
            {totalNodes} · {totalEdges}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {isFiltered && (
            <button
              type="button"
              onClick={resetAll}
              title="Reset to show all"
              className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw size={11} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      <div className="p-2 space-y-3">
        {/* Node types */}
        <div>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider px-1.5 mb-1">Node types</p>
          <div className="space-y-0.5">
            {ALL_NODE_TYPES.map(type => {
              const cfg = NODE_TYPE_CONFIG[type];
              const Icon = cfg.icon;
              const active = activeNodeTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onNodeTypeToggle(type)}
                  className="w-full flex items-center gap-2 px-1.5 py-1.5 rounded-lg text-xs transition-colors text-left hover:bg-muted/60"
                >
                  <span className={`shrink-0 w-2.5 h-2.5 rounded-full border-2 transition-all ${cfg.dotBorder} ${active ? cfg.dotBg : 'bg-transparent'}`} />
                  <Icon size={12} className={`shrink-0 ${active ? 'text-foreground' : 'text-muted-foreground'}`} />
                  <span className={active ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                    {cfg.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Edge types */}
        <div>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider px-1.5 mb-1">Relationships</p>
          <div className="space-y-0.5">
            {(Object.entries(EDGE_TYPE_CONFIG) as [GraphEdgeType, typeof EDGE_TYPE_CONFIG[GraphEdgeType]][]).map(([type, cfg]) => {
              const Icon = cfg.icon;
              const active = activeEdgeTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onEdgeTypeToggle(type)}
                  className="w-full flex items-center gap-2 px-1.5 py-1.5 rounded-lg text-xs transition-colors text-left hover:bg-muted/60"
                >
                  <span className={`shrink-0 w-2.5 h-2.5 rounded-full border-2 transition-all ${cfg.dotBorder} ${active ? cfg.dotBg : 'bg-transparent'}`} />
                  <Icon size={12} className={`shrink-0 ${active ? 'text-foreground' : 'text-muted-foreground'}`} />
                  <span className={active ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                    {cfg.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
