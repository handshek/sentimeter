import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WidgetDocsContent } from "@/components/docs/widget-docs-content";
import { getWidgetDoc, widgetDocs } from "@/lib/widget-catalog";
import { getWidgetMarkdown } from "@/lib/widget-markdown";
import { DocsPage } from "fumadocs-ui/layouts/notebook/page";
import { widgetToc } from "@/lib/docs-navigation";
import { CopyButton } from "@/components/docs/copy-button";

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
    <DocsPage
      role="main"
      tabIndex={-1}
      toc={widgetToc}
      breadcrumb={{ enabled: false }}
      tableOfContentPopover={{ enabled: false }}
    >
      <header className="docs-header">
        <p className="ds-eyebrow text-muted-foreground">Feedback widgets</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="ds-page-title">{widget.name}</h1>
          <CopyButton
            text={getWidgetMarkdown(widget)}
            label="Copy as Markdown"
            className="px-2 text-xs sm:px-3 sm:text-sm"
          />
        </div>
        <p className="ds-lead text-muted-foreground">{widget.description}</p>
      </header>
      <WidgetDocsContent key={widget.slug} widget={widget} />
    </DocsPage>
  );
}
