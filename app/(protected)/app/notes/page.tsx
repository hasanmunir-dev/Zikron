import { Suspense } from 'react';
import { NotesPage } from '@/components/features/notes/NotesPage';

// Suspense required because NotesPage reads useSearchParams() internally.
export default function AppNotesPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <NotesPage basePath="/app/notes" />
    </Suspense>
  );
}
