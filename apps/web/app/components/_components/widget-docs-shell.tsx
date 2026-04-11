"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { cn } from "@workspace/ui/lib/utils";
import {
  ArrowLeft,
  Check,
  Copy,
  Smile,
  Star,
  Terminal,
  ThumbsUp,
} from "lucide-react";
import {
  EmojiFeedback,
  LikeDislike,
  StarRating,
  type WidgetSubmit,
} from "@repo/widgets";
import {
  overviewSections,
  widgetDocs,
  type WidgetDocConfig,
} from "./widget-docs-data";

const mockSubmit: WidgetSubmit = () =>
  new Promise<void>((resolve) => setTimeout(resolve, 500));

function docsHref(slug?: string) {
  return slug ? `/components/${slug}` : "/components";
}

function railHref(id: string) {
  return `/components#${id}`;
}

export function WidgetIcon({
  kind,
  className,
}: {
  kind: WidgetDocConfig["icon"];
  className?: string;
}) {
  switch (kind) {
    case "emoji":
      return <Smile className={cn("h-6 w-6", className)} />;
    case "thumbs":
      return <ThumbsUp className={cn("h-6 w-6", className)} />;
    case "star":
      return <Star className={cn("h-6 w-6", className)} />;
  }
}

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = React.useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          // noop
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-1.5 transition-colors hover:bg-muted",
        className,
      )}
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function HighlightedCode({
  code,
  lang = "tsx",
}: {
  code: string;
  lang?: string;
}) {
  const [html, setHtml] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    import("shiki")
      .then(({ codeToHtml }) =>
        codeToHtml(code, {
          lang,
          theme: "tokyo-night",
        }),
      )
      .then((result) => {
        if (!cancelled) setHtml(result);
      })
      .catch((err) => console.error("Shiki error:", err));

    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  if (!html) {
    return (
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-zinc-300">{code}</code>
      </pre>
    );
  }

  return (
    <div
      className="overflow-x-auto p-4 text-[13px] leading-relaxed [&_pre]:bg-transparent! [&_code]:font-mono"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function CodeBlock({
  code,
  label,
  lang,
}: {
  code: string;
  label?: string;
  lang?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-zinc-950 text-zinc-100 shadow-sm">
      {label ? (
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
          <span className="text-xs font-medium text-zinc-500">{label}</span>
          <CopyButton text={code} className="text-zinc-400 hover:bg-white/6" />
        </div>
      ) : null}
      <HighlightedCode code={code} lang={lang ?? "tsx"} />
    </div>
  );
}

function InstallBlock({ registryName }: { registryName: string }) {
  const registryUrl = `https://registry.handshek.workers.dev/r/${registryName}.json`;
  const installCommands = {
    pnpm: `pnpm dlx shadcn@latest add "${registryUrl}"`,
    npm: `npx shadcn@latest add "${registryUrl}"`,
    yarn: `yarn dlx shadcn@latest add "${registryUrl}"`,
    bun: `bunx shadcn@latest add "${registryUrl}"`,
  } as const;

  return (
    <div className="overflow-hidden rounded-lg border border-border/70 bg-zinc-950 text-zinc-100">
      <Tabs defaultValue="pnpm">
        <div className="flex items-center border-b border-white/5 px-3 py-2">
          <Terminal className="mr-2 h-4 w-4 shrink-0 text-zinc-500" />
          <TabsList className="h-auto bg-transparent p-0">
            {Object.keys(installCommands).map((manager) => (
              <TabsTrigger
                key={manager}
                value={manager}
                className="h-auto rounded-md px-3 py-1.5 font-mono text-[13px] text-zinc-400 hover:text-zinc-100 data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100"
              >
                {manager}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="ml-auto">
            <TabsContent
              value="pnpm"
              forceMount
              className="m-0 data-[state=inactive]:hidden"
            >
              <CopyButton
                text={installCommands.pnpm}
                className="text-zinc-400 hover:bg-white/6"
              />
            </TabsContent>
            <TabsContent
              value="npm"
              forceMount
              className="m-0 data-[state=inactive]:hidden"
            >
              <CopyButton
                text={installCommands.npm}
                className="text-zinc-400 hover:bg-white/6"
              />
            </TabsContent>
            <TabsContent
              value="yarn"
              forceMount
              className="m-0 data-[state=inactive]:hidden"
            >
              <CopyButton
                text={installCommands.yarn}
                className="text-zinc-400 hover:bg-white/6"
              />
            </TabsContent>
            <TabsContent
              value="bun"
              forceMount
              className="m-0 data-[state=inactive]:hidden"
            >
              <CopyButton
                text={installCommands.bun}
                className="text-zinc-400 hover:bg-white/6"
              />
            </TabsContent>
          </div>
        </div>
        <TabsContent value="pnpm" className="m-0">
          <code className="block overflow-x-auto whitespace-nowrap px-4 py-3 font-mono text-[13px] text-zinc-300 no-scrollbar">
            {installCommands.pnpm}
          </code>
        </TabsContent>
        <TabsContent value="npm" className="m-0">
          <code className="block overflow-x-auto whitespace-nowrap px-4 py-3 font-mono text-[13px] text-zinc-300 no-scrollbar">
            {installCommands.npm}
          </code>
        </TabsContent>
        <TabsContent value="yarn" className="m-0">
          <code className="block overflow-x-auto whitespace-nowrap px-4 py-3 font-mono text-[13px] text-zinc-300 no-scrollbar">
            {installCommands.yarn}
          </code>
        </TabsContent>
        <TabsContent value="bun" className="m-0">
          <code className="block overflow-x-auto whitespace-nowrap px-4 py-3 font-mono text-[13px] text-zinc-300 no-scrollbar">
            {installCommands.bun}
          </code>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PreviewContainer({
  children,
  controls,
}: {
  children: React.ReactNode;
  controls?: React.ReactNode;
}) {
  return (
    <div className="group/preview relative overflow-hidden rounded-xl border border-border/60 bg-muted/20 transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.035)_1px,transparent_1px)] bg-size-[16px_16px] transition-opacity duration-300 group-hover/preview:opacity-60 dark:bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.06),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.12),transparent)]" />
      {controls ? (
        <div className="absolute right-4 top-4 z-10">{controls}</div>
      ) : null}
      <div className="relative flex items-center justify-center px-6 py-14 sm:px-12 sm:py-20">
        {children}
      </div>
    </div>
  );
}

function WidgetPreview({
  kind,
  style,
}: {
  kind: WidgetDocConfig["preview"];
  style: "icons" | "emoji";
}) {
  switch (kind) {
    case "emoji":
      return (
        <EmojiFeedback
          apiKey="pk_demo"
          location="/components"
          submit={mockSubmit}
          variant={style}
        />
      );
    case "thumbs":
      return (
        <LikeDislike
          apiKey="pk_demo"
          location="/components"
          submit={mockSubmit}
          variant={style}
        />
      );
    case "star":
      return (
        <StarRating
          apiKey="pk_demo"
          location="/components"
          submit={mockSubmit}
          variant={style}
        />
      );
  }
}

function defaultPreviewStyle(slug: WidgetDocConfig["slug"]): "icons" | "emoji" {
  return slug === "emoji-feedback" ? "emoji" : "icons";
}

export function ComponentsLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isOverview = pathname === "/components";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.10),transparent_50%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.18),transparent_50%)]" />

      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
          <div className="h-5 w-px bg-border/60" />
          <span className="text-sm font-semibold tracking-tight">
            Components
          </span>
          <div className="ml-auto">
            <Badge variant="outline" className="font-mono text-[11px]">
              shadcn registry
            </Badge>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl">
        <div className="flex gap-1 overflow-x-auto border-b border-border/60 px-6 py-2.5 no-scrollbar lg:hidden">
          <Link
            href={docsHref()}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              pathname === "/components"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            Overview
          </Link>
          {widgetDocs.map((widget) => {
            const href = docsHref(widget.slug);
            const isActive = pathname === href;

            return (
              <Link
                key={widget.slug}
                href={href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <WidgetIcon kind={widget.icon} className="h-3.5 w-3.5" />
                {widget.name}
              </Link>
            );
          })}
        </div>

        <div className="flex">
          <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 border-r border-border/60 lg:block">
            <nav className="flex flex-col gap-0.5 p-4 pt-8">
              <span className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                Docs
              </span>
              <Link
                href={docsHref()}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                  pathname === "/components"
                    ? "bg-primary/10 text-primary shadow-[inset_2px_0_0_0] shadow-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                Overview
              </Link>
              <span className="mb-3 mt-6 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                Widgets
              </span>
              {widgetDocs.map((widget) => {
                const href = docsHref(widget.slug);
                const isActive = pathname === href;

                return (
                  <Link
                    key={widget.slug}
                    href={href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-primary/10 text-primary shadow-[inset_2px_0_0_0] shadow-primary"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <WidgetIcon kind={widget.icon} className="h-4 w-4" />
                    {widget.name}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="min-w-0 flex-1 px-6 py-10 lg:px-12 lg:py-14">
            {children}
          </main>

          {isOverview ? (
            <aside className="sticky top-24 hidden w-64 shrink-0 self-start px-6 py-10 xl:block">
              <div className="rounded-2xl border border-border/60 bg-background/70 p-5 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                  On This Page
                </p>
                <nav className="mt-4 space-y-1.5">
                  {overviewSections.map((section) => (
                    <a
                      key={section.id}
                      href={railHref(section.id)}
                      className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
                <div className="mt-6 rounded-xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-sm font-semibold tracking-tight">
                    Need a live example?
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Jump into a widget page for install snippets, live previews,
                    and the full props table.
                  </p>
                  <Button asChild size="sm" className="mt-4 w-full">
                    <Link href={docsHref(widgetDocs[0]?.slug)}>
                      Open first widget
                    </Link>
                  </Button>
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ComponentsOverviewContent() {
  return (
    <div className="max-w-3xl space-y-16 xl:max-w-4xl">
      <section id="introduction" className="scroll-mt-24 space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
            {overviewSections[0]?.eyebrow}
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Components
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
            Sentimeter gives you open-code feedback widgets that drop into a
            shadcn-style app without fighting your design system. You install
            the component source, adapt it to your product, and keep ownership
            of the final UI.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/70 bg-background/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Open-code install</CardTitle>
              <CardDescription>
                Pull component files into your app instead of importing a locked
                UI package.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-border/70 bg-background/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Realtime analytics</CardTitle>
              <CardDescription>
                Capture reactions in-product and stream them into the hosted
                Sentimeter dashboard.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-border/70 bg-background/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Host-first styling</CardTitle>
              <CardDescription>
                Keep typography, spacing, and tokens aligned with the app you
                already ship.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
            {overviewSections[1]?.eyebrow}
          </p>
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <p className="max-w-3xl text-[15px] leading-7 text-muted-foreground">
            The integration path is deliberately simple: install the component,
            render it where feedback matters, and send reactions to Sentimeter
            when you want analytics. The widget stays UI-native to your app
            while the dashboard handles the collection layer.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Install",
              description:
                "Use the shadcn registry to copy the widget component into your project.",
            },
            {
              step: "02",
              title: "Embed",
              description:
                "Render the component in any flow where you want lightweight sentiment or rating signals.",
            },
            {
              step: "03",
              title: "Analyze",
              description:
                "Connect publishable keys and endpoints to watch reactions show up in your dashboard.",
            },
          ].map((item) => (
            <Card
              key={item.step}
              className="border-border/70 bg-background/60 shadow-sm"
            >
              <CardHeader>
                <p className="font-mono text-xs font-bold tracking-[0.18em] text-primary">
                  {item.step}
                </p>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription className="text-sm leading-6">
                  {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="quick-install" className="scroll-mt-24 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
            {overviewSections[2]?.eyebrow}
          </p>
          <h2 className="text-3xl font-bold tracking-tight">Quick install</h2>
          <p className="max-w-3xl text-[15px] leading-7 text-muted-foreground">
            Start with any widget, then refine copy, layout, or callbacks inside
            your app. The registry install gives you a source file you can own,
            review, and adapt without waiting on a package release.
          </p>
        </div>

        <InstallBlock registryName="emoji-feedback" />

        <div className="grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
          <Card className="border-border/70 bg-background/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">
                Recommended first path
              </CardTitle>
              <CardDescription className="text-sm leading-6">
                Install one widget, confirm the UI fits your host app, then add
                a publishable key and endpoint when you are ready to collect
                live data. If you just want to prototype interaction first, pass
                a local `submit` handler.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-border/70 bg-background/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">What you will tune</CardTitle>
              <CardDescription className="text-sm leading-6">
                `apiKey`, `location`, copy, thank-you messaging, callbacks, and
                host-specific styling.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section id="choose-a-widget" className="scroll-mt-24 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
            {overviewSections[3]?.eyebrow}
          </p>
          <h2 className="text-3xl font-bold tracking-tight">Choose a widget</h2>
          <p className="max-w-3xl text-[15px] leading-7 text-muted-foreground">
            Each widget is optimized for a slightly different feedback shape.
            Pick the one that matches the decision you want users to make in the
            moment, then move into its dedicated page for implementation
            details.
          </p>
        </div>

        <div className="space-y-5">
          {widgetDocs.map((widget) => (
            <Card
              key={widget.slug}
              className="border-border/70 bg-background/60 shadow-sm"
            >
              <CardContent className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-2 items-center">
                      <div className="rounded-xl border border-border/60 bg-muted/30 p-2 text-muted-foreground">
                        <WidgetIcon kind={widget.icon} className="h-5 w-5" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="font-mono text-[11px]"
                      >
                        {widget.registryName}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight">
                        {widget.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {widget.description}
                      </p>
                    </div>
                  </div>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    {widget.slug === "emoji-feedback"
                      ? "Best when you want a fast emotional signal with minimal friction."
                      : widget.slug === "like-dislike"
                        ? "Best for binary helpfulness or approval questions where users should decide instantly."
                        : "Best when you need a stronger gradient of satisfaction or quality scoring."}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild>
                    <Link href={docsHref(widget.slug)}>Open component</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="open-code" className="scroll-mt-24 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
            {overviewSections[4]?.eyebrow}
          </p>
          <h2 className="text-3xl font-bold tracking-tight">Open code</h2>
          <p className="max-w-3xl text-[15px] leading-7 text-muted-foreground">
            Sentimeter is not trying to hide your UI behind a black-box package.
            The goal is to give you a feedback primitive that can inherit your
            existing product language, layout decisions, and interaction model.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              title: "Host-owned composition",
              body: "Install the actual component code so your team can restructure, restyle, or wrap it without brittle overrides.",
            },
            {
              title: "Design-system friendly",
              body: "Widgets are built to sit naturally inside shadcn-style apps and can be adapted to your spacing, tokens, and copy standards.",
            },
            {
              title: "Analytics when you need it",
              body: "Use local submit handlers for prototyping, then switch to Sentimeter-backed analytics once the UI flow is ready.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border/60 bg-background/60 p-5 shadow-sm"
            >
              <h3 className="text-lg font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function WidgetDocsContent({ widget }: { widget: WidgetDocConfig }) {
  const [previewStyle, setPreviewStyle] = React.useState<"icons" | "emoji">(
    defaultPreviewStyle(widget.slug),
  );

  React.useEffect(() => {
    setPreviewStyle(defaultPreviewStyle(widget.slug));
  }, [widget.slug]);

  return (
    <div className="max-w-3xl space-y-10">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {widget.name}
          </h1>
          <Badge variant="secondary" className="font-mono text-[11px]">
            {widget.registryName}
          </Badge>
        </div>
        <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {widget.description}
        </p>
      </div>

      <PreviewContainer
        controls={
          <Tabs
            value={previewStyle}
            onValueChange={(value) =>
              setPreviewStyle(value as "icons" | "emoji")
            }
          >
            <TabsList className="h-auto border border-border/60 bg-zinc-100 p-1">
              <TabsTrigger value="icons" className="h-auto px-3 py-1 text-xs">
                Icon
              </TabsTrigger>
              <TabsTrigger value="emoji" className="h-auto px-3 py-1 text-xs">
                Emoji
              </TabsTrigger>
            </TabsList>
          </Tabs>
        }
      >
        <WidgetPreview kind={widget.preview} style={previewStyle} />
      </PreviewContainer>

      <div className="space-y-3">
        <h2 className="text-base font-semibold">Installation</h2>
        <InstallBlock registryName={widget.registryName} />
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold">Usage</h2>
        <CodeBlock code={widget.usageSnippet} label="page.tsx" />
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight">Props</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Full exported API for this widget, including shared callbacks.
        </p>
      </div>

      <Card className="overflow-hidden border-border/70 bg-background/60 shadow-sm backdrop-blur">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-[18%]">Prop</TableHead>
                <TableHead className="w-[18%]">Type</TableHead>
                <TableHead className="w-[18%]">Default</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {widget.props.map((row) => (
                <TableRow key={row.prop}>
                  <TableCell className="font-mono text-[13px]">
                    {row.prop}
                  </TableCell>
                  <TableCell className="font-mono text-[13px] text-muted-foreground">
                    {row.type}
                  </TableCell>
                  <TableCell className="font-mono text-[13px] text-muted-foreground">
                    {row.defaultValue}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
