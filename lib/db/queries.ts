import { sql } from '@vercel/postgres';

export async function getUserData(userId: string) {
    const { rows } = await sql`SELECT * FROM users WHERE clerk_user_id = ${userId}`;
    return rows[0];
}

export async function getUserThreads(userId: string) {
    const { rows } = await sql`
    SELECT id, metadata, "createdAt"
    FROM threads
    WHERE clerk_user_id = ${userId}
    ORDER BY "createdAt" DESC
  `;
    return rows;
}
