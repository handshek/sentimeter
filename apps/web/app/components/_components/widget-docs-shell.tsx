"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";
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
import { ArrowLeft, Smile, Star, ThumbsUp } from "lucide-react";
import {
  getCompoundSnippet,
  getUsageSnippet,
  widgetDocs,
  type WidgetDemoOptions,
  type WidgetDocConfig,
} from "../../_lib/widget-catalog";
import { WidgetInstallCommand } from "./widget-install-command";
import { WidgetDemo } from "./widget-demo";
import { CodeBlock } from "./code-block";
import { CopyButton } from "./copy-button";

export function WidgetIcon({
  kind,
  className,
}: {
  kind: WidgetDocConfig["icon"];
  className?: string;
}) {
  const Icon = { emoji: Smile, thumbs: ThumbsUp, star: Star }[kind];
  return <Icon aria-hidden="true" className={cn("size-5", className)} />;
}

const navigation = [
  { href: "/components", name: "Widgets" },
  { href: "/components/getting-started", name: "Getting Started" },
  ...widgetDocs.map((widget) => ({
    href: `/components/${widget.slug}`,
    name: widget.name,
  })),
];

export function ComponentsLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  function navLink(item: (typeof navigation)[number]) {
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={pathname === item.href ? "page" : undefined}
        className={cn(
          "inline-flex min-h-11 shrink-0 items-center rounded-md px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring",
          pathname === item.href
            ? "bg-muted font-medium text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        {item.name}
      </Link>
    );
  }
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main"
        className="sr-only fixed left-4 top-4 z-60 rounded-md bg-background p-3 focus:not-sr-only focus-visible:outline-2 focus-visible:outline-ring"
      >
        Skip to Content
      </a>
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Button asChild variant="ghost" className="h-11">
            <Link href="/">
              <ArrowLeft className="size-4" aria-hidden="true" /> Sentimeter
            </Link>
          </Button>
          <span className="ml-auto text-sm text-muted-foreground">
            Feedback Registry
          </span>
        </div>
      </header>
      <div className="mx-auto max-w-7xl">
        <nav
          aria-label="Documentation"
          className="flex max-w-full gap-1 overflow-x-auto border-b border-border px-4 py-1 lg:hidden"
        >
          {navigation.map(navLink)}
        </nav>
        <div className="flex">
          <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-52 shrink-0 border-r border-border p-4 lg:block">
            <nav aria-label="Documentation" className="flex flex-col gap-1">
              {navigation.map(navLink)}
            </nav>
          </aside>
          <main
            id="main"
            className="min-w-0 flex-1 px-1.5 py-5 min-[360px]:px-3 sm:px-6 lg:px-8 lg:py-8"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export function ComponentsOverviewContent() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-balance text-3xl font-semibold tracking-tight">
          Feedback Widgets
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Try a widget, install its source, and connect your own backend. No
          account required.
        </p>
        <Button asChild variant="outline" className="h-11">
          <Link href="/components/getting-started">Getting Started</Link>
        </Button>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {widgetDocs.map((widget) => (
          <Card key={widget.slug} className="min-w-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WidgetIcon kind={widget.icon} />
                {widget.name}
              </CardTitle>
              <CardDescription>{widget.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-0 min-[360px]:px-3 sm:px-6">
              <WidgetDemo widget={widget} />
              <p className="text-xs text-muted-foreground">
                Local preview. Nothing is sent or stored.
              </p>
              <Button asChild variant="outline" className="h-11 w-full">
                <Link href={`/components/${widget.slug}`}>
                  Install {widget.name}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function WidgetDocsContent({
  widget,
  markdown,
}: {
  widget: WidgetDocConfig;
  markdown: string;
}) {
  const defaults: WidgetDemoOptions = {
    variant: widget.defaultVariant,
    size: "default",
    showInput: false,
  };
  const [options, setOptions] = useState<WidgetDemoOptions>(defaults);
  function updateOptions(next: Partial<WidgetDemoOptions>) {
    setOptions((current) => ({ ...current, ...next }));
  }

  return (
    <article className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-balance text-3xl font-semibold tracking-tight">
          {widget.name}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {widget.description}
        </p>
      </header>
      <div className="grid items-start gap-4 xl:grid-cols-2">
        <section
          aria-label="Live Preview"
          className="min-w-0 rounded-xl border border-border bg-muted/20 px-0 py-3 min-[360px]:px-2 sm:px-4"
        >
          <WidgetDemo widget={widget} options={options} />
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Runs locally—no account, project, or network request required.
          </p>
          <Accordion type="single" collapsible className="mt-2">
            <AccordionItem value="customize" className="border-0">
              <AccordionTrigger className="min-h-11 py-2">
                Customize Preview
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="preview-variant">Variant</Label>
                    <Select
                      value={options.variant}
                      onValueChange={(variant) =>
                        updateOptions({
                          variant: variant as WidgetDemoOptions["variant"],
                        })
                      }
                    >
                      <SelectTrigger
                        id="preview-variant"
                        className="h-11 w-full data-[size=default]:h-11"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emoji">Emoji</SelectItem>
                        <SelectItem value="icons">Icons</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preview-size">Size</Label>
                    <Select
                      value={options.size}
                      onValueChange={(size) =>
                        updateOptions({
                          size: size as WidgetDemoOptions["size"],
                        })
                      }
                    >
                      <SelectTrigger
                        id="preview-size"
                        className="h-11 w-full data-[size=default]:h-11"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["sm", "default", "md", "lg"].map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex min-h-11 items-center gap-3">
                  <Switch
                    id="preview-input"
                    checked={options.showInput}
                    onCheckedChange={(showInput) =>
                      updateOptions({ showInput })
                    }
                  />
                  <Label htmlFor="preview-input" className="cursor-pointer">
                    Optional Text Input
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => setOptions(defaults)}
                >
                  Restore Defaults
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
        <section aria-labelledby="installation" className="min-w-0 space-y-3">
          <h2 id="installation" className="scroll-mt-20 text-lg font-semibold">
            Installation
          </h2>
          <WidgetInstallCommand
            registryName={widget.registryName}
            metadata={widget.installMetadata}
          />
        </section>
      </div>
      <section aria-labelledby="usage" className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="usage" className="scroll-mt-20 text-xl font-semibold">
            Usage
          </h2>
          <CopyButton
            key={widget.slug}
            text={markdown}
            label="Copy as Markdown"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          The local example does not store feedback. Choose Your Backend to save
          submissions. Examples follow your preview settings and keep success
          visible with <code>{"autoHide={false}"}</code>.
        </p>
        <Tabs defaultValue="local">
          <TabsList
            aria-label="Submission Example"
            className="h-auto group-data-horizontal/tabs:h-auto"
          >
            <TabsTrigger value="local" className="h-11">
              Local Example
            </TabsTrigger>
            <TabsTrigger value="custom" className="h-11">
              Your Backend
            </TabsTrigger>
          </TabsList>
          <TabsContent value="local">
            <CodeBlock
              code={getUsageSnippet(widget, options)}
              label="Local Example"
            />
          </TabsContent>
          <TabsContent value="custom" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Implement <code>/api/feedback</code> in your app. Validate the
              payload and persist it before returning success. No Sentimeter key
              is needed; the existing payload includes an empty{" "}
              <code>apiKey</code>.
            </p>
            <CodeBlock
              code={getUsageSnippet(widget, options, "custom")}
              label="Your Backend"
            />
          </TabsContent>
        </Tabs>
      </section>
      <section aria-labelledby="submission" className="space-y-3">
        <h2 id="submission" className="scroll-mt-20 text-xl font-semibold">
          Submission Behavior
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          A custom <code>submit</code> handler takes precedence. Without it, a
          non-empty <code>apiKey</code> enables hosted analytics. With neither
          configured, the widget completes locally without sending or persisting
          feedback. Failed custom submissions remain retryable;{" "}
          <code>onSubmitError</code> receives the original error.
        </p>
        <Accordion type="single" collapsible>
          <AccordionItem value="compound">
            <AccordionTrigger className="min-h-11">
              Compound Composition
            </AccordionTrigger>
            <AccordionContent>
              <CodeBlock
                code={getCompoundSnippet(widget)}
                label="Compound Example"
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="hosted">
            <AccordionTrigger className="min-h-11">
              Optional Hosted Analytics
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <p className="text-sm leading-6 text-muted-foreground">
                Create a project in the{" "}
                <Link
                  href="/dashboard"
                  className="underline underline-offset-4"
                >
                  dashboard
                </Link>
                , use its publishable key, and configure allowed origins for
                production. Hosted failures expose{" "}
                <code>WidgetSubmitError</code> codes, HTTP status, and retry
                timing. See{" "}
                <Link
                  href="/components/getting-started#submission"
                  className="underline underline-offset-4"
                >
                  integration guidance
                </Link>
                .
              </p>
              <CodeBlock
                code={getUsageSnippet(widget, options, "hosted")}
                label="Hosted Example"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
      <section aria-labelledby="props" className="min-w-0 space-y-3">
        <h2 id="props" className="scroll-mt-20 text-xl font-semibold">
          Props
        </h2>
        <div
          role="region"
          aria-label={`${widget.name} Props`}
          tabIndex={0}
          className="max-w-full overflow-x-auto rounded-xl border border-border focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {widget.props.map((row) => (
                <TableRow key={row.prop}>
                  <TableCell className="font-mono text-xs">
                    {row.prop}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {row.type}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {row.defaultValue}
                  </TableCell>
                  <TableCell className="min-w-60 whitespace-normal text-sm">
                    {row.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </article>
  );
}
