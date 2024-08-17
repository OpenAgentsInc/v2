import { query } from "../_generated/server";
import { v } from "convex/values";

export const getThreadMessageCount = query({
  args: { thread_ids: v.array(v.id("threads")) },
  handler: async (ctx, args) => {
    const messageCounts = {};
    for (const thread_id of args.thread_ids) {
      const messages = await ctx.db
        .query("messages")
        .filter((q) => q.eq(q.field("thread_id"), thread_id))
        .collect();
      messageCounts[thread_id] = messages.length;
    }
    return messageCounts;
  },
});