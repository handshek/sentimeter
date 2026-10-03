import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  DocsPage,
  DocsTitle,
  DocsDescription,
} from "fumadocs-ui/layouts/notebook/page";
import { Button } from "@workspace/ui/components/button";
import { widgetDocs } from "../_lib/widget-catalog";
import { WidgetDemo } from "./_components/widget-demo";

export const metadata: Metadata = {
  title: "Feedback Widgets",
  description:
    "Try Emoji Feedback, Like / Dislike, and Star Rating. Install accessible React source from the Sentimeter shadcn registry.",
  alternates: { canonical: "/components" },
};

export default function ComponentsPage() {
  return (
    <DocsPage full breadcrumb={{ enabled: false }}>
      <DocsTitle>Feedback Widgets</DocsTitle>
      <DocsDescription className="mb-2! max-w-2xl!">
        Small, accessible feedback components. Copy the source into your app,
        make it yours, and connect any backend.
      </DocsDescription>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Button asChild variant="outline" className="h-11">
          <Link href="/components/getting-started">
            Installation & Integration{" "}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">
          MIT licensed. No account required.
        </span>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {widgetDocs.map((widget) => (
          <section
            key={widget.slug}
            aria-labelledby={`title-${widget.slug}`}
            className="min-w-0 rounded-xl border border-border"
          >
            <div className="border-b bg-muted/20 px-0 py-6 min-[360px]:px-3">
              <WidgetDemo
                widget={{
                  slug: widget.slug,
                  preview: widget.preview,
                  defaultVariant: widget.defaultVariant,
                  name: widget.name,
                }}
              />
            </div>
            <div className="space-y-3 p-5">
              <h2
                id={`title-${widget.slug}`}
                className="text-lg font-semibold tracking-tight"
              >
                {widget.name}
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {widget.description}
              </p>
              <Button asChild variant="ghost" className="h-11 -ml-3">
                <Link href={`/components/${widget.slug}`}>
                  Preview & Install{" "}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
            </div>
          </section>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        All previews run locally. Nothing is sent or stored.
      </p>
    </DocsPage>
  );
}
import type { Metadata } from "next";
