import { defineTable, fields } from "convex/schema";

export const emails = defineTable({
  to: fields.string(),
  from: fields.string(),
  subject: fields.string(),
  body: fields.string(),
  status: fields.string(),
  sentAt: fields.optional(fields.number()),
  createdAt: fields.number(),
});

export const emailCampaigns = defineTable({
  name: fields.string(),
  description: fields.optional(fields.string()),
  status: fields.string(),
  createdAt: fields.number(),
  updatedAt: fields.number(),
});

export const emailAudiences = defineTable({
  name: fields.string(),
  description: fields.optional(fields.string()),
  members: fields.array(fields.string()),
  createdAt: fields.number(),
  updatedAt: fields.number(),
});