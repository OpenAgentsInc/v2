'use server'

import { sql } from '@vercel/postgres'
import { Message } from '@/types'
import { saveMessage } from './saveMessage'

export async function createNewThread(clerkUserId: string, firstMessage: Message) {
    try {
        const contentString = typeof firstMessage.content === 'string' ? firstMessage.content : JSON.stringify(firstMessage.content);
        const title = contentString.substring(0, 100);
        const { rows: [thread] } = await sql`
        INSERT INTO threads (user_id, clerk_user_id, metadata)
        VALUES (
          (SELECT id FROM users WHERE clerk_user_id = ${clerkUserId}),
          ${clerkUserId},
          ${JSON.stringify({ title })}::jsonb
        )
        RETURNING id
        `;

        const savedMessage = await saveMessage(thread.id, clerkUserId, firstMessage);

        await sql`
        UPDATE threads
        SET first_message_id = ${savedMessage.id}
        WHERE id = ${thread.id}
        `;

        return { threadId: thread.id, message: savedMessage };
    } catch (error) {
        console.error('Error in createThread:', error);
        throw error;
    }
}