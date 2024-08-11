'use server'

import { sql } from '@vercel/postgres'

export async function deleteThread(threadId: number) {
    try {
        await sql`DELETE FROM threads WHERE id = ${threadId}`;
    } catch (error) {
        console.error('Error in deleteThread:', error);
        throw error;
    }
}