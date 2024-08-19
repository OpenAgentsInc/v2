import { defineTable } from "convex/server";
import { v } from "convex/values";

export const users = defineTable({
  clerk_user_id: v.string(),
  name: v.optional(v.string()),
  username: v.optional(v.string()),
  email: v.string(),
  image: v.optional(v.string()),
  credits: v.number(),
  createdAt: v.string(),
  referrer_id: v.optional(v.id("users")),
})
  .index('by_clerk_user_id', ['clerk_user_id'])
  .index('by_email', ['email']);