import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  MousePointer2,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { WidgetInstallCommand } from "../../components/_components/widget-install-command";
import { WidgetSpecimen } from "./widget-specimen";

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
                Find your widget{" "}
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
          <div className="ds-panel">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4">
              <span className="ds-label text-muted-foreground">
                A moment in your product
              </span>
              <Badge variant="secondary" className="h-6 px-2.5">
                Live example
              </Badge>
            </div>
            <div className="bg-muted/35 px-0 pt-8 pb-3 sm:px-8">
              <div className="mx-auto mb-7 flex max-w-80 items-start gap-3 px-4 sm:px-0">
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-primary"
                />
                <div>
                  <p className="ds-label text-foreground">
                    Your workspace is ready
                  </p>
                  <p className="ds-caption mt-1 text-muted-foreground">
                    The perfect moment to ask how it felt.
                  </p>
                </div>
              </div>
              <div className="min-h-64">
                <WidgetSpecimen showInput />
              </div>
            </div>
            <div className="ds-caption flex items-start gap-2 border-t border-border px-5 py-3 text-muted-foreground">
              <MousePointer2
                aria-hidden="true"
                className="mt-0.5 size-3.5 shrink-0"
              />
              Try a reaction. This example runs locally and stores nothing.
            </div>
          </div>
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
            Explore the collection{" "}
            <ArrowDown aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
