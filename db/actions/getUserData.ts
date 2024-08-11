'use server'

import { sql } from '@vercel/postgres'

export async function getUserData(userId: string) {
    try {
        const { rows } = await sql`SELECT * FROM users WHERE clerk_user_id = ${userId}`;
        return rows[0];
    } catch (error) {
        console.error('Error in getUserData:', error);
        throw error;
    }
}