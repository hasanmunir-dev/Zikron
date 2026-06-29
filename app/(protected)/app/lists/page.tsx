import { Suspense } from 'react';
import { ListsPage } from '@/components/features/lists/ListsPage';

export default function AppListsPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <ListsPage />
    </Suspense>
  );
}
