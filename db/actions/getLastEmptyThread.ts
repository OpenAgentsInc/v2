'use server'

import { sql } from '@vercel/postgres'

export async function getLastEmptyThread(clerkUserId: string) {
    try {
        const { rows } = await sql`
            SELECT t.id, t.clerk_user_id, t.metadata, t."createdAt"
            FROM threads t
            LEFT JOIN messages m ON t.id = m.thread_id
            WHERE t.clerk_user_id = ${clerkUserId}
            GROUP BY t.id
            HAVING COUNT(m.id) = 0
            ORDER BY t."createdAt" DESC
            LIMIT 1
        `;
        return rows[0] || null;
    } catch (error) {
        console.error('Error in getLastEmptyThread:', error);
        throw error;
    }
}