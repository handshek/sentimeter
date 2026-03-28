"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";
import { Separator } from "@workspace/ui/components/separator";
import { Badge } from "@workspace/ui/components/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  EmojiFeedback,
  LikeDislike,
  StarRating,
  FeedbackWidget,
  FeedbackTitle,
  FeedbackDescription,
  FeedbackRating,
  FeedbackInput,
  FeedbackFooter,
  type WidgetPayload,
  type WidgetState,
  type WidgetSubmit,
  type WidgetSize,
} from "@repo/widgets";
import {
  IconArrowLeft,
  IconBug,
  IconCircleCheck,
  IconCircleX,
  IconCode,
  IconMessageCircle2,
  IconRadar2,
  IconRefresh,
} from "@tabler/icons-react";

type SubmitMode = "mock" | "real";
type MockOutcome = "success" | "error";

type SubmitResult = {
  ok: boolean;
  status: number;
  error?: string;
  at: number;
};

type WidgetCommon = {
  apiKey: string;
  location: string;
  disabled: boolean;
  thankYouMessage: string;
  doneDurationMs: number;
  submitLabel: string;
  submit: WidgetSubmit;
  submitMode: SubmitMode;
  title: string;
  description: string;
  showInput: boolean;
  size: WidgetSize;
};

function Field({
  id,
  label,
  description,
  children,
}: {
  id: string;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label htmlFor={id} className="text-xs font-semibold tracking-wide">
          {label}
        </Label>
        {description ? (
          <p className="text-[12px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function badgeTone(state: WidgetState) {
  switch (state) {
    case "idle":
      return "outline";
    case "selected":
      return "secondary";
    case "submitting":
      return "outline";
    case "done":
      return "default";
  }
}

function WidgetSection({
  tag,
  title,
  subtitle,
  children,
}: {
  tag: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2">
            <span className="rounded-md border border-border/70 bg-muted/30 px-2 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground">
              {tag}
            </span>
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function PlaygroundCard({
  children,
  title,
  icon,
  description,
}: {
  title: string;
  icon: React.ReactNode;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border/70 bg-background/60 shadow-sm backdrop-blur">
      <CardHeader className="border-b border-border/60">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground">{icon}</div>
            <div>
              <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground">
                {title}
              </CardTitle>
              {description ? (
                <CardDescription className="text-[12px]">
                  {description}
                </CardDescription>
              ) : null}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4">{children}</CardContent>
    </Card>
  );
}

function PopoverWidgetDemo({ common }: { common: WidgetCommon }) {
  const [open, setOpen] = React.useState(false);
  const [state, setState] = React.useState<WidgetState>("idle");
  const closeTimerRef = React.useRef<number | null>(null);

  const clearCloseTimer = React.useCallback(() => {
    if (closeTimerRef.current == null) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }, []);

  React.useEffect(() => clearCloseTimer, [clearCloseTimer]);

  React.useEffect(() => {
    if (!open || state !== "done") {
      clearCloseTimer();
      return;
    }

    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
    }, common.doneDurationMs);

    return clearCloseTimer;
  }, [clearCloseTimer, common.doneDurationMs, open, state]);

  return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6">
      <div className="flex flex-col gap-4">
        <div className="max-w-2xl space-y-2">
          <p className="text-sm leading-relaxed text-muted-foreground">
            This is the shadcn-native integration path. The host owns open
            state, Popover handles focus and dismissal, and the Sentimeter
            widget stays container-agnostic.
          </p>
          <p className="text-[12px] text-muted-foreground">
            The same widget can later be placed inside a Dialog, Sheet, or
            Drawer without changing its internals.
          </p>
        </div>

        <Popover
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            clearCloseTimer();
            if (!nextOpen) setState("idle");
          }}
        >
          <PopoverTrigger asChild>
            <Button type="button" variant="default" className="w-fit">
              <IconMessageCircle2 className="mr-2 h-4 w-4" />
              Open feedback popover
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="center"
            sideOffset={12}
            className="w-auto border-0 bg-transparent p-0 shadow-none"
          >
            <EmojiFeedback
              apiKey={common.apiKey}
              location={common.location}
              disabled={common.disabled}
              title={common.title}
              description={common.description}
              showInput={common.showInput}
              submitLabel={common.submitLabel}
              thankYouMessage={common.thankYouMessage}
              size={common.size}
              submit={common.submit}
              doneDurationMs={common.doneDurationMs}
              closeButton
              onCancel={() => {
                clearCloseTimer();
                setOpen(false);
                setState("idle");
              }}
              onStateChange={setState}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function useMockSubmit(outcome: MockOutcome, delayMs: number) {
  return React.useCallback<WidgetSubmit>(async () => {
    await new Promise<void>((r) => window.setTimeout(r, delayMs));
    if (outcome === "error") throw new Error("mock failure");
  }, [delayMs, outcome]);
}

function formatTime(ms: number) {
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function WidgetRig({
  title,
  kind,
  description,
  common,
  emojiVariant,
  setEmojiVariant,
}: {
  title: string;
  description: string;
  kind: "emoji" | "thumbs" | "stars";
  common: WidgetCommon;
  emojiVariant?: "emoji" | "tabler";
  setEmojiVariant?: (v: "emoji" | "tabler") => void;
}) {
  const [state, setState] = React.useState<WidgetState>("idle");
  const [selectedValue, setSelectedValue] = React.useState<number | null>(null);
  const [lastPayload, setLastPayload] = React.useState<WidgetPayload | null>(
    null,
  );
  const [lastResult, setLastResult] = React.useState<SubmitResult | null>(null);
  const [instance, setInstance] = React.useState(0);

  const widgetType: WidgetPayload["widgetType"] =
    kind === "emoji" ? "emoji" : kind === "thumbs" ? "thumbs" : "star";

  const wrappedSubmit = React.useCallback<WidgetSubmit>(
    async (payload) => {
      try {
        await common.submit(payload);
        setLastResult({ ok: true, status: 200, at: Date.now() });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "submit_failed";
        setLastResult({ ok: false, status: 0, error: message, at: Date.now() });
        throw error;
      }
    },
    [common],
  );

  const widgetCommon = {
    apiKey: common.apiKey,
    location: common.location,
    disabled: common.disabled,
    thankYouMessage: common.thankYouMessage,
    doneDurationMs: common.doneDurationMs,
    submitLabel: common.submitLabel,
    title: common.title,
    description: common.description,
    showInput: common.showInput,
    size: common.size,
    submit: wrappedSubmit,
    onSelect: (v: number) => setSelectedValue(v),
    onStateChange: (s: WidgetState) => setState(s),
    onSubmitStart: (p: WidgetPayload) => setLastPayload(p),
  } as const;

  const payloadPreview: WidgetPayload | null =
    lastPayload ??
    (selectedValue == null
      ? null
      : {
          apiKey: common.apiKey,
          location: common.location,
          widgetType,
          value: selectedValue,
        });

  return (
    <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
      <div className="space-y-4">
        <PlaygroundCard
          title={title}
          icon={<IconRadar2 size={16} />}
          description={description}
        >
          <div className="space-y-3">
            {kind === "emoji" && emojiVariant && setEmojiVariant ? (
              <Field
                id={`${kind}-emojiVariant`}
                label="Emoji Variant"
                description="Native emoji or Tabler faces"
              >
                <Select value={emojiVariant} onValueChange={setEmojiVariant}>
                  <SelectTrigger id={`${kind}-emojiVariant`} className="w-full">
                    <SelectValue placeholder="Select variant" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="emoji">Native emoji</SelectItem>
                    <SelectItem value="tabler">Tabler faces</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            ) : null}

            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInstance((v) => v + 1)}
              >
                <IconRefresh className="mr-2 h-4 w-4" />
                Reset widget
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSelectedValue(null);
                  setLastPayload(null);
                  setLastResult(null);
                  setState("idle");
                }}
              >
                Clear debug
              </Button>
            </div>
          </div>
        </PlaygroundCard>

        <PlaygroundCard title="Runtime" icon={<IconCircleCheck size={16} />}>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium">State</div>
              <Badge variant={badgeTone(state)}>{state.toUpperCase()}</Badge>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Selected value</span>
                <span className="font-mono text-[12px]">
                  {selectedValue == null ? "—" : selectedValue}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Submit mode</span>
                <span className="font-mono text-[12px]">
                  {common.submitMode}
                </span>
              </div>
              {lastResult ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Last result</span>
                  <span className="font-mono text-[12px]">
                    {lastResult.ok ? "ok" : "error"} ·{" "}
                    {formatTime(lastResult.at)}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </PlaygroundCard>

        <PlaygroundCard title="Payload" icon={<IconCode size={16} />}>
          <Textarea
            readOnly
            value={JSON.stringify(payloadPreview ?? {}, null, 2)}
            aria-label="Payload JSON"
            className="min-h-24 font-mono text-[12px]"
          />
          <div className="mt-2 flex items-center justify-between gap-3 text-[12px] text-muted-foreground">
            <span>Updates on select / submit start.</span>
            {payloadPreview ? (
              <span className="inline-flex items-center gap-1">
                <IconCircleCheck size={14} className="text-emerald-500" />
                ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <IconCircleX size={14} className="text-muted-foreground" />
                select first
              </span>
            )}
          </div>
          {lastResult && !lastResult.ok ? (
            <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12px] text-muted-foreground">
              <span className="font-semibold text-foreground">
                Submit failed:
              </span>{" "}
              {lastResult.error}
            </div>
          ) : null}
        </PlaygroundCard>
      </div>

      <div className="space-y-4">
        <PlaygroundCard title="Preview" icon={<IconCircleCheck size={16} />}>
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-muted/20 p-6">
            <div className="pointer-events-none absolute inset-0 opacity-40 [background:repeating-linear-gradient(135deg,rgba(255,255,255,0.10)_0px,rgba(255,255,255,0.10)_1px,transparent_1px,transparent_10px)] dark:opacity-20" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_70%_0%,rgba(99,102,241,0.16),transparent_55%),radial-gradient(50%_50%_at_10%_10%,rgba(16,185,129,0.10),transparent_60%)]" />
            <div className="relative flex items-center justify-center">
              {kind === "emoji" ? (
                <EmojiFeedback
                  key={instance}
                  {...widgetCommon}
                  variant={emojiVariant ?? "emoji"}
                />
              ) : kind === "thumbs" ? (
                <LikeDislike key={instance} {...widgetCommon} />
              ) : (
                <StarRating key={instance} {...widgetCommon} />
              )}
            </div>
          </div>
        </PlaygroundCard>
      </div>
    </div>
  );
}

async function submitToConvexSite(payload: WidgetPayload): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  if (!siteUrl) throw new Error("NEXT_PUBLIC_CONVEX_SITE_URL is not set");

  const res = await fetch(`${siteUrl}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) return;

  let error = `HTTP ${res.status}`;
  try {
    const body = await res.json();
    if (typeof body?.error === "string") error = body.error;
  } catch {
    // ignore
  }
  throw new Error(error);
}

function WidgetsPlaygroundContent() {
  const { isSignedIn } = useAuth();
  const searchParams = useSearchParams();
  const projectIdFromQuery = searchParams.get("projectId") ?? "";

  const projects = useQuery(api.projects.getProjects, isSignedIn ? {} : "skip");
  const projectList = projects ?? [];

  const [selectedProjectId, setSelectedProjectId] =
    React.useState<string>(projectIdFromQuery);

  const selectedProjectQueryArgs = React.useMemo(() => {
    if (!isSignedIn) return "skip";
    return selectedProjectId && selectedProjectId.length > 0
      ? { projectId: selectedProjectId as Id<"projects"> }
      : "skip";
  }, [isSignedIn, selectedProjectId]);

  const selectedProject = useQuery(
    api.projects.getProject,
    selectedProjectQueryArgs,
  );
  const activeApiKey = selectedProject?.activeApiKey?.key ?? "";

  const [apiKey, setApiKey] = React.useState("demo-api-key");
  const [location, setLocation] = React.useState("/widgets");
  const [disabled, setDisabled] = React.useState(false);
  const [thankYouMessage, setThankYouMessage] = React.useState("Thanks!");
  const [doneDurationMs, setDoneDurationMs] = React.useState(2000);
  const [submitMode, setSubmitMode] = React.useState<SubmitMode>("mock");
  const [mockOutcome, setMockOutcome] = React.useState<MockOutcome>("success");
  const [mockDelayMs, setMockDelayMs] = React.useState(450);
  const [emojiVariant, setEmojiVariant] = React.useState<"emoji" | "tabler">(
    "emoji",
  );
  const [title, setTitle] = React.useState("Rate your experience");
  const [description, setDescription] = React.useState(
    "This helps us improve our product.",
  );
  const [showInput, setShowInput] = React.useState(false);
  const [widgetSize, setWidgetSize] = React.useState<WidgetSize>("default");

  React.useEffect(() => {
    if (!isSignedIn) return;
    if (!activeApiKey) return;
    setApiKey(activeApiKey);
  }, [activeApiKey, isSignedIn, selectedProjectId]);

  React.useEffect(() => {
    if (!projectIdFromQuery) return;
    setSelectedProjectId(projectIdFromQuery);
  }, [projectIdFromQuery]);

  const injectedMockSubmit = useMockSubmit(mockOutcome, mockDelayMs);

  const realSubmit = React.useCallback<WidgetSubmit>(async (payload) => {
    await submitToConvexSite(payload);
  }, []);

  const submit = submitMode === "mock" ? injectedMockSubmit : realSubmit;

  const common = React.useMemo(
    () => ({
      apiKey,
      location,
      disabled,
      thankYouMessage,
      doneDurationMs,
      submitLabel: submitMode === "mock" ? "Submit (Mock)" : "Submit (Real)",
      submit,
      submitMode,
      title,
      description,
      showInput,
      size: widgetSize,
    }),
    [
      apiKey,
      disabled,
      doneDurationMs,
      location,
      submit,
      submitMode,
      thankYouMessage,
      title,
      description,
      showInput,
      widgetSize,
    ],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 opacity-70 [background:radial-gradient(70%_50%_at_50%_0%,rgba(99,102,241,0.18),transparent_60%)]" />
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold tracking-tight">
                Widgets Playground
              </div>
              <div className="text-[12px] text-muted-foreground">
                Production widgets + submit adapter debugging
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">/widgets</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Test the widgets the way users will.
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              This page renders the exact production components from{" "}
              <code className="font-mono text-[12px]">@repo/widgets</code>. Mock
              mode injects a{" "}
              <code className="font-mono text-[12px]">submit</code> function;
              Real mode posts to{" "}
              <code className="font-mono text-[12px]">
                {process.env.NEXT_PUBLIC_CONVEX_SITE_URL ??
                  "[set NEXT_PUBLIC_CONVEX_SITE_URL]"}
                /feedback
              </code>
              .
            </p>
          </div>
          <PlaygroundCard
            title="Real Data"
            icon={<IconBug size={16} />}
            description="Send feedback to Convex so the dashboard updates"
          >
            <div className="space-y-3">
              <Field
                id="global-mode"
                label="Mode"
                description="Mock for UI testing, Real for dashboard analytics"
              >
                <Select
                  value={submitMode}
                  onValueChange={(v) => setSubmitMode(v as SubmitMode)}
                >
                  <SelectTrigger id="global-mode" className="w-full">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="mock">Mock</SelectItem>
                    <SelectItem value="real">Real (Convex)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field
                id="global-size"
                label="Size"
                description="Icon and button scale"
              >
                <Select
                  value={widgetSize}
                  onValueChange={(v) => setWidgetSize(v as WidgetSize)}
                >
                  <SelectTrigger id="global-size" className="w-full">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {submitMode === "mock" ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field
                    id="global-outcome"
                    label="Mock outcome"
                    description="Only in mock mode"
                  >
                    <Select
                      value={mockOutcome}
                      onValueChange={(v) => setMockOutcome(v as MockOutcome)}
                    >
                      <SelectTrigger id="global-outcome" className="w-full">
                        <SelectValue placeholder="Outcome" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field id="global-delay" label="Mock delay" description="ms">
                    <Input
                      id="global-delay"
                      type="number"
                      min={0}
                      value={mockDelayMs}
                      onChange={(e) =>
                        setMockDelayMs(Number(e.target.value || 0))
                      }
                    />
                  </Field>
                </div>
              ) : (
                <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-[12px] text-muted-foreground">
                  Tip: open your project dashboard in another tab to watch
                  updates in realtime.
                </div>
              )}
            </div>
          </PlaygroundCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
          <PlaygroundCard
            title="Project Helper"
            icon={<IconCircleCheck size={16} />}
            description={
              isSignedIn
                ? "Auto-fill publishable key from your project"
                : "Sign in to auto-fill publishable keys"
            }
          >
            {isSignedIn ? (
              <div className="space-y-3">
                <Field
                  id="project-select"
                  label="Project"
                  description="Pick a project to auto-fill its active publishable key"
                >
                  <Select
                    value={selectedProjectId}
                    onValueChange={(v) => setSelectedProjectId(v)}
                  >
                    <SelectTrigger id="project-select" className="w-full">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {projectList.map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!activeApiKey}
                    onClick={async () => {
                      if (!activeApiKey) return;
                      try {
                        await navigator.clipboard.writeText(activeApiKey);
                      } catch {
                        window.prompt("Copy publishable key:", activeApiKey);
                      }
                    }}
                  >
                    Copy key
                  </Button>
                  <Button
                    type="button"
                    asChild
                    variant="outline"
                    disabled={!selectedProjectId}
                  >
                    <Link href={`/dashboard/projects/${selectedProjectId}`}>
                      Open dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Sign in and open this page again to pick a project and auto-fill
                the publishable key.
              </div>
            )}
          </PlaygroundCard>

          <PlaygroundCard
            title="Global Props"
            icon={<IconRadar2 size={16} />}
            description="Shared across all widgets"
          >
            <div className="space-y-3">
              <Field
                id="global-apiKey"
                label="API Key"
                description="Publishable Sentimeter project key (string)"
              >
                <Input
                  id="global-apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </Field>
              <Field
                id="global-location"
                label="Location"
                description="Use a route or stable ID (e.g. /pricing, pricing.hero)"
              >
                <Input
                  id="global-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </Field>

              <Field
                id="global-thankYou"
                label="Thank you message"
                description="Displayed briefly after a successful submit"
              >
                <Input
                  id="global-thankYou"
                  value={thankYouMessage}
                  onChange={(e) => setThankYouMessage(e.target.value)}
                />
              </Field>

              <Field
                id="global-doneDuration"
                label="Done duration"
                description="How long to show the thank-you before hiding (ms)"
              >
                <Input
                  id="global-doneDuration"
                  type="number"
                  min={0}
                  value={doneDurationMs}
                  onChange={(e) =>
                    setDoneDurationMs(Number(e.target.value || 0))
                  }
                />
              </Field>

              <Field
                id="global-title"
                label="Title"
                description="The main heading for the widget"
              >
                <Input
                  id="global-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Field>

              <Field
                id="global-description"
                label="Description"
                description="Subtitle explaining what feedback you're collecting"
              >
                <Input
                  id="global-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>

              <div className="flex items-center justify-between rounded-md border border-border/70 bg-background/40 px-3 py-2">
                <div>
                  <Label
                    htmlFor="global-showInput"
                    className="text-sm font-medium"
                  >
                    {showInput ? "Input visible" : "Input hidden"}
                  </Label>
                  <div className="text-[12px] text-muted-foreground">
                    Shows the text area to collect qualitative feedback
                  </div>
                </div>
                <Switch
                  id="global-showInput"
                  checked={showInput}
                  onCheckedChange={setShowInput}
                />
              </div>

              <div className="flex items-center justify-between rounded-md border border-border/70 bg-background/40 px-3 py-2">
                <div>
                  <Label
                    htmlFor="global-disabled"
                    className="text-sm font-medium"
                  >
                    {disabled ? "Disabled" : "Enabled"}
                  </Label>
                  <div className="text-[12px] text-muted-foreground">
                    Disables selection and submit
                  </div>
                </div>
                <Switch
                  id="global-disabled"
                  checked={disabled}
                  onCheckedChange={setDisabled}
                />
              </div>
            </div>
          </PlaygroundCard>
        </div>

        <div className="space-y-10">
          <WidgetSection
            tag="W01"
            title="Emoji"
            subtitle="Native emojis by default, optional Tabler faces."
          >
            <WidgetRig
              title="Emoji"
              description="5-point reaction"
              kind="emoji"
              common={common}
              emojiVariant={emojiVariant}
              setEmojiVariant={setEmojiVariant}
            />
          </WidgetSection>

          <Separator className="opacity-60" />

          <WidgetSection
            tag="W02"
            title="Thumbs"
            subtitle="Like/Dislike (1/0) with consistent submit flow."
          >
            <WidgetRig
              title="Thumbs"
              description="Binary feedback"
              kind="thumbs"
              common={common}
            />
          </WidgetSection>

          <Separator className="opacity-60" />

          <WidgetSection
            tag="W03"
            title="Stars"
            subtitle="Hover preview, click to lock, submit to send."
          >
            <WidgetRig
              title="Stars"
              description="1–5 rating"
              kind="stars"
              common={common}
            />
          </WidgetSection>

          <Separator className="opacity-60" />

          <WidgetSection
            tag="W04"
            title="Compound"
            subtitle="Composable compound components — build your own layout."
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <PlaygroundCard
                title="With Input + Cancel"
                icon={<IconRadar2 size={16} />}
                description="Full-feature compound widget"
              >
                <div className="relative overflow-hidden rounded-xl border border-border/60 bg-muted/20 p-6">
                  <div className="pointer-events-none absolute inset-0 opacity-40 [background:repeating-linear-gradient(135deg,rgba(255,255,255,0.10)_0px,rgba(255,255,255,0.10)_1px,transparent_1px,transparent_10px)] dark:opacity-20" />
                  <div className="relative flex items-center justify-center">
                    <FeedbackWidget
                      apiKey={common.apiKey}
                      location={common.location}
                      widgetType="emoji"
                      disabled={common.disabled}
                      submit={common.submit}
                      doneDurationMs={common.doneDurationMs}
                      closeButton
                    >
                      <FeedbackTitle>How was your experience?</FeedbackTitle>
                      <FeedbackDescription>
                        Your feedback shapes our product.
                      </FeedbackDescription>
                      <FeedbackRating variant="emoji" />
                      <FeedbackInput placeholder="What could be better?" />
                      <FeedbackFooter
                        submitLabel={common.submitLabel}
                        thankYouMessage={common.thankYouMessage}
                        showCancel
                      />
                    </FeedbackWidget>
                  </div>
                </div>
              </PlaygroundCard>

              <PlaygroundCard
                title="Minimal — Stars Only"
                icon={<IconRadar2 size={16} />}
                description="Just a rating, no text input"
              >
                <div className="relative overflow-hidden rounded-xl border border-border/60 bg-muted/20 p-6">
                  <div className="pointer-events-none absolute inset-0 opacity-40 [background:repeating-linear-gradient(135deg,rgba(255,255,255,0.10)_0px,rgba(255,255,255,0.10)_1px,transparent_1px,transparent_10px)] dark:opacity-20" />
                  <div className="relative flex items-center justify-center">
                    <FeedbackWidget
                      apiKey={common.apiKey}
                      location={common.location}
                      widgetType="star"
                      disabled={common.disabled}
                      submit={common.submit}
                      doneDurationMs={common.doneDurationMs}
                    >
                      <FeedbackTitle>Quick rating</FeedbackTitle>
                      <FeedbackRating variant="stars" />
                      <FeedbackFooter
                        submitLabel={common.submitLabel}
                        thankYouMessage={common.thankYouMessage}
                      />
                    </FeedbackWidget>
                  </div>
                </div>
              </PlaygroundCard>
            </div>
          </WidgetSection>

          <Separator className="opacity-60" />

          <WidgetSection
            tag="W05"
            title="Popover"
            subtitle="Shadcn Popover owns accessibility, focus, and dismissal."
          >
            <PopoverWidgetDemo common={common} />
          </WidgetSection>
        </div>
      </main>
    </div>
  );
}

export default function WidgetsPlaygroundPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground">
          <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-muted-foreground">
            Loading widgets playground...
          </div>
        </div>
      }
    >
      <WidgetsPlaygroundContent />
    </React.Suspense>
  );
}
