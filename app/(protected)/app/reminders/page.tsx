import { Bell, Clock, Repeat } from 'lucide-react';

const upcoming = [
  { icon: Clock, title: 'Time-based reminders', desc: 'Set a specific date and time to be reminded.' },
  { icon: Bell, title: 'Smart notifications', desc: 'Get notified in the app and optionally via email.' },
  { icon: Repeat, title: 'Recurring reminders', desc: 'Daily, weekly, or custom repeat schedules.' },
];

export default function RemindersPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground">Reminders</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Never forget what matters.</p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-2xl p-8 text-center mb-8">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Bell size={28} className="text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Coming in Phase 2</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Reminders are being built. You'll be able to attach time-based reminders to your notes, inbox items, and messages.
        </p>
      </div>

      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">What's coming</h4>
      <div className="space-y-3">
        {upcoming.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-4 bg-card border border-border rounded-xl p-4">
            <div className="w-9 h-9 bg-amber-50 dark:bg-amber-950/40 rounded-lg flex items-center justify-center shrink-0">
              <Icon size={17} className="text-amber-500" />
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
