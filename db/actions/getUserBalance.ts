'use server'

import { sql } from '@vercel/postgres'
import { auth } from "@clerk/nextjs/server";

export async function getUserBalance(): Promise<number> {
    const { userId } = auth();

    try {
        const { rows } = await sql`
        SELECT credits FROM users WHERE clerk_user_id = ${userId}
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
