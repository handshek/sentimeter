import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { widgetDocs } from "../../_lib/widget-catalog";
import { WidgetDemo } from "../../components/_components/widget-demo";
import { HeaderSection } from "./header-section";
import { FooterSection } from "./footer-section";

export function LandingPage({
  analyticsEnabled,
}: {
  analyticsEnabled: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <a
        href="#main"
        className="sr-only fixed left-4 top-4 z-60 rounded-md bg-background p-3 focus:not-sr-only focus-visible:outline-2 focus-visible:outline-ring"
      >
        Skip to Content
      </a>
      <HeaderSection analyticsEnabled={analyticsEnabled} />
      <main
        id="main"
        className="mx-auto w-full max-w-6xl flex-1 space-y-10 px-1.5 py-8 min-[360px]:px-4 sm:px-6 sm:py-12"
      >
        <section
          aria-labelledby="introduction"
          className="space-y-5 px-2 sm:px-0"
        >
          <p className="text-sm text-muted-foreground">
            Open-source feedback widgets for shadcn apps
          </p>
          <h1
            id="introduction"
            className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            Feedback widgets.
            <br />
            Your code. Your backend.
          </h1>
          <p className="max-w-2xl text-pretty leading-7 text-muted-foreground">
            Install accessible React components into your app. Keep the source,
            match your theme, and save feedback wherever you want. No account
            required.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="h-11">
              <Link href="/components">
                Browse Widgets{" "}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11">
              <Link href="/components/getting-started">Getting Started</Link>
            </Button>
          </div>
        </section>
        <section aria-labelledby="try-widgets" className="space-y-4">
          <div className="space-y-1 px-2 sm:px-0">
            <h2
              id="try-widgets"
              className="text-xl font-semibold tracking-tight"
            >
              Try the Widgets
            </h2>
            <p className="text-sm text-muted-foreground">
              These demos run locally. Nothing is sent or stored.
            </p>
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            {widgetDocs.map((widget) => (
              <Card key={widget.slug} className="min-w-0">
                <CardHeader className="px-4">
                  <CardTitle>{widget.name}</CardTitle>
                  <CardDescription>{widget.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 px-0 min-[360px]:px-2 sm:px-4">
                  <WidgetDemo
                    widget={{
                      slug: widget.slug,
                      preview: widget.preview,
                      defaultVariant: widget.defaultVariant,
                      name: widget.name,
                    }}
                  />
                  <Button asChild variant="outline" className="h-11 w-full">
                    <Link href={`/components/${widget.slug}`}>
                      Install {widget.name}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        <section
          aria-labelledby="own-the-code"
          className="space-y-2 px-2 sm:px-0"
        >
          <h2
            id="own-the-code"
            className="text-xl font-semibold tracking-tight"
          >
            Source You Can Own
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            The shadcn command copies the widget and shared feedback system into
            your project, using your Button, Textarea, and theme tokens. Connect
            a custom submit handler to your own backend; hosted analytics is
            optional.
          </p>
        </section>
      </main>
      <FooterSection analyticsEnabled={analyticsEnabled} />
    </div>
  );
}
