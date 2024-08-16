import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { models } from "@/lib/models";

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
      metadata: args.metadata || {},
      createdAt: new Date().toISOString(),
    });

    return newThread;
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
    const thread = await ctx.db.get(args.thread_id);
    if (!thread) {
      return { success: false, reason: "not_found" };
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_thread_id", (q) => q.eq("thread_id", args.thread_id))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    await ctx.db.delete(args.thread_id);

    return { success: true };
  },
});

export const updateThreadData = mutation({
  args: {
    thread_id: v.id("threads"),
    metadata: v.object({
      title: v.optional(v.string()),
    }),
  },
  async handler(ctx, args) {
    const thread = await ctx.db.get(args.thread_id);
    if (!thread) {
      throw new Error("Thread not found");
    }

    await ctx.db.patch(args.thread_id, {
      metadata: { ...thread.metadata, ...args.metadata },
    });
  },
});

export const shareThread = mutation({
  args: { thread_id: v.id("threads") },
  async handler(ctx, args) {
    const thread = await ctx.db.get(args.thread_id);
    if (!thread) {
      throw new Error("Thread not found");
    }

    const shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    await ctx.db.patch(args.thread_id, {
      metadata: { ...thread.metadata, shareToken },
    });

    return shareToken;
  },
});

export const generateTitle = action({
  args: { threadId: v.id("threads") },
  async handler(ctx, args) {
    const messages = await ctx.runQuery(api.threads.getThreadMessages, { threadId: args.threadId });

    if (messages.length === 0) {
      return "New Thread";
    }

    const formattedMessages = messages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    const modelObj = models.find((m) => m.name === "GPT-4o Mini");
    if (!modelObj) {
      throw new Error("Model not found");
    }

    const { text } = await generateText({
      model: openai(modelObj.id),
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates concise and relevant titles for chat conversations.",
        },
        {
          role: "user",
          content: `Please generate a short, concise title (5 words or less) for the following conversation:\n\n${formattedMessages}`,
        },
      ],
      temperature: 0.7,
      maxTokens: 10,
    });

    const generatedTitle = text.trim();

    await ctx.runMutation(api.threads.updateThreadData, {
      thread_id: args.threadId,
      metadata: { title: generatedTitle },
    });

    return generatedTitle;
  },
});

export const getThreadMessages = query({
  args: { threadId: v.id("threads") },
  async handler(ctx, args) {
    return await ctx.db
      .query("messages")
      .withIndex("by_thread_id", (q) => q.eq("thread_id", args.threadId))
      .order("asc")
      .collect();
  },
});