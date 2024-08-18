import { query } from "../_generated/server";
import { v } from "convex/values";

export const getThreadMessages = query({
  args: { threadId: v.id("threads") },
  async handler(ctx, args) {
    return await ctx.db
      .query("messages")
      .withIndex("by_thread_id", (q) => q.eq("thread_id", args.threadId))
      .order("asc")
      .collect();
  },
});