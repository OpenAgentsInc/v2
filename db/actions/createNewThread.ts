'use server'
import { sql } from '@vercel/postgres'
import { createOrGetUser } from './createOrGetUser'
import { currentUser } from '@clerk/nextjs/server'

export async function createNewThread() {
    try {
        // First, ensure the user exists
        const { userId } = await createOrGetUser();

        const user = await currentUser()
        if (!user) {
            throw new Error('No user found')
        }

        // Now create the thread
        const { rows: [thread] } = await sql`
            INSERT INTO threads (user_id, clerk_user_id, metadata)
            VALUES (
                ${userId},
                ${user.id},
                ${JSON.stringify({ title: 'New Thread' })}::jsonb
            )
            RETURNING id
        `;

        return { threadId: thread.id };
    } catch (error) {
        console.error('Error in createNewThread:', error);
        throw error;
    }
}
