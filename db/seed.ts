import { sql } from '@vercel/postgres';
import { currentUser } from "@clerk/nextjs/server";

async function executeSQL(query: string, params: any[] = []) {
    try {
        await sql.query(query, params);
        console.log(`Successfully executed: ${query.split('\n')[0]}...`);
    } catch (error) {
        console.error(`Error executing SQL: ${query.split('\n')[0]}...`);
        console.error(error);
        throw error;
    }
}

export async function seed(dropTables = false) {
    const user = await currentUser();
    console.log("We have user:", user);

    if (dropTables) {
        // Drop existing tables if the flag is set
        await executeSQL('DROP TABLE IF EXISTS messages CASCADE;');
        await executeSQL('DROP TABLE IF EXISTS threads CASCADE;');
        await executeSQL('DROP TABLE IF EXISTS users CASCADE;');
        console.log("Dropped existing tables");
    } else {
        console.log("Skipping table drop");
    }

    // Create users table
    await executeSQL(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      image VARCHAR(255),
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    `);

    // Create threads table (removed first_message_id)
    await executeSQL(`
    CREATE TABLE IF NOT EXISTS threads (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      clerk_user_id VARCHAR(255) NOT NULL,
      metadata JSONB,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    `);

    // Create messages table with new token usage fields, model_id, and cost_in_cents
    await executeSQL(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      thread_id INTEGER NOT NULL,
      clerk_user_id VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      tool_invocations JSONB,
      finish_reason VARCHAR(50),
      total_tokens INTEGER,
      prompt_tokens INTEGER,
      completion_tokens INTEGER,
      model_id VARCHAR(255),
      cost_in_cents DECIMAL(10, 2)
    );
    `);

    // Add foreign key constraints
    await executeSQL('ALTER TABLE threads ADD CONSTRAINT fk_threads_user_id FOREIGN KEY (user_id) REFERENCES users(id);');
    await executeSQL('ALTER TABLE threads ADD CONSTRAINT fk_threads_clerk_user_id FOREIGN KEY (clerk_user_id) REFERENCES users(clerk_user_id);');
    await executeSQL('ALTER TABLE messages ADD CONSTRAINT fk_messages_thread_id FOREIGN KEY (thread_id) REFERENCES threads(id);');
    await executeSQL('ALTER TABLE messages ADD CONSTRAINT fk_messages_clerk_user_id FOREIGN KEY (clerk_user_id) REFERENCES users(clerk_user_id);');

    // Create indexes
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);');
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_threads_user_id ON threads(user_id);');
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_threads_clerk_user_id ON threads(clerk_user_id);');
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);');
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_messages_clerk_user_id ON messages(clerk_user_id);');

    let userId = null;

    if (user) {
        try {
            // Insert user and get the id
            const insertedUser = await sql`
                INSERT INTO users (clerk_user_id, email, image)
                VALUES (${user.id}, ${user.emailAddresses[0].emailAddress}, ${user.imageUrl})
                ON CONFLICT (clerk_user_id) DO UPDATE SET email = EXCLUDED.email, image = EXCLUDED.image
                RETURNING id, clerk_user_id;
            `;
            userId = insertedUser.rows[0].id;
            const clerkUserId = insertedUser.rows[0].clerk_user_id;
            console.log(`Upserted user with id: ${userId} and clerk_user_id: ${clerkUserId}`);
        } catch (error) {
            console.error("Error inserting user data:", error);
        }
    } else {
        console.log("No user found, skipping user seeding");
    }

    return {
        message: "Database seeding completed",
        userId,
    };
}
