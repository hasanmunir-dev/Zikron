import { redirect } from 'next/navigation';

// Deep-link backward-compat: /admin/my-notes/123 → /admin/my-notes?detail=123
export default async function AdminMyNoteDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/my-notes?detail=${id}`);
}
