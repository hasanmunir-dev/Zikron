import { Suspense } from 'react';
import { NotesPage } from '@/components/features/notes/NotesPage';

// Suspense required because NotesPage reads useSearchParams() internally.
export default function AppNotesPage() {
  return (
    <Suspense>
      <NotesPage basePath="/app/notes" />
    </Suspense>
  );
}
