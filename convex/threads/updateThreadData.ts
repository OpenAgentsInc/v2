import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const updateThreadData = mutation({
  args: {
    thread_id: v.id("threads"),
    metadata: v.object({
      title: v.optional(v.string()),
    }),
  },
  async handler(ctx, args) {
    const thread = await ctx.db.get(args.thread_id);
    if (!thread) {
      throw new Error("Thread not found");
    }

    await ctx.db.patch(args.thread_id, {
      metadata: {
        ...thread.metadata,
        title: args.metadata.title || thread.metadata?.title,
      },
    });
  },
});