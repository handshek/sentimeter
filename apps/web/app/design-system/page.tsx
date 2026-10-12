import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { WidgetDemo } from "../components/_components/widget-demo";
import { widgetDocs } from "../_lib/widget-catalog";
import { chapterHref, systemChapters } from "./_lib/catalog";
import { SystemHeading, SystemSection } from "./_components/system-section";

export const metadata: Metadata = {
  title: "Design system",
  alternates: { canonical: "/design-system" },
};

export default function DesignSystemOverview() {
  return (
    <>
      <SystemHeading
        title="Thoughtful by design."
        description="One shared language for everything we make. From the first headline to the smallest feedback button, the details should feel like they belong together."
      />
      <SystemSection
        id="in-practice"
        title="A system you can see at work."
        description="The same type, spacing, surfaces, and interaction rules carry from the website into the product."
      >
        <div className="ds-panel overflow-hidden">
          <div className="ds-caption flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3 text-muted-foreground">
            <span>Sentimeter / Product moment</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-success" /> Live
              components
            </span>
          </div>
          <div className="grid min-w-0 gap-8 py-5 sm:p-8 xl:grid-cols-[1fr_288px] xl:items-center">
            <div className="min-w-0 space-y-5 px-5 sm:p-0">
              <p className="ds-eyebrow text-muted-foreground">
                Small moments. Better products.
              </p>
              <h3 className="ds-section-title max-w-sm">
                Make room
                <br className="hidden sm:block" /> for a little feedback.
              </h3>
              <p className="ds-body max-w-sm text-muted-foreground">
                Clear words, considered space, and a simple way to respond.
                Every part has a purpose.
              </p>
              <div className="ds-label flex items-center gap-2 text-muted-foreground">
                <Check className="size-4 text-success" aria-hidden="true" />{" "}
                Open code. Your product’s voice.
              </div>
            </div>
            <div className="min-w-0 rounded-lg bg-muted/60 sm:p-4 xl:-mr-4">
              <WidgetDemo
                widget={widgetDocs[0]!}
                options={{ showInput: true }}
              />
            </div>
          </div>
        </div>
        <p className="ds-caption text-muted-foreground">
          Try the widget. This example completes locally and stores no feedback.
        </p>
      </SystemSection>
      <SystemSection
        id="principles"
        title="Quiet foundations. Richer composition."
      >
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-3">
            <p className="ds-eyebrow text-muted-foreground">
              01 / Familiar by default
            </p>
            <h3 className="ds-title">Build on what already works.</h3>
            <p className="ds-body text-muted-foreground">
              Geist typography, shadcn primitives, and Lucide icons make a
              dependable base. Neutral surfaces keep attention on the content;
              color signals an action or a state.
            </p>
          </div>
          <div className="space-y-3">
            <p className="ds-eyebrow text-muted-foreground">
              02 / Intent in the details
            </p>
            <h3 className="ds-title">Compose with a shared rhythm.</h3>
            <p className="ds-body text-muted-foreground">
              Type has a role. Space expresses a relationship. Components share
              their edges, alignment, and states, whether they appear on a
              landing page or inside a form.
            </p>
          </div>
        </div>
      </SystemSection>
      <SystemSection
        id="chapters"
        title="Explore the system."
        description="Start with the foundations, then see how they come together in working interfaces."
      >
        <ol className="divide-y divide-border border-y border-border">
          {systemChapters
            .filter((chapter) => chapter.slug)
            .map((chapter, index) => (
              <li key={chapter.slug}>
                <Link
                  href={chapterHref(chapter.slug)}
                  className="group grid grid-cols-[24px_minmax(0,1fr)_20px] items-start gap-4 rounded-sm py-5 transition-colors hover:bg-muted/50 focus-visible:ds-focus sm:grid-cols-[36px_minmax(0,1fr)_20px]"
                >
                  <span className="ds-code pt-0.5 text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-medium tracking-tight">
                      {chapter.title}
                    </h3>
                    <p className="ds-label font-normal leading-6 text-muted-foreground">
                      {chapter.description}
                    </p>
                  </div>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="mt-0.5 size-4 text-muted-foreground transition-colors group-hover:text-foreground"
                  />
                </Link>
              </li>
            ))}
        </ol>
      </SystemSection>
      <SystemSection
        id="across-sentimeter"
        title="The same language, in context."
        description="These foundations are shared by the real website and documentation, as well as the examples on these pages."
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/">
              Landing page{" "}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/components/getting-started">
              Documentation{" "}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/design-system/patterns">
              See product patterns{" "}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>
      </SystemSection>
    </>
  );
}
