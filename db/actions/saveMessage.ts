'use server'

import { sql } from '@vercel/postgres'
import { Message } from '@/types'

export async function saveMessage(threadId: number, clerkUserId: string, message: Message) {
    try {
        const contentString = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
        const { rows } = await sql`
        INSERT INTO messages (thread_id, clerk_user_id, role, content, tool_invocations)
        VALUES (${threadId}, ${clerkUserId}, ${message.role}, ${contentString}, ${JSON.stringify(message.toolInvocations)}::jsonb)
        RETURNING id, created_at as "createdAt"
        `;
        return { ...message, id: rows[0].id, createdAt: rows[0].createdAt };
    } catch (error) {
        console.error('Error in saveMessage:', error);
        throw error;
    }
}