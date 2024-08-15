import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    title: v.string(),
    tokenIdentifier: v.string(),
    fileId: v.id("_storage"),
  }).index('by_tokenIdentifier', ['tokenIdentifier']),

  sbv_datum: defineTable({
    instance_id: v.string(),
    patch: v.string(),
    repo: v.string(),
    base_commit: v.string(),
    hints_text: v.string(),
    created_at: v.string(),
    test_patch: v.string(),
    problem_statement: v.string(),
    version: v.string(),
    environment_setup_commit: v.string(),
    FAIL_TO_PASS: v.string(),
    PASS_TO_PASS: v.string(),
  }).index('by_instance_id', ['instance_id']),

  users: defineTable({
    clerk_user_id: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    credits: v.number(),
    createdAt: v.string(),
  })
    .index('by_clerk_user_id', ['clerk_user_id'])
    .index('by_email', ['email']),

  threads: defineTable({
    user_id: v.id("users"),
    title: v.optional(v.string()),
    clerk_user_id: v.string(),
    metadata: v.optional(v.object({})),
    createdAt: v.string(),
    shareToken: v.optional(v.string()),
  })
    .index('by_user_id', ['user_id'])
    .index('by_clerk_user_id', ['clerk_user_id'])
    .index('by_shareToken', ['shareToken']),

  messages: defineTable({
    thread_id: v.id("threads"),
    clerk_user_id: v.string(),
    role: v.string(),
    content: v.string(),
    created_at: v.string(),
    tool_invocations: v.optional(v.object({})),
    finish_reason: v.optional(v.string()),
    total_tokens: v.optional(v.number()),
    prompt_tokens: v.optional(v.number()),
    completion_tokens: v.optional(v.number()),
    model_id: v.optional(v.string()),
    cost_in_cents: v.optional(v.number()),
  })
    .index('by_thread_id', ['thread_id'])
    .index('by_clerk_user_id', ['clerk_user_id']),
});
