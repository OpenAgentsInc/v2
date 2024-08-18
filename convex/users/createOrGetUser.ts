import { v } from "convex/values"
import { Id } from "../_generated/dataModel"
import { mutation } from "../_generated/server"

export const createOrGetUser = mutation({
  args: {
    clerk_user_id: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    referrer_id: v.optional(v.string()),
    name: v.string(),
    username: v.string(),
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
      name: args.name,
      username: args.username,
      credits: 0,
      createdAt: new Date().toISOString(),
      referrer_id: args.referrer_id ? args.referrer_id as Id<"users"> : undefined,
    });

    // If there's a referrer, add credits to their account
    const referrerId = args.referrer_id as Id<"users">;
    if (referrerId !== undefined) {
      const referrer = await ctx.db
        .query("users")
        .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", referrerId))
        .first();

      if (referrer) {
        await ctx.db.patch(referrer._id, { credits: referrer.credits + 500 }); // Add $5 worth of credits
      }
    }

    return await ctx.db.get(newUser);
  },
});
