import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WidgetDocsContent } from "../_components/widget-docs-content";
import { getWidgetDoc, widgetDocs } from "../../_lib/widget-catalog";
import { getWidgetMarkdown } from "../../_lib/widget-markdown";
import {
  DocsPage,
  DocsTitle,
  DocsDescription,
} from "fumadocs-ui/layouts/notebook/page";
import { widgetToc } from "../../_lib/docs-navigation";
import { CopyButton } from "../_components/copy-button";

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
      className="xl:pt-8!"
      toc={widgetToc}
      breadcrumb={{ enabled: false }}
      tableOfContentPopover={{ enabled: false }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <DocsTitle className="text-2xl! tracking-tight sm:text-3xl!">
          {widget.name}
        </DocsTitle>
        <CopyButton
          text={getWidgetMarkdown(widget)}
          label="Copy as Markdown"
          className="px-2 text-xs sm:px-3 sm:text-sm"
        />
      </div>
      <DocsDescription className="mb-2! text-sm! leading-6 sm:text-base!">
        {widget.description}
      </DocsDescription>
      <WidgetDocsContent key={widget.slug} widget={widget} />
    </DocsPage>
  );
}
