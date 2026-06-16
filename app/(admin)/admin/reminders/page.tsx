import { Bell } from 'lucide-react';

export default function AdminRemindersPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Reminders</h2>
        <p className="text-sm text-muted-foreground mt-0.5">All user reminders across the platform.</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-5">
          <Bell size={30} className="text-muted-foreground/40" />
        </div>
        <p className="text-base font-semibold text-foreground mb-2">Coming in Phase 2</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Admin visibility into user reminders will be available when the Reminders module is built.
        </p>
      </div>
    </div>
  );
}
