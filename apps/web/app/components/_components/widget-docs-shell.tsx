"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  IconArrowLeft,
  IconCheck,
  IconCopy,
  IconMoodSmile,
  IconStar,
  IconTerminal2,
  IconThumbUp,
} from "@tabler/icons-react";
import type { WidgetDocConfig } from "./widget-docs-data";
import { EmojiFeedback, LikeDislike, StarRating, type WidgetSubmit } from "@repo/widgets";

function CopyButton({ text }: { text: string }) {
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
      className="inline-flex items-center justify-center rounded-md p-1.5 transition-colors hover:bg-muted"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <IconCheck className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <IconCopy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-zinc-950 text-zinc-100 shadow-sm">
      {label ? (
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
          <span className="text-xs font-medium text-zinc-500">{label}</span>
          <CopyButton text={code} />
        </div>
      ) : null}
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}

function InstallBlock({ registryName }: { registryName: string }) {
  const cmd = `bunx shadcn@latest add "https://registry.handshek.workers.dev/r/${registryName}.json"`;
  return (
    <div className="flex items-center gap-3 overflow-hidden rounded-xl border border-border/70 bg-zinc-950 px-4 py-3 text-zinc-100 shadow-sm">
      <IconTerminal2 className="h-4 w-4 shrink-0 text-zinc-500" />
      <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-[13px] text-zinc-300 no-scrollbar">
        {cmd}
      </code>
      <CopyButton text={cmd} />
    </div>
  );
}

function PreviewContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/20 shadow-sm">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.035)_1px,transparent_1px)] bg-size-[16px_16px] dark:bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.06),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.12),transparent)]" />
      <div className="relative flex items-center justify-center px-6 py-14 sm:px-12 sm:py-20">
        {children}
      </div>
    </div>
  );
}

const mockSubmit: WidgetSubmit = () =>
  new Promise<void>((resolve) => setTimeout(resolve, 500));

function WidgetIcon({ kind }: { kind: WidgetDocConfig["icon"] }) {
  switch (kind) {
    case "emoji":
      return <IconMoodSmile className="h-6 w-6" />;
    case "thumbs":
      return <IconThumbUp className="h-6 w-6" />;
    case "star":
      return <IconStar className="h-6 w-6" />;
  }
}

function WidgetPreview({ kind }: { kind: WidgetDocConfig["preview"] }) {
  switch (kind) {
    case "emoji":
      return <EmojiFeedback apiKey="pk_demo" location="/components" submit={mockSubmit} />;
    case "thumbs":
      return <LikeDislike apiKey="pk_demo" location="/components" submit={mockSubmit} />;
    case "star":
      return <StarRating apiKey="pk_demo" location="/components" submit={mockSubmit} />;
  }
}

export function WidgetDocsShell({ widget }: { widget: WidgetDocConfig }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.10),transparent_50%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.18),transparent_50%)]" />

      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/components">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Components
            </Link>
          </Button>
          <div className="h-5 w-px bg-border/60" />
          <span className="text-sm font-semibold tracking-tight">Widget Docs</span>
          <div className="ml-auto">
            <Badge variant="outline" className="font-mono text-[11px]">
              {widget.registryName}
            </Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
        <div className="max-w-4xl space-y-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-muted-foreground">
                <WidgetIcon kind={widget.icon} />
              </div>
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

          <PreviewContainer>
            <WidgetPreview kind={widget.preview} />
          </PreviewContainer>

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <Card className="border-border/70 bg-background/60 shadow-sm backdrop-blur">
              <CardHeader className="border-b border-border/60">
                <CardTitle className="text-base">Installation</CardTitle>
                <CardDescription>Install from the shadcn registry.</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <InstallBlock registryName={widget.registryName} />
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-background/60 shadow-sm backdrop-blur">
              <CardHeader className="border-b border-border/60">
                <CardTitle className="text-base">Usage</CardTitle>
                <CardDescription>Minimal starter snippet.</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <CodeBlock code={widget.usageSnippet} label="page.tsx" />
              </CardContent>
            </Card>
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
                      <TableCell className="font-mono text-[13px]">{row.prop}</TableCell>
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

          <Separator className="opacity-60" />
        </div>
      </main>
    </div>
  );
}

export function ComponentsOverview({ widgets }: { widgets: WidgetDocConfig[] }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.10),transparent_50%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.18),transparent_50%)]" />
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
          <div className="h-5 w-px bg-border/60" />
          <span className="text-sm font-semibold tracking-tight">Components</span>
          <div className="ml-auto">
            <Badge variant="outline" className="font-mono text-[11px]">
              shadcn registry
            </Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
        <div className="max-w-3xl space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Components
          </h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Open-code React feedback widgets, installable via the shadcn registry.
            Each widget now has its own dedicated page with preview, installation,
            usage, and props documentation.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {widgets.map((widget) => (
            <Link key={widget.slug} href={`/widgets/${widget.slug}`}>
              <Card className="h-full border-border/70 bg-background/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="text-muted-foreground">
                          <WidgetIcon kind={widget.icon} />
                        </div>
                        <CardTitle className="text-lg">{widget.name}</CardTitle>
                      </div>
                      <CardDescription>{widget.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[11px]">
                      {widget.registryName}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                    Open the dedicated page to view the preview, install command,
                    usage snippet, and props table.
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
