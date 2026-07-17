'use client';

import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Calendar, ChevronLeft, ChevronRight, Filter, LayoutGrid, List, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { useCalendarEvents } from '@/hooks/queries/use-calendar';
import type { CalendarEvent, CalendarEventSource } from '@/types';

// Dynamic import to avoid SSR issues with FullCalendar
const FullCalendar = dynamic(() => import('./FullCalendarWrapper'), { ssr: false, loading: () => (
  <div className="flex-1 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
) });

type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

const SOURCE_LABELS: Record<CalendarEventSource, string> = {
  note: 'Notes',
  inbox: 'Inbox',
  contact: 'Contacts',
  reminder: 'Reminders',
  milestone: 'Milestones',
};

const SOURCE_COLORS: Record<CalendarEventSource, string> = {
  note: '#8b5cf6',
  inbox: '#3b82f6',
  contact: '#06b6d4',
  reminder: '#f59e0b',
  milestone: '#10b981',
};

interface EventDetailDrawer {
  event: CalendarEvent;
  x: number;
  y: number;
}

export function CalendarPageContent() {
  const router = useRouter();
  const [view, setView] = useState<CalendarView>('dayGridMonth');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeModules, setActiveModules] = useState<Set<CalendarEventSource>>(
    new Set(['note', 'inbox', 'contact', 'reminder', 'milestone'])
  );
  const [showFilters, setShowFilters] = useState(false);
  const [drawer, setDrawer] = useState<EventDetailDrawer | null>(null);

  // Compute date range for current view
  const { start, end } = getViewRange(currentDate, view);

  const { data: events = [], isLoading } = useCalendarEvents({ start, end });

  // Filter by active modules
  const filteredEvents = events.filter(e => activeModules.has(e.source));

  // FullCalendar event objects
  const fcEvents = filteredEvents.map(e => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
    allDay: e.allDay,
    backgroundColor: e.color,
    borderColor: e.color,
    extendedProps: e,
  }));

  const handleEventClick = useCallback((info: { event: { extendedProps: unknown }; jsEvent: MouseEvent }) => {
    const calEvent = info.event.extendedProps as CalendarEvent;
    setDrawer({ event: calEvent, x: info.jsEvent.clientX, y: info.jsEvent.clientY });
  }, []);

  const handleDatesSet = useCallback((info: { start: Date; end: Date; view: { type: string } }) => {
    setCurrentDate(info.start);
  }, []);

  const toggleModule = (source: CalendarEventSource) => {
    setActiveModules(prev => {
      const next = new Set(prev);
      if (next.has(source)) next.delete(source);
      else next.add(source);
      return next;
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold text-foreground">Calendar</h1>
          {isLoading && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View switcher */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            {([
              { value: 'dayGridMonth', label: 'Month', icon: LayoutGrid },
              { value: 'timeGridWeek', label: 'Week', icon: Calendar },
              { value: 'timeGridDay', label: 'Day', icon: Clock },
              { value: 'listWeek', label: 'List', icon: List },
            ] as { value: CalendarView; label: string; icon: React.ElementType }[]).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1 transition-colors ${
                  view === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          {/* Filter toggle */}
          <button
            type="button"
            onClick={() => setShowFilters(p => !p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              showFilters ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            <Filter size={12} />
            Filters
          </button>
        </div>
      </div>

      {/* Filter pills */}
      {showFilters && (
        <div className="flex items-center gap-2 flex-wrap p-3 bg-muted/30 rounded-xl border border-border">
          <span className="text-xs text-muted-foreground font-medium">Show:</span>
          {(Object.keys(SOURCE_LABELS) as CalendarEventSource[]).map(source => (
            <button
              key={source}
              type="button"
              onClick={() => toggleModule(source)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                activeModules.has(source)
                  ? 'text-white'
                  : 'bg-muted text-muted-foreground opacity-50'
              }`}
              style={activeModules.has(source) ? { backgroundColor: SOURCE_COLORS[source] } : undefined}
            >
              {SOURCE_LABELS[source]}
            </button>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {(Object.keys(SOURCE_LABELS) as CalendarEventSource[]).filter(s => activeModules.has(s)).map(source => (
          <div key={source} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SOURCE_COLORS[source] }} />
            <span className="text-xs text-muted-foreground">{SOURCE_LABELS[source]}</span>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="flex-1 min-h-0 rounded-xl border border-border overflow-hidden bg-card">
        <FullCalendar
          view={view}
          events={fcEvents}
          onEventClick={handleEventClick}
          onDatesSet={handleDatesSet}
        />
      </div>

      {/* Event detail drawer */}
      {drawer && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDrawer(null)} />
          <div
            className="fixed z-50 bg-card border border-border rounded-xl shadow-xl p-4 w-72 space-y-3"
            style={{
              left: Math.min(drawer.x, window.innerWidth - 300),
              top: Math.min(drawer.y + 8, window.innerHeight - 200),
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-foreground text-sm">{drawer.event.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(drawer.event.start), drawer.event.allDay ? 'MMM d, yyyy' : 'MMM d, yyyy · h:mm a')}
                </p>
              </div>
              <div
                className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                style={{ backgroundColor: drawer.event.color }}
              />
            </div>
            {drawer.event.status && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Status:</span>
                <span className="text-xs font-medium capitalize text-foreground">{drawer.event.status}</span>
              </div>
            )}
            {drawer.event.priority && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Priority:</span>
                <span className="text-xs font-medium capitalize text-foreground">{drawer.event.priority}</span>
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => { router.push(drawer.event.url); setDrawer(null); }}
                className="flex-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                Open
              </button>
              <button
                type="button"
                onClick={() => setDrawer(null)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getViewRange(date: Date, view: CalendarView): { start: string; end: string } {
  switch (view) {
    case 'dayGridMonth': {
      const s = startOfWeek(startOfMonth(date));
      const e = endOfWeek(endOfMonth(date));
      return { start: s.toISOString(), end: e.toISOString() };
    }
    case 'timeGridWeek': {
      const s = startOfWeek(date);
      const e = endOfWeek(date);
      return { start: s.toISOString(), end: e.toISOString() };
    }
    case 'timeGridDay': {
      const s = new Date(date); s.setHours(0, 0, 0, 0);
      const e = new Date(date); e.setHours(23, 59, 59, 999);
      return { start: s.toISOString(), end: e.toISOString() };
    }
    case 'listWeek':
    default: {
      const s = date;
      const e = addDays(date, 7);
      return { start: s.toISOString(), end: e.toISOString() };
    }
  }
}
