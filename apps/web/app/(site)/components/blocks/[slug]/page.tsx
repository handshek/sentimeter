import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsPage } from "fumadocs-ui/layouts/notebook/page";
import { BlockPreview } from "@/components/docs/block-preview";
import { CodeBlock } from "@/components/docs/code-block";
import { CopyButton } from "@/components/docs/copy-button";
import { WidgetInstallCommand } from "@/components/docs/widget-install-command";
import { blockDocs, getBlockDoc, getBlockFiles } from "@/lib/block-catalog";
import { getBlockMarkdown } from "@/lib/block-markdown";
import { blockUsage } from "@/lib/block-usage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const block = getBlockDoc((await params).slug);
  if (!block) notFound();
  return {
    title: block.name,
    description: block.description,
    alternates: {
      canonical: `/components/blocks/${block.slug}`,
      types: { "text/markdown": `/components/blocks/${block.slug}/markdown` },
    },
  };
}

export function generateStaticParams() {
  return blockDocs.map((block) => ({ slug: block.slug }));
}

export default async function BlockPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const block = getBlockDoc((await params).slug);
  if (!block) notFound();
  const files = getBlockFiles(block);

  return (
    <DocsPage role="main" tabIndex={-1} full breadcrumb={{ enabled: false }}>
      <header className="docs-header">
        <p className="ds-eyebrow text-muted-foreground">
          Block · {block.situationGroup}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="ds-page-title">{block.name}</h1>
          <CopyButton
            text={getBlockMarkdown(block)}
            label="Copy as Markdown"
            className="px-2 text-xs sm:px-3 sm:text-sm"
          />
        </div>
        <p className="ds-lead text-muted-foreground">{block.description}</p>
      </header>
      <section aria-label="Preview" className="mb-12">
        <BlockPreview
          slug={block.slug}
          title={block.name}
          installCommand={block.installCommand}
          usage={blockUsage[block.slug]}
        />
        <p className="ds-caption mt-3 text-muted-foreground">
          Examples run locally. Nothing is sent or stored.
        </p>
      </section>
      <section aria-labelledby="installation" className="mb-12 space-y-4">
        <h2 id="installation" className="ds-section-title">
          Installation
        </h2>
        <WidgetInstallCommand registryName={block.registryName} />
        <p className="ds-body-sm text-muted-foreground">
          Adds{" "}
          {files.map((file, index) => (
            <span key={file}>
              {index > 0 ? ", " : ""}
              <code className="ds-code">{file}</code>
            </span>
          ))}{" "}
          and the component it uses.
        </p>
      </section>
      <section aria-labelledby="usage" className="space-y-4">
        <h2 id="usage" className="ds-section-title">
          Usage
        </h2>
        <CodeBlock code={blockUsage[block.slug]} label="Usage" />
      </section>
    </DocsPage>
  );
}
