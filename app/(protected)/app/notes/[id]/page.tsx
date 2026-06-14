import { redirect } from 'next/navigation';

// Deep-link backward-compat: /app/notes/123 → /app/notes?detail=123
export default async function NoteDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/app/notes?detail=${id}`);
}
