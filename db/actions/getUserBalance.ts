'use server'
import { sql } from '@vercel/postgres'

export async function getUserBalance(clerkUserId: string): Promise<number> {
    try {
        const { rows } = await sql`
        SELECT credits FROM users WHERE clerk_user_id = ${clerkUserId}
        `;

        if (rows.length === 0) {
            throw new Error('User not found');
        }

        return Number(rows[0].credits);
    } catch (error) {
        console.error('Error in getUserBalance:', error);
        throw error;
    }
}
