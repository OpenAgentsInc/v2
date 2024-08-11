'use server'

import { sql } from '@vercel/postgres'

export async function createNewThread(clerkUserId: string) {
    try {
        const { rows: [thread] } = await sql`
        INSERT INTO threads (user_id, clerk_user_id, metadata)
        VALUES (
          (SELECT id FROM users WHERE clerk_user_id = ${clerkUserId}),
          ${clerkUserId},
          ${JSON.stringify({ title: 'New Thread' })}::jsonb
        )
        RETURNING id
        `;

        return { threadId: thread.id };
    } catch (error) {
        console.error('Error in createThread:', error);
        throw error;
    }
}