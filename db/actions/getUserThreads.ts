'use server'

import { sql } from '@vercel/postgres'

export async function getUserThreads(userId: string) {
    try {
        const { rows } = await sql`
        SELECT id, metadata, "createdAt"
        FROM threads
        WHERE clerk_user_id = ${userId}
        ORDER BY "createdAt" DESC
        `;
        return rows;
    } catch (error) {
        console.error('Error in getUserThreads:', error);
        throw error;
    }
}