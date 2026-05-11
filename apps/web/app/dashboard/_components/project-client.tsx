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
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart";
import { Badge } from "@workspace/ui/components/badge";
import { Textarea } from "@workspace/ui/components/textarea";
import { Separator } from "@workspace/ui/components/separator";
import { Input } from "@workspace/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { cn } from "@workspace/ui/lib/utils";
import { SyncUserGate } from "./sync-user-gate";
import { useEffect, useMemo, useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AreaChart as AreaChartIcon,
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  Columns3,
  Download,
  FlaskConical,
  Frown,
  Globe,
  Info,
  LayoutGrid,
  LineChart as LineChartIcon,
  Meh,
  MessageSquare,
  MoreHorizontal,
  Search,
  Settings,
  Smile,
  Star,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

type RangeOption = "24h" | "7d" | "30d" | "all";
type WidgetFilterOption = "all" | "emoji" | "thumbs" | "star";
type SentimentFilter = "all" | "positive" | "neutral" | "negative";
type ChartType = "stacked" | "grouped" | "area" | "line";
type Tone = "up" | "down" | "flat";

const CHART_TYPES: Array<{
  value: ChartType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: "stacked", label: "Stacked", icon: BarChart3 },
  { value: "grouped", label: "Grouped", icon: Columns3 },
  { value: "area", label: "Area", icon: AreaChartIcon },
  { value: "line", label: "Line", icon: LineChartIcon },
];

const RANGE_LABEL: Record<RangeOption, string> = {
  "24h": "LAST 24 HOURS",
  "7d": "LAST 7 DAYS",
  "30d": "LAST 30 DAYS",
  all: "ALL TIME",
};

const SENTIMENT_TINT = {
  positive:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
  negative:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20",
  neutral: "bg-muted text-muted-foreground border-border",
  amber:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
} as const;

const CHIP_SLATE =
  "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-300 dark:border-zinc-700/60";

function formatShortDate(ms: number) {
  return new Date(ms).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function formatShortTime(ms: number) {
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatLongDate(ms: number) {
  return new Date(ms).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

function classifyValueSentiment(
  widgetType: "emoji" | "thumbs" | "star",
  value: number,
): "positive" | "neutral" | "negative" {
  if (widgetType === "thumbs") return value === 1 ? "positive" : "negative";
  if (value >= 4) return "positive";
  if (value <= 2) return "negative";
  return "neutral";
}

function toneFor(delta: number): Tone {
  if (delta > 0.5) return "up";
  if (delta < -0.5) return "down";
  return "flat";
}

function DeltaBadge({
  delta,
  tone,
  suffix = "%",
  positiveIsGood = true,
}: {
  delta: number;
  tone: Tone;
  suffix?: string;
  positiveIsGood?: boolean;
}) {
  const isGood =
    tone === "flat" ? null : positiveIsGood ? tone === "up" : tone === "down";
  const tint =
    isGood === null
      ? SENTIMENT_TINT.neutral
      : isGood
        ? SENTIMENT_TINT.positive
        : SENTIMENT_TINT.negative;
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
  const abs = Math.abs(delta);
  const formatted =
    suffix === "pp"
      ? `${sign}${abs.toFixed(1)}pp`
      : suffix === "%"
        ? `${sign}${abs < 10 ? abs.toFixed(1) : Math.round(abs)}%`
        : `${sign}${Math.round(abs)}`;
  return (
    <Badge variant="outline" className={cn("font-medium", tint)}>
      {tone === "up" ? (
        <TrendingUp className="h-3 w-3" />
      ) : tone === "down" ? (
        <TrendingDown className="h-3 w-3" />
      ) : null}
      {formatted}
    </Badge>
  );
}

type VolumePoint = {
  ts: number;
  label: string;
  total: number;
  positive: number;
  neutral: number;
  negative: number;
};

function renderVolumeChart({
  chartType,
  chartData,
}: {
  chartType: ChartType;
  chartData: VolumePoint[];
}) {
  const bucketCount = chartData.length;
  const barSize =
    chartType === "grouped"
      ? bucketCount <= 8
        ? 12
        : bucketCount <= 14
          ? 9
          : bucketCount <= 24
            ? 7
            : 5
      : bucketCount <= 8
        ? 22
        : bucketCount <= 14
          ? 18
          : bucketCount <= 24
            ? 14
            : 10;
  const barCategoryGap =
    chartType === "grouped"
      ? Math.max(6, Math.round(barSize * 0.8))
      : Math.max(8, Math.round(barSize * 0.7));

  const sharedAxes = (
    <>
      <CartesianGrid
        vertical={false}
        stroke="var(--border)"
        strokeOpacity={0.8}
      />
      <XAxis
        dataKey="label"
        tickLine={false}
        axisLine={false}
        tickMargin={10}
        fontSize={11}
      />
      <YAxis
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        width={28}
        fontSize={11}
        allowDecimals={false}
      />
      <ChartTooltip
        content={<ChartTooltipContent indicator="dot" />}
        cursor={{ fill: "var(--muted)", opacity: 0.4 }}
      />
    </>
  );

  const margin = { left: 4, right: 4, top: 8, bottom: 0 };

  if (chartType === "area") {
    return (
      <RechartsAreaChart data={chartData} margin={margin}>
        {sharedAxes}
        <Area
          dataKey="negative"
          type="monotone"
          stroke="var(--color-negative)"
          fill="var(--color-negative)"
          fillOpacity={0.14}
          strokeWidth={2}
        />
        <Area
          dataKey="neutral"
          type="monotone"
          stroke="var(--color-neutral)"
          fill="var(--color-neutral)"
          fillOpacity={0.18}
          strokeWidth={2}
        />
        <Area
          dataKey="positive"
          type="monotone"
          stroke="var(--color-positive)"
          fill="var(--color-positive)"
          fillOpacity={0.22}
          strokeWidth={2}
        />
      </RechartsAreaChart>
    );
  }

  if (chartType === "line") {
    return (
      <RechartsLineChart data={chartData} margin={margin}>
        {sharedAxes}
        <Line
          dataKey="positive"
          type="monotone"
          stroke="var(--color-positive)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          dataKey="neutral"
          type="monotone"
          stroke="var(--color-neutral)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          dataKey="negative"
          type="monotone"
          stroke="var(--color-negative)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </RechartsLineChart>
    );
  }

  const stackId = chartType === "stacked" ? "s" : undefined;

  return (
    <BarChart
      data={chartData}
      margin={margin}
      barGap={2}
      barCategoryGap={barCategoryGap}
    >
      {sharedAxes}
      <Bar
        dataKey="positive"
        fill="var(--color-positive)"
        radius={[3, 3, 0, 0]}
        barSize={barSize}
        stackId={stackId}
      />
      <Bar
        dataKey="neutral"
        fill="var(--color-neutral)"
        radius={[3, 3, 0, 0]}
        barSize={barSize}
        stackId={stackId}
      />
      <Bar
        dataKey="negative"
        fill="var(--color-negative)"
        radius={[3, 3, 0, 0]}
        barSize={barSize}
        stackId={stackId}
      />
    </BarChart>
  );
}

export function ProjectClient({ projectId }: { projectId: string }) {
  return (
    <div className="space-y-8">
      <SyncUserGate fallback={<ProjectPageSkeleton />}>
        <ProjectInner projectId={projectId} />
      </SyncUserGate>
    </div>
  );
}

function ProjectPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sk className="h-4 w-16" />
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
          <Sk className="h-4 w-32" />
          <Sk className="ml-2 h-5 w-24 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Sk className="h-8 w-28 rounded-md" />
          <Sk className="h-8 w-28 rounded-md" />
          <Sk className="h-8 w-24 rounded-md" />
          <Sk className="h-8 w-24 rounded-md" />
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Sk className="h-8 w-56" />
          <Sk className="h-4 w-72" />
        </div>
        <Sk className="h-4 w-36" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiCardSkeleton key={`kpi-skel-${i}`} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card size="sm" className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div className="space-y-2">
              <Sk className="h-5 w-40" />
              <Sk className="h-3 w-56" />
            </div>
            <Sk className="h-8 w-28 rounded-md" />
          </CardHeader>
          <Separator className="mb-0" />
          <CardContent className="pt-4">
            <ChartSkeleton />
          </CardContent>
        </Card>

        <Card size="sm" className="flex flex-col">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div className="space-y-2">
              <Sk className="h-5 w-24" />
              <Sk className="h-3 w-40" />
            </div>
            <Sk className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-5">
            <SentimentCardSkeleton />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card size="sm">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div className="space-y-2">
              <Sk className="h-5 w-32" />
              <Sk className="h-3 w-48" />
            </div>
            <Sk className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent className="space-y-4">
            <WidgetTypeSkeleton />
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sk className="h-5 w-28" />
              <Sk className="h-5 w-8 rounded-full" />
            </div>
            <Sk className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent>
            <LocationsSkeleton />
          </CardContent>
        </Card>
      </div>

      <Card size="sm">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sk className="h-5 w-36" />
            <Sk className="h-5 w-20 rounded-full" />
            <Sk className="h-5 w-14 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Sk className="h-8 w-32 rounded-md" />
            <Sk className="h-8 w-56 rounded-md" />
            <Sk className="h-8 w-20 rounded-md" />
          </div>
        </CardHeader>
        <Separator className="mb-0" />
        <CardContent className="px-0">
          <div className="px-4 py-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`row-skel-${i}`}
                className="flex items-center gap-4 border-b border-border/40 py-3 last:border-0"
              >
                <Sk className="h-5 w-24" />
                <Sk className="h-5 w-10" />
                <Sk className="h-4 w-28" />
                <Sk className="h-4 flex-1" />
                <Sk className="h-5 w-16 rounded-full" />
                <Sk className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectInner({ projectId: propProjectId }: { projectId: string }) {
  const router = useRouter();
  const params = useParams<{ projectId?: string | string[] }>();
  const [deleting, setDeleting] = useState(false);

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
    return !deleting &&
      typeof effectiveProjectId === "string" &&
      effectiveProjectId.length > 0
      ? { projectId: effectiveProjectId as Id<"projects"> }
      : "skip";
  }, [deleting, effectiveProjectId]);

  const data = useQuery(api.projects.getProject, projectQueryArgs);

  const rotateKey = useMutation(api.projects.generateApiKey);
  const updateAllowedOrigins = useMutation(api.projects.updateAllowedOrigins);
  const deleteProject = useMutation(api.projects.deleteProject);

  const [range, setRange] = useState<RangeOption>("7d");
  const [widgetFilter, setWidgetFilter] = useState<WidgetFilterOption>("all");
  const [sentimentFilter, setSentimentFilter] =
    useState<SentimentFilter>("all");
  const [search, setSearch] = useState("");
  const [chartType, setChartType] = useState<ChartType>("stacked");

  const [revealKey, setRevealKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [originText, setOriginText] = useState("");
  const [savingOrigins, setSavingOrigins] = useState(false);
  const [savedOrigins, setSavedOrigins] = useState(false);

  const [, setNowTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setNowTick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (projectQueryArgs !== "skip") return;
    router.replace("/dashboard");
  }, [projectQueryArgs, router]);

  const project = data?.project;
  const convexProjectId = project?._id;
  const activeKey = data?.activeApiKey?.key;
  const keyDisplay = !activeKey
    ? "—"
    : revealKey
      ? activeKey
      : maskKey(activeKey);
  const hasOriginRestrictions = (project?.allowedOrigins?.length ?? 0) > 0;
  const allowedOriginsValue = (project?.allowedOrigins ?? []).join("\n");

  useEffect(() => {
    setOriginText(allowedOriginsValue);
  }, [allowedOriginsValue]);

  const feedbackWidgetType =
    widgetFilter === "all"
      ? undefined
      : (widgetFilter as "emoji" | "thumbs" | "star");

  const analyticsArgs = useMemo(() => {
    return !deleting && convexProjectId && projectQueryArgs !== "skip"
      ? { projectId: convexProjectId, range, widgetType: feedbackWidgetType }
      : "skip";
  }, [convexProjectId, deleting, feedbackWidgetType, projectQueryArgs, range]);

  const analytics = useQuery(api.feedback.getAnalytics, analyticsArgs);
  const volume = useQuery(api.feedback.getVolumeSeries, analyticsArgs);
  const feedArgs = useMemo(() => {
    return !deleting && convexProjectId && projectQueryArgs !== "skip"
      ? {
          projectId: convexProjectId,
          limit: 50,
          range,
          widgetType: feedbackWidgetType,
        }
      : "skip";
  }, [convexProjectId, deleting, feedbackWidgetType, projectQueryArgs, range]);
  const feed = useQuery(api.feedback.getFeedback, feedArgs);

  const chartData = useMemo(() => {
    const points = volume?.points ?? [];
    return points.map((p) => {
      const neutral = Math.max(0, p.total - p.positive - p.negative);
      return {
        ts: p.ts,
        label:
          volume?.granularity === "hour"
            ? formatShortTime(p.ts)
            : formatShortDate(p.ts),
        total: p.total,
        positive: p.positive,
        neutral,
        negative: p.negative,
      };
    });
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
    const neutral = Math.max(0, total - positive - negative);
    return { total, positive, neutral, negative };
  }, [volume?.points]);

  const sentimentScore =
    totals.positive + totals.negative > 0
      ? Math.round(
          (totals.positive / (totals.positive + totals.negative)) * 100,
        )
      : 0;

  const avgPerDay =
    range === "24h"
      ? (analytics?.total ?? 0)
      : range === "7d"
        ? Math.round((analytics?.total ?? 0) / 7)
        : range === "30d"
          ? Math.round((analytics?.total ?? 0) / 30)
          : null;

  const kpiDeltas = useMemo(() => {
    const points = volume?.points ?? [];
    if (points.length < 4) return null;
    const mid = Math.floor(points.length / 2);
    const early = points.slice(0, mid);
    const late = points.slice(mid);
    const sum = (arr: typeof points, k: "total" | "positive" | "negative") =>
      arr.reduce((acc, p) => acc + p[k], 0);

    const earlyTotal = sum(early, "total");
    const lateTotal = sum(late, "total");
    const earlyPositive = sum(early, "positive");
    const latePositive = sum(late, "positive");
    const earlyNegative = sum(early, "negative");
    const lateNegative = sum(late, "negative");

    const totalPct = earlyTotal
      ? ((lateTotal - earlyTotal) / earlyTotal) * 100
      : lateTotal > 0
        ? 100
        : 0;

    const earlySent =
      earlyPositive + earlyNegative > 0
        ? (earlyPositive / (earlyPositive + earlyNegative)) * 100
        : null;
    const lateSent =
      latePositive + lateNegative > 0
        ? (latePositive / (latePositive + lateNegative)) * 100
        : null;
    const sentimentPp =
      earlySent != null && lateSent != null ? lateSent - earlySent : null;

    const avgPct = earlyTotal
      ? ((lateTotal / late.length - earlyTotal / early.length) /
          (earlyTotal / early.length)) *
        100
      : null;

    const negativeDelta = lateNegative - earlyNegative;

    return {
      total: { delta: totalPct, tone: toneFor(totalPct) },
      sentiment:
        sentimentPp != null
          ? { delta: sentimentPp, tone: toneFor(sentimentPp) }
          : null,
      avg: avgPct != null ? { delta: avgPct, tone: toneFor(avgPct) } : null,
      negative: {
        delta: negativeDelta,
        tone: toneFor(negativeDelta),
      },
    };
  }, [volume?.points]);

  const topLocations = useMemo(() => {
    const byLocation = analytics?.byLocation ?? {};
    const entries = Object.entries(byLocation).map(([location, agg]) => ({
      location,
      total: agg.total,
    }));
    entries.sort((a, b) => b.total - a.total);
    return entries.slice(0, 8);
  }, [analytics?.byLocation]);

  const byWidgetType = analytics?.byWidgetType ?? {
    emoji: 0,
    thumbs: 0,
    star: 0,
  };
  const byWidgetTypeRows = [
    { key: "emoji" as const, label: "Emoji", value: byWidgetType.emoji },
    { key: "thumbs" as const, label: "Thumbs", value: byWidgetType.thumbs },
    { key: "star" as const, label: "Stars", value: byWidgetType.star },
  ];
  const widgetTotal = byWidgetTypeRows.reduce((a, r) => a + r.value, 0);

  const filteredFeed = useMemo(() => {
    const items = feed ?? [];
    const q = search.trim().toLowerCase();
    return items.filter((f) => {
      if (sentimentFilter !== "all") {
        const sent = classifyValueSentiment(f.widgetType, f.value);
        if (sent !== sentimentFilter) return false;
      }
      if (q) {
        const hay =
          `${f.location ?? ""} ${"text" in f && typeof f.text === "string" ? f.text : ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [feed, search, sentimentFilter]);

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
    setDeleting(true);
    try {
      await deleteProject({ projectId: convexProjectId });
      router.replace("/dashboard");
    } catch {
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
      await updateAllowedOrigins({
        projectId: convexProjectId,
        allowedOrigins,
      });
      setSavedOrigins(true);
      window.setTimeout(() => setSavedOrigins(false), 1500);
    } catch {
      toast.error("Could not save origins.");
    } finally {
      setSavingOrigins(false);
    }
  }

  if (projectQueryArgs === "skip") {
    return (
      <Card size="sm">
        <CardContent>
          <div className="text-sm text-muted-foreground">Redirecting…</div>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    positive: { label: "Positive", color: "oklch(0.72 0.17 153)" },
    neutral: { label: "Neutral", color: "oklch(0.84 0.01 250)" },
    negative: { label: "Negative", color: "oklch(0.64 0.22 25)" },
  } satisfies ChartConfig;

  const kpiCards = [
    {
      key: "total",
      label: "Total responses",
      icon: MessageSquare,
      value: (analytics?.total ?? 0).toLocaleString(),
      sub:
        volume?.points && volume.points.length > 0
          ? `vs previous ${range === "24h" ? "24h" : range === "7d" ? "7 days" : range === "30d" ? "30 days" : "period"}`
          : "no prior data",
      delta: kpiDeltas?.total ?? null,
      positiveIsGood: true,
      suffix: "%" as const,
    },
    {
      key: "sentiment",
      label: "Sentiment",
      icon: Smile,
      value: `${sentimentScore}%`,
      sub: `${totals.positive} positive of ${totals.positive + totals.negative}`,
      delta: kpiDeltas?.sentiment ?? null,
      positiveIsGood: true,
      suffix: "pp" as const,
    },
    {
      key: "avg",
      label: "Avg / day",
      icon: Activity,
      value: avgPerDay == null ? "—" : avgPerDay.toLocaleString(),
      sub:
        range === "24h"
          ? "same as total"
          : range === "all"
            ? "N/A for all-time"
            : `across ${range === "7d" ? "7" : "30"} days`,
      delta: kpiDeltas?.avg ?? null,
      positiveIsGood: true,
      suffix: "%" as const,
    },
    {
      key: "negative",
      label: "Negative",
      icon: Frown,
      value: totals.negative.toLocaleString(),
      sub:
        totals.negative > 0
          ? `${Math.round((totals.negative / Math.max(1, totals.total)) * 100)}% of responses`
          : "none in range",
      delta: kpiDeltas?.negative ?? null,
      positiveIsGood: false,
      suffix: "" as const,
    },
  ];

  const segPositivePct =
    totals.total > 0 ? (totals.positive / totals.total) * 100 : 0;
  const segNeutralPct =
    totals.total > 0 ? (totals.neutral / totals.total) * 100 : 0;
  const segNegativePct =
    totals.total > 0 ? (totals.negative / totals.total) * 100 : 0;

  const rangeLabel = RANGE_LABEL[range];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav
          aria-label="breadcrumb"
          className="flex items-center gap-1.5 text-sm"
        >
          <Link
            href="/dashboard"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Projects
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          {project ? (
            <span className="font-medium text-foreground">{project.name}</span>
          ) : (
            <span className="inline-block h-4 w-28 animate-pulse rounded bg-muted/70" />
          )}
          {activeKey ? (
            <Badge
              variant="outline"
              className={cn(
                "ml-2 font-mono text-[10.5px] tracking-tight",
                CHIP_SLATE,
              )}
            >
              {maskKey(activeKey)}
            </Badge>
          ) : null}
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={range}
            onValueChange={(v) => setRange(v as RangeOption)}
          >
            <SelectTrigger
              size="sm"
              className="h-8 gap-1.5 bg-background dark:bg-background"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="end">
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
            <SelectTrigger
              size="sm"
              className="h-8 gap-1.5 bg-background dark:bg-background"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              <SelectItem value="all">All widgets</SelectItem>
              <SelectItem value="emoji">Emoji</SelectItem>
              <SelectItem value="thumbs">Thumbs</SelectItem>
              <SelectItem value="star">Stars</SelectItem>
            </SelectContent>
          </Select>

          <span className="mx-1 hidden h-5 w-px bg-border sm:inline-block" />

          {convexProjectId ? (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="border border-dashed border-border text-muted-foreground hover:text-foreground"
              title="Dev-only · will be removed before production"
            >
              <Link href={`/widgets?projectId=${convexProjectId}`}>
                <FlaskConical className="h-4 w-4" />
                Test widgets
              </Link>
            </Button>
          ) : null}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" disabled={!data}>
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full overflow-y-auto sm:max-w-md"
            >
              <SheetHeader>
                <SheetTitle>Project settings</SheetTitle>
                <SheetDescription>
                  {project?.name ?? "Loading…"}
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-6 px-4 pb-8">
                <section className="space-y-3">
                  <div>
                    <div className="text-sm font-semibold">Publishable key</div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Publishable write key for client-side widget feedback.
                    </p>
                  </div>

                  <div className="rounded-lg border border-border/70 bg-muted/40 px-3 py-2 font-mono text-sm break-all">
                    {data ? (
                      keyDisplay
                    ) : (
                      <span className="inline-block h-4 w-56 animate-pulse rounded bg-muted/70 align-middle" />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-pressed={revealKey}
                      onClick={() => setRevealKey((v) => !v)}
                      disabled={!activeKey}
                    >
                      {revealKey ? "Hide" : "Reveal"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onCopy}
                      disabled={!activeKey}
                    >
                      {copied ? "Copied" : "Copy"}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          size="sm"
                          disabled={!data || rotating}
                        >
                          {rotating ? "Rotating…" : "Rotate"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Rotate publishable key?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Existing widgets using the current key will stop
                            working. Replace the key in your deployments after
                            rotating.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={rotating}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={onRotate}
                            disabled={rotating}
                          >
                            {rotating ? "Rotating…" : "Rotate key"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </section>

                <Separator />

                <section className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "relative flex h-2 w-2 shrink-0",
                          hasOriginRestrictions
                            ? "text-emerald-500"
                            : "text-amber-500",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute inline-flex h-full w-full rounded-full opacity-40",
                            hasOriginRestrictions
                              ? "bg-emerald-500"
                              : "animate-pulse bg-amber-500",
                          )}
                        />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
                      </span>
                      <div className="text-sm font-semibold">
                        Allowed origins
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] uppercase tracking-widest",
                        hasOriginRestrictions
                          ? SENTIMENT_TINT.positive
                          : SENTIMENT_TINT.amber,
                      )}
                    >
                      {hasOriginRestrictions ? "enforced" : "open"}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    One origin per line. Leave blank to accept any origin.
                  </p>

                  <Textarea
                    value={originText}
                    onChange={(e) => setOriginText(e.target.value)}
                    placeholder={
                      "https://app.example.com\nhttps://staging.example.com\nhttp://localhost:3000"
                    }
                    className="min-h-28 font-mono text-sm"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onSaveOrigins}
                      disabled={!data || savingOrigins}
                    >
                      {savingOrigins
                        ? "Saving…"
                        : savedOrigins
                          ? "Saved"
                          : "Save origins"}
                    </Button>
                    {!hasOriginRestrictions ? (
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        All origins accepted
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {project?.allowedOrigins?.length} origin
                        {(project?.allowedOrigins?.length ?? 0) !== 1
                          ? "s"
                          : ""}{" "}
                        enforced
                      </span>
                    )}
                  </div>
                </section>

                <Separator />

                <section className="space-y-3">
                  <div>
                    <div className="text-sm font-semibold text-destructive">
                      Danger zone
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Deleting a project permanently removes its feedback and
                      keys.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={!data || deleting}
                      >
                        {deleting ? "Deleting…" : "Delete project"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete project?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This permanently deletes the project, feedback, and
                          API keys. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={onDelete}
                          disabled={deleting}
                        >
                          {deleting ? "Deleting…" : "Delete project"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </section>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          {project ? (
            <h1 className="text-3xl font-bold tracking-tight">
              {project.name}
            </h1>
          ) : (
            <div className="h-8 w-56 animate-pulse rounded bg-muted/70" />
          )}
          <p className="text-sm text-muted-foreground">
            Feedback overview
            {project ? (
              <>
                <span className="mx-1.5 text-muted-foreground/40">·</span>
                Created {formatLongDate(project.createdAt)}
              </>
            ) : null}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          {feed === undefined
            ? "Connecting…"
            : feed[0]
              ? `Updated ${formatRelativeTime(feed[0].createdAt)}`
              : "Awaiting first feedback"}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {analytics === undefined || volume === undefined
          ? Array.from({ length: 4 }).map((_, i) => (
              <KpiCardSkeleton key={`kpi-skel-${i}`} />
            ))
          : kpiCards.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <Card key={kpi.key} size="sm" className="gap-3">
                  <CardHeader className="flex flex-row items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{kpi.label}</span>
                        <Info className="h-3.5 w-3.5 text-muted-foreground/60" />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-muted-foreground/60 transition-colors hover:text-foreground"
                      aria-label="More"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-end justify-between gap-2">
                      <div className="font-mono text-3xl font-bold leading-none tracking-tight">
                        {kpi.value}
                      </div>
                      {kpi.delta ? (
                        <DeltaBadge
                          delta={kpi.delta.delta}
                          tone={kpi.delta.tone}
                          suffix={kpi.suffix}
                          positiveIsGood={kpi.positiveIsGood}
                        />
                      ) : null}
                    </div>
                    <p className="font-mono text-[11.5px] text-muted-foreground">
                      {kpi.sub}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card size="sm" className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold tracking-tight">
                  Response volume
                </span>
                <Badge
                  variant="outline"
                  className={cn("text-[10px] tracking-widest", CHIP_SLATE)}
                >
                  {rangeLabel}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Daily sentiment-coded submissions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-3 text-[11.5px] text-muted-foreground sm:inline-flex">
                <Legend color="oklch(0.72 0.17 153)" label="Positive" />
                <Legend color="oklch(0.84 0.01 250)" label="Neutral" />
                <Legend color="oklch(0.64 0.22 25)" label="Negative" />
              </div>
              <Select
                value={chartType}
                onValueChange={(v) => setChartType(v as ChartType)}
              >
                <SelectTrigger
                  size="sm"
                  className="h-8 gap-1.5 bg-background dark:bg-background"
                  aria-label="Chart type"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="end">
                  {CHART_TYPES.map((t) => {
                    const Icon = t.icon;
                    return (
                      <SelectItem key={t.value} value={t.value}>
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        {t.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <Separator className="mb-0" />
          <CardContent className="pt-4">
            {volume === undefined ? (
              <ChartSkeleton />
            ) : (
              <ChartContainer config={chartConfig} className="h-[240px] w-full">
                {renderVolumeChart({ chartType, chartData })}
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card size="sm" className="flex flex-col">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <div className="text-base font-semibold tracking-tight">
                Sentiment
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Distribution across all widgets
              </p>
            </div>
            <button
              type="button"
              className="text-muted-foreground/60 transition-colors hover:text-foreground"
              aria-label="More"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-5">
            {volume === undefined ? (
              <SentimentCardSkeleton />
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <div className="font-mono text-[28px] font-bold leading-none tracking-tight">
                    {totals.total.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">responses</div>
                </div>

                <div className="flex h-2.5 gap-[2px] overflow-hidden rounded-sm">
                  <span
                    className="h-full"
                    style={{
                      width: `${segPositivePct}%`,
                      background: "oklch(0.72 0.17 153)",
                    }}
                  />
                  <span
                    className="h-full"
                    style={{
                      width: `${segNeutralPct}%`,
                      background: "oklch(0.84 0.01 250)",
                    }}
                  />
                  <span
                    className="h-full"
                    style={{
                      width: `${segNegativePct}%`,
                      background: "oklch(0.64 0.22 25)",
                    }}
                  />
                  {totals.total === 0 ? (
                    <span className="h-full flex-1 bg-muted" />
                  ) : null}
                </div>

                <div className="space-y-3">
                  <SentimentRow
                    color="oklch(0.72 0.17 153)"
                    icon={<Smile className="h-4 w-4 text-muted-foreground" />}
                    label="Positive"
                    count={totals.positive}
                    pct={segPositivePct}
                    tint={SENTIMENT_TINT.positive}
                  />
                  <SentimentRow
                    color="oklch(0.84 0.01 250)"
                    icon={<Meh className="h-4 w-4 text-muted-foreground" />}
                    label="Neutral"
                    count={totals.neutral}
                    pct={segNeutralPct}
                    tint={SENTIMENT_TINT.neutral}
                  />
                  <SentimentRow
                    color="oklch(0.64 0.22 25)"
                    icon={<Frown className="h-4 w-4 text-muted-foreground" />}
                    label="Negative"
                    count={totals.negative}
                    pct={segNegativePct}
                    tint={SENTIMENT_TINT.negative}
                  />
                </div>

                <div className="mt-auto border-t border-border/60 pt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    View full breakdown
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card size="sm">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <div className="text-base font-semibold tracking-tight">
                By widget type
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Which widget drives the most responses
              </p>
            </div>
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics === undefined ? (
              <WidgetTypeSkeleton />
            ) : (
              byWidgetTypeRows.map((row) => {
                const pct =
                  widgetTotal > 0 ? (row.value / widgetTotal) * 100 : 0;
                const Icon =
                  row.key === "emoji"
                    ? Smile
                    : row.key === "thumbs"
                      ? ThumbsUp
                      : Star;
                return (
                  <div key={row.key}>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            row.key === "star"
                              ? "text-amber-500"
                              : "text-muted-foreground",
                          )}
                        />
                        <span className="font-medium">{row.label}</span>
                      </div>
                      <div className="font-mono text-[12.5px] tabular-nums text-muted-foreground">
                        {row.value.toLocaleString()} · {pct.toFixed(1)}%
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="text-base font-semibold tracking-tight">
                Top locations
              </div>
              <Badge variant="outline" className={CHIP_SLATE}>
                {topLocations.length}
              </Badge>
            </div>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analytics === undefined ? (
              <LocationsSkeleton />
            ) : topLocations.length > 0 ? (
              <div className="space-y-1">
                {topLocations.map((row) => {
                  const total = analytics?.total ?? 0;
                  const pct = total > 0 ? (row.total / total) * 100 : 0;
                  return (
                    <div
                      key={row.location}
                      className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/40"
                    >
                      <Globe className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                      <div className="min-w-0 flex-1 truncate font-mono text-[12.5px]">
                        {row.location || "/"}
                      </div>
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="w-24 text-right font-mono text-[12.5px] tabular-nums text-muted-foreground">
                        {row.total} · {pct.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No locations yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card size="sm">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight">
              Recent feedback
            </span>
            <Badge variant="outline" className={CHIP_SLATE}>
              {(analytics?.total ?? 0).toLocaleString()} total
            </Badge>
            <Badge
              variant="outline"
              className={cn("gap-1.5", SENTIMENT_TINT.positive)}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Live
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={sentimentFilter}
              onValueChange={(v) => setSentimentFilter(v as SentimentFilter)}
            >
              <SelectTrigger
                size="sm"
                className="h-8 gap-1.5 bg-background dark:bg-background"
              >
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectItem value="all">Any sentiment</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search message or location"
                className="h-8 w-56 pl-8 text-sm"
              />
            </div>
            <Button variant="outline" size="sm" disabled>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <Separator className="mb-0" />
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4 text-[11px] uppercase tracking-widest text-muted-foreground">
                  Widget
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Value
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Location
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Message
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Sentiment
                </TableHead>
                <TableHead className="pr-4 text-right text-[11px] uppercase tracking-widest text-muted-foreground">
                  Received
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feed === undefined ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell className="pl-4">
                      <div className="h-5 w-24 animate-pulse rounded bg-muted/70" />
                    </TableCell>
                    <TableCell>
                      <div className="h-5 w-10 animate-pulse rounded bg-muted/70" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-28 animate-pulse rounded bg-muted/70" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-48 animate-pulse rounded bg-muted/70" />
                    </TableCell>
                    <TableCell>
                      <div className="h-5 w-16 animate-pulse rounded-full bg-muted/70" />
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <div className="ml-auto h-4 w-12 animate-pulse rounded bg-muted/70" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredFeed.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    {search.trim() || sentimentFilter !== "all"
                      ? "No feedback matches your filters."
                      : "No feedback yet. Submit a reaction from the widgets playground to see it here."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredFeed.map((f) => {
                  const sent = classifyValueSentiment(f.widgetType, f.value);
                  const hasText =
                    "text" in f &&
                    typeof f.text === "string" &&
                    f.text.trim().length > 0;
                  const WidgetIcon =
                    f.widgetType === "emoji"
                      ? Smile
                      : f.widgetType === "thumbs"
                        ? ThumbsUp
                        : Star;
                  return (
                    <TableRow key={f._id}>
                      <TableCell className="pl-4">
                        <div className="inline-flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground">
                            <WidgetIcon className="h-3.5 w-3.5" />
                          </span>
                          <span className="text-sm font-medium capitalize">
                            {f.widgetType}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {f.widgetType === "thumbs" ? (
                          f.value === 1 ? (
                            <ThumbsUp className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <ThumbsDown className="h-4 w-4 text-rose-500" />
                          )
                        ) : f.widgetType === "star" ? (
                          <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                            <span className="text-sm">{f.value}</span>
                            <Star className="h-3.5 w-3.5 text-amber-500" />
                          </span>
                        ) : (
                          <span className="text-lg leading-none">
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
                      </TableCell>
                      <TableCell className="font-mono text-[12.5px] text-muted-foreground">
                        {f.location || "/"}
                      </TableCell>
                      <TableCell className="max-w-[280px] truncate text-sm text-muted-foreground">
                        {hasText ? (
                          <span title={f.text!.trim()}>
                            &ldquo;{f.text!.trim()}&rdquo;
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("capitalize", SENTIMENT_TINT[sent])}
                        >
                          {sent}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-4 text-right font-mono text-[12.5px] tabular-nums text-muted-foreground">
                        {formatRelativeTime(f.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
        <Separator className="mb-0" />
        <div className="flex items-center justify-between px-5 py-3 text-xs text-muted-foreground">
          <span>
            Showing {filteredFeed.length} of {(feed ?? []).length}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

function Sk({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded bg-muted/70", className)}
      aria-hidden
    />
  );
}

function KpiCardSkeleton() {
  return (
    <Card size="sm" className="gap-3">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 shrink-0 animate-pulse items-center justify-center rounded-lg border border-border bg-muted/60" />
          <Sk className="h-4 w-24" />
        </div>
        <Sk className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between gap-2">
          <Sk className="h-8 w-20" />
          <Sk className="h-5 w-14 rounded-full" />
        </div>
        <Sk className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  const heights = [60, 40, 75, 55, 85, 45, 70];
  return (
    <div className="flex h-[240px] w-full flex-col gap-2">
      <div className="relative flex flex-1 items-end gap-6 pr-2 pl-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={`grid-${i}`}
            className="absolute left-6 right-2 border-t border-border/70"
            style={{ top: `${(i * 100) / 4}%` }}
          />
        ))}
        {heights.map((h, i) => (
          <div
            key={`bar-${i}`}
            className="flex flex-1 items-end justify-center gap-[3px]"
          >
            <div
              className="w-[14%] min-w-[6px] animate-pulse rounded-t bg-muted/80"
              style={{ height: `${h}%` }}
            />
            <div
              className="w-[14%] min-w-[6px] animate-pulse rounded-t bg-muted/60"
              style={{ height: `${Math.max(20, h - 15)}%` }}
            />
            <div
              className="w-[14%] min-w-[6px] animate-pulse rounded-t bg-muted/50"
              style={{ height: `${Math.max(15, h - 30)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between pl-6 pr-2">
        {heights.map((_, i) => (
          <Sk key={`lbl-${i}`} className="h-2.5 w-8" />
        ))}
      </div>
    </div>
  );
}

function SentimentCardSkeleton() {
  return (
    <>
      <div className="flex items-baseline gap-2">
        <Sk className="h-7 w-20" />
        <Sk className="h-3 w-16" />
      </div>
      <Sk className="h-2.5 w-full rounded-sm" />
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div
            key={`sent-skel-${i}`}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <Sk className="h-2 w-2 rounded-full" />
              <Sk className="h-4 w-4 rounded" />
              <Sk className="h-4 w-16" />
            </div>
            <div className="flex items-center gap-3">
              <Sk className="h-4 w-8" />
              <Sk className="h-5 w-11 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto border-t border-border/60 pt-4">
        <Sk className="h-8 w-full rounded-md" />
      </div>
    </>
  );
}

function WidgetTypeSkeleton() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div key={`wt-skel-${i}`} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sk className="h-4 w-4 rounded" />
              <Sk className="h-4 w-16" />
            </div>
            <Sk className="h-3 w-20" />
          </div>
          <Sk className="h-1.5 w-full rounded-full" />
        </div>
      ))}
    </>
  );
}

function LocationsSkeleton() {
  const widths = ["w-40", "w-32", "w-48", "w-28", "w-36"];
  return (
    <div className="space-y-2">
      {widths.map((w, i) => (
        <div
          key={`loc-skel-${i}`}
          className="flex items-center gap-3 rounded-lg px-2 py-1.5"
        >
          <Sk className="h-4 w-4 rounded" />
          <div className="flex-1">
            <Sk className={cn("h-3.5", w)} />
          </div>
          <Sk className="h-1.5 w-20 rounded-full" />
          <Sk className="h-3.5 w-20" />
        </div>
      ))}
    </div>
  );
}

function SentimentRow({
  color,
  icon,
  label,
  count,
  pct,
  tint,
}: {
  color: string;
  icon: React.ReactNode;
  label: string;
  count: number;
  pct: number;
  tint: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: color }}
        />
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-[12.5px] tabular-nums">
          {count.toLocaleString()}
        </span>
        <Badge
          variant="outline"
          className={cn("min-w-[42px] justify-center", tint)}
        >
          {pct.toFixed(0)}%
        </Badge>
      </div>
    </div>
  );
}
