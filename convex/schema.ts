import { defineSchema } from "convex/server";
import { documents } from "./schema/documents";
import { sbv_datum } from "./schema/sbv_datum";
import { users } from "./schema/users";
import { threads } from "./schema/threads";
import { messages } from "./schema/messages";

export default defineSchema({
  documents,
  sbv_datum,
  users,
  threads,
  messages,
});

export { documents, sbv_datum, users, threads, messages };