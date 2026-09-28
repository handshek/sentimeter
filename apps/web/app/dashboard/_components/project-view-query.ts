export type RangeOption = "24h" | "7d" | "30d" | "all";
export type WidgetFilterOption = "all" | "emoji" | "thumbs" | "star";
export type SentimentFilter =
  | "all"
  | "positive"
  | "neutral"
  | "negative";
export type ChartType = "stacked" | "grouped" | "area" | "line";

export type ProjectViewQuery = {
  range: RangeOption;
  widget: WidgetFilterOption;
  sentiment: SentimentFilter;
  search: string;
  chart: ChartType;
};

export const DEFAULT_PROJECT_VIEW_QUERY: ProjectViewQuery = {
  range: "7d",
  widget: "all",
  sentiment: "all",
  search: "",
  chart: "stacked",
};

const RANGE_OPTIONS = ["24h", "7d", "30d", "all"] as const;
const WIDGET_OPTIONS = ["all", "emoji", "thumbs", "star"] as const;
const SENTIMENT_OPTIONS = [
  "all",
  "positive",
  "neutral",
  "negative",
] as const;
const CHART_OPTIONS = ["stacked", "grouped", "area", "line"] as const;

type SearchParamsReader = Pick<URLSearchParams, "get" | "toString">;

function readOption<T extends string>(
  value: string | null,
  options: readonly T[],
  fallback: T,
) {
  return value !== null && options.includes(value as T)
    ? (value as T)
    : fallback;
}

export function parseProjectViewQuery(
  searchParams: Pick<SearchParamsReader, "get">,
): ProjectViewQuery {
  return {
    range: readOption(
      searchParams.get("range"),
      RANGE_OPTIONS,
      DEFAULT_PROJECT_VIEW_QUERY.range,
    ),
    widget: readOption(
      searchParams.get("widget"),
      WIDGET_OPTIONS,
      DEFAULT_PROJECT_VIEW_QUERY.widget,
    ),
    sentiment: readOption(
      searchParams.get("sentiment"),
      SENTIMENT_OPTIONS,
      DEFAULT_PROJECT_VIEW_QUERY.sentiment,
    ),
    search: searchParams.get("q") ?? DEFAULT_PROJECT_VIEW_QUERY.search,
    chart: readOption(
      searchParams.get("chart"),
      CHART_OPTIONS,
      DEFAULT_PROJECT_VIEW_QUERY.chart,
    ),
  };
}

export function updateProjectViewQuery(
  searchParams: SearchParamsReader,
  updates: Partial<ProjectViewQuery>,
) {
  const next = new URLSearchParams(searchParams.toString());

  if (updates.range !== undefined) {
    if (updates.range === DEFAULT_PROJECT_VIEW_QUERY.range) {
      next.delete("range");
    } else {
      next.set("range", updates.range);
    }
  }

  if (updates.widget !== undefined) {
    if (updates.widget === DEFAULT_PROJECT_VIEW_QUERY.widget) {
      next.delete("widget");
    } else {
      next.set("widget", updates.widget);
    }
  }

  if (updates.sentiment !== undefined) {
    if (updates.sentiment === DEFAULT_PROJECT_VIEW_QUERY.sentiment) {
      next.delete("sentiment");
    } else {
      next.set("sentiment", updates.sentiment);
    }
  }

  if (updates.search !== undefined) {
    if (updates.search.trim().length === 0) {
      next.delete("q");
    } else {
      next.set("q", updates.search);
    }
  }

  if (updates.chart !== undefined) {
    if (updates.chart === DEFAULT_PROJECT_VIEW_QUERY.chart) {
      next.delete("chart");
    } else {
      next.set("chart", updates.chart);
    }
  }

  return next.toString();
}
