'use server'

import { sql } from '@vercel/postgres'
import { currentUser } from '@clerk/nextjs/server'

export async function createOrGetUser() {
    const user = await currentUser()
    if (!user) {
        throw new Error('No user found')
    }

    const clerkUserId = user.id
    const email = user.emailAddresses[0]?.emailAddress || ''
    const imageUrl = user.imageUrl

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
        VALUES (${clerkUserId}, ${email}, ${imageUrl})
        RETURNING id
        `;
        return { userId: newUser.id };
    } catch (error) {
        console.error('Error in createOrGetUser:', error);
        throw error;
    }
}
