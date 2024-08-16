import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { calculateMessageCost } from '../utils';
import { models } from '../../lib/models';

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
    const { clerk_user_id, model_id, usage } = args;

    const model = models.find(m => m.id === model_id);
    if (!model) {
      console.error(`Model with id ${model_id} not found`);
      throw new Error(`Model with id ${model_id} not found`);
    }

    const cost_in_cents = calculateMessageCost(model, usage);

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

    const newBalance = user.credits - cost_in_cents;
    await ctx.db.patch(user._id, { credits: newBalance });

    return { cost_in_cents, newBalance };
  },
});