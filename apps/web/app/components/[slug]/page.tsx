import { notFound } from "next/navigation";
import { WidgetDocsShell } from "../_components/widget-docs-shell";
import { getWidgetDoc, widgetDocs } from "../_components/widget-docs-data";

export function generateStaticParams() {
  return widgetDocs.map((widget) => ({ slug: widget.slug }));
}

export default async function WidgetDocsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const widget = getWidgetDoc(slug);

  if (!widget) notFound();

  return <WidgetDocsShell widget={widget} />;
}
