import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const updateUserCredits = mutation({
  args: {
    clerk_user_id: v.string(),
    credits: v.number(),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { credits: args.credits });
  },
});