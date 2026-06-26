import { Suspense } from 'react';
import { ListsPage } from '@/components/features/lists/ListsPage';

export default function AppListsPage() {
  return (
    <Suspense>
      <ListsPage />
    </Suspense>
  );
}
