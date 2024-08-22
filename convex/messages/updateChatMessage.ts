import { v } from "convex/values"
import { mutation } from "../_generated/server"
import { Id } from "../_generated/dataModel"

export const updateChatMessage = mutation({
  args: {
    id: v.id("messages"),
    content: v.optional(v.string()),
    tool_invocations: v.optional(v.any()),
    tool_calls: v.optional(v.any()),
    tool_results: v.optional(v.any()),
    finish_reason: v.optional(v.string()),
    total_tokens: v.optional(v.number()),
    prompt_tokens: v.optional(v.number()),
    completion_tokens: v.optional(v.number()),
    model_id: v.optional(v.string()),
    cost_in_cents: v.optional(v.number()),
    status: v.optional(v.string()),
    role: v.optional(v.string()),
    thread_id: v.optional(v.id("threads")),
  },
  async handler(ctx, args) {
    const { id, ...updateFields } = args;

    const existingMessage = await ctx.db.get(id);
    if (!existingMessage) {
      throw new Error(`Message with id ${id} not found`);
    }

    await ctx.db.patch(id, updateFields);

    return await ctx.db.get(id);
  },
});