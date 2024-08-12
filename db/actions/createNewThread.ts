'use server'
import { sql } from '@vercel/postgres'
import { createOrGetUser } from './createOrGetUser'
import { currentUser } from '@clerk/nextjs/server'

export async function createNewThread() {
    try {
        const { userId } = await createOrGetUser();
        const user = await currentUser()

        if (!user) {
            throw new Error('No user found')
        }

        console.log("Creating a new thread for user", user.id);

        const { rows: [thread] } = await sql`
            INSERT INTO threads (user_id, clerk_user_id, metadata)
            VALUES (
                ${userId},
                ${user.id},
                ${JSON.stringify({ title: 'New Chat' })}::jsonb
            )
            RETURNING id
        `;

        console.log("New thread created with ID:", thread.id);
        return { threadId: thread.id };
    } catch (error) {
        console.error('Error in createNewThread:', error);
        throw error;
    }
}
