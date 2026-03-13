"use client";

import * as React from "react";
import Link from "next/link";
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
  EmojiFeedback,
  LikeDislike,
  StarRating,
  type WidgetPayload,
  type WidgetState,
  type WidgetSubmit,
} from "@repo/widgets";
import {
  IconArrowLeft,
  IconBug,
  IconCircleCheck,
  IconCircleX,
  IconCode,
  IconRadar2,
  IconRefresh,
} from "@tabler/icons-react";

type SubmitMode = "mock" | "real";
type MockOutcome = "success" | "error";

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

function useMockSubmit(outcome: MockOutcome, delayMs: number) {
  return React.useCallback<WidgetSubmit>(
    async () => {
      await new Promise<void>((r) => window.setTimeout(r, delayMs));
      if (outcome === "error") throw new Error("mock failure");
    },
    [delayMs, outcome],
  );
}

function WidgetPlayground({
  kind,
}: {
  kind: "emoji" | "thumbs" | "stars";
}) {
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

  const [state, setState] = React.useState<WidgetState>("idle");
  const [selectedValue, setSelectedValue] = React.useState<number | null>(null);
  const [lastPayload, setLastPayload] = React.useState<WidgetPayload | null>(
    null,
  );

  const [instance, setInstance] = React.useState(0);

  const injectedSubmit = useMockSubmit(mockOutcome, mockDelayMs);
  const submit = submitMode === "mock" ? injectedSubmit : undefined;

  const widgetCommon = {
    apiKey,
    location,
    disabled,
    thankYouMessage,
    doneDurationMs,
    submitLabel: submitMode === "mock" ? "Submit (Mock)" : "Submit",
    submit,
    onSelect: (v: number) => setSelectedValue(v),
    onStateChange: (s: WidgetState) => setState(s),
    onSubmitStart: (p: WidgetPayload) => setLastPayload(p),
  } as const;

  const payloadPreview: WidgetPayload | null =
    lastPayload ??
    (selectedValue == null
      ? null
      : {
          apiKey,
          location,
          widgetType:
            kind === "emoji" ? "emoji" : kind === "thumbs" ? "thumbs" : "star",
          value: selectedValue,
        });

  return (
    <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
      <div className="space-y-4">
        <PlaygroundCard
          title="Controls"
          icon={<IconRadar2 size={16} />}
          description="Production props only"
        >
          <div className="space-y-3">
            <Field
              id={`${kind}-apiKey`}
              label="API Key"
              description="Sentimeter project API key (string)"
            >
              <Input
                id={`${kind}-apiKey`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </Field>
            <Field
              id={`${kind}-location`}
              label="Location"
              description="Arbitrary identifier (URL/path) for analytics grouping"
            >
              <Input
                id={`${kind}-location`}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </Field>

            {kind === "emoji" ? (
              <Field
                id={`${kind}-emojiVariant`}
                label="Emoji Variant"
                description="Native emoji or Tabler faces"
              >
                <Select
                  value={emojiVariant}
                  onValueChange={(v) => setEmojiVariant(v as "emoji" | "tabler")}
                >
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

            <Field
              id={`${kind}-thankYou`}
              label="Thank you message"
              description="Displayed briefly after a successful submit"
            >
              <Input
                id={`${kind}-thankYou`}
                value={thankYouMessage}
                onChange={(e) => setThankYouMessage(e.target.value)}
              />
            </Field>

            <Field
              id={`${kind}-doneDuration`}
              label="Done duration"
              description="How long to show the thank-you before hiding (ms)"
            >
              <Input
                id={`${kind}-doneDuration`}
                type="number"
                min={0}
                value={doneDurationMs}
                onChange={(e) => setDoneDurationMs(Number(e.target.value || 0))}
              />
            </Field>

            <Field
              id={`${kind}-disabled`}
              label="Disabled"
              description="Disables selection and submit"
            >
              <div className="flex items-center justify-between rounded-md border border-border/70 bg-background/40 px-3 py-2">
                <span className="text-sm font-medium">
                  {disabled ? "Disabled" : "Enabled"}
                </span>
                <Switch
                  id={`${kind}-disabled`}
                  checked={disabled}
                  onCheckedChange={setDisabled}
                />
              </div>
            </Field>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInstance((v) => v + 1)}
              >
                <IconRefresh className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSelectedValue(null);
                  setLastPayload(null);
                  setState("idle");
                }}
              >
                Clear Debug
              </Button>
            </div>
          </div>
        </PlaygroundCard>

        <PlaygroundCard
          title="Submit Adapter"
          icon={<IconBug size={16} />}
          description="Mock via public submit() injection"
        >
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <Field id={`${kind}-mode`} label="Mode" description="Mock or Real">
                <Select
                  value={submitMode}
                  onValueChange={(v) => setSubmitMode(v as SubmitMode)}
                >
                  <SelectTrigger id={`${kind}-mode`} className="w-full">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="mock">Mock</SelectItem>
                    <SelectItem value="real">Real</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field
                id={`${kind}-outcome`}
                label="Mock outcome"
                description="Only used in mock mode"
              >
                <Select
                  value={mockOutcome}
                  onValueChange={(v) => setMockOutcome(v as MockOutcome)}
                  disabled={submitMode !== "mock"}
                >
                  <SelectTrigger id={`${kind}-outcome`} className="w-full">
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field
              id={`${kind}-delay`}
              label="Mock delay"
              description="Artificial latency in mock mode (ms)"
            >
              <Input
                id={`${kind}-delay`}
                type="number"
                min={0}
                value={mockDelayMs}
                onChange={(e) => setMockDelayMs(Number(e.target.value || 0))}
                disabled={submitMode !== "mock"}
              />
            </Field>

            <div className="text-[12px] text-muted-foreground">
              In <span className="font-semibold">Mock</span>, the playground
              injects <code className="font-mono">submit(payload)</code>. In{" "}
              <span className="font-semibold">Real</span>, widgets use their
              built-in <code className="font-mono">submitFeedback</code>.
            </div>
          </div>
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
                  variant={emojiVariant}
                />
              ) : kind === "thumbs" ? (
                <LikeDislike key={instance} {...widgetCommon} />
              ) : (
                <StarRating key={instance} {...widgetCommon} />
              )}
            </div>
          </div>
        </PlaygroundCard>

        <div className="grid gap-4 lg:grid-cols-2">
          <PlaygroundCard title="Runtime State" icon={<IconRadar2 size={16} />}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium">State</div>
              <Badge variant={badgeTone(state)}>{state.toUpperCase()}</Badge>
            </div>
            <div className="mt-3 grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Selected value</span>
                <span className="font-mono text-[12px]">
                  {selectedValue == null ? "—" : selectedValue}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Submit mode</span>
                <span className="font-mono text-[12px]">{submitMode}</span>
              </div>
              {submitMode === "mock" ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Mock outcome</span>
                  <span className="font-mono text-[12px]">{mockOutcome}</span>
                </div>
              ) : null}
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
              <span>Preview updates on select / submit start.</span>
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
          </PlaygroundCard>
        </div>
      </div>
    </div>
  );
}

export default function WidgetsPlaygroundPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 opacity-70 [background:radial-gradient(70%_50%_at_50%_0%,rgba(99,102,241,0.18),transparent_60%)]" />
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
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
              mode injects a <code className="font-mono text-[12px]">submit</code>{" "}
              function; Real mode uses the hardcoded endpoint in{" "}
              <code className="font-mono text-[12px]">submitFeedback</code>.
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/60 p-4 shadow-sm backdrop-blur">
            <div className="text-xs font-semibold tracking-wide text-muted-foreground">
              QUICK NOTES
            </div>
            <ul className="mt-2 space-y-1.5 text-[12px] text-muted-foreground">
              <li>Done state hides after ~2s (returns null).</li>
              <li>Error returns to selected silently.</li>
              <li>Reset remounts the widget instance.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-10">
          <WidgetSection
            tag="W01"
            title="Emoji"
            subtitle="Native emojis by default, optional Tabler faces."
          >
            <WidgetPlayground kind="emoji" />
          </WidgetSection>

          <Separator className="opacity-60" />

          <WidgetSection
            tag="W02"
            title="Thumbs"
            subtitle="Like/Dislike (1/0) with consistent submit flow."
          >
            <WidgetPlayground kind="thumbs" />
          </WidgetSection>

          <Separator className="opacity-60" />

          <WidgetSection
            tag="W03"
            title="Stars"
            subtitle="Hover preview, click to lock, submit to send."
          >
            <WidgetPlayground kind="stars" />
          </WidgetSection>
        </div>
      </main>
    </div>
  );
}
