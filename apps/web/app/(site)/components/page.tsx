import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DocsPage } from "fumadocs-ui/layouts/notebook/page";
import { Button } from "@workspace/ui/components/button";
import { ComponentGrid } from "@/components/docs/component-grid";

export const metadata: Metadata = {
  title: "Feedback components for shadcn/ui",
  description:
    "Accessible feedback components for shadcn apps: a feedback form, emoji, thumbs and star ratings, NPS, and a survey.",
  alternates: { canonical: "/components" },
  openGraph: {
    title: "Feedback components · Sentimeter",
    url: "/components",
  },
};

export default function ComponentsPage() {
  return (
    <DocsPage role="main" tabIndex={-1} full breadcrumb={{ enabled: false }}>
      <header className="docs-header">
        <h1 className="ds-page-title">Components</h1>
        <p className="ds-lead max-w-prose text-muted-foreground">
          Accessible feedback controls for shadcn apps. Each one installs as a
          single file you own.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button asChild variant="outline">
            <Link href="/components/getting-started">
              Read the docs <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          <span className="ds-caption text-muted-foreground">
            MIT licensed. No account required.
          </span>
        </div>
      </header>
      <ComponentGrid />
    </DocsPage>
  );
}
