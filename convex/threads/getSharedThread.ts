import { v } from "convex/values"
import { query } from "../_generated/server"

export const getSharedThread = query({
  args: {
    threadId: v.id("threads"),
  },
  async handler(ctx, args) {
    const thread = await ctx.db.get(args.threadId);

    if (!thread) {
      return null;
    }

    if (!thread.shareToken) {
      return null;
    }

    return {
      ...thread,
      // Add any additional fields or transformations here
    };
  },
});