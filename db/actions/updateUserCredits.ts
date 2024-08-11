'use server'

import { sql } from '@vercel/postgres'

export async function updateUserCredits(clerkUserId: string, creditsToAdd: number): Promise<{ success: boolean; newBalance: number | null; error?: string }> {
    try {
        // First, get the current balance
        const { rows: [user] } = await sql`
            SELECT credits FROM users WHERE clerk_user_id = ${clerkUserId}
        `

        if (!user) {
            return { success: false, newBalance: null, error: 'User not found' }
        }

        const currentBalance = parseFloat(user.credits)
        const newBalance = currentBalance + creditsToAdd

        // Update the user's balance
        const { rows: [updatedUser] } = await sql`
            UPDATE users
            SET credits = ${newBalance}
            WHERE clerk_user_id = ${clerkUserId}
            RETURNING credits
        `

        console.log(`Updated credits for user ${clerkUserId}. New balance: ${updatedUser.credits}`)

        return { success: true, newBalance: parseFloat(updatedUser.credits) }
    } catch (error) {
        console.error('Error in updateUserCredits:', error)
        return { success: false, newBalance: null, error: 'Failed to update user credits' }
    }
}