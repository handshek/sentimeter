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

function clampLimit(limit: number, max = 200) {
  if (!Number.isFinite(limit)) return 50;
  return Math.max(1, Math.min(Math.floor(limit), max));
}

function getRangeBounds(range: RangePreset | undefined): { from?: number; to?: number } {
  const now = Date.now();
  const preset = range ?? "7d";
  if (preset === "all") return {};
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
  args: { projectId: v.id("projects"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const user = await getUserByClerkIdOrThrow(ctx, identity.subject);
    await assertProjectOwner(ctx, args.projectId, user._id);

    const limit = clampLimit(args.limit ?? 50);

    return await ctx.db
      .query("feedback")
      .withIndex("by_projectId_createdAt", (q) => q.eq("projectId", args.projectId))
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

    const { from, to } = getRangeBounds(args.range as RangePreset | undefined);

    const widgetType = args.widgetType;

    const docs = widgetType
      ? await ctx.db
          .query("feedback")
          .withIndex("by_projectId_widgetType_createdAt", (q) => {
            if (from !== undefined && to !== undefined) {
              return q
                .eq("projectId", args.projectId)
                .eq("widgetType", widgetType)
                .gte("createdAt", from)
                .lt("createdAt", to);
            }
            if (from !== undefined) {
              return q
                .eq("projectId", args.projectId)
                .eq("widgetType", widgetType)
                .gte("createdAt", from);
            }
            if (to !== undefined) {
              return q
                .eq("projectId", args.projectId)
                .eq("widgetType", widgetType)
                .lt("createdAt", to);
            }
            return q.eq("projectId", args.projectId).eq("widgetType", widgetType);
          })
          .collect()
      : await ctx.db
          .query("feedback")
          .withIndex("by_projectId_createdAt", (q) => {
            if (from !== undefined && to !== undefined) {
              return q
                .eq("projectId", args.projectId)
                .gte("createdAt", from)
                .lt("createdAt", to);
            }
            if (from !== undefined) {
              return q.eq("projectId", args.projectId).gte("createdAt", from);
            }
            if (to !== undefined) {
              return q.eq("projectId", args.projectId).lt("createdAt", to);
            }
            return q.eq("projectId", args.projectId);
          })
          .collect();

    const byValue: Record<string, number> = {};
    const byLocation: Record<string, { total: number; byValue: Record<string, number> }> = {};

    for (const doc of docs) {
      const valueKey = String(doc.value);
      byValue[valueKey] = (byValue[valueKey] ?? 0) + 1;

      const loc = doc.location;
      const locAgg = (byLocation[loc] ??= { total: 0, byValue: {} });
      locAgg.total += 1;
      locAgg.byValue[valueKey] = (locAgg.byValue[valueKey] ?? 0) + 1;
    }

    return {
      total: docs.length,
      byValue,
      byLocation,
      range: args.range ?? "7d",
      widgetType: widgetType ?? null,
    };
  },
});
