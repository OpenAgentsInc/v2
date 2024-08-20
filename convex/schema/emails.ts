import { v } from "convex/values";

export const emails = {
  to: v.string(),
  from: v.string(),
  subject: v.string(),
  body: v.string(),
  status: v.string(),
  sentAt: v.optional(v.number()),
  createdAt: v.number(),
};

export const emailCampaigns = {
  name: v.string(),
  description: v.optional(v.string()),
  status: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
};

export const emailAudiences = {
  name: v.string(),
  description: v.optional(v.string()),
  members: v.array(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
};