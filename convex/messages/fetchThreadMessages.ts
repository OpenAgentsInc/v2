import { query } from "../_generated/server";
import { v } from "convex/values";

export const fetchThreadMessages = query({
  args: { thread_id: v.id("threads") },
  async handler(ctx, args) {
    return await ctx.db
      .query("messages")
      .withIndex("by_thread_id", (q) => q.eq("thread_id", args.thread_id))
      .order("asc")
      .collect();
  },
});