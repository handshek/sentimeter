import Link from "next/link";
import { ArrowDown, ArrowRight, Check } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { WidgetInstallCommand } from "@/components/docs/widget-install-command";
import { WidgetDemo } from "@/components/docs/widget-demo";
import { widgetDocs } from "@/lib/widget-catalog";

export function HeroSection() {
  return (
    <section aria-labelledby="introduction" className="ds-container">
      <div className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div>
          <p className="ds-eyebrow mb-6 flex items-center gap-2.5 text-muted-foreground">
            <span
              className="size-1.5 rounded-full bg-brand"
              aria-hidden="true"
            />
            Open code. Built for shadcn.
          </p>
          <h1 id="introduction" className="ds-display max-w-xl text-balance">
            A little feedback.
            <br />A better product.
          </h1>
          <p className="ds-lead mt-7 max-w-md text-pretty text-muted-foreground">
            Thoughtful feedback components that feel like part of your app.
            Install the source. Make it yours. Start listening.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/components">
                Browse components{" "}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/components/getting-started">Read the docs</Link>
            </Button>
          </div>
          <div className="ds-caption mt-6 flex flex-wrap gap-x-5 gap-y-2 text-muted-foreground">
            {["MIT licensed", "No account required"].map((label) => (
              <span key={label} className="flex items-center gap-1.5">
                <Check aria-hidden="true" className="size-3.5" />
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="min-w-0">
          <WidgetDemo widget={widgetDocs[0]!} />
          <div className="mt-4">
            <WidgetInstallCommand registryName="emoji-feedback" />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-5 border-t border-border py-6">
        <p className="ds-caption text-muted-foreground">
          React components. Your theme. Your backend.
        </p>
        <Button
          asChild
          variant="ghost"
          className="gap-3 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
        >
          <Link href="#widgets">
            Explore the components{" "}
            <ArrowDown aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
