import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const deleteThread = mutation({
  args: { thread_id: v.id("threads") },
  async handler(ctx, args) {
    const thread = await ctx.db.get(args.thread_id);
    if (!thread) {
      return { success: false, reason: "not_found" };
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_thread_id", (q) => q.eq("thread_id", args.thread_id))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    await ctx.db.delete(args.thread_id);

    return { success: true };
  },
});