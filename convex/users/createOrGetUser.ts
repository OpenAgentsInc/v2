import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createOrGetUser = mutation({
  args: {
    clerk_user_id: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    referrer_id: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .first();

    if (existingUser) {
      return existingUser;
    }

    const newUser = await ctx.db.insert("users", {
      clerk_user_id: args.clerk_user_id,
      email: args.email,
      image: args.image,
      credits: 0,
      createdAt: new Date().toISOString(),
      referrer_id: args.referrer_id,
    });

    // If there's a referrer, add credits to their account
    if (args.referrer_id) {
      const referrer = await ctx.db
        .query("users")
        .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.referrer_id))
        .first();

      if (referrer) {
        await ctx.db.patch(referrer._id, { credits: referrer.credits + 500 }); // Add $5 worth of credits
      }
    }

    return await ctx.db.get(newUser);
  },
});