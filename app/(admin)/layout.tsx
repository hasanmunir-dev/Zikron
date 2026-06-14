'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AdminGuardLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    } else if (role !== null && role !== 'admin') {
      router.replace('/app/dashboard');
    }
  }, [user, role, loading, router]);

  if (loading || role === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={24} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || role !== 'admin') return null;

  return <>{children}</>;
}
