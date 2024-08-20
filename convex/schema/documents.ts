import { defineTable } from "convex/server";
import { v } from "convex/values";

export const documents = defineTable({
  title: v.string(),
  tokenIdentifier: v.string(),
  fileId: v.id("_storage"),
}).index('by_tokenIdentifier', ['tokenIdentifier']);