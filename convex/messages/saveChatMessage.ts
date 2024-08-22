import { v } from "convex/values"
import { mutation } from "../_generated/server"

export const saveChatMessage = mutation({
  args: {
    thread_id: v.id("threads"),
    clerk_user_id: v.string(),
    role: v.string(),
    content: v.string(),
    tool_invocations: v.optional(v.any()),
    tool_calls: v.optional(v.any()),
    tool_results: v.optional(v.any()),
    finish_reason: v.optional(v.string()),
    total_tokens: v.optional(v.number()),
    prompt_tokens: v.optional(v.number()),
    completion_tokens: v.optional(v.number()),
    model_id: v.optional(v.string()),
    cost_in_cents: v.optional(v.number()),
  },
  async handler(ctx, args) {
    const newMessage = await ctx.db.insert("messages", {
      ...args,
      created_at: new Date().toISOString(),
    });

    return await ctx.db.get(newMessage);
  },
});
