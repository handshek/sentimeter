import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { widgetDocs } from "../../_lib/widget-catalog";
import { WidgetDemo } from "../../components/_components/widget-demo";
import { WidgetInstallCommand } from "../../components/_components/widget-install-command";

export function HeroSection() {
  const widget = widgetDocs[0]!;
  return (
    <section
      aria-labelledby="introduction"
      className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:py-20"
    >
      <div className="space-y-6">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span
            className="size-1.5 rounded-full bg-primary"
            aria-hidden="true"
          />
          Open source. Built for shadcn.
        </p>
        <h1
          id="introduction"
          className="max-w-xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.5rem]"
        >
          Feedback that feels like part of your app.
        </h1>
        <p className="max-w-lg text-pretty leading-7 text-muted-foreground">
          Emoji, stars, and thumbs. Accessible React widgets that use your
          theme, live in your codebase, and connect to your backend.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="h-11 px-5">
            <Link href="/components">
              Browse Widgets{" "}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 px-5">
            <Link href="/components/getting-started">Read the Docs</Link>
          </Button>
        </div>
        <p className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          {["MIT licensed", "No account needed", "Source you own"].map(
            (text) => (
              <span key={text} className="flex items-center gap-1.5">
                <Check aria-hidden="true" className="size-3.5" />
                {text}
              </span>
            ),
          )}
        </p>
      </div>
      <div className="min-w-0 space-y-3">
        <div className="rounded-xl border border-border bg-muted/20">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 text-xs text-muted-foreground">
            <span className="font-mono" translate="no">
              emoji-feedback.tsx
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="size-1.5 rounded-full bg-foreground"
                aria-hidden="true"
              />
              Live Preview
            </span>
          </div>
          <div className="px-0 py-5 min-[360px]:px-3 sm:px-6">
            <WidgetDemo
              widget={{
                slug: widget.slug,
                name: widget.name,
                preview: widget.preview,
                defaultVariant: widget.defaultVariant,
              }}
            />
          </div>
        </div>
        <WidgetInstallCommand registryName={widget.registryName} />
        <p className="text-xs leading-5 text-muted-foreground">
          Try it above. The demo runs locally; nothing is sent or stored.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-6 text-sm text-muted-foreground lg:col-span-2">
        <span>For React apps built with</span>
        {["Next.js", "Vite", "React Router", "Astro + React"].map((name) => (
          <span key={name} className="font-medium text-foreground">
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
