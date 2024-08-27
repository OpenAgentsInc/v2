import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const saveChatMessage = mutation({
  args: {
    thread_id: v.id("threads"),
    clerk_user_id: v.string(),
    role: v.string(),
    content: v.string(),
    tool_invocations: v.optional(v.array(v.object({
      toolCallId: v.string(),
      toolName: v.string(),
      args: v.any(),
      state: v.union(v.literal('partial-call'), v.literal('call'), v.literal('result')),
      result: v.optional(v.any()),
    }))),
    finish_reason: v.optional(v.string()),
    total_tokens: v.optional(v.number()),
    prompt_tokens: v.optional(v.number()),
    completion_tokens: v.optional(v.number()),
    model_id: v.optional(v.string()),
    cost_in_cents: v.optional(v.number()),
  },
  async handler(ctx, args) {
    const { tool_invocations, ...otherArgs } = args;
    
    const messageData = {
      ...otherArgs,
      created_at: new Date().toISOString(),
    };

    if (tool_invocations && tool_invocations.length > 0) {
      messageData.tool_invocations = tool_invocations.map(invocation => ({
        toolCallId: invocation.toolCallId,
        toolName: invocation.toolName,
        args: JSON.stringify(invocation.args),
        state: invocation.state,
        result: invocation.result ? JSON.stringify(invocation.result) : undefined,
      }));
    }

    const newMessage = await ctx.db.insert("messages", messageData);

    return await ctx.db.get(newMessage);
  },
});