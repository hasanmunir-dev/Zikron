import { redirect } from 'next/navigation';

// Deep-link backward-compat: /admin/my-notes/new → /admin/my-notes?create=true
export default function AdminNewMyNoteRedirect() {
  redirect('/admin/my-notes?create=true');
}
