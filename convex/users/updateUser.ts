import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const updateUser = mutation({
  args: {
    _id: v.id("users"),
    email: v.string(),
    image: v.optional(v.string()),
    credits: v.number(),
    name: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const { _id, email, image, credits, name, username } = args;

    const updatedUser = await ctx.db.patch(_id, {
      email,
      image,
      credits,
      name,
      username,
    });

    return updatedUser;
  },
});