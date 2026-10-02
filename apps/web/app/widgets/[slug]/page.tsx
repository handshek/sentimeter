import { redirect } from "next/navigation";
import { widgetDocs } from "../../_lib/widget-catalog";

export function generateStaticParams() {
  return widgetDocs.map((widget) => ({ slug: widget.slug }));
}

export default async function WidgetDocsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/components/${slug}`);
}
