'use client';

import { use } from 'react';
import { UserDetailPanel } from '@/components/admin/UserDetailPanel';

export default function AdminUserModalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <UserDetailPanel userId={id} listRoute="/admin/users" />;
}
