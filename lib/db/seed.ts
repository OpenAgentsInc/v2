import { sql } from '@vercel/postgres';
import { currentUser } from "@clerk/nextjs/server";

export async function seed(dropTables = true) {
    const user = await currentUser();
    console.log("We have user:", user);

    if (dropTables) {
        // Drop existing tables if the flag is set
        await sql`DROP TABLE IF EXISTS threads;`;
        await sql`DROP TABLE IF EXISTS users;`;
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
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (clerk_user_id) REFERENCES users(clerk_user_id)
    );
    `;
    console.log(`Created "threads" table`);

    // Create indexes on threads table
    await sql`CREATE INDEX IF NOT EXISTS idx_threads_user_id ON threads(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_threads_clerk_user_id ON threads(clerk_user_id);`;
    console.log(`Created indexes on threads table`);

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

            // Insert a sample thread
            await sql`
                INSERT INTO threads (user_id, clerk_user_id, metadata)
                VALUES (${userId}, ${clerkUserId}, ${{ title: "Sample Thread", description: "This is a sample thread" }}::jsonb)
                RETURNING id;
            `;

            // Insert two more sample threads
            await sql`
                INSERT INTO threads (user_id, clerk_user_id, metadata)
                VALUES (${userId}, ${clerkUserId}, ${{ title: "Sample Thread 2", description: "This is another sample thread" }}::jsonb)
            `;

            await sql`
                INSERT INTO threads (user_id, clerk_user_id, metadata)
                VALUES (${userId}, ${clerkUserId}, ${{ title: "Sample Thread 3", description: "This is yet another sample thread" }}::jsonb)
            `;
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
