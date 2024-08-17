import { query } from "./_generated/server";
import { v } from "convex/values";

export const getThreadMessageCount = query({
  args: { thread_id: v.id("threads") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("thread_id"), args.thread_id))
      .collect();

    return messages.length;
  },
});