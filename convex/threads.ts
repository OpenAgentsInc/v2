import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createNewThread = mutation({
  args: {
    user_id: v.id("users"),
    clerk_user_id: v.string(),
    metadata: v.optional(v.object({})),
  },
  async handler(ctx, args) {
    const newThread = await ctx.db.insert("threads", {
      user_id: args.user_id,
      clerk_user_id: args.clerk_user_id,
      metadata: args.metadata,
      createdAt: new Date().toISOString(),
    });

    return await ctx.db.get(newThread);
  },
});

export const getUserThreads = query({
  args: { clerk_user_id: v.string() },
  async handler(ctx, args) {
    return await ctx.db
      .query("threads")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .collect();
  },
});

export const getLastEmptyThread = query({
  args: { clerk_user_id: v.string() },
  async handler(ctx, args) {
    const threads = await ctx.db
      .query("threads")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .order("desc")
      .collect();

    for (const thread of threads) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_thread_id", (q) => q.eq("thread_id", thread._id))
        .collect();

      if (messages.length === 0) {
        return thread;
      }
    }

    return null;
  },
});

export const deleteThread = mutation({
  args: { thread_id: v.id("threads") },
  async handler(ctx, args) {
    // Delete all messages associated with the thread
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_thread_id", (q) => q.eq("thread_id", args.thread_id))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete the thread
    await ctx.db.delete(args.thread_id);
  },
});

export const updateThreadData = mutation({
  args: {
    thread_id: v.id("threads"),
    metadata: v.object({}),
  },
  async handler(ctx, args) {
    await ctx.db.patch(args.thread_id, { metadata: args.metadata });
  },
});