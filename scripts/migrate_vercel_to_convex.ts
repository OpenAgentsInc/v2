import { Client } from 'pg';
import { ConvexClient } from 'convex/browser';

// Vercel Postgres connection configuration
const vercelConfig = {
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  ssl: {
    rejectUnauthorized: false
  }
};

// Convex configuration
const convexUrl = process.env.CONVEX_URL;

async function migrateData() {
  // Connect to Vercel Postgres
  const vercelClient = new Client(vercelConfig);
  await vercelClient.connect();

  // Connect to Convex
  const convex = new ConvexClient(convexUrl);
  await convex.initialize();

  try {
    // Migrate users
    const usersResult = await vercelClient.query('SELECT * FROM users');
    for (const user of usersResult.rows) {
      await convex.mutation('users:create', {
        clerk_user_id: user.clerk_user_id,
        email: user.email,
        image: user.image,
        credits: parseFloat(user.credits),
        createdAt: user.createdAt.toISOString(),
      });
    }

    // Migrate threads
    const threadsResult = await vercelClient.query('SELECT * FROM threads');
    for (const thread of threadsResult.rows) {
      await convex.mutation('threads:create', {
        user_id: thread.user_id.toString(), // Convex uses string IDs
        clerk_user_id: thread.clerk_user_id,
        metadata: thread.metadata,
        createdAt: thread.createdAt.toISOString(),
        isShared: false, // This field is not in the Vercel schema, defaulting to false
      });
    }

    // Migrate messages
    const messagesResult = await vercelClient.query('SELECT * FROM messages');
    for (const message of messagesResult.rows) {
      await convex.mutation('messages:create', {
        thread_id: message.thread_id.toString(), // Convex uses string IDs
        clerk_user_id: message.clerk_user_id,
        role: message.role,
        content: message.content,
        created_at: message.created_at.toISOString(),
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
    // Close connections
    await vercelClient.end();
    await convex.close();
  }
}

migrateData();