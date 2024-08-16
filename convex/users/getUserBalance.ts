import { query } from "../_generated/server";
import { v } from "convex/values";

export const getUserBalance = query({
  args: { clerk_user_id: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .first();
    return user ? user.credits : 0;
  },
});