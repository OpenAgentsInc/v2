import { query } from "../_generated/server";
import { v } from "convex/values";

export const getUserData = query({
  args: { clerk_user_id: v.optional(v.string()) },
  async handler(ctx, args) {
    if (!args.clerk_user_id) {
      return null; // Return null if no clerk_user_id is provided
    }
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .first();
  },
});