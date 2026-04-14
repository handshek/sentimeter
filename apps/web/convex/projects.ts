import { mutation, query, type MutationCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import {
  assertProjectOwner,
  getOrCreateUser,
  getUserByClerkIdOrThrow,
  requireIdentity,
} from "./lib/auth";
import { nanoid } from "./lib/nanoid";

function generatePublicKey() {
  return `pk_${nanoid(24)}`;
}

function normalizeOrigins(origins: string[]) {
  return Array.from(
    new Set(
      origins
        .map((origin) => origin.trim())
        .filter(Boolean)
        .map((origin) => {
          try {
            return new URL(origin).origin;
          } catch {
            throw new ConvexError("invalid_origin");
          }
        }),
    ),
  );
}

async function revokeAllActiveKeysForProject(
  ctx: MutationCtx,
  projectId: Id<"projects">,
  now: number,
) {
  const keys: Doc<"apiKeys">[] = await ctx.db
    .query("apiKeys")
    .withIndex("by_projectId_revokedAt", (q) => q.eq("projectId", projectId))
    .collect();
  await Promise.all(
    keys
      .filter((k) => k.revokedAt === undefined)
      .map((k) => ctx.db.patch(k._id, { revokedAt: now })),
  );
}

export const createProject = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const user = await getOrCreateUser(ctx, identity);

    const name = args.name.trim();
    if (!name) {
      throw new ConvexError("invalid_project_name");
    }

    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      userId: user._id,
      name,
      mode: "development",
      allowedOrigins: [],
      createdAt: now,
    });

    const keyId = await ctx.db.insert("apiKeys", {
      projectId,
      userId: user._id,
      key: generatePublicKey(),
      createdAt: now,
    });

    const project = await ctx.db.get("projects", projectId);
    const apiKey = await ctx.db.get("apiKeys", keyId);
    if (!project || !apiKey) throw new ConvexError("insert_failed");

    return { project, apiKey };
  },
});

export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const user = await getUserByClerkIdOrThrow(ctx, identity.subject);
    await assertProjectOwner(ctx, args.projectId, user._id);

    // Cascade delete feedback
    while (true) {
      const batch = await ctx.db
        .query("feedback")
        .withIndex("by_projectId_createdAt", (q) =>
          q.eq("projectId", args.projectId),
        )
        .take(100);
      if (batch.length === 0) break;
      await Promise.all(batch.map((doc) => ctx.db.delete(doc._id)));
    }

    // Cascade delete api keys
    while (true) {
      const batch = await ctx.db
        .query("apiKeys")
        .withIndex("by_projectId_revokedAt", (q) =>
          q.eq("projectId", args.projectId),
        )
        .take(100);
      if (batch.length === 0) break;
      await Promise.all(batch.map((doc) => ctx.db.delete(doc._id)));
    }

    await ctx.db.delete(args.projectId);
    return { ok: true };
  },
});

export const generateApiKey = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const user = await getUserByClerkIdOrThrow(ctx, identity.subject);
    await assertProjectOwner(ctx, args.projectId, user._id);

    const now = Date.now();
    await revokeAllActiveKeysForProject(ctx, args.projectId, now);

    const apiKeyId = await ctx.db.insert("apiKeys", {
      projectId: args.projectId,
      userId: user._id,
      key: generatePublicKey(),
      createdAt: now,
    });

    const apiKey = await ctx.db.get("apiKeys", apiKeyId);
    if (!apiKey) throw new ConvexError("insert_failed");
    return apiKey;
  },
});

export const updateAllowedOrigins = mutation({
  args: {
    projectId: v.id("projects"),
    allowedOrigins: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const user = await getUserByClerkIdOrThrow(ctx, identity.subject);
    await assertProjectOwner(ctx, args.projectId, user._id);

    const allowedOrigins = normalizeOrigins(args.allowedOrigins);
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new ConvexError("project_not_found");
    }
    await ctx.db.patch(args.projectId, { allowedOrigins });

    return { ok: true, allowedOrigins };
  },
});

export const getProjects = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const user = await getUserByClerkIdOrThrow(ctx, identity.subject);

    return await ctx.db
      .query("projects")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const user = await getUserByClerkIdOrThrow(ctx, identity.subject);
    const project = await assertProjectOwner(ctx, args.projectId, user._id);

    const keys = await ctx.db
      .query("apiKeys")
      .withIndex("by_projectId_revokedAt", (q) => q.eq("projectId", project._id))
      .collect();

    const activeApiKey =
      keys
        .filter((k) => k.revokedAt === undefined)
        .reduce<Doc<"apiKeys"> | null>((best, current) => {
          if (!best) return current;
          return current.createdAt > best.createdAt ? current : best;
        }, null) ?? null;

    return { project, activeApiKey };
  },
});
