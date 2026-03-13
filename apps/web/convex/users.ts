import { mutation } from "./_generated/server";
import { getOrCreateUser, requireIdentity } from "./lib/auth";

export const syncUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const user = await getOrCreateUser(ctx, identity);
    return user;
  },
});
