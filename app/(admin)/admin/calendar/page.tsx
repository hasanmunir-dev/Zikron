'use client';

import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Clock, AlertCircle, Flag, CheckCircle2, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';

interface CalendarMetrics {
  scheduledNotes: number;
  followUpInbox: number;
  followUpContacts: number;
  upcomingReminders: number;
  overdueReminders: number;
  totalMilestones: number;
  completedMilestones: number;
  overdueMilestones: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-2">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={16} className="text-white" />
      </div>
      <div className="text-2xl font-bold text-foreground">{value.toLocaleString()}</div>
      <div className="text-xs text-muted-foreground font-medium">{label}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

export default function AdminCalendarPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'calendar', 'metrics'],
    queryFn: () => api.get<CalendarMetrics>('/api/admin/calendar/metrics'),
    staleTime: 60_000,
  });

  const milestoneCompletionRate = data && data.totalMilestones > 0
    ? Math.round((data.completedMilestones / data.totalMilestones) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold text-foreground">Calendar Metrics</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-2">
              <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Scheduling stats */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">Scheduled Items</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <StatCard
                label="Scheduled Notes"
                value={data?.scheduledNotes ?? 0}
                icon={CalendarDays}
                color="bg-violet-500"
                sub="Notes with scheduled_at set"
              />
              <StatCard
                label="Inbox Follow-ups"
                value={data?.followUpInbox ?? 0}
                icon={Clock}
                color="bg-blue-500"
                sub="Inbox items with follow_up_at"
              />
              <StatCard
                label="Contact Follow-ups"
                value={data?.followUpContacts ?? 0}
                icon={Clock}
                color="bg-cyan-500"
                sub="Contacts with follow_up_at"
              />
              <StatCard
                label="Upcoming Reminders"
                value={data?.upcomingReminders ?? 0}
                icon={CalendarDays}
                color="bg-amber-500"
                sub="Due in next 7 days"
              />
            </div>
          </section>

          {/* Overdue */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">Overdue</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <StatCard
                label="Overdue Reminders"
                value={data?.overdueReminders ?? 0}
                icon={AlertCircle}
                color={data?.overdueReminders ? 'bg-red-500' : 'bg-slate-400'}
                sub="Pending reminders past due date"
              />
              <StatCard
                label="Overdue Milestones"
                value={data?.overdueMilestones ?? 0}
                icon={AlertCircle}
                color={data?.overdueMilestones ? 'bg-red-500' : 'bg-slate-400'}
                sub="Milestones past due, not complete"
              />
            </div>
          </section>

          {/* Milestones */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">Collection Milestones</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Milestones"
                value={data?.totalMilestones ?? 0}
                icon={Flag}
                color="bg-fuchsia-500"
              />
              <StatCard
                label="Completed"
                value={data?.completedMilestones ?? 0}
                icon={CheckCircle2}
                color="bg-emerald-500"
              />
              <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500">
                  <TrendingUp size={16} className="text-white" />
                </div>
                <div className="text-2xl font-bold text-foreground">{milestoneCompletionRate}%</div>
                <div className="text-xs text-muted-foreground font-medium">Completion Rate</div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${milestoneCompletionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
