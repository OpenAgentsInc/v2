'use server'

import { sql } from '@vercel/postgres'
import { Chat } from '@/types'

export async function updateThreadData(threadId: number, updates: Partial<Chat>) {
    console.log('Updating thread data:', { threadId, updates })
    if (isNaN(threadId)) {
        console.error("Invalid threadId:", threadId)
        return null
    }
    try {
        const { rows: [updatedThread] } = await sql`
        UPDATE threads
        SET
          metadata = COALESCE(${JSON.stringify(updates.metadata)}::jsonb, metadata)
        WHERE id = ${threadId}
        RETURNING id, metadata, "createdAt"
        `;
        console.log('Thread updated:', updatedThread)
        return updatedThread;
    } catch (error) {
        console.error('Error in updateThread:', error);
        throw error;
    }
}