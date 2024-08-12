import { sql } from '@vercel/postgres';

export async function deductUserCredits(
    clerkUserId: string,
    amountToDeduct: number
): Promise<{ success: boolean; newBalance: number | null; error?: string }> {
    try {
        // Start a transaction
        await sql.query('BEGIN');

        // Get the current user's balance and id
        const userResult = await sql`
      SELECT id, credits FROM users WHERE clerk_user_id = ${clerkUserId} FOR UPDATE;
    `;

        if (userResult.rows.length === 0) {
            await sql.query('ROLLBACK');
            return { success: false, newBalance: null, error: 'User not found' };
        }

        const userId = userResult.rows[0].id;
        const currentBalance = parseFloat(userResult.rows[0].credits);

        // Deduct credits
        const newBalance = currentBalance - amountToDeduct;
        await sql`
      UPDATE users SET credits = ${newBalance} WHERE id = ${userId};
    `;

        // Commit the transaction
        await sql.query('COMMIT');

        return { success: true, newBalance };
    } catch (error) {
        await sql.query('ROLLBACK');
        console.error('Error in deductUserCredits:', error);
        return { success: false, newBalance: null, error: 'An error occurred while processing the transaction' };
    }
}
