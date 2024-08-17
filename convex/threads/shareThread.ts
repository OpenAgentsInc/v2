import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const shareThread = mutation({
  args: { thread_id: v.id("threads") },
  async handler(ctx, args) {
    const thread = await ctx.db.get(args.thread_id);
    if (!thread) {
      throw new Error("Thread not found");
    }

    await ctx.db.patch(args.thread_id, {
      isShared: true,
    });

    return true;
  },
});