import { sql } from '@vercel/postgres';
import { currentUser } from "@clerk/nextjs/server";

export async function seed(dropTables = false) {
    const user = await currentUser();
    console.log("We have user:", user);

    if (dropTables) {
        // Drop existing tables if the flag is set
        await sql`DROP TABLE IF EXISTS messages CASCADE;`;
        await sql`DROP TABLE IF EXISTS threads CASCADE;`;
        await sql`DROP TABLE IF EXISTS users CASCADE;`;
        console.log("Dropped existing tables");
    }

    // Create users table
    await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      image VARCHAR(255),
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    `;
    console.log(`Created "users" table`);

    // Create index on clerk_user_id
    await sql`CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);`;
    console.log(`Created index on clerk_user_id`);

    // Create threads table
    await sql`
    CREATE TABLE IF NOT EXISTS threads (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      clerk_user_id VARCHAR(255) NOT NULL,
      metadata JSONB,
      first_message_id INTEGER,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (clerk_user_id) REFERENCES users(clerk_user_id)
    );
    `;
    console.log(`Created "threads" table`);

    // Create messages table
    await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      thread_id INTEGER NOT NULL,
      clerk_user_id VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      tool_invocations JSONB,
      FOREIGN KEY (thread_id) REFERENCES threads(id),
      FOREIGN KEY (clerk_user_id) REFERENCES users(clerk_user_id)
    );
    `;
    console.log(`Created "messages" table`);

    // Add foreign key constraint for threads.first_message_id
    await sql`
    ALTER TABLE threads
    ADD CONSTRAINT fk_threads_first_message_id
    FOREIGN KEY (first_message_id)
    REFERENCES messages(id);
    `;
    console.log(`Added foreign key constraint for threads.first_message_id`);

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_threads_user_id ON threads(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_threads_clerk_user_id ON threads(clerk_user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_threads_first_message_id ON threads(first_message_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_clerk_user_id ON messages(clerk_user_id);`;
    console.log(`Created indexes on threads and messages tables`);

    let userId = null;

    if (user) {
        try {
            // Insert user and get the id
            const insertedUser = await sql`
                INSERT INTO users (clerk_user_id, email, image)
                VALUES (${user.id}, ${user.emailAddresses[0].emailAddress}, 'https://placekitten.com/200/200')
                ON CONFLICT (clerk_user_id) DO UPDATE SET email = EXCLUDED.email
                RETURNING id, clerk_user_id;
            `;
            userId = insertedUser.rows[0].id;
            const clerkUserId = insertedUser.rows[0].clerk_user_id;
            console.log(`Upserted user with id: ${userId} and clerk_user_id: ${clerkUserId}`);

            // Insert sample threads and messages
            for (let i = 1; i <= 3; i++) {
                // Insert a thread
                const insertedThread = await sql`
                    INSERT INTO threads (user_id, clerk_user_id, metadata)
                    VALUES (${userId}, ${clerkUserId}, ${JSON.stringify({ title: `Sample Thread ${i}`, description: `This is sample thread ${i}` })}::jsonb)
                    RETURNING id;
                `;
                const threadId = insertedThread.rows[0].id;

                // Insert a message
                const insertedMessage = await sql`
                    INSERT INTO messages (thread_id, clerk_user_id, role, content)
                    VALUES (${threadId}, ${clerkUserId}, 'user', ${`This is sample message ${i}`})
                    RETURNING id;
                `;
                const messageId = insertedMessage.rows[0].id;

                // Update the thread with the first_message_id
                await sql`
                    UPDATE threads
                    SET first_message_id = ${messageId}
                    WHERE id = ${threadId};
                `;
            }

            console.log(`Inserted sample threads and messages`);
        } catch (error) {
            console.error("Error inserting data:", error);
        }
    } else {
        console.log("No user found, skipping user and thread seeding");
    }

    return {
        message: "Database seeding completed",
        userId,
    };
}