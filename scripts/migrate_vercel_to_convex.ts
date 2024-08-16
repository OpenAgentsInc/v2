import { ConvexClient } from "convex/browser"
import dotenv from "dotenv"
import { sql } from "@vercel/postgres"
import { api } from "../convex/_generated/api"

dotenv.config();
// Convex configuration
const convexUrl = process.env.CONVEX_URL as string;

async function migrateData() {
  // Connect to Convex
  const convex = new ConvexClient(convexUrl);

  try {
    // Migrate users
    const { rows: users } = await sql`SELECT * FROM users`;
    for (const user of users) {
      await convex.mutation(api.users.createOrGetUser.createOrGetUser, {
        clerk_user_id: user.clerk_user_id,
        email: user.email,
        image: user.image,
        credits: parseFloat(user.credits),
        // createdAt: user.createdAt.toISOString(),
      });
    }

    // Migrate threads
    const { rows: threads } = await sql`SELECT * FROM threads`;
    for (const thread of threads) {
      await convex.mutation(api.threads.createNewThread.createNewThread, {
        clerk_user_id: thread.clerk_user_id,
        metadata: thread.metadata,
      });
    }

    // Migrate messages
    const { rows: messages } = await sql`SELECT * FROM messages`;
    for (const message of messages) {
      await convex.mutation(api.messages.saveChatMessage.saveChatMessage, {
        thread_id: message.thread_id.toString(), // Convex uses string IDs
        clerk_user_id: message.clerk_user_id,
        role: message.role,
        content: message.content,
        // created_at: message.created_at.toISOString(),
        tool_invocations: message.tool_invocations,
        finish_reason: message.finish_reason,
        total_tokens: message.total_tokens,
        prompt_tokens: message.prompt_tokens,
        completion_tokens: message.completion_tokens,
        model_id: message.model_id,
        cost_in_cents: parseFloat(message.cost_in_cents),
      });
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close connection
    await convex.close();
  }
}

migrateData();