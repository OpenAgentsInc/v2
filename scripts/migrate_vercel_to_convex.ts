import { ConvexClient } from "convex/browser"
import dotenv from "dotenv"
import { sql } from "@vercel/postgres"
import { api } from "../convex/_generated/api"
import { Id } from "../convex/_generated/dataModel"

dotenv.config();
// Convex configuration
const convexUrl = process.env.CONVEX_URL as string;

async function migrateData() {
  // Connect to Convex
  const convex = new ConvexClient(convexUrl);

  try {
    // Migrate users
    const { rows: users } = await sql`SELECT * FROM users`;
    const userIdMap = new Map<number, Id<"users">>();
    for (const user of users) {
      const convexUser = await convex.mutation(api.users.createOrGetUser.createOrGetUser, {
        clerk_user_id: user.clerk_user_id,
        email: user.email,
        image: user.image,
        credits: parseFloat(user.credits),
        name: user.email.split('@')[0], // Default name to part before @ in email
        username: user.email.split('@')[0], // Default username to part before @ in email
      });
      if (convexUser) {
        userIdMap.set(user.id, convexUser._id);
      }
    }

    // Migrate threads
    const { rows: threads } = await sql`SELECT * FROM threads`;
    const threadIdMap = new Map<number, Id<"threads">>();
    for (const thread of threads) {
      const convexUserId = userIdMap.get(thread.user_id);
      if (convexUserId) {
        const convexThread = await convex.mutation(api.threads.createNewThread.createNewThread, {
          clerk_user_id: thread.clerk_user_id,
          metadata: thread.metadata || { title: "Untitled Thread" },
        });
        threadIdMap.set(thread.id, convexThread);
      } else {
        console.warn(`User not found for thread ${thread.id}. Skipping this thread.`);
      }
    }

    // Migrate messages
    const { rows: messages } = await sql`SELECT * FROM messages`;
    for (const message of messages) {
      const convexThreadId = threadIdMap.get(message.thread_id);
      if (convexThreadId) {
        await convex.mutation(api.messages.saveChatMessage.saveChatMessage, {
          thread_id: convexThreadId,
          clerk_user_id: message.clerk_user_id,
          role: message.role,
          content: message.content,
          tool_invocations: message.tool_invocations,
          finish_reason: message.finish_reason,
          total_tokens: message.total_tokens,
          prompt_tokens: message.prompt_tokens,
          completion_tokens: message.completion_tokens,
          model_id: message.model_id,
          cost_in_cents: parseFloat(message.cost_in_cents),
        });
      } else {
        console.warn(`Thread not found for message ${message.id}. Skipping this message.`);
      }
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