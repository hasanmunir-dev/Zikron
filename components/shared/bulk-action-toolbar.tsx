'use client';

import { X, CheckSquare } from 'lucide-react';

export interface BulkAction {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

interface Props {
  count: number;
  total: number;
  actions: BulkAction[];
  onClear: () => void;
  onSelectAll: () => void;
}

export function BulkActionToolbar({ count, total, actions, onClear, onSelectAll }: Props) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 flex items-center gap-1.5 rounded-xl border border-border bg-card shadow-xl px-3 py-2 animate-in slide-in-from-bottom-3 duration-200 max-w-[calc(100vw-2rem)] flex-wrap justify-center">
      {/* Count + select-all */}
      <div className="flex items-center gap-2 pr-2 border-r border-border shrink-0">
        <span className="text-sm font-semibold text-foreground tabular-nums">{count}</span>
        <span className="text-sm text-muted-foreground hidden sm:inline">selected</span>
        {count < total && (
          <button
            type="button"
            onClick={onSelectAll}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors ml-1"
          >
            <CheckSquare size={13} />
            <span className="hidden sm:inline">All {total}</span>
          </button>
        )}
      </div>

      {/* Actions */}
      {actions.map((action) => {
        const Icon = action.icon;
        const isDestructive = action.variant === 'destructive';
        return (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isDestructive
                ? 'text-destructive hover:bg-destructive/10'
                : 'text-foreground hover:bg-muted'
            }`}
          >
            <Icon size={13} className="shrink-0" />
            <span>{action.label}</span>
          </button>
        );
      })}

      {/* Clear */}
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear selection"
        className="ml-1 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}
