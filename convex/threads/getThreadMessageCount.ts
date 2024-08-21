import { v } from "convex/values"
import { Id } from "../_generated/dataModel"
import { query } from "../_generated/server"

export const getThreadMessageCount = query({
  args: { thread_ids: v.array(v.id("threads")) },
  handler: async (ctx, args) => {
    const messageCounts: { [key: Id<"threads">]: number } = {};

    // Initialize all thread_ids with 0 count
    for (const thread_id of args.thread_ids) {
      messageCounts[thread_id] = 0;
    }

    // Use a single query to get all messages for the specified threads
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_thread_id", (q) => q.eq("thread_id", args.thread_ids[0]))
      .collect();

    // Count messages for each thread
    for (const message of messages) {
      if (args.thread_ids.includes(message.thread_id)) {
        messageCounts[message.thread_id]++;
      }
    }

    return messageCounts;
  },
});
