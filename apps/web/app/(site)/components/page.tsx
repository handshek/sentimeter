import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DocsPage } from "fumadocs-ui/layouts/notebook/page";
import { Button } from "@workspace/ui/components/button";
import { DirectoryGroups } from "@/components/landing/directory-groups";

export const metadata: Metadata = {
  title: "Feedback components and blocks for shadcn/ui",
  description:
    "Feedback components and ready-made blocks for shadcn apps: a feedback form, ratings, NPS, a survey, and blocks for error pages, menus, and cancel flows.",
  alternates: { canonical: "/components" },
  openGraph: {
    title: "Feedback components and blocks · Sentimeter",
    url: "/components",
  },
};

export default function ComponentsPage() {
  return (
    <DocsPage role="main" tabIndex={-1} full breadcrumb={{ enabled: false }}>
      <header className="docs-header">
        <h1 className="ds-page-title">Components</h1>
        <p className="ds-lead max-w-prose text-muted-foreground">
          Components are the feedback controls. Blocks are ready-made files that
          place them in one spot of your app. Both install as open code.
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
      <DirectoryGroups />
    </DocsPage>
  );
}
