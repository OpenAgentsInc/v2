import { defineSchema } from "convex/server";
import { documents } from "./schema/documents";
import { sbv_datum } from "./schema/sbv_datum";
import { users } from "./schema/users";
import { threads } from "./schema/threads";
import { messages } from "./schema/messages";
import { emails, emailCampaigns, emailAudiences } from "./schema/emails";

export default defineSchema({
  documents,
  sbv_datum,
  users,
  threads,
  messages,
  emails,
  emailCampaigns,
  emailAudiences,
});

export { documents, sbv_datum, users, threads, messages, emails, emailCampaigns, emailAudiences };