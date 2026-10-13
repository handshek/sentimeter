import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { rateLimiter } from "./lib/rateLimits";
import {
  normalizeWaitlistEmail,
  type WaitlistJoinResult,
} from "./lib/waitlistValidation";

export const join = mutation({
  args: {
    email: v.string(),
    ip: v.string(),
    source: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, args): Promise<WaitlistJoinResult> => {
    const secret = process.env.WAITLIST_SECRET;
    if (!secret || args.secret !== secret) {
      throw new ConvexError("unauthorized");
    }

    const email = normalizeWaitlistEmail(args.email);
    const source = args.source.trim();
    if (!email || !source || source.length > 80) return "invalid";

    const ipLimit = await rateLimiter.limit(ctx, "waitlistPerIp", {
      key: args.ip,
    });
    if (!ipLimit.ok) return "rate_limited";
    const globalLimit = await rateLimiter.limit(ctx, "waitlistGlobal");
    if (!globalLimit.ok) return "rate_limited";

    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (query) => query.eq("email", email))
      .first();
    if (!existing) {
      await ctx.db.insert("waitlist", { email, source, createdAt: Date.now() });
    }
    return "ok";
  },
});
