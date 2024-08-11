'use server'

import { sql } from '@vercel/postgres'
import { Message } from '@/types'

export async function getLastMessage(threadId: number) {
    try {
        const { rows } = await sql`
        SELECT id, role, content, created_at as "createdAt", tool_invocations as "toolInvocations"
        FROM messages
        WHERE thread_id = ${threadId}
        ORDER BY created_at DESC
        LIMIT 1
        `;
        return rows[0] ? {
            id: rows[0].id.toString(),
            content: rows[0].content,
            role: rows[0].role as Message['role'],
            createdAt: rows[0].createdAt,
            toolInvocations: rows[0].toolInvocations
        } : null;
    } catch (error) {
        console.error('Error in getLastMessage:', error);
        throw error;
    }
}