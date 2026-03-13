"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart";
import { Progress } from "@workspace/ui/components/progress";
import { Badge } from "@workspace/ui/components/badge";
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
  IconActivity,
  IconChartBar,
  IconChevronRight,
  IconLayoutGrid,
  IconMoodHappy,
  IconMoodNeutral,
  IconMoodSad,
  IconStarFilled,
  IconThumbDownFilled,
  IconThumbUpFilled,
} from "@tabler/icons-react";

function formatDate(ms: number) {
  return new Date(ms).toLocaleString();
}

function formatShortDate(ms: number) {
  return new Date(ms).toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatShortTime(ms: number) {
  return new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function maskKey(key: string) {
  if (!key.startsWith("sk_")) return "••••••";
  if (key.length <= 10) return "sk_••••";
  const start = key.slice(0, 7); // sk_ + 4
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
  const deleteProject = useMutation(api.projects.deleteProject);

  const [tab, setTab] = useState<"overview" | "live">("overview");
  const [range, setRange] = useState<"24h" | "7d" | "30d" | "all">("7d");
  const [widgetFilter, setWidgetFilter] = useState<
    "all" | "emoji" | "thumbs" | "star"
  >("all");

  const [revealKey, setRevealKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (projectQueryArgs !== "skip") return;
    router.replace("/dashboard");
  }, [projectQueryArgs, router]);

  const project = data?.project;
  const convexProjectId = project?._id;
  const activeKey = data?.activeApiKey?.key;
  const keyDisplay = !activeKey ? "—" : revealKey ? activeKey : maskKey(activeKey);

  const feedbackWidgetType =
    widgetFilter === "all" ? undefined : (widgetFilter as "emoji" | "thumbs" | "star");

  const analyticsArgs =
    convexProjectId && projectQueryArgs !== "skip"
      ? { projectId: convexProjectId, range, widgetType: feedbackWidgetType }
      : "skip";

  const analytics = useQuery(api.feedback.getAnalytics, analyticsArgs);
  const volume = useQuery(api.feedback.getVolumeSeries, analyticsArgs);
  const feedArgs =
    convexProjectId && projectQueryArgs !== "skip"
      ? {
          projectId: convexProjectId,
          limit: 50,
          range,
          widgetType: feedbackWidgetType,
        }
      : "skip";
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
      window.prompt("Copy API key:", activeKey);
    }
  }

  async function onRotate() {
    if (!convexProjectId) return;
    if (
      !window.confirm("Rotate API key? Existing widgets will stop working.")
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

  const metricCardClass =
    "relative overflow-hidden border-border/60 bg-card/40 shadow-sm backdrop-blur";

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
          <Select value={range} onValueChange={(v) => setRange(v as any)}>
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

          <Select value={widgetFilter} onValueChange={(v) => setWidgetFilter(v as any)}>
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
                <IconChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <Panel>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">API key</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Use this key to authenticate public widget feedback writes.
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

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "overview" | "live")}
        orientation="vertical"
        className="gap-6 md:flex-row"
      >
        <TabsList
          variant="line"
          className="w-full justify-start gap-1 rounded-xl border border-border/60 bg-muted/10 p-2 md:w-[220px]"
        >
          <TabsTrigger value="overview" className="rounded-lg px-3 py-2">
            <IconChartBar className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="live" className="rounded-lg px-3 py-2">
            <IconActivity className="h-4 w-4" />
            Live Feed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Card className={metricCardClass}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground">
                  Total Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold tracking-tight">
                  {(analytics?.total ?? 0).toLocaleString()}
                </div>
                <div className="mt-1 text-[12px] text-muted-foreground">
                  Range: {range === "24h" ? "24h" : range}
                </div>
              </CardContent>
            </Card>

            <Card className={metricCardClass}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground">
                  Sentiment Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <div className="text-3xl font-extrabold tracking-tight">
                    {sentimentScore}%
                  </div>
                  <Badge variant="outline" className="mb-1">
                    {totals.positive}/{totals.positive + totals.negative}
                  </Badge>
                </div>
                <div className="mt-1 text-[12px] text-muted-foreground">
                  Positive / (Positive + Negative)
                </div>
              </CardContent>
            </Card>

            <Card className={metricCardClass}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground">
                  Avg / Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold tracking-tight">
                  {avgPerDay == null ? "—" : avgPerDay.toLocaleString()}
                </div>
                <div className="mt-1 text-[12px] text-muted-foreground">
                  {range === "all"
                    ? "All time (no daily avg)"
                    : "Based on selected range"}
                </div>
              </CardContent>
            </Card>

            <Card className={metricCardClass}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground">
                  Negative Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold tracking-tight">
                  {totals.negative.toLocaleString()}
                </div>
                <div className="mt-1 text-[12px] text-muted-foreground">
                  Thumbs down + low ratings
                </div>
              </CardContent>
            </Card>
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
              <div className="inline-flex items-center gap-2 text-[12px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span
                    className="size-2 rounded-sm"
                    style={{ backgroundColor: "var(--chart-1)" }}
                  />
                  Total
                </span>
                <span className="inline-flex items-center gap-1">
                  <span
                    className="size-2 rounded-sm"
                    style={{ backgroundColor: "var(--chart-2)" }}
                  />
                  Positive
                </span>
                <span className="inline-flex items-center gap-1">
                  <span
                    className="size-2 rounded-sm"
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
                  <ChartLegend content={<ChartLegendContent />} />
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
                <IconLayoutGrid className="h-4 w-4 text-muted-foreground" />
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
                            <IconMoodHappy className="h-4 w-4 text-muted-foreground" />
                          ) : row.key === "thumbs" ? (
                            <IconThumbUpFilled className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <IconStarFilled className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-medium">{row.label}</span>
                        </div>
                        <div className="font-mono text-[12px] text-muted-foreground">
                          {row.value.toLocaleString()} · {pct.toFixed(1)}%
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
                        <IconThumbUpFilled className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <IconThumbDownFilled className="h-4 w-4 text-muted-foreground" />
                      )
                    ) : widgetFilter === "all" ? (
                      row.key === "5" || row.key === "4" ? (
                        <IconMoodHappy className="h-4 w-4 text-muted-foreground" />
                      ) : row.key === "3" ? (
                        <IconMoodNeutral className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <IconMoodSad className="h-4 w-4 text-muted-foreground" />
                      )
                    ) : (
                      <IconStarFilled className="h-4 w-4 text-muted-foreground" />
                    );
                  return (
                    <div key={row.key} className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          {icon}
                          <span className="font-medium">{label}</span>
                        </div>
                        <div className="font-mono text-[12px] text-muted-foreground">
                          {row.count.toLocaleString()} · {row.pct.toFixed(1)}%
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
                        <div className="font-mono text-[12px] text-foreground/90">
                          {row.location}
                        </div>
                        <div className="font-mono text-[12px] text-muted-foreground">
                          {row.total} · {pct.toFixed(1)}%
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

        <TabsContent value="live" className="space-y-4">
          <Panel>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Live Feed</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Updates automatically as feedback arrives
                </div>
              </div>
              <Badge variant="outline">streaming</Badge>
            </div>

            <div className="mt-4 space-y-2">
              {(feed ?? []).length > 0 ? (
                (feed ?? []).map((f) => (
                  <div
                    key={f._id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/40 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 text-center font-mono text-[12px] text-foreground/90">
                        {f.widgetType === "thumbs" ? (
                          f.value === 1 ? (
                            <IconThumbUpFilled className="inline h-5 w-5 text-primary" />
                          ) : (
                            <IconThumbDownFilled className="inline h-5 w-5 text-muted-foreground" />
                          )
                        ) : f.widgetType === "star" ? (
                          <span className="inline-flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <IconStarFilled
                                key={i}
                                className={`h-4 w-4 ${i < f.value ? "text-primary" : "text-muted-foreground/30"}`}
                              />
                            ))}
                          </span>
                        ) : (
                          <span className="text-lg">
                            {f.value <= 1
                              ? "😡"
                              : f.value === 2
                                ? "🙁"
                                : f.value === 3
                                  ? "😐"
                                  : f.value === 4
                                    ? "🙂"
                                    : "😍"}
                          </span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-mono text-[12px] text-foreground/90">
                          {f.location}
                        </div>
                        <div className="text-[12px] text-muted-foreground">
                          {formatShortTime(f.createdAt)} · {f.widgetType}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">{String(f.value)}</Badge>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  No events yet. Submit feedback from the widgets playground.
                </div>
              )}
            </div>
          </Panel>
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
