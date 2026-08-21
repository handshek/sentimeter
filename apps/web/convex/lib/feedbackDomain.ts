export type WidgetType = "emoji" | "thumbs" | "star";
export type RangePreset = "24h" | "7d" | "30d" | "all";
export type Sentiment = "positive" | "neutral" | "negative";

export const MAX_CREATED_AT = Number.MAX_SAFE_INTEGER;

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGE_MS: Record<Exclude<RangePreset, "all">, number> = {
  "24h": DAY_MS,
  "7d": 7 * DAY_MS,
  "30d": 30 * DAY_MS,
};

export function clampFeedbackLimit(limit: number, max = 200) {
  if (!Number.isFinite(limit)) return 50;
  return Math.max(1, Math.min(Math.floor(limit), max));
}

export function getFeedbackRangeBounds(
  range: RangePreset | undefined,
  now = Date.now(),
): { from?: number; to: number } {
  const preset = range ?? "7d";
  if (preset === "all") return { to: now };
  return { from: now - RANGE_MS[preset], to: now };
}

export function isFeedbackValueAllowed(widgetType: WidgetType, value: number) {
  if (!Number.isFinite(value)) return false;
  if (widgetType === "thumbs") return value === 0 || value === 1;
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

export function classifyFeedbackSentiment(
  widgetType: WidgetType,
  value: number,
): Sentiment {
  if (widgetType === "thumbs") {
    return value === 1 ? "positive" : "negative";
  }
  if (value >= 4) return "positive";
  if (value <= 2) return "negative";
  return "neutral";
}

export function normalizeOrigin(origin: string) {
  try {
    return new URL(origin).origin;
  } catch {
    return null;
  }
}

export function normalizeAllowedOrigins(origins: string[]) {
  return Array.from(
    new Set(
      origins
        .map((origin) => origin.trim())
        .filter(Boolean)
        .map((origin) => {
          const normalized = normalizeOrigin(origin);
          if (!normalized) throw new Error("invalid_origin");
          return normalized;
        }),
    ),
  );
}

export function getCorsOrigin(
  allowedOrigins: string[] | undefined,
  requestOrigin: string | null,
) {
  if (!allowedOrigins || allowedOrigins.length === 0) {
    return "*";
  }
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }
  return null;
}
