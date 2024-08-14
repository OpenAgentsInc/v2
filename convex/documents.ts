import { mutation } from "./_generated/server";
import { v } from "convex/values"

export const createDocument = mutation({
  args: {
    title: v.string()
  },
  async handler(ctx, args) {
    await ctx.db.insert('documents', {
      title: args.title
    })
  },
});
