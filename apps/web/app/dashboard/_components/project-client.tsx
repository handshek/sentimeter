"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart";
import { Progress } from "@workspace/ui/components/progress";
import { Badge } from "@workspace/ui/components/badge";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { Panel } from "./panel";
import { SyncUserGate } from "./sync-user-gate";
import { useEffect, useMemo, useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BarChart3,
  ChevronRight,
  Frown,
  LayoutGrid,
  Meh,
  Smile,
  Star,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

type RangeOption = "24h" | "7d" | "30d" | "all";
type WidgetFilterOption = "all" | "emoji" | "thumbs" | "star";

function formatDate(ms: number) {
  return new Date(ms).toLocaleString();
}

function formatShortDate(ms: number) {
  return new Date(ms).toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatShortTime(ms: number) {
  return new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatRelativeTime(ms: number) {
  const seconds = Math.floor((Date.now() - ms) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatShortDate(ms);
}

function maskKey(key: string) {
  if (!key.startsWith("pk_") && !key.startsWith("sk_")) return "••••••";
  if (key.length <= 10) return `${key.slice(0, 3)}••••`;
  const start = key.slice(0, 7);
  const end = key.slice(-4);
  return `${start}…${end}`;
}

export function ProjectClient({ projectId }: { projectId: string }) {
  return (
    <div className="space-y-8">
      <SyncUserGate>
        <ProjectInner projectId={projectId} />
      </SyncUserGate>
    </div>
  );
}

function ProjectInner({ projectId: propProjectId }: { projectId: string }) {
  const router = useRouter();
  const params = useParams<{ projectId?: string | string[] }>();

  const effectiveProjectId = useMemo(() => {
    const routeProjectId =
      typeof params?.projectId === "string"
        ? params.projectId
        : Array.isArray(params?.projectId)
          ? params?.projectId[0]
          : "";
    return propProjectId || routeProjectId;
  }, [params?.projectId, propProjectId]);

  const projectQueryArgs = useMemo(() => {
    return typeof effectiveProjectId === "string" && effectiveProjectId.length > 0
      ? { projectId: effectiveProjectId as Id<"projects"> }
      : "skip";
  }, [effectiveProjectId]);

  const data = useQuery(api.projects.getProject, projectQueryArgs);

  const rotateKey = useMutation(api.projects.generateApiKey);
  const updateAllowedOrigins = useMutation(api.projects.updateAllowedOrigins);
  const deleteProject = useMutation(api.projects.deleteProject);

  const [tab, setTab] = useState<"overview" | "live">("overview");
  const [range, setRange] = useState<RangeOption>("7d");
  const [widgetFilter, setWidgetFilter] = useState<WidgetFilterOption>("all");

  const [revealKey, setRevealKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [originText, setOriginText] = useState("");
  const [savingOrigins, setSavingOrigins] = useState(false);
  const [savedOrigins, setSavedOrigins] = useState(false);

  useEffect(() => {
    if (projectQueryArgs !== "skip") return;
    router.replace("/dashboard");
  }, [projectQueryArgs, router]);

  const project = data?.project;
  const convexProjectId = project?._id;
  const activeKey = data?.activeApiKey?.key;
  const keyDisplay = !activeKey ? "—" : revealKey ? activeKey : maskKey(activeKey);
  const hasOriginRestrictions = (project?.allowedOrigins?.length ?? 0) > 0;
  const allowedOriginsValue = (project?.allowedOrigins ?? []).join("\n");

  useEffect(() => {
    setOriginText(allowedOriginsValue);
  }, [allowedOriginsValue]);

  const feedbackWidgetType =
    widgetFilter === "all" ? undefined : (widgetFilter as "emoji" | "thumbs" | "star");

  const analyticsArgs = useMemo(() => {
    return convexProjectId && projectQueryArgs !== "skip"
      ? { projectId: convexProjectId, range, widgetType: feedbackWidgetType }
      : "skip";
  }, [convexProjectId, feedbackWidgetType, projectQueryArgs, range]);

  const analytics = useQuery(api.feedback.getAnalytics, analyticsArgs);
  const volume = useQuery(api.feedback.getVolumeSeries, analyticsArgs);
  const feedArgs = useMemo(() => {
    return convexProjectId && projectQueryArgs !== "skip"
      ? {
          projectId: convexProjectId,
          limit: 50,
          range,
          widgetType: feedbackWidgetType,
        }
      : "skip";
  }, [convexProjectId, feedbackWidgetType, projectQueryArgs, range]);
  const feed = useQuery(api.feedback.getFeedback, feedArgs);

  const chartData = useMemo(() => {
    const points = volume?.points ?? [];
    return points.map((p) => ({
      ts: p.ts,
      label: volume?.granularity === "hour" ? formatShortTime(p.ts) : formatShortDate(p.ts),
      total: p.total,
      positive: p.positive,
      negative: p.negative,
    }));
  }, [volume?.granularity, volume?.points]);

  const totals = useMemo(() => {
    const points = volume?.points ?? [];
    let positive = 0;
    let negative = 0;
    let total = 0;
    for (const p of points) {
      total += p.total;
      positive += p.positive;
      negative += p.negative;
    }
    return { total, positive, negative };
  }, [volume?.points]);

  const sentimentScore =
    totals.positive + totals.negative > 0
      ? Math.round((totals.positive / (totals.positive + totals.negative)) * 100)
      : 0;

  const avgPerDay =
    range === "24h"
      ? (analytics?.total ?? 0)
      : range === "7d"
        ? Math.round((analytics?.total ?? 0) / 7)
        : range === "30d"
          ? Math.round((analytics?.total ?? 0) / 30)
          : null;

  const topLocations = useMemo(() => {
    const byLocation = analytics?.byLocation ?? {};
    const entries = Object.entries(byLocation).map(([location, agg]) => ({
      location,
      total: agg.total,
    }));
    entries.sort((a, b) => b.total - a.total);
    return entries.slice(0, 8);
  }, [analytics?.byLocation]);

  const byWidgetType = analytics?.byWidgetType ?? { emoji: 0, thumbs: 0, star: 0 };
  const byWidgetTypeRows = [
    { key: "emoji" as const, label: "Emoji", value: byWidgetType.emoji },
    { key: "thumbs" as const, label: "Thumbs", value: byWidgetType.thumbs },
    { key: "star" as const, label: "Stars", value: byWidgetType.star },
  ];

  const distributionRows = useMemo(() => {
    const byValue = analytics?.byValue ?? {};
    const total = analytics?.total ?? 0;
    const keys =
      widgetFilter === "thumbs"
        ? ["1", "0"]
        : widgetFilter === "all"
          ? ["5", "4", "3", "2", "1"]
          : ["5", "4", "3", "2", "1"];

    return keys.map((k) => {
      const count = byValue[k] ?? 0;
      const pct = total > 0 ? (count / total) * 100 : 0;
      return { key: k, count, pct };
    });
  }, [analytics?.byValue, analytics?.total, widgetFilter]);

  async function onCopy() {
    if (!activeKey) return;
    try {
      await navigator.clipboard.writeText(activeKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      window.prompt("Copy publishable key:", activeKey);
    }
  }

  async function onRotate() {
    if (!convexProjectId) return;
    if (
      !window.confirm("Rotate publishable key? Existing widgets will stop working.")
    ) {
      return;
    }
    setRotating(true);
    try {
      await rotateKey({ projectId: convexProjectId });
      setRevealKey(true);
      setCopied(false);
    } finally {
      setRotating(false);
    }
  }

  async function onDelete() {
    if (!convexProjectId) return;
    if (
      !window.confirm("Delete this project? This also deletes feedback + keys.")
    ) {
      return;
    }
    setDeleting(true);
    try {
      await deleteProject({ projectId: convexProjectId });
      router.push("/dashboard");
    } finally {
      setDeleting(false);
    }
  }

  async function onSaveOrigins() {
    if (!convexProjectId || savingOrigins) return;

    const allowedOrigins = originText
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean);

    setSavingOrigins(true);
    setSavedOrigins(false);
    try {
      await updateAllowedOrigins({ projectId: convexProjectId, allowedOrigins });
      setSavedOrigins(true);
      window.setTimeout(() => setSavedOrigins(false), 1500);
    } finally {
      setSavingOrigins(false);
    }
  }

  if (projectQueryArgs === "skip") {
    return (
      <Panel>
        <div className="text-sm text-muted-foreground">Redirecting…</div>
      </Panel>
    );
  }

  const chartConfig = {
    total: { label: "Total", color: "var(--chart-1)" },
    positive: { label: "Positive", color: "var(--chart-2)" },
    negative: { label: "Negative", color: "var(--chart-5)" },
  } satisfies ChartConfig;

  const metricCards = [
    {
      label: "Total Responses",
      value: (analytics?.total ?? 0).toLocaleString(),
      accent: "var(--primary)",
    },
    {
      label: "Sentiment",
      value: `${sentimentScore}%`,
      accent: "oklch(0.65 0.19 145)",
      sub: `${totals.positive} positive of ${totals.positive + totals.negative}`,
    },
    {
      label: "Avg / Day",
      value: avgPerDay == null ? "\u2014" : avgPerDay.toLocaleString(),
      accent: "oklch(0.75 0.15 75)",
    },
    {
      label: "Negative",
      value: totals.negative.toLocaleString(),
      accent: "var(--destructive)",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" className="-ml-2">
          <Link href="/dashboard">← Projects</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        {project ? (
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {project.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Created {formatDate(project.createdAt)}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-7 w-64 animate-pulse rounded bg-muted/70" />
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={range}
            onValueChange={(v) => setRange(v as RangeOption)}
          >
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={widgetFilter}
            onValueChange={(v) => setWidgetFilter(v as WidgetFilterOption)}
          >
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All widgets</SelectItem>
              <SelectItem value="emoji">Emoji</SelectItem>
              <SelectItem value="thumbs">Thumbs</SelectItem>
              <SelectItem value="star">Stars</SelectItem>
            </SelectContent>
          </Select>

          {convexProjectId ? (
            <Button asChild variant="outline">
              <Link href={`/widgets?projectId=${convexProjectId}`}>
                Test in Widgets
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <Panel>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Publishable key</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Publishable write key for client-side widget feedback.
              </div>
            </div>
            <div className="inline-flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                aria-pressed={revealKey}
                onClick={() => setRevealKey((v) => !v)}
                disabled={!activeKey}
              >
                {revealKey ? "Hide" : "Reveal"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCopy}
                disabled={!activeKey}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border/70 bg-background px-3 py-2 font-mono text-sm">
            {data ? (
              keyDisplay
            ) : (
              <span className="inline-block h-4 w-72 animate-pulse rounded bg-muted/70 align-middle" />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={onRotate}
              disabled={!data || rotating}
            >
              {rotating ? "Rotating…" : "Rotate key"}
            </Button>
          </div>
        </div>
      </Panel>

      <Panel>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Allowed origins</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Leave empty to allow all origins. Add one origin per line to lock
                writes to specific deployed apps.
              </div>
            </div>
            <Badge variant={hasOriginRestrictions ? "default" : "outline"}>
              {hasOriginRestrictions ? "restricted" : "open"}
            </Badge>
          </div>

          <Textarea
            value={originText}
            onChange={(e) => setOriginText(e.target.value)}
            placeholder={"https://app.example.com\nhttps://staging.example.com"}
            className="min-h-28 font-mono text-sm"
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onSaveOrigins}
              disabled={!data || savingOrigins}
            >
              {savingOrigins ? "Saving…" : savedOrigins ? "Saved" : "Save origins"}
            </Button>
            <div className="text-xs text-muted-foreground">
              Exact origins only, including localhost ports when you choose to use
              them.
            </div>
          </div>
        </div>
      </Panel>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "overview" | "live")}
      >
        <TabsList
          variant="line"
          className="mb-6 w-full justify-start gap-0 rounded-none border-b border-border/60 bg-transparent p-0"
        >
          <TabsTrigger
            value="overview"
            className="rounded-none px-5 py-3 text-sm font-semibold"
          >
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="live"
            className="rounded-none px-5 py-3 text-sm font-semibold"
          >
            <Activity className="h-4 w-4" />
            Live Feed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metricCards.map((card) => (
              <div
                key={card.label}
                className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur"
                style={{ borderLeftWidth: 3, borderLeftColor: card.accent }}
              >
                <div className="p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {card.label}
                  </div>
                  <div className="mt-3 font-mono text-4xl font-bold tracking-tight">
                    {card.value}
                  </div>
                  {"sub" in card && card.sub ? (
                    <div className="mt-1 font-mono text-xs text-muted-foreground">
                      {card.sub}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <Panel>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Response Volume</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {widgetFilter === "all"
                    ? "All widgets"
                    : `Filtered: ${widgetFilter}`}
                  {range === "all" ? " · Chart shows last 30d" : null}
                </div>
              </div>
              <div className="inline-flex items-center gap-3 text-[12px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: "var(--chart-1)" }}
                  />
                  Total
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: "var(--chart-2)" }}
                  />
                  Positive
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: "var(--chart-5)" }}
                  />
                  Negative
                </span>
              </div>
            </div>

            <div className="mt-4">
              <ChartContainer config={chartConfig} className="h-[260px] w-full">
                <AreaChart data={chartData} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    width={32}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="var(--color-total)"
                    fill="var(--color-total)"
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="positive"
                    stroke="var(--color-positive)"
                    fill="var(--color-positive)"
                    fillOpacity={0.06}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="negative"
                    stroke="var(--color-negative)"
                    fill="var(--color-negative)"
                    fillOpacity={0.06}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">By Widget Type</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Which widget drives the most responses
                  </div>
                </div>
                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="mt-4 space-y-4">
                {byWidgetTypeRows.map((row) => {
                  const total = analytics?.total ?? 0;
                  const pct = total > 0 ? (row.value / total) * 100 : 0;
                  return (
                    <div key={row.key} className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          {row.key === "emoji" ? (
                            <Smile className="h-4 w-4 text-muted-foreground" />
                          ) : row.key === "thumbs" ? (
                            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Star className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-medium">{row.label}</span>
                        </div>
                        <div className="font-mono text-xs tabular-nums text-muted-foreground">
                          {row.value.toLocaleString()} &middot; {pct.toFixed(1)}%
                        </div>
                      </div>
                      <Progress value={pct} />
                    </div>
                  );
                })}
              </div>
            </Panel>

            <Panel>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">
                    {widgetFilter === "all" ? "Sentiment Breakdown" : "Value Breakdown"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Distribution of submitted values
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {distributionRows.map((row) => {
                  const label =
                    widgetFilter === "thumbs"
                      ? row.key === "1"
                        ? "Like"
                        : "Dislike"
                      : `${row.key}`;
                  const icon =
                    widgetFilter === "thumbs" ? (
                      row.key === "1" ? (
                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ThumbsDown className="h-4 w-4 text-muted-foreground" />
                      )
                    ) : widgetFilter === "all" ? (
                      row.key === "5" || row.key === "4" ? (
                        <Smile className="h-4 w-4 text-muted-foreground" />
                      ) : row.key === "3" ? (
                        <Meh className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Frown className="h-4 w-4 text-muted-foreground" />
                      )
                    ) : (
                      <Star className="h-4 w-4 text-muted-foreground" />
                    );
                  return (
                    <div key={row.key} className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          {icon}
                          <span className="font-medium">{label}</span>
                        </div>
                        <div className="font-mono text-xs tabular-nums text-muted-foreground">
                          {row.count.toLocaleString()} &middot; {row.pct.toFixed(1)}%
                        </div>
                      </div>
                      <Progress value={row.pct} />
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>

          <Panel>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Top Locations</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Where feedback is happening
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              {topLocations.length > 0 ? (
                topLocations.map((row) => {
                  const total = analytics?.total ?? 0;
                  const pct = total > 0 ? (row.total / total) * 100 : 0;
                  return (
                    <div
                      key={row.location}
                      className="rounded-lg border border-border/60 bg-background/40 px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-mono text-xs text-foreground/90">
                          {row.location}
                        </div>
                        <div className="font-mono text-xs tabular-nums text-muted-foreground">
                          {row.total} &middot; {pct.toFixed(1)}%
                        </div>
                      </div>
                      <div className="mt-2">
                        <Progress value={pct} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-muted-foreground">
                  No feedback yet. Use “Test in Widgets” to generate real data.
                </div>
              )}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="live" className="space-y-6">
          <header className="flex flex-col gap-1 border-b border-border/40 pb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight">Live Feed</h3>
              <span
                className="relative flex h-2 w-2 shrink-0"
                aria-hidden
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              New feedback appears here as it arrives
            </p>
          </header>

          {(feed ?? []).length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(feed ?? []).map((f, index) => {
                const isFeatured = index === 0;
                const hasText =
                  "text" in f &&
                  typeof f.text === "string" &&
                  f.text.trim().length > 0;
                return (
                  <article
                    key={f._id}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl border border-border/50 border-l-2 border-l-border/30 bg-card/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-border/80 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]",
                      isFeatured && "sm:col-span-2",
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-start gap-4",
                        isFeatured ? "p-5" : "p-3.5",
                      )}
                    >
                      <div
                        className={cn(
                          "flex shrink-0 items-center justify-center rounded-xl bg-muted/40 ring-1 ring-border/30 transition-colors group-hover:bg-muted/60",
                          isFeatured ? "h-12 w-12" : "h-10 w-10",
                        )}
                      >
                        {f.widgetType === "thumbs" ? (
                          f.value === 1 ? (
                            <ThumbsUp
                              className={cn(
                                "text-primary",
                                isFeatured ? "h-6 w-6" : "h-5 w-5",
                              )}
                            />
                          ) : (
                            <ThumbsDown
                              className={cn(
                                "text-muted-foreground",
                                isFeatured ? "h-6 w-6" : "h-5 w-5",
                              )}
                            />
                          )
                        ) : f.widgetType === "star" ? (
                          <span
                            className="inline-flex items-center gap-1 font-mono tabular-nums"
                            aria-label={`${f.value} of 5 stars`}
                          >
                            <span
                              className={cn(
                                "text-foreground/90",
                                isFeatured ? "text-sm font-semibold" : "text-xs font-medium",
                              )}
                            >
                              {f.value}
                            </span>
                            <Star
                              className={cn(
                                "shrink-0 text-amber-500",
                                isFeatured ? "h-4 w-4" : "h-3.5 w-3.5",
                              )}
                            />
                          </span>
                        ) : (
                          <span
                            className={cn(
                              "leading-none",
                              isFeatured ? "text-2xl" : "text-xl",
                            )}
                            aria-hidden
                          >
                            {f.value <= 1
                              ? "😖"
                              : f.value === 2
                                ? "😕"
                                : f.value === 3
                                  ? "😐"
                                  : f.value === 4
                                    ? "😊"
                                    : "😍"}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span className="font-mono text-xs font-semibold tracking-tight text-foreground">
                            {f.location}
                          </span>
                          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            {formatRelativeTime(f.createdAt)} &middot;{" "}
                            {f.widgetType}
                          </span>
                        </div>
                        {hasText ? (
                          <blockquote
                            className={cn(
                              "mt-2 border-l-2 border-muted-foreground/20 pl-3 italic leading-snug text-muted-foreground",
                              isFeatured
                                ? "text-sm"
                                : "text-xs line-clamp-2",
                            )}
                          >
                            &ldquo;{f.text!.trim()}&rdquo;
                          </blockquote>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/5 py-16 px-6 text-center">
              <div className="rounded-full bg-muted/40 p-4">
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  No feedback yet
                </p>
                <p className="max-w-xs text-xs text-muted-foreground">
                  Submit a reaction from the widgets playground to see it here.
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Panel className="border-destructive/30">
        <div className="space-y-3">
          <div className="text-sm font-semibold">Danger zone</div>
          <div className="text-sm text-muted-foreground">
            Deleting a project permanently removes its feedback and keys.
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={!data || deleting}
          >
            {deleting ? "Deleting…" : "Delete project"}
          </Button>
        </div>
      </Panel>
    </div>
  );
}
