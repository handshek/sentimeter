import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { REPOSITORY_URL } from "../../_lib/widget-catalog";

export function HeaderSection({
  analyticsEnabled,
}: {
  analyticsEnabled: boolean;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:px-6">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-md text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-ring"
        >
          Sentimeter
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1">
          <Button asChild variant="ghost" className="h-11">
            <Link href="/components">Widgets</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="hidden h-11 sm:inline-flex"
          >
            <Link href="/components/getting-started">Getting Started</Link>
          </Button>
          {analyticsEnabled && (
            <Button
              asChild
              variant="ghost"
              className="hidden h-11 text-muted-foreground md:inline-flex"
            >
              <Link href="/dashboard">Analytics</Link>
            </Button>
          )}
          <Button asChild variant="ghost" size="icon" className="size-11">
            <a href={REPOSITORY_URL} aria-label="Sentimeter on GitHub">
              <Github aria-hidden="true" className="size-5" />
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
