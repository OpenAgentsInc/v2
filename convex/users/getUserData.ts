import { v } from "convex/values"
import { query } from "../_generated/server"

export const getUserData = query({
  args: { clerk_user_id: v.optional(v.string()) },
  async handler(ctx, args) {
    const clerk_user_id = args.clerk_user_id;
    if (clerk_user_id === undefined) {
      return null; // Return null if no clerk_user_id is provided
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", clerk_user_id))
      .first();

    if (user) {
      // Destructure the user object and omit the email and credits fields
      const { email, credits, ...userWithoutEmailAndCredits } = user;
      return userWithoutEmailAndCredits;
    }

    return null;
  },
});
