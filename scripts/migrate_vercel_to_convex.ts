import { ConvexClient } from "convex/browser"
import dotenv from "dotenv"
import { sql } from "@vercel/postgres"
import { api } from "../convex/_generated/api"
import { Id } from "../convex/_generated/dataModel"
import path from 'path'

// Load .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log("CONVEX_URL:", process.env.CONVEX_URL);

// Convex configuration
const convexUrl = process.env.CONVEX_URL || "https://your-deployment-id.convex.cloud";
console.log("Using CONVEX_URL:", convexUrl);

async function migrateData() {
  // Connect to Convex
  const convex = new ConvexClient(convexUrl);

  try {
    // Migrate users
    const { rows: users } = await sql`SELECT * FROM users`;
    const userIdMap = new Map<number, Id<"users">>();
    for (const user of users) {
      const existingUser = await convex.query(api.users.getUserByClerkId.getUserByClerkId, { clerk_user_id: user.clerk_user_id });
      if (existingUser) {
        console.log(`User ${user.clerk_user_id} already exists. Updating...`);
        const updatedUser = await convex.mutation(api.users.updateUser.updateUser, {
          _id: existingUser._id,
          email: user.email,
          image: user.image,
          credits: parseFloat(user.credits),
          name: user.email.split('@')[0],
          username: user.email.split('@')[0],
        });
        userIdMap.set(user.id, updatedUser._id);
      } else {
        const newUser = await convex.mutation(api.users.createOrGetUser.createOrGetUser, {
          clerk_user_id: user.clerk_user_id,
          email: user.email,
          image: user.image,
          credits: parseFloat(user.credits),
          name: user.email.split('@')[0],
          username: user.email.split('@')[0],
        });
        if (newUser) {
          userIdMap.set(user.id, newUser._id);
        }
      }
    }

    // Migrate threads
    const { rows: threads } = await sql`SELECT * FROM threads`;
    const threadIdMap = new Map<number, Id<"threads">>();
    for (const thread of threads) {
      const existingThread = await convex.query(api.threads.getThreadByClerkId.getThreadByClerkId, { clerk_user_id: thread.clerk_user_id });
      if (existingThread) {
        console.log(`Thread for user ${thread.clerk_user_id} already exists. Skipping...`);
        threadIdMap.set(thread.id, existingThread._id);
      } else {
        const convexThread = await convex.mutation(api.threads.createNewThread.createNewThread, {
          clerk_user_id: thread.clerk_user_id,
          metadata: thread.metadata || { title: "Untitled Thread" },
        });
        threadIdMap.set(thread.id, convexThread);
      }
    }

    // Migrate messages
    const { rows: messages } = await sql`SELECT * FROM messages`;
    for (const message of messages) {
      const convexThreadId = threadIdMap.get(message.thread_id);
      if (convexThreadId) {
        const existingMessage = await convex.query(api.messages.getMessageByThreadAndTimestamp.getMessageByThreadAndTimestamp, {
          thread_id: convexThreadId,
          created_at: message.created_at,
        });
        if (existingMessage) {
          console.log(`Message in thread ${convexThreadId} at ${message.created_at} already exists. Skipping...`);
        } else {
          await convex.mutation(api.messages.saveChatMessage.saveChatMessage, {
            thread_id: convexThreadId,
            clerk_user_id: message.clerk_user_id,
            role: message.role,
            content: message.content,
            tool_invocations: message.tool_invocations,
            finish_reason: message.finish_reason,
            total_tokens: message.total_tokens || 0,
            prompt_tokens: message.prompt_tokens || 0,
            completion_tokens: message.completion_tokens || 0,
            model_id: message.model_id,
            cost_in_cents: parseFloat(message.cost_in_cents) || 0,
            created_at: message.created_at,
          });
        }
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