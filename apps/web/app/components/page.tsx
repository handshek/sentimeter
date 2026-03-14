"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@workspace/ui/components/tabs";
import { Separator } from "@workspace/ui/components/separator";
import {
  EmojiFeedback,
  LikeDislike,
  StarRating,
  type WidgetSubmit,
} from "@repo/widgets";
import {
  IconArrowLeft,
  IconCheck,
  IconCopy,
  IconMoodSmile,
  IconStar,
  IconTerminal2,
  IconThumbUp,
} from "@tabler/icons-react";
import { cn } from "@workspace/ui/lib/utils";

const REGISTRY_BASE = "https://registry.handshek.workers.dev";

function installCmd(runner: string, name: string) {
  const url = `${REGISTRY_BASE}/r/${name}.json`;
  if (runner === "bunx") return `bunx shadcn@latest add "${url}"`;
  if (runner === "pnpm") return `pnpm dlx shadcn@latest add "${url}"`;
  return `npx shadcn@latest add "${url}"`;
}

const mockSubmit: WidgetSubmit = () =>
  new Promise<void>((r) => setTimeout(r, 500));

type WidgetDef = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  registryName: string;
  usage: string;
};

const WIDGETS: WidgetDef[] = [
  {
    id: "emoji-feedback",
    name: "Emoji Feedback",
    description:
      "Emoji-based feedback widget with a 5-point scale. Users tap a face that matches their mood.",
    icon: IconMoodSmile,
    registryName: "emoji-feedback",
    usage: `import { EmojiFeedback } from "@/components/sentimeter/emoji-feedback";

<EmojiFeedback
  apiKey="pk_your-api-key"
  location="/pricing"
/>`,
  },
  {
    id: "like-dislike",
    name: "Like / Dislike",
    description:
      "Thumbs up or thumbs down feedback widget. Simple binary sentiment.",
    icon: IconThumbUp,
    registryName: "like-dislike",
    usage: `import { LikeDislike } from "@/components/sentimeter/like-dislike";

<LikeDislike
  apiKey="pk_your-api-key"
  location="/docs/getting-started"
/>`,
  },
  {
    id: "star-rating",
    name: "Star Rating",
    description:
      "Five-star rating feedback widget. Hover to preview, click to lock.",
    icon: IconStar,
    registryName: "star-rating",
    usage: `import { StarRating } from "@/components/sentimeter/star-rating";

<StarRating
  apiKey="pk_your-api-key"
  location="/checkout"
/>`,
  },
];

/* ─── Utility components ─────────────────────────────────────────── */

function CopyButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          /* noop */
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-1.5 transition-all duration-150",
        className,
      )}
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

function WidgetPreview({ id }: { id: string }) {
  const [key, setKey] = React.useState(0);
  const props = {
    key,
    apiKey: "pk_demo",
    location: "/components",
    submit: mockSubmit,
    doneDurationMs: 2000,
    onStateChange: (state: string) => {
      if (state === "done") setTimeout(() => setKey((k) => k + 1), 2200);
    },
  };

  switch (id) {
    case "emoji-feedback":
      return <EmojiFeedback {...props} />;
    case "like-dislike":
      return <LikeDislike {...props} />;
    case "star-rating":
      return <StarRating {...props} />;
    default:
      return null;
  }
}

function PreviewContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="group/preview relative overflow-hidden rounded-xl border border-border/60 bg-muted/20 transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.035)_1px,transparent_1px)] bg-size-[16px_16px] transition-opacity duration-300 group-hover/preview:opacity-60 dark:bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.06),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.12),transparent)]" />
      <div className="relative flex items-center justify-center px-6 py-14 sm:px-12 sm:py-20">
        {children}
      </div>
    </div>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="group/code relative overflow-hidden rounded-lg border border-border/70 bg-zinc-950">
      {label ? (
        <div className="flex items-center justify-between border-b border-white/6 px-4 py-2.5">
          <span className="text-xs font-medium text-zinc-500">{label}</span>
          <CopyButton
            text={code}
            className="text-zinc-600 hover:bg-white/6 hover:text-zinc-300"
          />
        </div>
      ) : (
        <CopyButton
          text={code}
          className="absolute right-2 top-2 text-zinc-600 opacity-0 transition-opacity hover:bg-white/6 hover:text-zinc-300 group-hover/code:opacity-100"
        />
      )}
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-zinc-300">{code}</code>
      </pre>
    </div>
  );
}

function InstallBlock({ registryName }: { registryName: string }) {
  return (
    <Tabs defaultValue="npx">
      <TabsList>
        <TabsTrigger value="npx">npx</TabsTrigger>
        <TabsTrigger value="bunx">bun</TabsTrigger>
        <TabsTrigger value="pnpm">pnpm</TabsTrigger>
      </TabsList>
      {(["npx", "bunx", "pnpm"] as const).map((runner) => {
        const cmd = installCmd(runner, registryName);
        return (
          <TabsContent key={runner} value={runner}>
            <div className="flex items-center gap-3 overflow-hidden rounded-lg border border-border/70 bg-zinc-950 px-4 py-3">
              <IconTerminal2 className="h-4 w-4 shrink-0 text-zinc-500" />
              <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-[13px] text-zinc-300 no-scrollbar">
                {cmd}
              </code>
              <CopyButton
                text={cmd}
                className="shrink-0 text-zinc-600 hover:bg-white/6 hover:text-zinc-300"
              />
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */

export default function ComponentsPage() {
  const [activeId, setActiveId] = React.useState(WIDGETS[0]!.id);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );

    for (const w of WIDGETS) {
      const el = document.getElementById(w.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const scrollTo = React.useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.10),transparent_50%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.18),transparent_50%)]" />

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <IconArrowLeft className="mr-2 h-4 w-4" />
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
        {/* ── Mobile nav ───────────────────────────────────────── */}
        <div className="flex gap-1 overflow-x-auto border-b border-border/60 px-6 py-2.5 no-scrollbar lg:hidden">
          {WIDGETS.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => scrollTo(w.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                activeId === w.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <w.icon className="h-3.5 w-3.5" />
              {w.name}
            </button>
          ))}
        </div>

        <div className="flex">
          {/* ── Desktop sidebar ─────────────────────────────────── */}
          <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 border-r border-border/60 lg:block">
            <nav className="flex flex-col gap-0.5 p-4 pt-8">
              <span className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                Widgets
              </span>
              {WIDGETS.map((w) => (
                <a
                  key={w.id}
                  href={`#${w.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(w.id);
                  }}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                    activeId === w.id
                      ? "bg-primary/10 text-primary shadow-[inset_2px_0_0_0] shadow-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <w.icon className="h-4 w-4" />
                  {w.name}
                </a>
              ))}
            </nav>
          </aside>

          {/* ── Main content ───────────────────────────────────── */}
          <main className="min-w-0 flex-1 px-6 py-10 lg:px-12 lg:py-14">
            <div className="max-w-3xl">
              <div className="mb-16 space-y-3">
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Components
                </h1>
                <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                  Open-code React feedback widgets, installable via the shadcn
                  registry. Fully customizable, zero extra runtime dependencies.
                </p>
              </div>

              <div className="space-y-24">
                {WIDGETS.map((w, i) => (
                  <section key={w.id} id={w.id} className="scroll-mt-24">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-bold tracking-tight">
                          {w.name}
                        </h2>
                        <Badge
                          variant="secondary"
                          className="font-mono text-[11px]"
                        >
                          {w.registryName}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {w.description}
                      </p>
                    </div>

                    <div className="mt-6">
                      <PreviewContainer>
                        <WidgetPreview id={w.id} />
                      </PreviewContainer>
                    </div>

                    <div className="mt-10 space-y-3">
                      <h3 className="text-base font-semibold">Installation</h3>
                      <InstallBlock registryName={w.registryName} />
                    </div>

                    <div className="mt-10 space-y-3">
                      <h3 className="text-base font-semibold">Usage</h3>
                      <CodeBlock code={w.usage} label="page.tsx" />
                    </div>

                    {i < WIDGETS.length - 1 && (
                      <Separator className="mt-20 opacity-40" />
                    )}
                  </section>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
