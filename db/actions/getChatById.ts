'use server'

import { sql } from '@vercel/postgres'

export async function getChatById(threadId: number, userId: string) {
    const chatResult = await sql`
        SELECT * FROM threads WHERE id = ${threadId} AND user_id = ${userId}
    `;

    if (chatResult.rows.length === 0) {
        throw new Error('Chat not found');
    }

    return chatResult.rows[0];
}