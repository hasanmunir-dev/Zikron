'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GitBranch, Calendar, Clock, CheckCircle2, AlertCircle, Circle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/utils/date';
import type { ActivityLog, CalendarEvent } from '@/types';

interface TimelineData {
  activities: ActivityLog[];
  scheduled: CalendarEvent[];
}

const ACTION_COLORS: Record<string, string> = {
  created: 'text-emerald-500',
  updated: 'text-blue-500',
  deleted: 'text-red-500',
  restored: 'text-violet-500',
  completed: 'text-emerald-500',
  cancelled: 'text-slate-400',
  shared: 'text-cyan-500',
  imported: 'text-amber-500',
  archived: 'text-slate-400',
  favorited: 'text-amber-500',
};

const SOURCE_COLORS: Record<string, string> = {
  note: 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400',
  inbox: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400',
  contact: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400',
  reminder: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400',
  milestone: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400',
};

type Tab = 'all' | 'scheduled' | 'activity';

function formatEventDate(dateStr: string, allDay: boolean): string {
  const date = new Date(dateStr);
  if (isToday(date)) return allDay ? 'Today' : `Today at ${format(date, 'h:mm a')}`;
  if (isTomorrow(date)) return allDay ? 'Tomorrow' : `Tomorrow at ${format(date, 'h:mm a')}`;
  return allDay ? format(date, 'MMM d') : format(date, 'MMM d · h:mm a');
}

export function TimelinePageContent() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['calendar', 'timeline'],
    queryFn: () => api.get<TimelineData>('/api/calendar/timeline'),
    staleTime: 60_000,
  });

  const activities = data?.activities ?? [];
  const scheduled = data?.scheduled ?? [];

  const tabs: { value: Tab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'scheduled', label: `Scheduled (${scheduled.length})` },
    { value: 'activity', label: `Activity (${activities.length})` },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold text-foreground">Timeline</h1>
          {isLoading && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border pb-0">
        {tabs.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.value ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-6">
        {(tab === 'all' || tab === 'scheduled') && scheduled.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Calendar size={12} />
              Upcoming (next 30 days)
            </h2>
            <div className="space-y-2">
              {scheduled.map(event => {
                const overdue = isPast(new Date(event.start)) && event.status !== 'completed';
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => router.push(event.url)}
                    className="w-full flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="mt-0.5 shrink-0">
                      {event.status === 'completed' ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      ) : overdue ? (
                        <AlertCircle size={16} className="text-red-500" />
                      ) : (
                        <Circle size={16} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${event.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {event.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock size={10} className={overdue ? 'text-red-500' : 'text-muted-foreground'} />
                        <span className={`text-xs ${overdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                          {formatEventDate(event.start, event.allDay)}
                        </span>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full capitalize ${SOURCE_COLORS[event.source] ?? 'bg-muted text-muted-foreground'}`}>
                          {event.source}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {(tab === 'all' || tab === 'activity') && activities.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Clock size={12} />
              Recent Activity
            </h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-3.5 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-1">
                {activities.map(log => (
                  <div key={log.id} className="flex gap-3 pl-8 relative">
                    <div className="absolute left-2.5 top-2.5 w-2 h-2 rounded-full bg-border ring-2 ring-card shrink-0" />
                    <div className="flex-1 py-2">
                      <p className="text-sm text-foreground">
                        <span className={`font-medium ${ACTION_COLORS[log.action] ?? 'text-foreground'} capitalize`}>
                          {log.action}
                        </span>
                        {log.item_title && (
                          <span className="text-muted-foreground"> · {log.item_title}</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(log.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {!isLoading && scheduled.length === 0 && activities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <GitBranch className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No timeline entries yet.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Schedule items and activity will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
