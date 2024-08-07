import { sql } from '@vercel/postgres';
import { currentUser } from "@clerk/nextjs/server";

export async function seed() {
    const user = await currentUser();
    console.log("We have user:", user);

    const createTable = await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      clerk_user_id VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      image VARCHAR(255),
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    `;
    console.log(`Created "users" table`);

    if (user) {
        const users = await sql`
            INSERT INTO users (clerk_user_id, email, image)
            VALUES (${user.id}, ${user.emailAddresses[0].emailAddress}, 'https://placekitten.com/200/200')
            ON CONFLICT (email) DO NOTHING;
        `;
        console.log(`Seeded ${users.rowCount} users`);
    } else {
        console.log("No user found, skipping user seeding");
    }

    return {
        createTable,
        users: user ? 1 : 0,
    };
}
