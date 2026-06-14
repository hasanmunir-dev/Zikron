import { redirect } from 'next/navigation';

// Deep-link backward-compat: /app/notes/new → /app/notes?create=true
export default function NewNoteRedirect() {
  redirect('/app/notes?create=true');
}
