import { query } from "../_generated/server";
import { v } from "convex/values";

export const getLastEmptyThread = query({
  args: { clerk_user_id: v.string() },
  async handler(ctx, args) {
    const threads = await ctx.db
      .query("threads")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .order("desc")
      .collect();

    for (const thread of threads) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_thread_id", (q) => q.eq("thread_id", thread._id))
        .collect();

      if (messages.length === 0) {
        return thread;
      }
    }

    return null;
  },
});