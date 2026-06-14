import { redirect } from 'next/navigation';

// Deep-link backward-compat: /admin/notes/123 → /admin/notes?detail=123
export default async function AdminNoteDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/notes?detail=${id}`);
}
