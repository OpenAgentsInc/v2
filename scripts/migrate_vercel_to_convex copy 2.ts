import { ConvexClient } from "convex/browser"
import dotenv from "dotenv"
import path from "path"
import { sql } from "@vercel/postgres"
import { api } from "../convex/_generated/api"

// Load .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });
// dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log("NEXT_PUBLIC_CONVEX_URL:", process.env.NEXT_PUBLIC_CONVEX_URL);

// Convex configuration
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
console.log("Using CONVEX_URL:", convexUrl);
if (!convexUrl) {
  throw new Error("CONVEX_URL is not set in the environment.");
}

async function migrateData() {
  // Connect to Convex
  const convex = new ConvexClient(convexUrl as string);

  try {
    // Migrate messages with pagination
    const PAGE_SIZE = 1000; // Adjust this value based on your needs
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { rows: messages } = await sql`
           SELECT * FROM messages
           ORDER BY id
           LIMIT ${PAGE_SIZE}
           OFFSET ${offset}
         `;

      if (messages.length === 0) {
        hasMore = false;
        continue;
      }

      for (const message of messages) {
        // Check if the message already exists using its original ID
        const existingMessage = await convex.query(api.messages.getMessageByOriginalId.getMessageByOriginalId, {
          originalId: message.id.toString()
        });

        if (existingMessage) {
          console.log(`Message with original ID ${message.id} already exists. Skipping...`);
        } else {
          await convex.mutation(api.messages.saveChatMessage.saveChatMessage, {
            thread_id: message.thread_id,
            clerk_user_id: message.clerk_user_id,
            role: message.role,
            content: message.content,
            tool_invocations: message.tool_invocations || undefined,
            finish_reason: message.finish_reason || "",
            total_tokens: message.total_tokens || 0,
            prompt_tokens: message.prompt_tokens || 0,
            completion_tokens: message.completion_tokens || 0,
            model_id: message.model_id || "",
            cost_in_cents: parseFloat(message.cost_in_cents) || 0,
            // originalId: message.id.toString() // Store the original PostgreSQL ID
          });
        }
      }

      offset += PAGE_SIZE;
      console.log(`Processed ${offset} messages so far.`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await convex.close();
  }
}

migrateData();
