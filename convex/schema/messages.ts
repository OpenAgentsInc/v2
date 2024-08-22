import { defineTable } from "convex/server"
import { v } from "convex/values"

export const messages = defineTable({
  thread_id: v.id("threads"),
  clerk_user_id: v.string(),
  role: v.string(),
  content: v.string(),
  created_at: v.string(),
  tool_invocations: v.optional(v.any()),
  tool_results: v.optional(v.any()),
  tool_calls: v.optional(v.any()),
  finish_reason: v.optional(v.string()),
  total_tokens: v.optional(v.number()),
  prompt_tokens: v.optional(v.number()),
  completion_tokens: v.optional(v.number()),
  model_id: v.optional(v.string()),
  cost_in_cents: v.optional(v.number()),
  original_id: v.optional(v.number()),
  status: v.string(),
})
  .index('by_thread_id', ['thread_id'])
  .index('by_clerk_user_id', ['clerk_user_id']);