import { v } from "convex/values"
import { mutation } from "../_generated/server"

export const createNewThread = mutation({
  args: {
    clerk_user_id: v.string(),
    metadata: v.optional(v.object({
      title: v.optional(v.string())
    })),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .first();

    if (!user) {
      throw new Error("User not found. Please ensure the user is created before creating a thread.");
    }

    const newThread = await ctx.db.insert("threads", {
      user_id: user._id,
      clerk_user_id: args.clerk_user_id,
      metadata: args.metadata || {},
      createdAt: new Date().toISOString(),
      isShared: false,
    });

    return newThread;
  },
});
