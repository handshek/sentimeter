"use client";

import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import Link from "next/link";
import { useNavigationGuard } from "nextjs-nav-guard";
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
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { classifyFeedbackSentiment } from "../../../convex/lib/feedbackDomain";
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
  BarChart3,
  ChevronRight,
  Columns3,
  FlaskConical,
  Frown,
  Globe,
  Info,
  LayoutGrid,
  LineChart as LineChartIcon,
  Meh,
  MessageSquare,
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
import { copyText, type CopyTextResult } from "../../_lib/clipboard";
import { formatFeedbackFeedSummary } from "./feedback-feed-summary";
import { formatResponseVolumeSummary } from "./project-accessibility";
import {
  allowedOriginsDraftReducer,
  createAllowedOriginsDraft,
  hasUnsavedAllowedOrigins,
} from "./project-settings-state";
import {
  parseProjectViewQuery,
  updateProjectViewQuery,
  type ChartType,
  type ProjectViewQuery,
  type RangeOption,
  type SentimentFilter,
  type WidgetFilterOption,
} from "./project-view-query";

type Tone = "up" | "down" | "flat";

const SHOW_DEVELOPMENT_WIDGET_TOOLS = process.env.NODE_ENV === "development";
const SEARCH_QUERY_DEBOUNCE_MS = 300;
const UNSAVED_ORIGINS_WARNING =
  "You have unsaved allowed-origin changes. Leave without saving them?";

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

const RANGE_SUMMARY_LABEL: Record<RangeOption, string> = {
  "24h": "the last 24 hours",
  "7d": "the last 7 days",
  "30d": "the last 30 days",
  all: "all time",
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
        <TrendingUp className="h-3 w-3" aria-hidden="true" />
      ) : tone === "down" ? (
        <TrendingDown className="h-3 w-3" aria-hidden="true" />
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
    <div className="min-w-0 space-y-8">
      <SyncUserGate fallback={<ProjectPageSkeleton />}>
        <ProjectInner projectId={projectId} />
      </SyncUserGate>
    </div>
  );
}

function ProjectPageSkeleton() {
  return (
    <div
      className="min-w-0 space-y-6 overflow-x-hidden"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading project dashboard…</span>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <Sk className="h-4 w-16" />
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
          <Sk className="h-4 w-32" />
          <Sk className="ml-2 h-5 w-24 rounded-full" />
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <Sk className="h-8 w-28 rounded-md" />
          <Sk className="h-8 w-28 rounded-md" />
          {SHOW_DEVELOPMENT_WIDGET_TOOLS ? (
            <Sk className="h-8 w-24 rounded-md" />
          ) : null}
          <Sk className="h-8 w-24 rounded-md" />
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 max-w-full space-y-2">
          <Sk className="h-8 w-56" />
          <Sk className="h-4 w-full max-w-72" />
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
            <div className="min-w-0 flex-1 space-y-2">
              <Sk className="h-5 w-40" />
              <Sk className="h-3 w-full max-w-56" />
            </div>
            <Sk className="h-8 w-28 rounded-md" />
          </CardHeader>
          <Separator className="mb-0" />
          <CardContent className="pt-4">
            <ChartSkeleton />
          </CardContent>
        </Card>

        <Card size="sm" className="flex flex-col">
          <CardHeader className="flex flex-row items-start gap-2">
            <div className="space-y-2">
              <Sk className="h-5 w-24" />
              <Sk className="h-3 w-40" />
            </div>
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
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Sk className="h-5 w-36" />
            <Sk className="h-5 w-20 rounded-full" />
            <Sk className="h-5 w-14 rounded-full" />
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Sk className="h-8 w-32 rounded-md" />
            <Sk className="h-8 w-full max-w-56 rounded-md sm:w-56" />
          </div>
        </CardHeader>
        <Separator className="mb-0" />
        <CardContent className="px-0">
          <div className="px-4 py-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`row-skel-${i}`}
                className="grid min-w-0 grid-cols-2 items-center gap-4 border-b border-border/40 py-3 last:border-0 sm:grid-cols-[6rem_2.5rem_7rem_minmax(0,1fr)_4rem_3rem]"
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
  const pathname = usePathname();
  const params = useParams<{ projectId?: string | string[] }>();
  const searchParams = useSearchParams();
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

  const projectView = parseProjectViewQuery(searchParams);
  const {
    range,
    widget: widgetFilter,
    sentiment: sentimentFilter,
    search,
    chart: chartType,
  } = projectView;
  const [searchInput, setSearchInput] = useState(search);
  const searchTimeoutRef = useRef<number | null>(null);

  const clearSearchTimeout = useCallback(() => {
    if (searchTimeoutRef.current === null) return;
    window.clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = null;
  }, []);

  const pushProjectView = useCallback(
    (updates: Partial<ProjectViewQuery>) => {
      const query = updateProjectViewQuery(searchParams, updates);
      router.push(`${pathname}${query ? `?${query}` : ""}`, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  function updateProjectView(updates: Partial<ProjectViewQuery>) {
    clearSearchTimeout();
    pushProjectView({ search: searchInput, ...updates });
  }

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    clearSearchTimeout();
    if (searchInput === search) return clearSearchTimeout;

    searchTimeoutRef.current = window.setTimeout(() => {
      searchTimeoutRef.current = null;
      pushProjectView({ search: searchInput });
    }, SEARCH_QUERY_DEBOUNCE_MS);

    return clearSearchTimeout;
  }, [clearSearchTimeout, pushProjectView, search, searchInput]);

  const [revealKey, setRevealKey] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | CopyTextResult>("idle");
  const [keyActionStatus, setKeyActionStatus] = useState("");
  const [keyActionError, setKeyActionError] = useState("");
  const [rotating, setRotating] = useState(false);
  const [originDraft, dispatchOriginDraft] = useReducer(
    allowedOriginsDraftReducer,
    undefined,
    createAllowedOriginsDraft,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [discardOriginsOpen, setDiscardOriginsOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [, setNowTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setNowTick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (projectQueryArgs !== "skip" || deleting) return;
    router.replace("/dashboard");
  }, [deleting, projectQueryArgs, router]);

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
  const originText = originDraft.value;
  const savingOrigins = originDraft.status === "saving";
  const savedOrigins = originDraft.status === "saved";
  const originSaveError = originDraft.error;
  const originsDirty = hasUnsavedAllowedOrigins(originDraft);

  useEffect(() => {
    dispatchOriginDraft({ type: "hydrate", value: allowedOriginsValue });
  }, [allowedOriginsValue]);

  useNavigationGuard({
    enabled: ({ to, type }) => {
      if (!originsDirty || deleting) return false;
      if (type === "beforeunload") return true;
      const destination = new URL(to, window.location.href);
      return (
        destination.origin !== window.location.origin ||
        destination.pathname !== pathname
      );
    },
    confirm: () => window.confirm(UNSAVED_ORIGINS_WARNING),
  });

  function onSettingsOpenChange(open: boolean) {
    if (!open && originsDirty) {
      setDiscardOriginsOpen(true);
      return;
    }
    setSettingsOpen(open);
  }

  function discardOriginsAndCloseSettings() {
    dispatchOriginDraft({ type: "discard" });
    setDiscardOriginsOpen(false);
    setSettingsOpen(false);
  }

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
    const counts = { positive: 0, neutral: 0, negative: 0 };
    for (const widgetType of ["emoji", "thumbs", "star"] as const) {
      const byValue = analytics?.byWidgetTypeByValue[widgetType] ?? {};
      for (const [value, count] of Object.entries(byValue)) {
        const sentiment = classifyFeedbackSentiment(widgetType, Number(value));
        counts[sentiment] += count;
      }
    }
    return { total: analytics?.total ?? 0, ...counts };
  }, [analytics]);

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

  const topLocations = analytics?.topLocations ?? [];

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
    const q = searchInput.trim().toLowerCase();
    return items.filter((f) => {
      if (sentimentFilter !== "all") {
        const sent = classifyFeedbackSentiment(f.widgetType, f.value);
        if (sent !== sentimentFilter) return false;
      }
      if (q) {
        const hay =
          `${f.location ?? ""} ${"text" in f && typeof f.text === "string" ? f.text : ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [feed, searchInput, sentimentFilter]);

  const hasLocalFeedFilters =
    searchInput.trim().length > 0 || sentimentFilter !== "all";
  const feedbackFeedSummary = formatFeedbackFeedSummary({
    loadedCount: feed?.length,
    totalCount: analytics?.total,
    visibleCount: filteredFeed.length,
    hasLocalFilters: hasLocalFeedFilters,
  });
  const volumeRange =
    volume?.effectiveRange ?? (range === "all" ? "30d" : range);
  const responseVolumeSummary = formatResponseVolumeSummary({
    rangeLabel: RANGE_SUMMARY_LABEL[volumeRange],
    points: chartData,
  });
  const dashboardLoading =
    data === undefined ||
    analytics === undefined ||
    volume === undefined ||
    feed === undefined;

  async function onCopy() {
    if (!activeKey) return;
    setKeyActionError("");
    const result = await copyText(activeKey, navigator.clipboard);
    setCopyState(result);

    if (result === "copied") {
      setKeyActionStatus("Publishable key copied to clipboard.");
      window.setTimeout(() => {
        setCopyState("idle");
        setKeyActionStatus("");
      }, 1200);
    } else {
      setRevealKey(true);
      setKeyActionError(
        "Clipboard access is unavailable. Copy the key manually below.",
      );
    }
  }

  async function onRotate() {
    if (!convexProjectId) return;
    setRotating(true);
    setKeyActionError("");
    setKeyActionStatus("Rotating publishable key…");
    try {
      await rotateKey({ projectId: convexProjectId });
      setRevealKey(true);
      setCopyState("idle");
      setKeyActionStatus("Publishable key rotated.");
    } catch {
      setKeyActionStatus("");
      setKeyActionError(
        "Could not rotate the publishable key. The current key is still active; try again.",
      );
      toast.error("Could not rotate the publishable key.");
    } finally {
      setRotating(false);
    }
  }

  async function onDelete() {
    if (!convexProjectId) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteProject({ projectId: convexProjectId });
      router.replace("/dashboard");
    } catch {
      setDeleting(false);
      setDeleteError(
        "Could not delete the project. No data was deleted; try again.",
      );
      toast.error("Could not delete the project.");
    }
  }

  async function onSaveOrigins() {
    if (!convexProjectId || savingOrigins) return;
    const allowedOrigins = originText
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean);

    dispatchOriginDraft({ type: "save-start" });
    try {
      const result = await updateAllowedOrigins({
        projectId: convexProjectId,
        allowedOrigins,
      });
      dispatchOriginDraft({
        type: "save-success",
        value: result.allowedOrigins.join("\n"),
      });
      window.setTimeout(
        () => dispatchOriginDraft({ type: "clear-status" }),
        1500,
      );
    } catch {
      dispatchOriginDraft({
        type: "save-error",
        message:
          "Could not save allowed origins. Your edits are still here; check each URL and try again.",
      });
      toast.error("Could not save origins.");
    }
  }

  if (projectQueryArgs === "skip") {
    return (
      <Card size="sm">
        <CardContent>
          <div className="text-sm text-muted-foreground" role="status">
            {deleting ? "Deleting project…" : "Redirecting…"}
          </div>
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

  const volumeRangeLabel = RANGE_LABEL[volumeRange];

  return (
    <div className="min-w-0 space-y-6" aria-busy={dashboardLoading}>
      <p className="sr-only" role="status" aria-live="polite">
        {dashboardLoading
          ? "Loading project dashboard data."
          : "Project dashboard data loaded. Live updates are connected."}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav
          aria-label="breadcrumb"
          className="flex w-full min-w-0 flex-wrap items-center gap-1.5 text-sm sm:w-auto sm:flex-1"
        >
          <Link
            href="/dashboard"
            className="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            Projects
          </Link>
          <ChevronRight
            className="h-3.5 w-3.5 text-muted-foreground/60"
            aria-hidden="true"
          />
          {project ? (
            <span className="min-w-0 break-words font-medium text-foreground [overflow-wrap:anywhere]">
              {project.name}
            </span>
          ) : (
            <span className="inline-block h-4 w-28 animate-pulse rounded bg-muted/70 motion-reduce:animate-none" />
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

        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto">
          <Select
            value={range}
            onValueChange={(value) =>
              updateProjectView({ range: value as RangeOption })
            }
          >
            <SelectTrigger
              size="sm"
              className="h-8 gap-1.5 bg-background dark:bg-background"
              aria-label="Feedback date range"
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
            onValueChange={(value) =>
              updateProjectView({ widget: value as WidgetFilterOption })
            }
          >
            <SelectTrigger
              size="sm"
              className="h-8 gap-1.5 bg-background dark:bg-background"
              aria-label="Widget type"
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

          {SHOW_DEVELOPMENT_WIDGET_TOOLS && convexProjectId ? (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="border border-dashed border-border text-muted-foreground hover:text-foreground"
              title="Dev-only · will be removed before production"
            >
              <Link
                href={`/widgets?projectId=${convexProjectId}&advanced=1#advanced`}
              >
                <FlaskConical className="h-4 w-4" aria-hidden="true" />
                Test widgets
              </Link>
            </Button>
          ) : null}

          <Sheet open={settingsOpen} onOpenChange={onSettingsOpenChange}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" disabled={!data}>
                <Settings className="h-4 w-4" aria-hidden="true" />
                Settings
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="max-h-dvh min-w-0 overscroll-contain overflow-y-auto scroll-pb-24 pb-[env(safe-area-inset-bottom)] data-[side=right]:h-dvh data-[side=right]:w-full data-[side=right]:sm:max-w-md"
            >
              <SheetHeader>
                <SheetTitle>Project settings</SheetTitle>
                <SheetDescription className="break-words [overflow-wrap:anywhere]">
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
                      <span className="inline-block h-4 w-56 animate-pulse rounded bg-muted/70 align-middle motion-reduce:animate-none" />
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
                      {copyState === "copied" ? "Copied" : "Copy"}
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
                  <p className="sr-only" role="status" aria-live="polite">
                    {rotating ? "Rotating publishable key…" : keyActionStatus}
                  </p>
                  {keyActionError ? (
                    <p
                      className="text-xs text-destructive"
                      role="alert"
                      aria-live="assertive"
                    >
                      {keyActionError}
                    </p>
                  ) : null}
                  {copyState === "manual" && activeKey ? (
                    <Input
                      readOnly
                      value={activeKey}
                      aria-label="Publishable key to copy manually"
                      className="font-mono text-xs"
                      onFocus={(event) => event.currentTarget.select()}
                    />
                  ) : null}
                </section>

                <Separator />

                <section className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
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
                              : "animate-pulse bg-amber-500 motion-reduce:animate-none",
                          )}
                        />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
                      </span>
                      <div
                        id="allowed-origins-label"
                        className="text-sm font-semibold"
                      >
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
                    {originsDirty ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] uppercase tracking-widest",
                          SENTIMENT_TINT.amber,
                        )}
                      >
                        Unsaved
                      </Badge>
                    ) : null}
                  </div>

                  <p
                    id="allowed-origins-description"
                    className="text-xs text-muted-foreground"
                  >
                    One origin per line. Leave blank to accept any origin.
                  </p>

                  <Textarea
                    id="allowed-origins"
                    name="allowed-origins"
                    autoComplete="off"
                    aria-labelledby="allowed-origins-label"
                    aria-describedby="allowed-origins-description allowed-origins-status"
                    aria-invalid={originSaveError ? "true" : undefined}
                    value={originText}
                    onChange={(event) =>
                      dispatchOriginDraft({
                        type: "edit",
                        value: event.target.value,
                      })
                    }
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
                      disabled={!data || savingOrigins || !originsDirty}
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
                  {originSaveError ? (
                    <p
                      id="allowed-origins-status"
                      className="text-xs text-destructive"
                      role="alert"
                    >
                      {originSaveError}
                    </p>
                  ) : (
                    <p
                      id="allowed-origins-status"
                      className="text-xs text-muted-foreground"
                      role="status"
                      aria-live="polite"
                    >
                      {savingOrigins
                        ? "Saving allowed origins…"
                        : savedOrigins
                          ? "Allowed origins saved."
                          : originsDirty
                            ? "Unsaved changes"
                            : "All changes saved"}
                    </p>
                  )}
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
                  <p className="sr-only" role="status" aria-live="polite">
                    {deleting ? "Deleting project…" : ""}
                  </p>
                  {deleteError ? (
                    <p className="text-xs text-destructive" role="alert">
                      {deleteError}
                    </p>
                  ) : null}
                </section>
              </div>
            </SheetContent>
          </Sheet>
          <AlertDialog
            open={discardOriginsOpen}
            onOpenChange={setDiscardOriginsOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Discard unsaved origins?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your allowed-origin edits have not been saved. Keep editing or
                  discard them and close settings.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep editing</AlertDialogCancel>
                <AlertDialogAction onClick={discardOriginsAndCloseSettings}>
                  Discard changes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 space-y-1">
          {project ? (
            <h1 className="break-words text-3xl font-bold tracking-tight [overflow-wrap:anywhere]">
              {project.name}
            </h1>
          ) : (
            <div className="h-8 w-56 animate-pulse rounded bg-muted/70 motion-reduce:animate-none" />
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
        <div
          className="flex items-center gap-2 text-xs text-muted-foreground"
          aria-hidden="true"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          {feed === undefined
            ? "Connecting…"
            : feed[0]
              ? `Updated ${formatRelativeTime(feed[0].createdAt)}`
              : "Awaiting first feedback"}
        </div>
        <span className="sr-only" role="status" aria-live="polite">
          {feed === undefined
            ? "Connecting to live feedback updates."
            : feed[0]
              ? `Latest feedback received ${formatLongDate(feed[0].createdAt)}.`
              : "Live updates connected. Awaiting first feedback."}
        </span>
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
                  <CardHeader className="flex flex-row items-start gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{kpi.label}</span>
                        <Info
                          className="h-3.5 w-3.5 text-muted-foreground/60"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
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
                <span
                  id="response-volume-title"
                  className="text-base font-semibold tracking-tight"
                >
                  Response volume
                </span>
                <Badge
                  variant="outline"
                  className={cn("text-[10px] tracking-widest", CHIP_SLATE)}
                >
                  {volumeRangeLabel}
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
                onValueChange={(value) =>
                  updateProjectView({ chart: value as ChartType })
                }
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
                        <Icon
                          className="h-3.5 w-3.5 text-muted-foreground"
                          aria-hidden="true"
                        />
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
            <figure
              aria-labelledby="response-volume-title"
              aria-describedby="response-volume-summary"
            >
              <figcaption id="response-volume-summary" className="sr-only">
                {volume === undefined
                  ? "Loading response volume."
                  : responseVolumeSummary}
              </figcaption>
              {volume === undefined ? (
                <ChartSkeleton />
              ) : (
                <>
                  <ChartContainer
                    config={chartConfig}
                    className="h-[240px] w-full"
                    aria-hidden="true"
                  >
                    {renderVolumeChart({ chartType, chartData })}
                  </ChartContainer>
                  <table className="sr-only">
                    <caption>Response volume by time period</caption>
                    <thead>
                      <tr>
                        <th scope="col">Time period</th>
                        <th scope="col">Positive</th>
                        <th scope="col">Neutral</th>
                        <th scope="col">Negative</th>
                        <th scope="col">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.map((point) => (
                        <tr key={point.ts}>
                          <th scope="row">{point.label}</th>
                          <td>{point.positive}</td>
                          <td>{point.neutral}</td>
                          <td>{point.negative}</td>
                          <td>{point.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </figure>
          </CardContent>
        </Card>

        <Card size="sm" className="flex flex-col">
          <CardHeader className="flex flex-row items-start gap-2">
            <div>
              <div className="text-base font-semibold tracking-tight">
                Sentiment
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Distribution across all widgets
              </p>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-5">
            {analytics === undefined ? (
              <SentimentCardSkeleton />
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <div className="font-mono text-[28px] font-bold leading-none tracking-tight">
                    {totals.total.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">responses</div>
                </div>

                <div
                  className="flex h-2.5 gap-[2px] overflow-hidden rounded-sm"
                  aria-hidden="true"
                >
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
                    icon={
                      <Smile
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    }
                    label="Positive"
                    count={totals.positive}
                    pct={segPositivePct}
                    tint={SENTIMENT_TINT.positive}
                  />
                  <SentimentRow
                    color="oklch(0.84 0.01 250)"
                    icon={
                      <Meh
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    }
                    label="Neutral"
                    count={totals.neutral}
                    pct={segNeutralPct}
                    tint={SENTIMENT_TINT.neutral}
                  />
                  <SentimentRow
                    color="oklch(0.64 0.22 25)"
                    icon={
                      <Frown
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    }
                    label="Negative"
                    count={totals.negative}
                    pct={segNegativePct}
                    tint={SENTIMENT_TINT.negative}
                  />
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
            <LayoutGrid
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
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
                          aria-hidden="true"
                        />
                        <span className="font-medium">{row.label}</span>
                      </div>
                      <div className="font-mono text-[12.5px] tabular-nums text-muted-foreground">
                        {row.value.toLocaleString()} · {pct.toFixed(1)}%
                      </div>
                    </div>
                    <div
                      className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full rounded-full bg-primary transition-all motion-reduce:transition-none"
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
            <Globe
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
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
                      className="flex items-center gap-3 rounded-lg px-2 py-1.5"
                    >
                      <Globe
                        className="h-4 w-4 shrink-0 text-muted-foreground/60"
                        aria-hidden="true"
                      />
                      <div
                        className="min-w-0 flex-1 truncate font-mono text-[12.5px]"
                        title={row.location || "/"}
                      >
                        {row.location || "/"}
                      </div>
                      <div
                        className="h-1.5 w-20 overflow-hidden rounded-full bg-muted"
                        aria-hidden="true"
                      >
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
          <div className="flex min-w-0 flex-wrap items-center gap-2">
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
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70 motion-reduce:animate-none" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Live
            </Badge>
          </div>
          <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto">
            <Select
              value={sentimentFilter}
              onValueChange={(value) =>
                updateProjectView({ sentiment: value as SentimentFilter })
              }
            >
              <SelectTrigger
                size="sm"
                className="h-8 gap-1.5 bg-background dark:bg-background"
                aria-label="Feedback sentiment"
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
            <div className="relative w-full min-w-0 sm:w-auto">
              <label htmlFor="feedback-search" className="sr-only">
                Search feedback by message or location
              </label>
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="feedback-search"
                name="feedback-search"
                type="search"
                autoComplete="off"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search message or location"
                className="h-8 w-full min-w-0 pl-8 text-sm sm:w-56"
              />
            </div>
          </div>
        </CardHeader>
        <Separator className="mb-0" />
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
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
                  <TableRow
                    key={`skeleton-${i}`}
                    className="hover:bg-transparent"
                  >
                    <TableCell className="pl-4">
                      <div className="h-5 w-24 animate-pulse rounded bg-muted/70 motion-reduce:animate-none" />
                    </TableCell>
                    <TableCell>
                      <div className="h-5 w-10 animate-pulse rounded bg-muted/70 motion-reduce:animate-none" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-28 animate-pulse rounded bg-muted/70 motion-reduce:animate-none" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-48 animate-pulse rounded bg-muted/70 motion-reduce:animate-none" />
                    </TableCell>
                    <TableCell>
                      <div className="h-5 w-16 animate-pulse rounded-full bg-muted/70 motion-reduce:animate-none" />
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <div className="ml-auto h-4 w-12 animate-pulse rounded bg-muted/70 motion-reduce:animate-none" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredFeed.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    {searchInput.trim() || sentimentFilter !== "all"
                      ? "No feedback matches your filters."
                      : "No feedback yet. Install a widget and submit a reaction to see it here."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredFeed.map((f) => {
                  const sent = classifyFeedbackSentiment(f.widgetType, f.value);
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
                    <TableRow key={f._id} className="hover:bg-transparent">
                      <TableCell className="pl-4">
                        <div className="inline-flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground">
                            <WidgetIcon
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          </span>
                          <span className="text-sm font-medium capitalize">
                            {f.widgetType}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {f.widgetType === "thumbs" ? (
                          f.value === 1 ? (
                            <>
                              <ThumbsUp
                                className="h-4 w-4 text-emerald-600"
                                aria-hidden="true"
                              />
                              <span className="sr-only">Like</span>
                            </>
                          ) : (
                            <>
                              <ThumbsDown
                                className="h-4 w-4 text-rose-500"
                                aria-hidden="true"
                              />
                              <span className="sr-only">Dislike</span>
                            </>
                          )
                        ) : f.widgetType === "star" ? (
                          <span
                            className="inline-flex items-center gap-1 font-mono tabular-nums"
                            aria-label={`${f.value} ${f.value === 1 ? "star" : "stars"}`}
                          >
                            <span className="text-sm" aria-hidden="true">
                              {f.value}
                            </span>
                            <Star
                              className="h-3.5 w-3.5 text-amber-500"
                              aria-hidden="true"
                            />
                          </span>
                        ) : (
                          <span className="text-lg leading-none">
                            <span className="sr-only">
                              Rating {f.value} of 5
                            </span>
                            <span aria-hidden="true">
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
        <div className="px-5 py-3 text-xs text-muted-foreground">
          {feedbackFeedSummary}
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
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

function Sk({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "max-w-full animate-pulse rounded bg-muted/70 motion-reduce:animate-none",
        className,
      )}
      aria-hidden
    />
  );
}

function KpiCardSkeleton() {
  return (
    <Card size="sm" className="gap-3">
      <CardHeader className="flex flex-row items-start gap-2">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 shrink-0 animate-pulse items-center justify-center rounded-lg border border-border bg-muted/60 motion-reduce:animate-none" />
          <Sk className="h-4 w-24" />
        </div>
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
    <div className="flex h-[240px] w-full flex-col gap-2" aria-hidden="true">
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
              className="w-[14%] min-w-[6px] animate-pulse rounded-t bg-muted/80 motion-reduce:animate-none"
              style={{ height: `${h}%` }}
            />
            <div
              className="w-[14%] min-w-[6px] animate-pulse rounded-t bg-muted/60 motion-reduce:animate-none"
              style={{ height: `${Math.max(20, h - 15)}%` }}
            />
            <div
              className="w-[14%] min-w-[6px] animate-pulse rounded-t bg-muted/50 motion-reduce:animate-none"
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
          aria-hidden="true"
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
