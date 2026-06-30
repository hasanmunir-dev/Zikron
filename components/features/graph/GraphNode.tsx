'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { FileText, Inbox, Table2, Bell, FolderOpen, User, Hash } from 'lucide-react';
import type { GraphNodeType } from '@/hooks/queries/use-graph';

export const NODE_TYPE_CONFIG: Record<GraphNodeType, {
  label: string;
  icon: typeof FileText;
  chip: string;      // pill background + text + border
  hex: string;       // solid hex for MiniMap nodeColor
  ring: string;      // highlight glow shadow
  dotBg: string;     // active dot fill (Tailwind bg-*)
  dotBorder: string; // dot border (Tailwind border-*)
}> = {
  note:       { label: 'Note',       icon: FileText,   chip: 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',             hex: '#3b82f6', ring: 'shadow-[0_0_0_3px_#3b82f6,0_0_16px_#3b82f640]',   dotBg: 'bg-blue-500',    dotBorder: 'border-blue-500' },
  inbox:      { label: 'Inbox',      icon: Inbox,      chip: 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600',       hex: '#64748b', ring: 'shadow-[0_0_0_3px_#64748b,0_0_16px_#64748b40]',   dotBg: 'bg-slate-500',   dotBorder: 'border-slate-500' },
  list:       { label: 'List',       icon: Table2,     chip: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700', hex: '#6366f1', ring: 'shadow-[0_0_0_3px_#6366f1,0_0_16px_#6366f140]',   dotBg: 'bg-indigo-500',  dotBorder: 'border-indigo-500' },
  reminder:   { label: 'Reminder',   icon: Bell,       chip: 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700',       hex: '#f59e0b', ring: 'shadow-[0_0_0_3px_#f59e0b,0_0_16px_#f59e0b40]',   dotBg: 'bg-amber-500',   dotBorder: 'border-amber-500' },
  collection: { label: 'Collection', icon: FolderOpen, chip: 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700', hex: '#a855f7', ring: 'shadow-[0_0_0_3px_#a855f7,0_0_16px_#a855f740]',   dotBg: 'bg-purple-500',  dotBorder: 'border-purple-500' },
  contact:    { label: 'Contact',    icon: User,       chip: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700', hex: '#10b981', ring: 'shadow-[0_0_0_3px_#10b981,0_0_16px_#10b98140]', dotBg: 'bg-emerald-500', dotBorder: 'border-emerald-500' },
  tag:        { label: 'Tag',        icon: Hash,       chip: 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700',             hex: '#f43f5e', ring: 'shadow-[0_0_0_3px_#f43f5e,0_0_16px_#f43f5e40]',   dotBg: 'bg-rose-500',    dotBorder: 'border-rose-500' },
};

export interface ZikronNodeData extends Record<string, unknown> {
  label: string;
  nodeType: GraphNodeType;
  is_favorite?: boolean;
  highlighted?: boolean;
  dimmed?: boolean;
}

// Invisible handles at all 4 positions so edges can route from any direction
const HANDLE_CLASS = '!w-1 !h-1 !min-w-0 !min-h-0 !opacity-0 !border-0 !bg-transparent !pointer-events-none';

export const ZikronGraphNode = memo(({ data }: NodeProps) => {
  const nd = data as ZikronNodeData;
  const config = NODE_TYPE_CONFIG[nd.nodeType] ?? NODE_TYPE_CONFIG.note;
  const Icon = config.icon;

  return (
    <>
      <Handle type="target" position={Position.Top}    className={HANDLE_CLASS} />
      <Handle type="target" position={Position.Left}   className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Right}  className={HANDLE_CLASS} />

      <div
        className={`
          max-w-[180px] flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full border
          text-xs font-medium whitespace-nowrap select-none cursor-pointer
          transition-all duration-150
          ${config.chip}
          ${nd.highlighted ? config.ring : 'shadow-sm'}
          ${nd.dimmed ? 'opacity-20 scale-95' : ''}
        `}
      >
        <span className="shrink-0 flex items-center">
          <Icon size={11} strokeWidth={2.2} />
        </span>
        <span className="max-w-[140px] truncate leading-none">
          {nd.label}
        </span>
      </div>
    </>
  );
});

ZikronGraphNode.displayName = 'ZikronGraphNode';
