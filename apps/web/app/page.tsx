"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import {
  ArrowRight,
  Check,
  Copy,
  LayoutDashboard,
  LogIn,
  Package,
  Terminal,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import {
  EmojiFeedback,
  LikeDislike,
  StarRating,
  type WidgetSubmit,
} from "@repo/widgets";

const INSTALL_CMD =
  'npx shadcn@latest add "https://registry.handshek.workers.dev/r/emoji-feedback.json"';

const mockSubmit: WidgetSubmit = () =>
  new Promise<void>((r) => setTimeout(r, 500));

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

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
      className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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

function DemoWidget({
  kind,
  label,
}: {
  kind: "emoji" | "thumbs" | "stars";
  label: string;
}) {
  const [instance, setInstance] = useState(0);

  const props = {
    key: instance,
    submit: mockSubmit,
    doneDurationMs: 2000,
    onStateChange: (state: string) => {
      if (state === "done") setTimeout(() => setInstance((k) => k + 1), 2200);
    },
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="group/preview relative overflow-hidden rounded-xl border border-border/60 bg-muted/20 transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.035)_1px,transparent_1px)] bg-size-[16px_16px] dark:bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.06),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.12),transparent)]" />
        <div className="relative flex items-center justify-center px-8 py-10 sm:px-12 sm:py-14">
          {kind === "emoji" && <EmojiFeedback {...props} />}
          {kind === "thumbs" && <LikeDislike {...props} />}
          {kind === "stars" && <StarRating {...props} />}
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

const STEPS = [
  {
    number: "01",
    title: "Install",
    description: "One command via the shadcn CLI. You own every line of code.",
  },
  {
    number: "02",
    title: "Embed",
    description:
      "Drop the component anywhere in your React app. Style it however you want.",
  },
  {
    number: "03",
    title: "Analyze",
    description:
      "Reactions stream to your Sentimeter dashboard in real time when analytics are enabled.",
  },
];

export default function Home() {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.08),transparent_50%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent_50%)]" />

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <span className="text-xl font-bold tracking-tight">Sentimeter</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden sm:flex"
            >
              <Link href="/components">
                <Package className="mr-2 h-4 w-4" />
                Components
              </Link>
            </Button>

            {!isSignedIn && (
              <Button asChild>
                <Link href="/sign-in">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            )}

            {isSignedIn && (
              <Button asChild variant="default">
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* ── Section 1: Hero ────────────────────────────────────── */}
      <section className="relative flex flex-col items-center px-6 pt-24 pb-20 text-center md:pt-32 md:pb-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="bg-linear-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              Collect user feedback{" "}
            </span>
            <br className="hidden sm:block" />
            <span className="bg-linear-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              in{" "}
            </span>
            <em className="text-primary italic">minutes</em>
            <span className="bg-linear-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              , not sprints.
            </span>
          </h1>

          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            Drop-in React widgets via shadcn. Instant reactions. Real-time
            dashboard. Zero backend work.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild className="h-11 px-7 text-[15px]">
              <Link href={isSignedIn ? "/dashboard" : "/sign-in"}>
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-11 px-7 text-[15px]"
            >
              <Link href="/components">
                <Package className="mr-2 h-4 w-4" />
                Components
              </Link>
            </Button>
          </div>

          <div className="mt-12 flex w-full max-w-lg items-center gap-3 overflow-hidden rounded-lg border border-border/70 bg-zinc-950 px-4 py-2.5">
            <Terminal className="h-4 w-4 shrink-0 text-zinc-500" />
            <code className="no-scrollbar flex-1 overflow-x-auto whitespace-nowrap font-mono text-[13px] text-zinc-300">
              {INSTALL_CMD}
            </code>
            <CopyButton text={INSTALL_CMD} />
          </div>
        </div>
      </section>

      {/* ── Section 2: How It Works ────────────────────────────── */}
      <section className="relative border-t border-border/40 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <p className="mb-12 text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground/70">
            How it works
          </p>

          <div className="grid gap-12 md:grid-cols-3 md:gap-8">
            {STEPS.map((step) => (
              <div key={step.number} className="text-center md:text-left">
                <span className="font-mono text-xs font-bold tracking-widest text-primary">
                  {step.number}
                </span>
                <h3 className="mt-2 text-xl font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Live Widget Showcase ────────────────────── */}
      <section className="relative border-t border-border/40 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <p className="mb-12 text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground/70">
            Try them now
          </p>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <DemoWidget kind="emoji" label="Emoji Feedback" />
            <DemoWidget kind="thumbs" label="Like / Dislike" />
            <DemoWidget kind="stars" label="Star Rating" />
          </div>

          <p className="mt-12 text-center text-sm text-muted-foreground">
            Fully customizable. You own the code.{" "}
            <Link
              href="/components"
              className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
            >
              Browse all components
            </Link>
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 px-6 py-12 text-center text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p>&copy; 2026 Sentimeter. Built for developers.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="transition-colors hover:text-foreground">
              Documentation
            </Link>
            <Link
              href="/privacy"
              className="transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-foreground"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
