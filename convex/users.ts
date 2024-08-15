import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { calculateMessageCost } from './utils';
import { models } from '../lib/models';

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
      return existingUser;
    }

    const newUser = await ctx.db.insert("users", {
      clerk_user_id: args.clerk_user_id,
      email: args.email,
      image: args.image,
      credits: 0,
      createdAt: new Date().toISOString(),
    });

    return await ctx.db.get(newUser);
  },
});

export const getUserData = query({
  args: { clerk_user_id: v.string() },
  async handler(ctx, args) {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .first();
  },
});

export const getUserBalance = query({
  args: { clerk_user_id: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .first();
    return user ? user.credits : 0;
  },
});

export const updateUserCredits = mutation({
  args: {
    clerk_user_id: v.string(),
    credits: v.number(),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { credits: args.credits });
  },
});

export const updateUserBalance = mutation({
  args: {
    clerk_user_id: v.string(),
    cost_in_cents: v.number(),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { credits: user.credits - args.cost_in_cents / 100 });
  },
});

export const saveMessageAndUpdateBalance = mutation({
  args: {
    clerk_user_id: v.string(),
    model_id: v.string(),
    usage: v.object({
      promptTokens: v.number(),
      completionTokens: v.number(),
      totalTokens: v.number(),
    }),
  },
  async handler(ctx, args) {
    console.log("saveMessageAndUpdateBalance called with args:", JSON.stringify(args));
    const { clerk_user_id, model_id, usage } = args;

    const model = models.find(m => m.id === model_id);
    if (!model) {
      console.error(`Model with id ${model_id} not found`);
      throw new Error(`Model with id ${model_id} not found`);
    }
    console.log("Found model:", JSON.stringify(model));

    const cost_in_cents = calculateMessageCost(model, usage);
    console.log("Calculated cost_in_cents:", cost_in_cents);

    // Save the message to the database
    // This is a placeholder - you need to implement the actual message saving logic
    // const messageId = await ctx.db.insert('messages', { /* message data */ });

    // Update user balance
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerk_user_id', clerk_user_id))
      .first();

    if (!user) {
      console.error(`User with clerk_user_id ${clerk_user_id} not found`);
      throw new Error('User not found');
    }
    console.log("Found user:", JSON.stringify(user));

    const newBalance = user.credits - cost_in_cents;
    await ctx.db.patch(user._id, { credits: newBalance });
    console.log("Updated user balance. New balance:", newBalance);

    return { cost_in_cents, newBalance };
  },
});