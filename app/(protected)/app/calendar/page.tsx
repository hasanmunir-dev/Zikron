import { Suspense } from 'react';
import { CalendarPageContent } from './CalendarPageContent';

export const metadata = { title: 'Calendar — Zikron' };

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <CalendarPageContent />
    </Suspense>
  );
}
