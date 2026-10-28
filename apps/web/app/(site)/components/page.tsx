import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DocsPage } from "fumadocs-ui/layouts/notebook/page";
import { Button } from "@workspace/ui/components/button";
import { widgetDocs } from "@/lib/widget-catalog";
import { WidgetDemo } from "@/components/docs/widget-demo";

export const metadata: Metadata = {
  title: "Feedback Widgets",
  description:
    "Try Emoji Feedback, Like / Dislike, and Star Rating. Install accessible React source from the Sentimeter shadcn registry.",
  alternates: { canonical: "/components" },
};

export default function ComponentsPage() {
  return (
    <DocsPage role="main" tabIndex={-1} full breadcrumb={{ enabled: false }}>
      <header className="docs-header">
        <p className="ds-eyebrow text-muted-foreground">
          The component library
        </p>
        <h1 className="ds-page-title">Small asks. Useful answers.</h1>
        <p className="ds-lead max-w-prose text-muted-foreground">
          Feedback widgets that belong in your product. Try the interaction,
          install the source, and make it yours.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button asChild variant="outline">
            <Link href="/components/getting-started">
              Installation & Integration{" "}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          <span className="ds-caption text-muted-foreground">
            MIT licensed. No account required.
          </span>
        </div>
      </header>
      <div className="grid gap-6 xl:grid-cols-2">
        {widgetDocs.map((widget) => (
          <section
            key={widget.slug}
            aria-labelledby={`title-${widget.slug}`}
            className="ds-panel min-w-0 overflow-hidden"
          >
            <div className="docs-preview border-b px-0 py-8 min-[360px]:px-3">
              <WidgetDemo
                widget={{
                  slug: widget.slug,
                  preview: widget.preview,
                  defaultVariant: widget.defaultVariant,
                  name: widget.name,
                }}
              />
            </div>
            <div className="space-y-3 p-6">
              <h2 id={`title-${widget.slug}`} className="ds-title">
                {widget.name}
              </h2>
              <p className="ds-body text-muted-foreground">
                {widget.description}
              </p>
              <Button asChild variant="ghost" className="-ml-3">
                <Link href={`/components/${widget.slug}`}>
                  Preview & Install{" "}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
            </div>
          </section>
        ))}
      </div>
      <p className="ds-caption mt-5 text-muted-foreground">
        All previews run locally. Nothing is sent or stored.
      </p>
      <aside className="ds-inset mt-10 flex flex-wrap items-center justify-between gap-6 p-6">
        <div className="max-w-xl space-y-2">
          <p className="ds-label">
            One visual language, throughout the product.
          </p>
          <p className="ds-body text-muted-foreground">
            Explore the typography, color, spacing, and composition rules behind
            Sentimeter’s website and components.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/design-system">
            Explore the system{" "}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      </aside>
    </DocsPage>
  );
}
