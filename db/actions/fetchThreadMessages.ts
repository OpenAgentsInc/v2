'use server'

import { sql } from '@vercel/postgres'
import { Message } from '@/types'

export async function fetchThreadMessages(threadId: number): Promise<Message[]> {
    console.log('Fetching messages for thread:', threadId)
    if (isNaN(threadId)) {
        console.error("Invalid threadId:", threadId)
        return []
    }
    try {
        const { rows } = await sql`
        SELECT id, role, content, created_at as "createdAt", tool_invocations as "toolInvocations"
        FROM messages
        WHERE thread_id = ${threadId}
        ORDER BY created_at ASC
        `;
        return rows.map(msg => ({
            id: msg.id.toString(),
            content: msg.content,
            role: msg.role as Message['role'],
            createdAt: msg.createdAt,
            toolInvocations: msg.toolInvocations
        }));
    } catch (error) {
        console.error('Error in getThreadMessages:', error);
        throw error;
    }
}