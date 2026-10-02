import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WidgetDocsContent } from "../_components/widget-docs-shell";
import { getWidgetDoc, widgetDocs } from "../../_lib/widget-catalog";
import { getWidgetMarkdown } from "../../_lib/widget-markdown";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const widget = getWidgetDoc((await params).slug);
  if (!widget) notFound();
  return {
    title: widget.name,
    description: widget.description,
    alternates: {
      canonical: `/components/${widget.slug}`,
      types: { "text/markdown": `/components/${widget.slug}/markdown` },
    },
  };
}

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

  return (
    <WidgetDocsContent
      key={widget.slug}
      widget={widget}
      markdown={getWidgetMarkdown(widget)}
    />
  );
}
