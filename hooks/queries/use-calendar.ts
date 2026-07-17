import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CalendarEvent } from '@/types';

export const calendarKeys = {
  all: () => ['calendar'] as const,
  events: (params: Record<string, string>) => ['calendar', 'events', params] as const,
  today: () => ['calendar', 'today'] as const,
  upcoming: () => ['calendar', 'upcoming'] as const,
  overdue: () => ['calendar', 'overdue'] as const,
};

export function useCalendarEvents(params: {
  start?: string;
  end?: string;
  module?: string;
}) {
  return useQuery({
    queryKey: calendarKeys.events(params as Record<string, string>),
    queryFn: () => {
      const qs = new URLSearchParams();
      if (params.start) qs.set('start', params.start);
      if (params.end) qs.set('end', params.end);
      if (params.module) qs.set('module', params.module);
      return api.get<CalendarEvent[]>(`/api/calendar/events?${qs}`);
    },
    staleTime: 60_000,
  });
}

export function useTodayEvents() {
  return useQuery({
    queryKey: calendarKeys.today(),
    queryFn: () => api.get<CalendarEvent[]>('/api/calendar/today'),
    staleTime: 60_000,
  });
}

export function useUpcomingEvents() {
  return useQuery({
    queryKey: calendarKeys.upcoming(),
    queryFn: () => api.get<CalendarEvent[]>('/api/calendar/upcoming'),
    staleTime: 60_000,
  });
}

export function useOverdueEvents() {
  return useQuery({
    queryKey: calendarKeys.overdue(),
    queryFn: () => api.get<CalendarEvent[]>('/api/calendar/overdue'),
    staleTime: 60_000,
  });
}
