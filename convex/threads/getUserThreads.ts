import { query } from "../_generated/server";
import { v } from "convex/values";

export const getUserThreads = query({
  args: { clerk_user_id: v.string() },
  async handler(ctx, args) {
    return await ctx.db
      .query("threads")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .collect();
  },
});