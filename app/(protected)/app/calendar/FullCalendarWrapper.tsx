'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

interface FullCalendarWrapperProps {
  view: string;
  events: object[];
  onEventClick: (info: { event: { extendedProps: unknown }; jsEvent: MouseEvent }) => void;
  onDatesSet: (info: { start: Date; end: Date; view: { type: string } }) => void;
}

export default function FullCalendarWrapper({ view, events, onEventClick, onDatesSet }: FullCalendarWrapperProps) {
  return (
    <div className="h-full fullcalendar-wrapper">
      <style>{`
        .fullcalendar-wrapper .fc {
          height: 100%;
          font-family: inherit;
        }
        .fullcalendar-wrapper .fc-toolbar-title {
          font-size: 1rem;
          font-weight: 600;
        }
        .fullcalendar-wrapper .fc-button {
          background: transparent;
          border-color: hsl(var(--border));
          color: hsl(var(--foreground));
          text-transform: capitalize;
          font-size: 0.75rem;
          padding: 0.25rem 0.625rem;
        }
        .fullcalendar-wrapper .fc-button:hover {
          background: hsl(var(--muted));
        }
        .fullcalendar-wrapper .fc-button-active,
        .fullcalendar-wrapper .fc-button-primary:not(:disabled).fc-button-active {
          background: hsl(var(--primary));
          border-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }
        .fullcalendar-wrapper .fc-daygrid-day-number,
        .fullcalendar-wrapper .fc-col-header-cell-cushion {
          color: hsl(var(--foreground));
          text-decoration: none;
        }
        .fullcalendar-wrapper .fc-day-today {
          background: hsl(var(--primary) / 0.05) !important;
        }
        .fullcalendar-wrapper .fc-event {
          cursor: pointer;
          border-radius: 4px;
          font-size: 0.75rem;
        }
        .fullcalendar-wrapper .fc-list-event:hover td {
          background: hsl(var(--muted));
          cursor: pointer;
        }
        .fullcalendar-wrapper .fc-list-day-cushion {
          background: hsl(var(--muted) / 0.5);
        }
        .fullcalendar-wrapper .fc-scrollgrid {
          border-color: hsl(var(--border));
        }
        .fullcalendar-wrapper .fc-scrollgrid td,
        .fullcalendar-wrapper .fc-scrollgrid th {
          border-color: hsl(var(--border));
        }
        .fullcalendar-wrapper .fc-list-table td {
          border-color: hsl(var(--border));
        }
        .fullcalendar-wrapper .fc-toolbar {
          padding: 0.75rem 1rem;
          background: hsl(var(--muted) / 0.3);
        }
        .fullcalendar-wrapper .fc-theme-standard .fc-list {
          border-color: hsl(var(--border));
        }
      `}</style>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView={view}
        events={events}
        eventClick={onEventClick as never}
        datesSet={onDatesSet as never}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: '',
        }}
        height="100%"
        nowIndicator
        eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: true }}
        dayMaxEvents={4}
      />
    </div>
  );
}
