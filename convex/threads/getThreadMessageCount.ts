import { v } from "convex/values"
import { query } from "../_generated/server"
import { Id } from "../_generated/dataModel"

export const getThreadMessageCount = query({
  args: { thread_ids: v.array(v.id("threads")) },
  handler: async (ctx, args) => {
    const messageCounts: { [key: Id<"threads">]: number } = {};
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