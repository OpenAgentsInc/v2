'use server'

import { sql } from '@vercel/postgres'

export async function createOrGetUser(clerkUserId: string, email: string, image?: string) {
    try {
        // Check if user already exists
        const { rows: [existingUser] } = await sql`
        SELECT id FROM users WHERE clerk_user_id = ${clerkUserId}
        `;

        if (existingUser) {
            return { userId: existingUser.id };
        }

        // If user doesn't exist, create a new one
        const { rows: [newUser] } = await sql`
        INSERT INTO users (clerk_user_id, email, image)
        VALUES (${clerkUserId}, ${email}, ${image})
        RETURNING id
        `;

        return { userId: newUser.id };
    } catch (error) {
        console.error('Error in createOrGetUser:', error);
        throw error;
    }
}
