'use server'
import { sql } from '@vercel/postgres'
import { Message } from '@/types'

export async function generateTitle(threadId: number): Promise<string> {
    console.log('Fetching messages for thread:', threadId);

    try {
        // Fetch messages for the given thread
        const result = await sql`
            SELECT content, role
            FROM messages
            WHERE thread_id = ${threadId}
            ORDER BY created_at ASC
        `;

        const messages = result.rows;

        if (messages.length === 0) {
            console.log('No messages found for thread:', threadId);
            return "New Thread";
        }

        // Format messages for AI function
        const formattedMessages = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');

        console.log('Formatted messages:', formattedMessages);

        // TODO: Call AI function to generate title
        // For now, we'll use a dummy title
        const dummyTitle = "This is a new thread";

        // Update the thread title in the database
        await sql`
            UPDATE threads
            SET metadata = jsonb_set(COALESCE(metadata, '{}'), '{title}', ${JSON.stringify(dummyTitle)})
            WHERE id = ${threadId}
        `;

        return dummyTitle;
    } catch (error) {
        console.error('Error in generateTitle:', error);
        throw error;
    }
}