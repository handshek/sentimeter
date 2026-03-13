import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    createdAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_userId_createdAt", ["userId", "createdAt"]),

  apiKeys: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    key: v.string(),
    createdAt: v.number(),
    revokedAt: v.optional(v.number()),
  })
    .index("by_key", ["key"])
    .index("by_projectId_revokedAt", ["projectId", "revokedAt"]),

  feedback: defineTable({
    projectId: v.id("projects"),
    widgetType: v.union(
      v.literal("emoji"),
      v.literal("thumbs"),
      v.literal("star"),
    ),
    value: v.number(),
    location: v.string(),
    createdAt: v.number(),
  })
    .index("by_projectId_createdAt", ["projectId", "createdAt"])
    .index("by_projectId_widgetType_createdAt", [
      "projectId",
      "widgetType",
      "createdAt",
    ]),
});
