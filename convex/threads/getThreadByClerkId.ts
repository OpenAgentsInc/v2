import { query } from "../_generated/server";
import { v } from "convex/values";

export const getThreadByClerkId = query({
  args: { clerk_user_id: v.string() },
  handler: async (ctx, args) => {
    const thread = await ctx.db
      .query("threads")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerk_user_id", args.clerk_user_id)
      )
      .first();

    return thread;
  },
});