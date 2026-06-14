import { ListDetailView } from '@/components/features/lists/ListDetailView';

export default async function ListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ListDetailView id={id} />;
}
