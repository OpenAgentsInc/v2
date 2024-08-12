'use server'

import { sql } from '@vercel/postgres'

export async function updateUserCredits(clerkUserId: string, creditsToAdd: number): Promise<{ success: boolean; newBalance: number | null; error?: string }> {
    console.log(`Attempting to update credits for user ${clerkUserId}. Credits to add: ${creditsToAdd}`)

    // Check if creditsToAdd is a valid number
    if (typeof creditsToAdd !== 'number' || isNaN(creditsToAdd) || !isFinite(creditsToAdd)) {
        console.error(`Invalid creditsToAdd value: ${creditsToAdd}`)
        return { success: false, newBalance: null, error: 'Invalid credits value' }
    }

    try {
        // First, get the current balance
        const selectResult = await sql`
            SELECT credits FROM users WHERE clerk_user_id = ${clerkUserId}
        `
        console.log('Select query result:', selectResult)

        if (selectResult.rowCount === 0) {
            console.log(`User not found: ${clerkUserId}`)
            return { success: false, newBalance: null, error: 'User not found' }
        }

        const currentBalance = parseFloat(selectResult.rows[0].credits)

        // Check if currentBalance is a valid number
        if (isNaN(currentBalance) || !isFinite(currentBalance)) {
            console.error(`Invalid current balance for user ${clerkUserId}: ${currentBalance}`)
            return { success: false, newBalance: null, error: 'Invalid current balance' }
        }

        console.log(`Current balance for user ${clerkUserId}: ${currentBalance}`)

        const newBalance = currentBalance + creditsToAdd * 100 // Convert credits to cents

        // Check if newBalance is a valid number
        if (isNaN(newBalance) || !isFinite(newBalance)) {
            console.error(`Calculated invalid new balance: ${newBalance}`)
            return { success: false, newBalance: null, error: 'Invalid new balance calculation' }
        }

        console.log(`New balance to set: ${newBalance}`)

        // Update the user's balance
        const updateResult = await sql`
            UPDATE users
            SET credits = ${newBalance}
            WHERE clerk_user_id = ${clerkUserId}
            RETURNING credits
        `
        console.log('Update query result:', updateResult)

        if (updateResult.rowCount === 0) {
            console.log(`Failed to update credits for user ${clerkUserId}`)
            return { success: false, newBalance: null, error: 'Failed to update credits' }
        }

        const updatedBalance = parseFloat(updateResult.rows[0].credits)

        // Final check to ensure updatedBalance is valid
        if (isNaN(updatedBalance) || !isFinite(updatedBalance)) {
            console.error(`Retrieved invalid updated balance: ${updatedBalance}`)
            return { success: false, newBalance: null, error: 'Invalid updated balance retrieved' }
        }

        console.log(`Updated credits for user ${clerkUserId}. New balance: ${updatedBalance}`)
        return { success: true, newBalance: updatedBalance }
    } catch (error) {
        console.error('Error in updateUserCredits:', error)
        return { success: false, newBalance: null, error: 'Failed to update user credits' }
    }
}
