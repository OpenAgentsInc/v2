import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const shareThread = mutation({
  args: { thread_id: v.id("threads") },
  async handler(ctx, args) {
    const thread = await ctx.db.get(args.thread_id);
    if (!thread) {
      throw new Error("Thread not found");
    }

    const shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    await ctx.db.patch(args.thread_id, {
      shareToken,
    });

    return shareToken;
  },
});