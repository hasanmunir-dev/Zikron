import { redirect } from 'next/navigation';

// Deep-link backward-compat: /admin/users/123 → /admin/users?detail=123
export default async function AdminUserDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/users?detail=${id}`);
}
