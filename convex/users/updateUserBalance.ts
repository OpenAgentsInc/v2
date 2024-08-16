import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const updateUserBalance = mutation({
  args: {
    clerk_user_id: v.string(),
    cost_in_cents: v.number(),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { credits: user.credits - args.cost_in_cents / 100 });
  },
});