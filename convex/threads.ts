import { mutation, query } from "./_generated/server";
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
      credits: 0, // You can set an initial credit amount here
      createdAt: new Date().toISOString(),
    });

    return newUserId;
  },
});

export const createNewThread = mutation({
  args: {
    clerk_user_id: v.string(),
    metadata: v.optional(v.object({})),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .first();

    if (!user) {
      throw new Error("User not found. Please ensure the user is created before creating a thread.");
    }

    const newThread = await ctx.db.insert("threads", {
      user_id: user._id,
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

export const shareThread = mutation({
  args: { thread_id: v.id("threads") },
  async handler(ctx, args) {
    const thread = await ctx.db.get(args.thread_id);
    if (!thread) {
      throw new Error("Thread not found");
    }

    // Generate a unique share token (you might want to use a more sophisticated method)
    const shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Update the thread with the share token
    await ctx.db.patch(args.thread_id, { shareToken });

    // Return the share token
    return shareToken;
  },
});