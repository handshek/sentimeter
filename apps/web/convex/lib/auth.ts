import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Identity = {
  subject: string;
  email?: string;
};

export async function requireIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("unauthorized");
  }
  return identity as unknown as Identity;
}

export async function getOrCreateUser(
  ctx: MutationCtx,
  identity: Identity,
): Promise<Doc<"users">> {
  const existing = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (existing) return existing;

  const email = identity.email?.trim();
  if (!email) {
    throw new ConvexError("missing_email_claim");
  }

  const userId = await ctx.db.insert("users", {
    clerkId: identity.subject,
    email,
    createdAt: Date.now(),
  });

  const user = await ctx.db.get("users", userId);
  if (!user) throw new ConvexError("user_insert_failed");
  return user;
}

export async function getUserByClerkIdOrThrow(
  ctx: QueryCtx | MutationCtx,
  clerkId: string,
): Promise<Doc<"users">> {
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
    .unique();
  if (!user) throw new ConvexError("user_not_synced");
  return user;
}

export async function assertProjectOwner(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
  userId: Id<"users">,
): Promise<Doc<"projects">> {
  const project = await ctx.db.get(projectId);
  if (!project) throw new ConvexError("project_not_found");
  if (project.userId !== userId) throw new ConvexError("forbidden");
  return project;
}
