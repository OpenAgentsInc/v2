'use server'

import { sql } from '@vercel/postgres'

export async function getLastEmptyThread(clerkUserId: string) {
    try {
        const { rows } = await sql`
            SELECT t.id
            FROM threads t
            LEFT JOIN messages m ON t.id = m.thread_id
            WHERE t.clerk_user_id = ${clerkUserId}
            GROUP BY t.id
            HAVING COUNT(m.id) = 0
            ORDER BY (
                SELECT MAX(created_at) 
                FROM messages 
                WHERE thread_id = t.id
            ) DESC NULLS FIRST
            LIMIT 1
        `;
        return rows[0] ? rows[0].id : null;
    } catch (error) {
        console.error('Error in getLastEmptyThread:', error);
        throw error;
    }
}