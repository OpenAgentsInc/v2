import { defineTable } from "convex/server";
import { v } from "convex/values";

export const threads = defineTable({
  user_id: v.id("users"),
  clerk_user_id: v.string(),
  metadata: v.optional(v.object({
    title: v.optional(v.string())
  })),
  createdAt: v.string(),
  isShared: v.boolean(),
})
  .index('by_user_id', ['user_id'])
  .index('by_clerk_user_id', ['clerk_user_id'])
  .index('by_isShared', ['isShared']);