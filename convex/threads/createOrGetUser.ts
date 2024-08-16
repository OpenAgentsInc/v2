import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createOrGetUser = mutation({
  args: {
    clerk_user_id: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    const newUserId = await ctx.db.insert("users", {
      clerk_user_id: args.clerk_user_id,
      email: args.email,
      image: args.image,
      credits: 0,
      createdAt: new Date().toISOString(),
    });

    return newUserId;
  },
});