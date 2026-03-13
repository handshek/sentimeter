import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  assertProjectOwner,
  getUserByClerkIdOrThrow,
  requireIdentity,
} from "./lib/auth";

const widgetTypeValidator = v.union(
  v.literal("emoji"),
  v.literal("thumbs"),
  v.literal("star"),
);

type WidgetType = "emoji" | "thumbs" | "star";
type RangePreset = "24h" | "7d" | "30d" | "all";

const MAX_CREATED_AT = Number.MAX_SAFE_INTEGER;

function clampLimit(limit: number, max = 200) {
  if (!Number.isFinite(limit)) return 50;
  return Math.max(1, Math.min(Math.floor(limit), max));
}

function getRangeBounds(
  range: RangePreset | undefined,
): { from?: number; to: number } {
  const now = Date.now();
  const preset = range ?? "7d";
  if (preset === "all") return { to: now };
  const ms =
    preset === "24h"
      ? 24 * 60 * 60 * 1000
      : preset === "7d"
        ? 7 * 24 * 60 * 60 * 1000
        : 30 * 24 * 60 * 60 * 1000;
  return { from: now - ms, to: now };
}

function assertValue(widgetType: WidgetType, value: number) {
  if (!Number.isFinite(value)) return false;
  if (widgetType === "thumbs") return value === 0 || value === 1;
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

function classifySentiment(widgetType: WidgetType, value: number) {
  if (widgetType === "thumbs") {
    return value === 1 ? ("positive" as const) : ("negative" as const);
  }
  if (value >= 4) return "positive" as const;
  if (value <= 2) return "negative" as const;
  return "neutral" as const;
}

export const submitFeedbackInternal = internalMutation({
  args: {
    apiKey: v.string(),
    widgetType: widgetTypeValidator,
    value: v.number(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    if (!assertValue(args.widgetType, args.value)) {
      return { ok: false as const, error: "invalid_value" as const };
    }
    const location = args.location.trim();
    if (!location) {
      return { ok: false as const, error: "invalid_body" as const };
    }

    const keyRow = await ctx.db
      .query("apiKeys")
      .withIndex("by_key", (q) => q.eq("key", args.apiKey))
      .first();

    if (!keyRow || keyRow.revokedAt !== undefined) {
      return { ok: false as const, error: "invalid_key" as const };
    }

    await ctx.db.insert("feedback", {
      projectId: keyRow.projectId,
      widgetType: args.widgetType,
      value: args.value,
      location,
      createdAt: Date.now(),
    });

    return { ok: true as const };
  },
});

export const getFeedback = query({
  args: {
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
    widgetType: v.optional(widgetTypeValidator),
    range: v.optional(
      v.union(v.literal("24h"), v.literal("7d"), v.literal("30d"), v.literal("all")),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const user = await getUserByClerkIdOrThrow(ctx, identity.subject);
    await assertProjectOwner(ctx, args.projectId, user._id);

    const limit = clampLimit(args.limit ?? 50);
    const { from } = getRangeBounds(args.range as RangePreset | undefined);

    if (args.widgetType) {
      const widgetType = args.widgetType;
      return await ctx.db
        .query("feedback")
        .withIndex("by_projectId_widgetType_createdAt", (q) => {
          if (from !== undefined) {
            return q
              .eq("projectId", args.projectId)
              .eq("widgetType", widgetType)
              .gte("createdAt", from)
              .lt("createdAt", MAX_CREATED_AT);
          }
          return q
            .eq("projectId", args.projectId)
            .eq("widgetType", widgetType);
        })
        .order("desc")
        .take(limit);
    }

    return await ctx.db
      .query("feedback")
      .withIndex("by_projectId_createdAt", (q) => {
        if (from !== undefined) {
          return q
            .eq("projectId", args.projectId)
            .gte("createdAt", from)
            .lt("createdAt", MAX_CREATED_AT);
        }
        return q.eq("projectId", args.projectId);
      })
      .order("desc")
      .take(limit);
  },
});

export const getAnalytics = query({
  args: {
    projectId: v.id("projects"),
    widgetType: v.optional(widgetTypeValidator),
    range: v.optional(
      v.union(v.literal("24h"), v.literal("7d"), v.literal("30d"), v.literal("all")),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const user = await getUserByClerkIdOrThrow(ctx, identity.subject);
    await assertProjectOwner(ctx, args.projectId, user._id);

    const { from } = getRangeBounds(args.range as RangePreset | undefined);

    const widgetType = args.widgetType;

    const docs = widgetType
      ? await ctx.db
          .query("feedback")
          .withIndex("by_projectId_widgetType_createdAt", (q) => {
            if (from !== undefined) {
              return q
                .eq("projectId", args.projectId)
                .eq("widgetType", widgetType)
                .gte("createdAt", from)
                .lt("createdAt", MAX_CREATED_AT);
            }
            return q
              .eq("projectId", args.projectId)
              .eq("widgetType", widgetType);
          })
          .collect()
      : await ctx.db
          .query("feedback")
          .withIndex("by_projectId_createdAt", (q) => {
            if (from !== undefined) {
              return q
                .eq("projectId", args.projectId)
                .gte("createdAt", from)
                .lt("createdAt", MAX_CREATED_AT);
            }
            return q.eq("projectId", args.projectId);
          })
          .collect();

    const byValue: Record<string, number> = {};
    const byLocation: Record<string, { total: number; byValue: Record<string, number> }> = {};
    const byWidgetType: Record<WidgetType, number> = { emoji: 0, thumbs: 0, star: 0 };
    const byWidgetTypeByValue: Record<WidgetType, Record<string, number>> = {
      emoji: {},
      thumbs: {},
      star: {},
    };

    for (const doc of docs) {
      const valueKey = String(doc.value);
      byValue[valueKey] = (byValue[valueKey] ?? 0) + 1;

      const loc = doc.location;
      const locAgg = (byLocation[loc] ??= { total: 0, byValue: {} });
      locAgg.total += 1;
      locAgg.byValue[valueKey] = (locAgg.byValue[valueKey] ?? 0) + 1;

      byWidgetType[doc.widgetType] += 1;
      const widgetAgg = byWidgetTypeByValue[doc.widgetType];
      widgetAgg[valueKey] = (widgetAgg[valueKey] ?? 0) + 1;
    }

    return {
      total: docs.length,
      byValue,
      byLocation,
      byWidgetType,
      byWidgetTypeByValue,
      range: args.range ?? "7d",
      widgetType: widgetType ?? null,
    };
  },
});

export const getVolumeSeries = query({
  args: {
    projectId: v.id("projects"),
    widgetType: v.optional(widgetTypeValidator),
    range: v.optional(
      v.union(v.literal("24h"), v.literal("7d"), v.literal("30d"), v.literal("all")),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const user = await getUserByClerkIdOrThrow(ctx, identity.subject);
    await assertProjectOwner(ctx, args.projectId, user._id);

    const requestedRange = (args.range as RangePreset | undefined) ?? "7d";
    const effectiveRange: Exclude<RangePreset, "all"> =
      requestedRange === "all" ? "30d" : requestedRange;

    const bounds = getRangeBounds(effectiveRange);
    const now = bounds.to;
    const from = bounds.from ?? now - 7 * 24 * 60 * 60 * 1000;
    const to = bounds.to;

    const widgetType = args.widgetType;

    const docs = widgetType
      ? await ctx.db
          .query("feedback")
          .withIndex("by_projectId_widgetType_createdAt", (q) =>
            q
              .eq("projectId", args.projectId)
              .eq("widgetType", widgetType)
              .gte("createdAt", from)
              .lt("createdAt", MAX_CREATED_AT),
          )
          .collect()
      : await ctx.db
          .query("feedback")
          .withIndex("by_projectId_createdAt", (q) =>
            q
              .eq("projectId", args.projectId)
              .gte("createdAt", from)
              .lt("createdAt", MAX_CREATED_AT),
          )
          .collect();

    const granularity = effectiveRange === "24h" ? ("hour" as const) : ("day" as const);
    const bucketSizeMs =
      granularity === "hour" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    const start = from - (from % bucketSizeMs);
    const bucketCount = Math.max(1, Math.ceil((to - start) / bucketSizeMs));

    const buckets: Array<{ ts: number; total: number; positive: number; negative: number }> =
      Array.from({ length: bucketCount }).map((_, idx) => ({
        ts: start + idx * bucketSizeMs,
        total: 0,
        positive: 0,
        negative: 0,
      }));

    for (const doc of docs) {
      const idx = Math.floor((doc.createdAt - start) / bucketSizeMs);
      if (idx < 0 || idx >= buckets.length) continue;
      const bucket = buckets[idx];
      if (!bucket) continue;
      bucket.total += 1;
      const sentiment = classifySentiment(doc.widgetType, doc.value);
      if (sentiment === "positive") bucket.positive += 1;
      if (sentiment === "negative") bucket.negative += 1;
    }

    return {
      requestedRange,
      effectiveRange,
      widgetType: widgetType ?? null,
      granularity,
      from,
      to,
      points: buckets,
    };
  },
});
