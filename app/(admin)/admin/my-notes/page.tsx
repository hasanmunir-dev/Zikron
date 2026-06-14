import { Suspense } from 'react';
import { NotesPage } from '@/components/features/notes/NotesPage';

export default function AdminMyNotesPage() {
  return (
    <Suspense>
      <NotesPage basePath="/admin/my-notes" />
    </Suspense>
  );
}
