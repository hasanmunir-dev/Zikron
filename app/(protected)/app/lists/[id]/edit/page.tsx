'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { listsService } from '@/lib/services/lists';
import { ListEditor } from '@/components/features/lists/ListEditor';
import type { FullList } from '@/types';

export default function EditListPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [data, setData] = useState<FullList | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listsService.get(id).then(d => {
      setData(d);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded-xl" />
          <div className="h-48 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-muted-foreground">List not found.</p>
      </div>
    );
  }

  return <ListEditor mode="edit" initialData={data} backHref={`/app/lists/${id}`} />;
}
