import { ListEditor } from '@/components/features/lists/ListEditor';

export default function NewListPage() {
  return <ListEditor mode="create" backHref="/app/lists" />;
}
