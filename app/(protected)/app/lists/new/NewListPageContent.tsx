'use client';

import { useSearchParams } from 'next/navigation';
import { ListEditor } from '@/components/features/lists/ListEditor';
import { useTemplate } from '@/hooks/queries/use-templates';
import { resolveTemplateVariables } from '@/utils/template-variables';

export function NewListPageContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template') ?? undefined;
  const { data: template, isLoading: templateLoading } = useTemplate(templateId);

  // Wait for template to load before rendering so ListEditor's useState initializes correctly
  if (templateId && templateLoading && !template) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  let initialTitle: string | undefined;
  let initialColumns: { name: string; sort_order: number }[] | undefined;

  if (template) {
    const resolved = resolveTemplateVariables(template);
    initialTitle = resolved.title_template ?? undefined;
    const meta = template.metadata_template as { columns?: { name: string; sort_order: number }[] } ?? {};
    if (meta.columns?.length) {
      initialColumns = meta.columns;
    }
  }

  return (
    <ListEditor
      mode="create"
      backHref="/app/lists"
      initialTitle={initialTitle}
      initialColumns={initialColumns}
    />
  );
}
