import { Suspense } from 'react';
import { TimelinePageContent } from './TimelinePageContent';

export const metadata = { title: 'Timeline — Zikron' };

export default function TimelinePage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <TimelinePageContent />
    </Suspense>
  );
}
