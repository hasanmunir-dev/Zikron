'use client';

import { useState } from 'react';
import { Plus, Trash2, Flag, CheckCircle2, Circle, Calendar } from 'lucide-react';
import { format, isPast } from 'date-fns';
import {
  useMilestones,
  useCreateMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
  useToggleMilestone,
} from '@/hooks/queries/use-milestones';
import type { CollectionMilestone } from '@/types';

interface Props {
  collectionId: string;
}

function MilestoneRow({
  milestone,
  collectionId,
  onDelete,
}: {
  milestone: CollectionMilestone;
  collectionId: string;
  onDelete: (id: string) => void;
}) {
  const toggle = useToggleMilestone(collectionId);
  const update = useUpdateMilestone(collectionId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(milestone.title);

  const isOverdue = milestone.due_date && isPast(new Date(milestone.due_date)) && !milestone.completed_at;

  const commitEdit = () => {
    if (draft.trim() && draft !== milestone.title) {
      update.mutate({ id: milestone.id, title: draft.trim() });
    }
    setEditing(false);
  };

  return (
    <div className="flex items-start gap-2 group py-2 px-1 rounded-lg hover:bg-muted/40 transition-colors">
      <button
        type="button"
        onClick={() => toggle.mutate(milestone.id)}
        disabled={toggle.isPending}
        className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        {milestone.completed_at ? (
          <CheckCircle2 size={16} className="text-emerald-500" />
        ) : (
          <Circle size={16} />
        )}
      </button>

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false); }}
            className="w-full text-sm bg-transparent border-b border-primary outline-none text-foreground"
          />
        ) : (
          <p
            className={`text-sm truncate cursor-pointer ${milestone.completed_at ? 'line-through text-muted-foreground' : 'text-foreground'}`}
            onClick={() => setEditing(true)}
          >
            {milestone.title}
          </p>
        )}
        {milestone.due_date && (
          <div className="flex items-center gap-1 mt-0.5">
            <Calendar size={10} className={isOverdue ? 'text-red-500' : 'text-muted-foreground'} />
            <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
              {format(new Date(milestone.due_date), 'MMM d, yyyy')}
              {isOverdue && ' · Overdue'}
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDelete(milestone.id)}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

export function CollectionMilestones({ collectionId }: Props) {
  const { data: milestones = [], isLoading } = useMilestones(collectionId);
  const create = useCreateMilestone(collectionId);
  const deleteMilestone = useDeleteMilestone(collectionId);

  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    create.mutate(
      { title: newTitle.trim(), due_date: newDueDate || null, sort_order: milestones.length },
      { onSuccess: () => { setNewTitle(''); setNewDueDate(''); setShowForm(false); } }
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this milestone?')) deleteMilestone.mutate(id);
  };

  const completed = milestones.filter(m => m.completed_at).length;
  const total = milestones.length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag size={14} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Milestones</span>
          {total > 0 && (
            <span className="text-xs text-muted-foreground">({completed}/{total})</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowForm(p => !p)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Plus size={12} />
          Add
        </button>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${(completed / total) * 100}%` }}
          />
        </div>
      )}

      {/* New milestone form */}
      {showForm && (
        <div className="space-y-2 p-3 bg-muted/30 rounded-xl border border-border">
          <input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowForm(false); }}
            placeholder="Milestone title"
            className="w-full text-sm bg-transparent border-b border-border outline-none focus:border-primary text-foreground placeholder:text-muted-foreground pb-1"
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={newDueDate}
              onChange={e => setNewDueDate(e.target.value)}
              className="flex-1 text-xs bg-card border border-border rounded-lg px-2 py-1 outline-none focus:border-primary text-foreground"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={!newTitle.trim() || create.isPending}
              className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {create.isPending ? 'Adding…' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Milestone list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : milestones.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No milestones yet. Add one to track goals.</p>
      ) : (
        <div className="divide-y divide-border/50">
          {milestones.map(m => (
            <MilestoneRow
              key={m.id}
              milestone={m}
              collectionId={collectionId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
