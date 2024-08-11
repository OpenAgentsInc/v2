'use server'
import { sql } from '@vercel/postgres'
import { Message } from '@/types'

export async function saveMessage(threadId: number, clerkUserId: string, message: Message) {
    try {
        const contentString = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
        const toolInvocationsString = message.toolInvocations ? JSON.stringify(message.toolInvocations) : null;

        const { rows } = await sql`
        INSERT INTO messages (thread_id, clerk_user_id, role, content, tool_invocations)
        VALUES (${threadId}, ${clerkUserId}, ${message.role}, ${contentString}, ${toolInvocationsString}::jsonb)
        RETURNING id, created_at as "createdAt", tool_invocations as "toolInvocations"
        `;

        const savedMessage = {
            ...message,
            id: rows[0].id,
            createdAt: rows[0].createdAt,
            toolInvocations: rows[0].toolInvocations || undefined
        };

        return savedMessage;
    } catch (error) {
        console.error('Error in saveMessage:', error);
        throw error;
    }
}
